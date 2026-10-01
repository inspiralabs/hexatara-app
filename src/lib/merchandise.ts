import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type ProdukMerchandise = { id: number; nama: string; harga: number; thumbnail_url: string | null };

export function pecahOrderMerch<T extends { status: string }>(orders: T[]) {
  return { utama: orders[0] ?? null, riwayat: orders.slice(1) };
}

export async function getKategoriMerchandiseId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('product_categories')
    .select('id, nama_id')
    .ilike('nama_id', 'merchandise')
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function getProdukMerchandiseAktif(): Promise<ProdukMerchandise[]> {
  const supabase = await createClient();
  // Tabel `products` hanya terbaca Admin. User dashboard harus lewat view publik,
  // sama seperti /katalog.
  const { data, error } = await supabase
    .from('products_public')
    .select('id, nama_id, harga, thumbnail_url, category_nama_id')
    .ilike('category_nama_id', 'merchandise')
    .order('urutan');
  if (error) console.error('[merchandise] gagal memuat produk publik:', error);
  return (data ?? []).flatMap((p) =>
    p.id != null && p.nama_id && typeof p.harga === 'number'
      ? [{ id: p.id, nama: p.nama_id, harga: p.harga, thumbnail_url: p.thumbnail_url }]
      : [],
  );
}

export async function ringkasItemOrder(orderIds: number[]) {
  const hasil = new Map<number, string>();
  if (orderIds.length === 0) return hasil;
  const supabase = await createClient();
  const { data: items } = await supabase
    .from('certificate_order_items')
    .select('order_id, qty, product_id')
    .in('order_id', orderIds);
  const productIds = [...new Set((items ?? []).map((item) => item.product_id))];
  const { data: products } =
    productIds.length > 0
      ? await supabase.from('products_public').select('id, nama_id').in('id', productIds)
      : { data: [] };
  const nama = new Map((products ?? []).flatMap((p) => (p.id != null ? [[p.id, p.nama_id ?? 'Produk'] as const] : [])));
  for (const item of items ?? []) {
    const baris = `${nama.get(item.product_id) ?? 'Produk'} × ${item.qty}`;
    const ada = hasil.get(item.order_id);
    hasil.set(item.order_id, ada ? `${ada}, ${baris}` : baris);
  }
  return hasil;
}
