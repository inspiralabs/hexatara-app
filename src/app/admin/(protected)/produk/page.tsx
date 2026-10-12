import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { cn } from 'cn';
import { getKategoriMerchandiseId } from '@/lib/merchandise';
import { ProdukTable } from './produk-table';

export default async function AdminProdukPage() {
  // Layout sudah memanggil requireAdmin(), tapi Server Component ini memanggil
  // lagi secara eksplisit sesuai ENGINEERING §4.1 — bukan cuma diandalkan dari layout.
  await requireAdmin();

  const supabase = await createClient();
  const kategoriMerchId = await getKategoriMerchandiseId();
  // Merchandise punya menu & urutan sendiri (F15.8) — dikeluarkan dari sini.
  // NULL-safe: produk tanpa category_id tetap tampil (bukan merchandise).
  let query = supabase
    .from('products')
    .select('id, nama_id, harga, tampilkan_harga, is_active, urutan, product_categories(nama_id)')
    .order('urutan');
  if (kategoriMerchId) {
    query = query.or(`category_id.is.null,category_id.neq.${kategoriMerchId}`);
  }
  const { data: produk, error } = await query;

  if (error) console.error('[admin-produk] gagal memuat daftar:', error);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Produk</h1>
        <Link href="/admin/produk/baru" className={cn(buttonVariants(), 'h-11 px-5')}>
          Tambah Produk
        </Link>
      </div>

      <ProdukTable
        basePath="/admin/produk"
        produk={(produk ?? []).map((p) => ({
          id: p.id,
          nama_id: p.nama_id,
          kategoriNama: p.product_categories?.nama_id ?? null,
          harga: p.harga,
          tampilkan_harga: p.tampilkan_harga,
          is_active: p.is_active,
          urutan: p.urutan,
        }))}
      />
    </div>
  );
}
