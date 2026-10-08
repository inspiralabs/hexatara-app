import { parseSpreadsheet } from '@/lib/import/spreadsheet';
import { UKURAN_BAJU } from '@/lib/validations/pendaftaran-batch';
import { PesertaExcelSchema, type PesertaExcel } from '@/lib/validations/company-registration';

/** Header di berkas di-lowercase + trim di `parseSpreadsheet` — kunci wajib ikut huruf kecil. */
export const KOLOM_WAJIB = ['nama lengkap', 'whatsapp', 'email'] as const;
const KOLOM_LOKASI = 'lokasi praktek';
const KOLOM_UKURAN = 'ukuran baju';

export type BarisGagal = { baris: number; alasan: string };
export type LokasiAktif = { id: number; nama: string };
export type OpsiParsePeserta = {
  butuhLokasi?: boolean;
  butuhUkuran?: boolean;
  lokasiAktif?: LokasiAktif[];
};

export type HasilParsePeserta =
  | { ok: true; peserta: PesertaExcel[] }
  | { ok: false; pesan?: string; gagal: BarisGagal[] };

function normKota(nilai: string) {
  return nilai.trim().toLowerCase().replace(/\s+/g, ' ');
}

function pesanKolomTambahan(pesan: string, butuhLokasi: boolean, butuhUkuran: boolean) {
  const rendah = pesan.toLowerCase();
  const parts: string[] = [];
  if (butuhLokasi && rendah.includes(KOLOM_LOKASI)) {
    parts.push("Kolom 'Lokasi Praktek' tidak ditemukan. Unduh template terbaru.");
  }
  if (butuhUkuran && rendah.includes(KOLOM_UKURAN)) {
    parts.push("Kolom 'Ukuran Baju' tidak ditemukan. Unduh template terbaru.");
  }
  return parts.length > 0 ? parts.join(' ') : pesan;
}

export async function parsePesertaPerusahaan(
  file: File,
  opsi: OpsiParsePeserta = {},
): Promise<HasilParsePeserta> {
  const butuhLokasi = opsi.butuhLokasi === true;
  const butuhUkuran = opsi.butuhUkuran === true;
  const kolom = [
    ...KOLOM_WAJIB,
    ...(butuhLokasi ? [KOLOM_LOKASI] : []),
    ...(butuhUkuran ? [KOLOM_UKURAN] : []),
  ] as const;

  const mentah = await parseSpreadsheet(file, kolom);
  if (!mentah.ok) {
    return { ok: false, pesan: pesanKolomTambahan(mentah.pesan, butuhLokasi, butuhUkuran), gagal: [] };
  }
  if (mentah.rows.length === 0) {
    return { ok: false, pesan: 'Berkas kosong — tidak ada baris peserta.', gagal: [] };
  }

  const kotaByNorm = new Map(
    (opsi.lokasiAktif ?? []).map((k) => [normKota(k.nama), k] as const),
  );
  const pilihanKota = (opsi.lokasiAktif ?? []).map((k) => k.nama).join(', ');
  const pilihanUkuran = UKURAN_BAJU.join(', ');

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

    let practice_location_id: number | null = null;
    let ukuran_baju: string | null = null;

    if (butuhLokasi) {
      const mentahKota = row.sel[KOLOM_LOKASI] ?? '';
      const cocok = kotaByNorm.get(normKota(mentahKota));
      if (!cocok) {
        gagal.push({
          baris: row.baris,
          alasan: `lokasi '${mentahKota}' tidak valid. Pilihan: ${pilihanKota}`,
        });
        continue;
      }
      practice_location_id = cocok.id;
    }

    if (butuhUkuran) {
      const mentahUkuran = (row.sel[KOLOM_UKURAN] ?? '').trim().toUpperCase();
      if (!(UKURAN_BAJU as readonly string[]).includes(mentahUkuran)) {
        gagal.push({
          baris: row.baris,
          alasan: `ukuran baju '${row.sel[KOLOM_UKURAN] ?? ''}' tidak valid. Pilihan: ${pilihanUkuran}`,
        });
        continue;
      }
      ukuran_baju = mentahUkuran;
    }

    peserta.push({ ...parsed.data, practice_location_id, ukuran_baju });
  }

  // All-or-nothing: satu baris gagal → seluruh berkas ditolak.
  if (gagal.length > 0) return { ok: false, gagal };
  return { ok: true, peserta };
}
