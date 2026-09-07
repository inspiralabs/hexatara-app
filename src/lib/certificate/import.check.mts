// Self-check tanpa framework (vitest sengaja ditunda ke Lampiran B — PANDUAN.md).
// Jalankan: node src/lib/certificate/import.check.mts
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import { parseSpreadsheet, validateRow } from './import.ts';

// Baris valid, existing_manual, kedaluwarsa manual.
{
  const hasil = validateRow({
    nomor_sertifikat: 'HXT-CERT-000099',
    jenis: 'existing_manual',
    nama_lengkap: 'Budi',
    tanggal_terbit: '2026-01-01',
    tanggal_kedaluwarsa: '2027-01-01',
  });
  assert.equal(hasil.ok, true);
}

// free_track + kedaluwarsa terisi -> ditolak.
{
  const hasil = validateRow({
    nomor_sertifikat: 'HXT-FT-000099',
    jenis: 'free_track',
    nama_lengkap: 'Budi',
    tanggal_terbit: '2026-01-01',
    tanggal_kedaluwarsa: '2027-01-01',
  });
  assert.equal(hasil.ok, false);
  assert.match(!hasil.ok ? hasil.alasan : '', /free track/);
}

// rpc_certified tanpa kedaluwarsa -> otomatis terbit + 2 tahun.
{
  const hasil = validateRow({
    nomor_sertifikat: 'HXT-RPC-000099',
    jenis: 'rpc_certified',
    nama_lengkap: 'Budi',
    tanggal_terbit: '2026-01-01',
    tanggal_kedaluwarsa: '',
  });
  assert.equal(hasil.ok, true);
  assert.equal(hasil.ok && hasil.data.tanggal_kedaluwarsa, '2028-01-01');
}

// Nama kosong -> ditolak.
{
  const hasil = validateRow({
    nomor_sertifikat: 'HXT-CERT-000099',
    jenis: 'existing_manual',
    nama_lengkap: '  ',
    tanggal_terbit: '2026-01-01',
    tanggal_kedaluwarsa: '',
  });
  assert.equal(hasil.ok, false);
  assert.match(!hasil.ok ? hasil.alasan : '', /nama lengkap kosong/);
}

// Tanggal terbit format salah -> ditolak.
{
  const hasil = validateRow({
    nomor_sertifikat: 'HXT-CERT-000099',
    jenis: 'existing_manual',
    nama_lengkap: 'Budi',
    tanggal_terbit: '01/01/2026',
    tanggal_kedaluwarsa: '',
  });
  assert.equal(hasil.ok, false);
  assert.match(!hasil.ok ? hasil.alasan : '', /format tanggal terbit/);
}

// Nomor kosong -> ditolak.
{
  const hasil = validateRow({
    nomor_sertifikat: '',
    jenis: 'existing_manual',
    nama_lengkap: 'Budi',
    tanggal_terbit: '2026-01-01',
    tanggal_kedaluwarsa: '',
  });
  assert.equal(hasil.ok, false);
  assert.match(!hasil.ok ? hasil.alasan : '', /nomor sertifikat kosong/);
}

// --- parseSpreadsheet: CSV, nomor baris termasuk header, baris kosong dilewati diam-diam ---
{
  const csv = [
    'nomor_sertifikat,jenis,nama_lengkap,tanggal_terbit,tanggal_kedaluwarsa',
    'HXT-CERT-000001,existing_manual,Budi,2026-01-01,', // baris 2 -> valid, auto +2 tahun
    ',existing_manual,Siti,2026-01-01,', // baris 3 -> nomor kosong, ditolak
    ',,,,', // baris 4 -> semua kosong, dilewati diam-diam (bukan gagal)
    'HXT-FT-000001,free_track,Andi,2026-01-01,2028-01-01', // baris 5 -> free_track + kedaluwarsa, ditolak
  ].join('\n');
  const file = new File([csv], 'test.csv', { type: 'text/csv' });
  const hasil = await parseSpreadsheet(file);
  assert.equal(hasil.ok, true);
  if (hasil.ok) {
    assert.equal(hasil.rows.length, 3); // baris kosong (baris 4) tidak ikut
    assert.deepEqual(
      hasil.rows.map((r) => r.baris),
      [2, 3, 5]
    );
    const divalidasi = hasil.rows.map((r) => ({ baris: r.baris, hasil: validateRow(r.sel) }));
    assert.equal(divalidasi[0].hasil.ok, true); // baris 2
    assert.equal(divalidasi[1].hasil.ok, false); // baris 3, nomor kosong
    assert.equal(divalidasi[2].hasil.ok, false); // baris 5, free_track+kedaluwarsa
  }
}

// --- parseSpreadsheet: header tidak sesuai template -> ditolak seluruh berkas ---
{
  const csv = 'nomor,jenis,nama\nHXT-CERT-000001,existing_manual,Budi';
  const file = new File([csv], 'test.csv', { type: 'text/csv' });
  const hasil = await parseSpreadsheet(file);
  assert.equal(hasil.ok, false);
  assert.match(!hasil.ok ? hasil.pesan : '', /Kolom tidak sesuai template/);
}

// --- parseSpreadsheet: Excel (.xlsx), tanggal sebagai sel Date sungguhan ---
{
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['nomor_sertifikat', 'jenis', 'nama_lengkap', 'tanggal_terbit', 'tanggal_kedaluwarsa'],
    ['HXT-CERT-000002', 'existing_manual', 'Citra', new Date(2026, 0, 15), ''],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  const file = new File([buffer], 'test.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const hasil = await parseSpreadsheet(file);
  assert.equal(hasil.ok, true);
  if (hasil.ok) {
    assert.equal(hasil.rows.length, 1);
    assert.equal(hasil.rows[0].sel.tanggal_terbit, '2026-01-15'); // sel Date -> yyyy-MM-dd, bukan serial number
    const divalidasi = validateRow(hasil.rows[0].sel);
    assert.equal(divalidasi.ok, true);
    assert.equal(divalidasi.ok && divalidasi.data.tanggal_kedaluwarsa, '2028-01-15'); // auto +2 tahun
  }
}

console.log('import.check.mts: semua cek lolos');
