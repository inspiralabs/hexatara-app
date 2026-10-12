import type { Database } from "@/types/database";

type StatusBatch = Database["public"]["Enums"]["status_batch"];

export const STATUS_BATCH_LABEL: Record<StatusBatch, { label: string; className: string }> = {
  upcoming: { label: "Akan Datang", className: "bg-primary/10 text-foreground" },
  open: { label: "Pendaftaran Dibuka", className: "bg-emerald-600/10 text-emerald-600" },
  closed: { label: "Ditutup", className: "bg-muted-foreground/10 text-muted-foreground" },
};

const formatOpts = { day: "numeric", month: "long", year: "numeric" } as const;

export function formatTanggalBatch(
  mulai: string | null,
  selesai: string | null,
  locale: string = "id",
) {
  if (!mulai) return null;
  const fmt = new Intl.DateTimeFormat(locale.startsWith("en") ? "en-GB" : "id-ID", formatOpts);
  const awal = fmt.format(new Date(mulai));
  if (!selesai || selesai === mulai) return awal;
  return `${awal} – ${fmt.format(new Date(selesai))}`;
}

export function formatRupiah(nilai: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nilai);
}

export const METODE_KELAS_TEORI = ['virtual_meeting', 'hybrid', 'full_tatap_muka'] as const;
export type MetodeKelasTeori = (typeof METODE_KELAS_TEORI)[number];

const LABEL_METODE_KELAS_TEORI: Record<MetodeKelasTeori, { id: string; en: string }> = {
  virtual_meeting: { id: 'Virtual Meeting', en: 'Virtual Meeting' },
  hybrid: { id: 'Hybrid', en: 'Hybrid' },
  full_tatap_muka: { id: 'Full Tatap Muka', en: 'Full In-Person' },
};

export function labelMetodeKelasTeori(nilai: string | null | undefined, locale: string) {
  if (nilai !== 'virtual_meeting' && nilai !== 'hybrid' && nilai !== 'full_tatap_muka') return null;
  return locale.startsWith('en') ? LABEL_METODE_KELAS_TEORI[nilai].en : LABEL_METODE_KELAS_TEORI[nilai].id;
}

/** Flag mati: metode null, alamat tetap. Virtual: alamat null. Nilai asing ditolak. */
export function sesuaikanMetodeKelasTeori(
  butuh: boolean,
  metode: string | null | undefined,
  alamat: string | null,
) {
  if (!butuh) return { ok: true as const, metode: null, alamat };
  if (metode == null || metode === '') return { ok: true as const, metode: null, alamat };
  if (metode !== 'virtual_meeting' && metode !== 'hybrid' && metode !== 'full_tatap_muka') {
    return { ok: false as const };
  }
  if (metode === 'virtual_meeting') return { ok: true as const, metode, alamat: null };
  return { ok: true as const, metode, alamat };
}

export function susunPesanBatchTidakBisaDihapus(perorangan: number, kelompok: number) {
  const bagian: string[] = [];
  if (perorangan > 0) bagian.push(`${perorangan} pendaftar perorangan`);
  if (kelompok > 0) bagian.push(`${kelompok} pendaftaran kelompok`);
  const punya = bagian.length > 0 ? `sudah punya ${bagian.join(" dan ")}` : "sudah punya pendaftar";
  return `Batch ini tidak bisa dihapus karena ${punya}. Nonaktifkan batch agar tidak tampil di publik.`;
}

export function stripHtmlExcerpt(html: string | null, maxLen = 120): string | null {
  if (!html) return null;
  const teks = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!teks) return null;
  return teks.length > maxLen ? `${teks.slice(0, maxLen).trimEnd()}…` : teks;
}

/** Pecah HTML Tiptap jadi item akordion per `<h2>`/`<h3>`. Kosong = tidak ada heading. */
export function splitHtmlByHeadings(html: string): { title: string; body: string }[] {
  const re = /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const matches = [...html.matchAll(re)];
  if (matches.length === 0) return [];

  const items: { title: string; body: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]!;
    const title = match[2]!.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const start = match.index! + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1]!.index! : html.length;
    const body = html.slice(start, end).trim();
    if (title) items.push({ title, body });
  }
  return items;
}
