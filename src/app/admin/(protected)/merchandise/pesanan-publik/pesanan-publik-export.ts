import { format } from 'date-fns';
import type { PesananPublikRow } from './pesanan-publik-table';

export async function eksporPesananPublikXlsx(rows: PesananPublikRow[]) {
  const XLSX = await import('xlsx');
  const sheet = rows.map((r) => ({
    Nama: r.nama,
    'Nomor telepon (WhatsApp)': r.telepon,
    'Daftar Produk': r.produk,
    'Alamat Lengkap': r.alamatLengkap,
    Kota: r.kota,
    'Kode Pos': r.kodePos,
    Catatan: r.catatan,
    Status: r.status,
    Tanggal: r.created_at,
  }));
  const ws = XLSX.utils.json_to_sheet(sheet);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pesanan Publik');
  XLSX.writeFile(wb, `pesanan-publik-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
