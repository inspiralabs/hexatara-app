import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { addYears, format, isValid, parse } from 'date-fns';

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

export type BarisMentah = {
  // Nomor baris di berkas Admin, termasuk baris header — bukan indeks array.
  baris: number;
  sel: Record<Kolom, string>;
};

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

const KOLOM_TANGGAL = new Set<Kolom>(['tanggal_terbit', 'tanggal_kedaluwarsa']);

// Sel tanggal Excel datang sebagai serial number (mis. 46037), BUKAN Date/string
// terformat — sengaja tidak memakai opsi cellDates/dateNF milik xlsx: keduanya
// membentuk objek Date yang dibaca lewat getter LOKAL, sehingga hasilnya bisa
// meleset satu hari tergantung timezone server (Vercel biasanya UTC, bukan WIB).
// XLSX.SSF.parse_date_code() murni aritmetika kalender, tidak tersentuh timezone.
function selToString(kolom: Kolom, nilai: unknown): string {
  if (KOLOM_TANGGAL.has(kolom) && typeof nilai === 'number') {
    const { y, m, d } = XLSX.SSF.parse_date_code(nilai);
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return String(nilai ?? '').trim();
}

function rowsFromMatrix(matrix: unknown[][]): { ok: true; rows: BarisMentah[] } | { ok: false; pesan: string } {
  const header = (matrix[0] ?? []).map((h) => String(h ?? '').trim().toLowerCase());
  const indexOf = new Map(header.map((h, i) => [h, i]));
  const kolomHilang = KOLOM_WAJIB.filter((k) => !indexOf.has(k));
  if (kolomHilang.length > 0) {
    return {
      ok: false,
      pesan: `Kolom tidak sesuai template (hilang: ${kolomHilang.join(', ')}). Unduh ulang template dan gunakan itu.`,
    };
  }

  const rows: BarisMentah[] = [];
  for (let i = 1; i < matrix.length; i++) {
    const baris = matrix[i] ?? [];
    const sel = Object.fromEntries(
      KOLOM_WAJIB.map((k) => [k, selToString(k, baris[indexOf.get(k)!])])
    ) as Record<Kolom, string>;
    const semuaKosong = KOLOM_WAJIB.every((k) => !sel[k]);
    if (semuaKosong) continue; // baris kosong (mis. baris terakhir berkas), bukan data
    rows.push({ baris: i + 1, sel }); // +1: indeks 0 = header = baris file 1
  }
  return { ok: true, rows };
}

function parseCsv(text: string) {
  const hasil = Papa.parse<string[]>(text, { skipEmptyLines: false });
  return rowsFromMatrix(hasil.data);
}

function parseExcel(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const namaSheet = workbook.SheetNames[0];
  const sheet = namaSheet ? workbook.Sheets[namaSheet] : undefined;
  if (!sheet) return { ok: false as const, pesan: 'Berkas Excel tidak berisi sheet apa pun.' };
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: '' });
  return rowsFromMatrix(matrix);
}

export async function parseSpreadsheet(
  file: File
): Promise<{ ok: true; rows: BarisMentah[] } | { ok: false; pesan: string }> {
  const nama = file.name.toLowerCase();
  if (nama.endsWith('.csv')) return parseCsv(await file.text());
  if (nama.endsWith('.xlsx') || nama.endsWith('.xls')) return parseExcel(await file.arrayBuffer());
  return { ok: false, pesan: 'Format berkas tidak didukung. Gunakan .csv atau .xlsx.' };
}
