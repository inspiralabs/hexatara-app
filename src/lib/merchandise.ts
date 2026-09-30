import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type ProdukMerchandise = { id: number; nama: string; harga: number };

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
    .select('id, nama_id, harga, category_nama_id')
    .ilike('category_nama_id', 'merchandise')
    .order('urutan');
  if (error) console.error('[merchandise] gagal memuat produk publik:', error);
  return (data ?? []).flatMap((p) =>
    p.id != null && p.nama_id && typeof p.harga === 'number'
      ? [{ id: p.id, nama: p.nama_id, harga: p.harga }]
      : [],
  );
}
