import Papa from 'papaparse';
import { format } from 'date-fns';
import type { Lead } from './leads-table';

// UTF-8 DENGAN BOM (ENGINEERING §5.6) — tanpa BOM, Excel Windows merusak huruf
// beraksen dan nama peserta jadi berantakan.
export function eksporLeadsCsv(leads: Lead[]) {
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

  const csv = Papa.unparse(rows);
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-batch-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
