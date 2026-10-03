import { parseSpreadsheet } from '@/lib/import/spreadsheet';
import { PesertaExcelSchema, type PesertaExcel } from '@/lib/validations/company-registration';

/** Header di berkas di-lowercase + trim di `parseSpreadsheet` — kunci wajib ikut huruf kecil. */
export const KOLOM_WAJIB = ['nama lengkap', 'whatsapp', 'email'] as const;

export type BarisGagal = { baris: number; alasan: string };

export type HasilParsePeserta =
  | { ok: true; peserta: PesertaExcel[] }
  | { ok: false; pesan?: string; gagal: BarisGagal[] };

export async function parsePesertaPerusahaan(file: File): Promise<HasilParsePeserta> {
  const mentah = await parseSpreadsheet(file, KOLOM_WAJIB);
  if (!mentah.ok) return { ok: false, pesan: mentah.pesan, gagal: [] };
  if (mentah.rows.length === 0) {
    return { ok: false, pesan: 'Berkas kosong — tidak ada baris peserta.', gagal: [] };
  }

  const peserta: PesertaExcel[] = [];
  const gagal: BarisGagal[] = [];

  for (const row of mentah.rows) {
    const parsed = PesertaExcelSchema.safeParse({
      nama: row.sel['nama lengkap'],
      whatsapp: row.sel.whatsapp,
      email: row.sel.email,
    });
    if (!parsed.success) {
      const alasan = parsed.error.issues[0]?.message ?? 'data tidak valid';
      gagal.push({ baris: row.baris, alasan });
      continue;
    }
    peserta.push(parsed.data);
  }

  // All-or-nothing: satu baris gagal → seluruh berkas ditolak.
  if (gagal.length > 0) return { ok: false, gagal };
  return { ok: true, peserta };
}
