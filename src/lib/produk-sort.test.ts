import { describe, expect, it } from 'vitest';
import { compareKatalogUrutan, masukKelompokMerch, urutanBerikutnyaUntukKelompok } from './produk-sort';

const MERCH = 'kategori-merch';
const LAIN = 'kategori-lain';

describe('masukKelompokMerch', () => {
  it('true hanya untuk category_id yang persis sama dengan kategori merchandise', () => {
    expect(masukKelompokMerch(MERCH, MERCH)).toBe(true);
    expect(masukKelompokMerch(LAIN, MERCH)).toBe(false);
    expect(masukKelompokMerch(null, MERCH)).toBe(false);
  });

  it('selalu false kalau kategori merchandise belum ada', () => {
    expect(masukKelompokMerch(MERCH, null)).toBe(false);
    expect(masukKelompokMerch(null, null)).toBe(false);
  });
});

describe('compareKatalogUrutan', () => {
  function item(category_id: string | null, urutan: number, created_at: string) {
    return { category_id, urutan, created_at };
  }

  it('kelompok produk selalu lebih dulu dari merchandise', () => {
    const produk = item(LAIN, 5, '2026-01-01');
    const merch = item(MERCH, 0, '2026-01-01');
    expect(compareKatalogUrutan(produk, merch, MERCH)).toBeLessThan(0);
    expect(compareKatalogUrutan(merch, produk, MERCH)).toBeGreaterThan(0);
  });

  it('dalam satu kelompok, urutan naik menang', () => {
    const a = item(LAIN, 0, '2026-01-01');
    const b = item(LAIN, 1, '2026-01-01');
    expect(compareKatalogUrutan(a, b, MERCH)).toBeLessThan(0);
  });

  it('urutan sama, tie-break created_at terbaru dulu', () => {
    const lama = item(LAIN, 0, '2026-01-01');
    const baru = item(LAIN, 0, '2026-06-01');
    expect(compareKatalogUrutan(baru, lama, MERCH)).toBeLessThan(0);
  });

  it('array.sort menghasilkan produk (naik) lalu merchandise (naik)', () => {
    const items = [
      item(MERCH, 1, '2026-01-01'),
      item(LAIN, 2, '2026-01-01'),
      item(MERCH, 0, '2026-01-01'),
      item(LAIN, 0, '2026-01-01'),
    ];
    const hasil = [...items].sort((a, b) => compareKatalogUrutan(a, b, MERCH));
    expect(hasil.map((i) => [i.category_id, i.urutan])).toEqual([
      [LAIN, 0],
      [LAIN, 2],
      [MERCH, 0],
      [MERCH, 1],
    ]);
  });
});

describe('urutanBerikutnyaUntukKelompok', () => {
  it('0 kalau kelompok masih kosong', () => {
    expect(urutanBerikutnyaUntukKelompok([], MERCH, false)).toBe(0);
    expect(urutanBerikutnyaUntukKelompok([{ category_id: LAIN, urutan: 5 }], MERCH, true)).toBe(0);
  });

  it('max + 1 hanya dihitung dari baris di kelompok yang sama', () => {
    const items = [
      { category_id: LAIN, urutan: 0 },
      { category_id: LAIN, urutan: 3 },
      { category_id: MERCH, urutan: 10 },
    ];
    expect(urutanBerikutnyaUntukKelompok(items, MERCH, false)).toBe(4);
    expect(urutanBerikutnyaUntukKelompok(items, MERCH, true)).toBe(11);
  });

  it('kategori merchandise belum ada → semua baris dihitung sebagai kelompok produk', () => {
    const items = [{ category_id: null, urutan: 2 }];
    expect(urutanBerikutnyaUntukKelompok(items, null, false)).toBe(3);
  });
});
