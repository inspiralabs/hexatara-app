import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export type BarisMentah<K extends string> = {
  // Nomor baris di berkas Admin, termasuk baris header — bukan indeks array.
  baris: number;
  sel: Record<K, string>;
};

type HasilBaris<K extends string> = { ok: true; rows: BarisMentah<K>[] } | { ok: false; pesan: string };

// Sel tanggal Excel datang sebagai serial number (mis. 46037), BUKAN Date/string
// terformat — sengaja tidak memakai opsi cellDates/dateNF milik xlsx: keduanya
// membentuk objek Date yang dibaca lewat getter LOKAL, sehingga hasilnya bisa
// meleset satu hari tergantung timezone server (Vercel biasanya UTC, bukan WIB).
// XLSX.SSF.parse_date_code() murni aritmetika kalender, tidak tersentuh timezone.
function selToString<K extends string>(kolom: K, nilai: unknown, kolomTanggal: ReadonlySet<K>): string {
  if (kolomTanggal.has(kolom) && typeof nilai === 'number') {
    const { y, m, d } = XLSX.SSF.parse_date_code(nilai);
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return String(nilai ?? '').trim();
}

function rowsFromMatrix<K extends string>(
  matrix: unknown[][],
  kolomWajib: readonly K[],
  kolomTanggal: ReadonlySet<K>
): HasilBaris<K> {
  const header = (matrix[0] ?? []).map((h) => String(h ?? '').trim().toLowerCase());
  const indexOf = new Map(header.map((h, i) => [h, i]));
  const kolomHilang = kolomWajib.filter((k) => !indexOf.has(k));
  if (kolomHilang.length > 0) {
    return {
      ok: false,
      pesan: `Kolom tidak sesuai template (hilang: ${kolomHilang.join(', ')}). Unduh ulang template dan gunakan itu.`,
    };
  }

  const rows: BarisMentah<K>[] = [];
  for (let i = 1; i < matrix.length; i++) {
    const baris = matrix[i] ?? [];
    const sel = Object.fromEntries(
      kolomWajib.map((k) => [k, selToString(k, baris[indexOf.get(k)!], kolomTanggal)])
    ) as Record<K, string>;
    const semuaKosong = kolomWajib.every((k) => !sel[k]);
    if (semuaKosong) continue; // baris kosong (mis. baris terakhir berkas), bukan data
    rows.push({ baris: i + 1, sel }); // +1: indeks 0 = header = baris file 1
  }
  return { ok: true, rows };
}

function parseCsv<K extends string>(text: string, kolomWajib: readonly K[], kolomTanggal: ReadonlySet<K>) {
  const hasil = Papa.parse<string[]>(text, { skipEmptyLines: false });
  return rowsFromMatrix(hasil.data, kolomWajib, kolomTanggal);
}

function parseExcel<K extends string>(buffer: ArrayBuffer, kolomWajib: readonly K[], kolomTanggal: ReadonlySet<K>) {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const namaSheet = workbook.SheetNames[0];
  const sheet = namaSheet ? workbook.Sheets[namaSheet] : undefined;
  if (!sheet) return { ok: false as const, pesan: 'Berkas Excel tidak berisi sheet apa pun.' };
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: '' });
  return rowsFromMatrix(matrix, kolomWajib, kolomTanggal);
}

// Dipakai bersama oleh impor sertifikat (F02.8) dan impor bank soal (F03.13) —
// satu tempat untuk aturan parsing CSV/Excel, bukan disalin per fitur.
export async function parseSpreadsheet<K extends string>(
  file: File,
  kolomWajib: readonly K[],
  kolomTanggal: ReadonlySet<K> = new Set()
): Promise<HasilBaris<K>> {
  const nama = file.name.toLowerCase();
  if (nama.endsWith('.csv')) return parseCsv(await file.text(), kolomWajib, kolomTanggal);
  if (nama.endsWith('.xlsx') || nama.endsWith('.xls')) return parseExcel(await file.arrayBuffer(), kolomWajib, kolomTanggal);
  return { ok: false, pesan: 'Format berkas tidak didukung. Gunakan .csv atau .xlsx.' };
}
