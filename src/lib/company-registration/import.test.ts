import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import {
  MIN_PESERTA_KELOMPOK,
  pesanMinimalPesertaKelompok,
} from '@/lib/validations/company-registration';
import { parsePesertaPerusahaan } from './import';

function excelFile(rows: Record<string, string>[], nama = 'peserta.xlsx') {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Peserta');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  return new File([buf], nama, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

describe('parsePesertaPerusahaan', () => {
  it('menerima baris valid', async () => {
    const file = excelFile([
      { 'Nama Lengkap': 'Budi Santoso', WhatsApp: '08123456789', Email: 'budi@contoh.com' },
      { 'Nama Lengkap': 'Ani', WhatsApp: '08111', Email: 'ani@contoh.com' },
    ]);
    const hasil = await parsePesertaPerusahaan(file);
    expect(hasil.ok).toBe(true);
    expect(hasil.ok && hasil.peserta).toHaveLength(2);
  });

  it('menolak seluruh berkas jika satu baris gagal (all-or-nothing)', async () => {
    const file = excelFile([
      { 'Nama Lengkap': 'Budi', WhatsApp: '08123456789', Email: 'budi@contoh.com' },
      { 'Nama Lengkap': '', WhatsApp: '08111', Email: 'ani@contoh.com' },
    ]);
    const hasil = await parsePesertaPerusahaan(file);
    expect(hasil.ok).toBe(false);
    expect(!hasil.ok && hasil.gagal.some((g) => g.baris === 3)).toBe(true);
  });

  it('menolak format berkas bukan spreadsheet', async () => {
    const file = new File(['bukan excel'], 'bukti.pdf', { type: 'application/pdf' });
    const hasil = await parsePesertaPerusahaan(file);
    expect(hasil.ok).toBe(false);
    expect(!hasil.ok && hasil.pesan).toMatch(/Format berkas/);
  });

  it('flag aktif: kota/ukuran dinormalisasi; salah ketik dan kolom hilang ditolak', async () => {
    const opsi = {
      butuhLokasi: true,
      butuhUkuran: true,
      lokasiAktif: [{ id: 7, nama: 'Bogor' }],
    };
    const ok = await parsePesertaPerusahaan(
      excelFile([
        {
          'Nama Lengkap': 'Budi',
          WhatsApp: '081',
          Email: 'budi@contoh.com',
          'Lokasi Praktek': ' bogor ',
          'Ukuran Baju': 'xl',
        },
      ]),
      opsi,
    );
    expect(ok.ok && ok.peserta[0]).toMatchObject({ practice_location_id: 7, ukuran_baju: 'XL' });

    const salah = await parsePesertaPerusahaan(
      excelFile([
        {
          'Nama Lengkap': 'Budi',
          WhatsApp: '081',
          Email: 'budi@contoh.com',
          'Lokasi Praktek': 'Bogorr',
          'Ukuran Baju': 'XL',
        },
      ]),
      opsi,
    );
    expect(salah.ok).toBe(false);
    expect(!salah.ok && salah.gagal[0]?.alasan).toMatch(/Bogorr/);
    expect(!salah.ok && salah.gagal[0]?.alasan).toMatch(/Bogor/);

    const lama = await parsePesertaPerusahaan(
      excelFile([{ 'Nama Lengkap': 'Budi', WhatsApp: '081', Email: 'budi@contoh.com' }]),
      opsi,
    );
    expect(lama.ok).toBe(false);
    expect(!lama.ok && lama.pesan).toMatch(/Lokasi Praktek/);
  });
});

describe('MIN_PESERTA_KELOMPOK', () => {
  it('pesan minimal menyebut jumlah terbaca dan konstanta 3', () => {
    expect(MIN_PESERTA_KELOMPOK).toBe(3);
    expect(pesanMinimalPesertaKelompok(2)).toMatch(/minimal 3 peserta/);
    expect(pesanMinimalPesertaKelompok(2)).toMatch(/Terbaca: 2 peserta/);
  });
});
