import { format } from 'date-fns';
import type { PesananMerchandiseRow } from './pesanan-merchandise-table';

export async function eksporPesananMerchandiseXlsx(rows: PesananMerchandiseRow[]) {
  const XLSX = await import('xlsx');
  const sheet = rows.map((r) => ({
    Nama: r.nama,
    Paket: r.paket,
    'Daftar Produk': r.produk,
    'Alamat Lengkap': r.alamatLengkap,
    Kota: r.kota,
    'Kode Pos': r.kodePos,
    'Status Pengiriman': r.status_pengiriman,
    Tanggal: r.created_at,
  }));
  const ws = XLSX.utils.json_to_sheet(sheet);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pesanan');
  XLSX.writeFile(wb, `pesanan-merchandise-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
