import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { ProdukTable } from './produk-table';

export default async function AdminProdukPage() {
  // Layout sudah memanggil requireAdmin(), tapi Server Component ini memanggil
  // lagi secara eksplisit sesuai ENGINEERING §4.1 — bukan cuma diandalkan dari layout.
  await requireAdmin();

  const supabase = await createClient();
  const { data: produk, error } = await supabase
    .from('products')
    .select('id, nama_id, kategori, harga, tampilkan_harga, is_active, urutan')
    .order('urutan');

  if (error) console.error('[admin-produk] gagal memuat daftar:', error);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-warna-teks">Produk</h1>
        <Link
          href="/admin/produk/baru"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          Tambah Produk
        </Link>
      </div>

      <ProdukTable produk={produk ?? []} />
    </div>
  );
}
