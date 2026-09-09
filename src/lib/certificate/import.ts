import { addYears, format, isValid, parse } from 'date-fns';
import { parseSpreadsheet as parseSpreadsheetGeneric, type BarisMentah as BarisMentahGeneric } from '@/lib/import/spreadsheet';

export const KOLOM_WAJIB = [
  'nomor_sertifikat',
  'jenis',
  'nama_lengkap',
  'tanggal_terbit',
  'tanggal_kedaluwarsa',
] as const;

type Kolom = (typeof KOLOM_WAJIB)[number];
type JenisSertifikat = 'free_track' | 'existing_manual' | 'rpc_certified';
const JENIS_VALID: readonly JenisSertifikat[] = ['free_track', 'existing_manual', 'rpc_certified'];
const KOLOM_TANGGAL = new Set<Kolom>(['tanggal_terbit', 'tanggal_kedaluwarsa']);

export type BarisMentah = BarisMentahGeneric<Kolom>;

export type SertifikatImpor = {
  nomor_sertifikat: string;
  jenis: JenisSertifikat;
  nama_lengkap: string;
  tanggal_terbit: string; // yyyy-MM-dd
  tanggal_kedaluwarsa: string | null;
};

export type HasilValidasiBaris = { ok: true; data: SertifikatImpor } | { ok: false; alasan: string };

function tanggalValid(nilai: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(nilai) && isValid(parse(nilai, 'yyyy-MM-dd', new Date()));
}

// Satu validator dipakai CSV maupun Excel, supaya aturan bisnis tidak ditulis dua kali.
export function validateRow(sel: Record<Kolom, string>): HasilValidasiBaris {
  const nomor = sel.nomor_sertifikat.trim();
  const jenis = sel.jenis.trim() as JenisSertifikat;
  const nama = sel.nama_lengkap.trim();
  const terbit = sel.tanggal_terbit.trim();
  const kedaluwarsa = sel.tanggal_kedaluwarsa.trim();

  if (!nomor) return { ok: false, alasan: 'nomor sertifikat kosong' };
  if (!JENIS_VALID.includes(jenis)) return { ok: false, alasan: 'jenis sertifikat tidak dikenali' };
  if (!nama) return { ok: false, alasan: 'nama lengkap kosong' };
  if (!terbit || !tanggalValid(terbit)) return { ok: false, alasan: 'format tanggal terbit tidak dikenali' };

  if (jenis === 'free_track') {
    if (kedaluwarsa) {
      return { ok: false, alasan: 'sertifikat free track tidak boleh punya tanggal kedaluwarsa' };
    }
    return {
      ok: true,
      data: { nomor_sertifikat: nomor, jenis, nama_lengkap: nama, tanggal_terbit: terbit, tanggal_kedaluwarsa: null },
    };
  }

  if (!kedaluwarsa) {
    const otomatis = format(addYears(parse(terbit, 'yyyy-MM-dd', new Date()), 2), 'yyyy-MM-dd');
    return {
      ok: true,
      data: { nomor_sertifikat: nomor, jenis, nama_lengkap: nama, tanggal_terbit: terbit, tanggal_kedaluwarsa: otomatis },
    };
  }

  if (!tanggalValid(kedaluwarsa)) {
    return { ok: false, alasan: 'format tanggal kedaluwarsa tidak dikenali' };
  }
  return {
    ok: true,
    data: { nomor_sertifikat: nomor, jenis, nama_lengkap: nama, tanggal_terbit: terbit, tanggal_kedaluwarsa: kedaluwarsa },
  };
}

export async function parseSpreadsheet(
  file: File
): Promise<{ ok: true; rows: BarisMentah[] } | { ok: false; pesan: string }> {
  return parseSpreadsheetGeneric(file, KOLOM_WAJIB, KOLOM_TANGGAL);
}
