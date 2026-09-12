import { format } from 'date-fns';
import type { Lead } from './leads-table';

// XLSX (ADR-016, menggantikan CSV+papaparse) — kolom asli per field, terbuka
// rapi di Excel tanpa kerusakan huruf beraksen (masalah lama BOM CSV, tidak
// relevan lagi di format biner XLSX). Dynamic import supaya `xlsx` (lumayan
// besar) tidak ikut bundle awal halaman leads.
export async function eksporLeadsXlsx(leads: Lead[]) {
  const XLSX = await import('xlsx');
  const rows = leads.map((lead) => ({
    Nama: lead.nama,
    WhatsApp: lead.whatsapp,
    Email: lead.email ?? '',
    Batch: lead.batches?.judul_id ?? '',
    Catatan: lead.catatan ?? '',
    Status: lead.status,
    'Tanggal Daftar': lead.created_at,
    'Waktu Persetujuan': lead.consent_at,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  XLSX.writeFile(wb, `leads-batch-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
