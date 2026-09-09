import { parseSpreadsheet as parseSpreadsheetGeneric, type BarisMentah as BarisMentahGeneric } from '@/lib/import/spreadsheet';

export const KOLOM_WAJIB = [
  'no',
  'pertanyaan_id',
  'pertanyaan_en',
  'jawaban_benar',
  'opsi_a_id',
  'opsi_a_en',
  'penjelasan_a_id',
  'penjelasan_a_en',
  'opsi_b_id',
  'opsi_b_en',
  'penjelasan_b_id',
  'penjelasan_b_en',
  'opsi_c_id',
  'opsi_c_en',
  'penjelasan_c_id',
  'penjelasan_c_en',
  'opsi_d_id',
  'opsi_d_en',
  'penjelasan_d_id',
  'penjelasan_d_en',
] as const;

type Kolom = (typeof KOLOM_WAJIB)[number];
export type BarisMentah = BarisMentahGeneric<Kolom>;

type HurufOpsi = 'a' | 'b' | 'c' | 'd';
const HURUF_OPSI: readonly HurufOpsi[] = ['a', 'b', 'c', 'd'];

// Kolom per opsi, ditulis eksplisit (bukan template literal di-cast) supaya
// TypeScript tetap memeriksa nama kolomnya cocok dengan KOLOM_WAJIB di atas.
const KOLOM_OPSI: { huruf: HurufOpsi; label: Kolom; labelEn: Kolom; penjelasan: Kolom; penjelasanEn: Kolom }[] = [
  { huruf: 'a', label: 'opsi_a_id', labelEn: 'opsi_a_en', penjelasan: 'penjelasan_a_id', penjelasanEn: 'penjelasan_a_en' },
  { huruf: 'b', label: 'opsi_b_id', labelEn: 'opsi_b_en', penjelasan: 'penjelasan_b_id', penjelasanEn: 'penjelasan_b_en' },
  { huruf: 'c', label: 'opsi_c_id', labelEn: 'opsi_c_en', penjelasan: 'penjelasan_c_id', penjelasanEn: 'penjelasan_c_en' },
  { huruf: 'd', label: 'opsi_d_id', labelEn: 'opsi_d_en', penjelasan: 'penjelasan_d_id', penjelasanEn: 'penjelasan_d_en' },
];

export type OpsiImpor = {
  label_id: string;
  label_en: string | null;
  is_correct: boolean;
  penjelasan_id: string | null;
  penjelasan_en: string | null;
};

export type SoalImpor = {
  pertanyaan_id: string;
  pertanyaan_en: string | null;
  // Urutan tetap a, b, c, d.
  opsi: OpsiImpor[];
};

export type HasilValidasiBaris = { ok: true; data: SoalImpor } | { ok: false; alasan: string };

function teksOrNull(v: string) {
  const t = v.trim();
  return t ? t : null;
}

export function validateRow(sel: Record<Kolom, string>): HasilValidasiBaris {
  const pertanyaan = sel.pertanyaan_id.trim();
  if (!pertanyaan) return { ok: false, alasan: 'pertanyaan (Indonesia) kosong' };

  const jawaban = sel.jawaban_benar.trim().toLowerCase();
  if (!HURUF_OPSI.includes(jawaban as HurufOpsi)) {
    return { ok: false, alasan: 'jawaban_benar harus salah satu dari a/b/c/d' };
  }

  const opsi: OpsiImpor[] = [];
  for (const k of KOLOM_OPSI) {
    const label = sel[k.label].trim();
    if (!label) return { ok: false, alasan: `opsi ${k.huruf} (Indonesia) kosong` };
    const benar = k.huruf === jawaban;
    opsi.push({
      label_id: label,
      label_en: teksOrNull(sel[k.labelEn]),
      is_correct: benar,
      // Penjelasan cuma milik opsi salah (PRD §8.10) — nilai untuk opsi benar
      // diabaikan diam-diam walau kolomnya terisi, bukan alasan menolak baris.
      penjelasan_id: benar ? null : teksOrNull(sel[k.penjelasan]),
      penjelasan_en: benar ? null : teksOrNull(sel[k.penjelasanEn]),
    });
  }

  return {
    ok: true,
    data: { pertanyaan_id: pertanyaan, pertanyaan_en: teksOrNull(sel.pertanyaan_en), opsi },
  };
}

export async function parseSpreadsheet(
  file: File
): Promise<{ ok: true; rows: BarisMentah[] } | { ok: false; pesan: string }> {
  return parseSpreadsheetGeneric(file, KOLOM_WAJIB);
}
