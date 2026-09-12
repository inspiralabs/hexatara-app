import { format } from 'date-fns';
import type { Penawaran } from './penawaran-table';

// XLSX (ADR-016, menggantikan CSV+papaparse) — berkas terpisah dari
// eksporLeadsXlsx dengan sengaja, kolomnya beda (F01.14 tidak disentuh selain
// format berkasnya). Dynamic import supaya `xlsx` tidak ikut bundle awal.
export async function eksporPenawaranXlsx(penawaran: Penawaran[]) {
  const XLSX = await import('xlsx');
  const rows = penawaran.map((p) => ({
    Nama: p.nama,
    Perusahaan: p.perusahaan ?? '',
    Email: p.email,
    WhatsApp: p.whatsapp ?? '',
    Produk: p.products?.nama_id ?? '',
    Kebutuhan: p.kebutuhan ?? '',
    Status: p.status,
    'Tanggal Masuk': p.created_at,
    'Waktu Persetujuan': p.consent_at,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Penawaran');
  XLSX.writeFile(wb, `leads-penawaran-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
