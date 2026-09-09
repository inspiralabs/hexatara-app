import Papa from 'papaparse';
import { format } from 'date-fns';
import type { Penawaran } from './penawaran-table';

// UTF-8 DENGAN BOM (ENGINEERING §5.6) — tanpa BOM, Excel Windows merusak huruf
// beraksen dan nama peserta jadi berantakan. Berkas terpisah dari eksporLeadsCsv
// dengan sengaja — kolomnya beda, dan F01.14 yang sudah DONE tidak disentuh.
export function eksporPenawaranCsv(penawaran: Penawaran[]) {
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

  const csv = Papa.unparse(rows);
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-penawaran-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
