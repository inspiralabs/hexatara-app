import type { Database } from "@/types/database";

type StatusBatch = Database["public"]["Enums"]["status_batch"];

export const STATUS_BATCH_LABEL: Record<StatusBatch, { label: string; className: string }> = {
  upcoming: { label: "Akan Datang", className: "bg-primary/10 text-foreground" },
  open: { label: "Pendaftaran Dibuka", className: "bg-emerald-600/10 text-emerald-600" },
  closed: { label: "Ditutup", className: "bg-muted-foreground/10 text-muted-foreground" },
};

const formatTanggalId = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatTanggalBatch(mulai: string | null, selesai: string | null) {
  if (!mulai) return null;
  const awal = formatTanggalId.format(new Date(mulai));
  if (!selesai || selesai === mulai) return awal;
  return `${awal} – ${formatTanggalId.format(new Date(selesai))}`;
}

export function formatRupiah(nilai: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nilai);
}

export function stripHtmlExcerpt(html: string | null, maxLen = 120): string | null {
  if (!html) return null;
  const teks = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!teks) return null;
  return teks.length > maxLen ? `${teks.slice(0, maxLen).trimEnd()}…` : teks;
}
