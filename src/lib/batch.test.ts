import { describe, expect, it } from 'vitest';
import { labelMetodeKelasTeori, sesuaikanMetodeKelasTeori, susunPesanBatchTidakBisaDihapus } from './batch';

describe('susunPesanBatchTidakBisaDihapus', () => {
  it('menyebut perorangan saja bila kelompok 0', () => {
    expect(susunPesanBatchTidakBisaDihapus(2, 0)).toBe(
      'Batch ini tidak bisa dihapus karena sudah punya 2 pendaftar perorangan. Nonaktifkan batch agar tidak tampil di publik.',
    );
  });

  it('menyebut kelompok saja bila perorangan 0', () => {
    expect(susunPesanBatchTidakBisaDihapus(0, 1)).toBe(
      'Batch ini tidak bisa dihapus karena sudah punya 1 pendaftaran kelompok. Nonaktifkan batch agar tidak tampil di publik.',
    );
  });

  it('menyebut keduanya', () => {
    expect(susunPesanBatchTidakBisaDihapus(3, 2)).toBe(
      'Batch ini tidak bisa dihapus karena sudah punya 3 pendaftar perorangan dan 2 pendaftaran kelompok. Nonaktifkan batch agar tidak tampil di publik.',
    );
  });

  it('label metode mengikuti locale', () => {
    expect(labelMetodeKelasTeori('full_tatap_muka', 'id')).toBe('Full Tatap Muka');
    expect(labelMetodeKelasTeori('full_tatap_muka', 'en')).toBe('Full In-Person');
    expect(labelMetodeKelasTeori(null, 'id')).toBeNull();
  });

  it('flag mati mengosongkan metode dan mempertahankan alamat', () => {
    expect(sesuaikanMetodeKelasTeori(false, 'hybrid', 'Jl. Mawar')).toEqual({
      ok: true,
      metode: null,
      alamat: 'Jl. Mawar',
    });
  });

  it('virtual mengosongkan alamat; hybrid mempertahankan alamat', () => {
    expect(sesuaikanMetodeKelasTeori(true, 'virtual_meeting', 'Jl. Mawar')).toEqual({
      ok: true,
      metode: 'virtual_meeting',
      alamat: null,
    });
    expect(sesuaikanMetodeKelasTeori(true, 'hybrid', 'Jl. Mawar').alamat).toBe('Jl. Mawar');
  });

  it('tanpa angka bila keduanya 0 (pelanggaran FK setelah hitung)', () => {
    expect(susunPesanBatchTidakBisaDihapus(0, 0)).toBe(
      'Batch ini tidak bisa dihapus karena sudah punya pendaftar. Nonaktifkan batch agar tidak tampil di publik.',
    );
  });
});
