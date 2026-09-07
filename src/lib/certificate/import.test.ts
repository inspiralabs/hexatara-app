import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { parseSpreadsheet, validateRow } from './import';

describe('validateRow', () => {
  it('menerima baris valid dengan kedaluwarsa manual', () => {
    const hasil = validateRow({
      nomor_sertifikat: 'HXT-CERT-000099',
      jenis: 'existing_manual',
      nama_lengkap: 'Budi',
      tanggal_terbit: '2026-01-01',
      tanggal_kedaluwarsa: '2027-01-01',
    });
    expect(hasil.ok).toBe(true);
  });

  it('menolak free_track yang kedaluwarsanya terisi', () => {
    const hasil = validateRow({
      nomor_sertifikat: 'HXT-FT-000099',
      jenis: 'free_track',
      nama_lengkap: 'Budi',
      tanggal_terbit: '2026-01-01',
      tanggal_kedaluwarsa: '2027-01-01',
    });
    expect(hasil.ok).toBe(false);
    expect(!hasil.ok && hasil.alasan).toMatch(/free track/);
  });

  it('mengisi otomatis terbit + 2 tahun untuk rpc_certified tanpa kedaluwarsa', () => {
    const hasil = validateRow({
      nomor_sertifikat: 'HXT-RPC-000099',
      jenis: 'rpc_certified',
      nama_lengkap: 'Budi',
      tanggal_terbit: '2026-01-01',
      tanggal_kedaluwarsa: '',
    });
    expect(hasil.ok).toBe(true);
    expect(hasil.ok && hasil.data.tanggal_kedaluwarsa).toBe('2028-01-01');
  });

  it('menolak nama lengkap kosong', () => {
    const hasil = validateRow({
      nomor_sertifikat: 'HXT-CERT-000099',
      jenis: 'existing_manual',
      nama_lengkap: '  ',
      tanggal_terbit: '2026-01-01',
      tanggal_kedaluwarsa: '',
    });
    expect(hasil.ok).toBe(false);
    expect(!hasil.ok && hasil.alasan).toMatch(/nama lengkap kosong/);
  });

  it('menolak tanggal terbit dengan format tidak dikenali', () => {
    const hasil = validateRow({
      nomor_sertifikat: 'HXT-CERT-000099',
      jenis: 'existing_manual',
      nama_lengkap: 'Budi',
      tanggal_terbit: '01/01/2026',
      tanggal_kedaluwarsa: '',
    });
    expect(hasil.ok).toBe(false);
    expect(!hasil.ok && hasil.alasan).toMatch(/format tanggal terbit/);
  });

  it('menolak nomor sertifikat kosong', () => {
    const hasil = validateRow({
      nomor_sertifikat: '',
      jenis: 'existing_manual',
      nama_lengkap: 'Budi',
      tanggal_terbit: '2026-01-01',
      tanggal_kedaluwarsa: '',
    });
    expect(hasil.ok).toBe(false);
    expect(!hasil.ok && hasil.alasan).toMatch(/nomor sertifikat kosong/);
  });
});

describe('parseSpreadsheet — CSV', () => {
  it('nomor baris mengikuti baris file asli (termasuk header), baris kosong dilewati diam-diam', async () => {
    const csv = [
      'nomor_sertifikat,jenis,nama_lengkap,tanggal_terbit,tanggal_kedaluwarsa',
      'HXT-CERT-000001,existing_manual,Budi,2026-01-01,', // baris 2 -> valid
      ',existing_manual,Siti,2026-01-01,', // baris 3 -> nomor kosong, ditolak
      ',,,,', // baris 4 -> semua kosong, dilewati diam-diam (bukan gagal)
      'HXT-FT-000001,free_track,Andi,2026-01-01,2028-01-01', // baris 5 -> free_track+kedaluwarsa, ditolak
    ].join('\n');
    const file = new File([csv], 'test.csv', { type: 'text/csv' });
    const hasil = await parseSpreadsheet(file);
    expect(hasil.ok).toBe(true);
    if (!hasil.ok) return;

    expect(hasil.rows.length).toBe(3); // baris kosong (baris 4) tidak ikut
    expect(hasil.rows.map((r) => r.baris)).toEqual([2, 3, 5]);

    const divalidasi = hasil.rows.map((r) => validateRow(r.sel));
    expect(divalidasi[0]?.ok).toBe(true); // baris 2
    expect(divalidasi[1]?.ok).toBe(false); // baris 3, nomor kosong
    expect(divalidasi[2]?.ok).toBe(false); // baris 5, free_track+kedaluwarsa
  });

  it('menolak seluruh berkas kalau kolom header tidak sesuai template', async () => {
    const csv = 'nomor,jenis,nama\nHXT-CERT-000001,existing_manual,Budi';
    const file = new File([csv], 'test.csv', { type: 'text/csv' });
    const hasil = await parseSpreadsheet(file);
    expect(hasil.ok).toBe(false);
    expect(!hasil.ok && hasil.pesan).toMatch(/Kolom tidak sesuai template/);
  });
});

describe('parseSpreadsheet — Excel', () => {
  it('mengonversi sel tanggal Excel ke yyyy-MM-dd tanpa meleset karena timezone', async () => {
    // Regresi: dulu memakai opsi cellDates+dateNF milik xlsx, yang membentuk
    // Date lalu dibaca lewat getter LOKAL — hasilnya bisa meleset satu hari
    // tergantung timezone server (Vercel biasanya UTC, bukan WIB). Sekarang
    // pakai XLSX.SSF.parse_date_code() yang murni aritmetika kalender.
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
    expect(hasil.ok).toBe(true);
    if (!hasil.ok) return;

    expect(hasil.rows.length).toBe(1);
    expect(hasil.rows[0]?.sel.tanggal_terbit).toBe('2026-01-15');

    const divalidasi = validateRow(hasil.rows[0]!.sel);
    expect(divalidasi.ok).toBe(true);
    expect(divalidasi.ok && divalidasi.data.tanggal_kedaluwarsa).toBe('2028-01-15'); // auto +2 tahun
  });
});
