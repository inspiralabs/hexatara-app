import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProdukRowActions } from './produk-row-actions';

function formatRupiah(nilai: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(nilai);
}

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

      <div className="overflow-x-auto rounded-lg border border-warna-latar-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Urutan</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!produk || produk.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-warna-teks-2">
                  Belum ada produk.
                </TableCell>
              </TableRow>
            ) : (
              produk.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.urutan}</TableCell>
                  <TableCell className="font-medium text-warna-teks">{p.nama_id}</TableCell>
                  <TableCell>{p.kategori ?? '—'}</TableCell>
                  <TableCell>
                    {p.tampilkan_harga ? (p.harga != null ? formatRupiah(p.harga) : '—') : 'Tersembunyi'}
                  </TableCell>
                  <TableCell>{p.is_active ? 'Ya' : 'Tidak'}</TableCell>
                  <TableCell className="text-right">
                    <ProdukRowActions id={p.id} nama={p.nama_id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
