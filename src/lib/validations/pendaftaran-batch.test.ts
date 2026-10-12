import { describe, expect, it } from 'vitest';
import { labelKategoriPeserta, resolveKategoriPeserta } from './pendaftaran-batch';

describe('resolveKategoriPeserta', () => {
  it('flag mati menyimpan null meski klien mengirim nilai', () => {
    expect(resolveKategoriPeserta(false, 'penerbitan_baru')).toEqual({ ok: true, value: null });
  });

  it('flag hidup menolak nilai kosong atau asing', () => {
    expect(resolveKategoriPeserta(true, undefined).ok).toBe(false);
    expect(resolveKategoriPeserta(true, 'lain').ok).toBe(false);
  });

  it('flag hidup menerima enum', () => {
    expect(resolveKategoriPeserta(true, 'perpanjangan_renewal')).toEqual({
      ok: true,
      value: 'perpanjangan_renewal',
    });
  });
});

describe('labelKategoriPeserta', () => {
  it('null tampil sebagai tanda pisah', () => {
    expect(labelKategoriPeserta(null)).toBe('—');
    expect(labelKategoriPeserta('penerbitan_baru')).toBe('Penerbitan baru');
  });
});
