import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { PesananPublikTable, type PesananPublikRow } from './pesanan-publik-table';

type Item = { nama_produk?: string; qty?: number; harga_satuan?: number };

export default async function PesananPublikPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('merchandise_public_orders')
    .select('id, nama_lengkap, whatsapp, alamat_pengiriman, items, catatan, status, created_at')
    .order('created_at', { ascending: false });
  if (error) console.error('[merchandise-publik] daftar:', error);

  const rows: PesananPublikRow[] = (data ?? []).map((row) => {
    const items = (Array.isArray(row.items) ? row.items : []) as Item[];
    const alamat = row.alamat_pengiriman as {
      nama_penerima?: string;
      telepon?: string;
      alamat_lengkap?: string;
      kota?: string;
      kode_pos?: string;
    } | null;
    return {
      id: row.id,
      nama: row.nama_lengkap,
      namaPenerima: alamat?.nama_penerima ?? row.nama_lengkap,
      telepon: alamat?.telepon || row.whatsapp,
      items: items.map((item) => ({
        nama: item.nama_produk ?? 'Produk',
        qty: item.qty ?? 0,
        harga: item.harga_satuan ?? 0,
      })),
      produk: items.map((item) => `${item.nama_produk ?? 'Produk'} × ${item.qty ?? 0}`).join(', ') || '—',
      alamat: `${alamat?.kota ?? '—'}`,
      alamatLengkap: alamat?.alamat_lengkap ?? '',
      kota: alamat?.kota ?? '',
      kodePos: alamat?.kode_pos ?? '',
      catatan: row.catatan ?? '',
      status: row.status,
      created_at: row.created_at,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-foreground">Pesanan Publik</h1>
      <PesananPublikTable rows={rows} />
    </div>
  );
}
