import { Link } from "@/i18n/navigation";
import { formatRupiah, formatTanggalBatch, stripHtmlExcerpt } from "@/lib/batch";
import { pick } from "@/lib/i18n/pick";
import { ContentCard } from "@/components/content-card";
import { StatusBadge } from "@/components/status-badge";
import type { Database } from "@/types/database";

export type PelatihanCardBatch = Pick<
  Database["public"]["Tables"]["batches"]["Row"],
  | "id"
  | "slug"
  | "judul_id"
  | "judul_en"
  | "kategori_id"
  | "kategori_en"
  | "lokasi_id"
  | "lokasi_en"
  | "deskripsi_id"
  | "deskripsi_en"
  | "harga"
  | "status"
  | "rating"
  | "hero_gambar_url"
  | "tanggal_mulai"
  | "tanggal_selesai"
>;

export function PelatihanCard({
  batch,
  locale,
  statusLabel,
  detailLabel,
}: {
  batch: PelatihanCardBatch;
  locale: string;
  statusLabel: string;
  detailLabel: string;
}) {
  const tanggal = formatTanggalBatch(batch.tanggal_mulai, batch.tanggal_selesai);
  const kategori = pick(batch.kategori_id, batch.kategori_en, locale);
  const lokasi = pick(batch.lokasi_id, batch.lokasi_en, locale);
  const deskripsi = pick(batch.deskripsi_id, batch.deskripsi_en, locale);
  const excerpt = stripHtmlExcerpt(deskripsi);
  const judul = pick(batch.judul_id, batch.judul_en, locale) ?? batch.judul_id;

  return (
    <ContentCard
      image={batch.hero_gambar_url ? { src: batch.hero_gambar_url, alt: judul } : null}
      badges={
        <>
          {kategori && (
            <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-medium text-foreground">
              {kategori}
            </span>
          )}
          <StatusBadge status={batch.status} label={statusLabel} />
        </>
      }
      title={judul}
      meta={[excerpt, [tanggal, lokasi].filter(Boolean).join(" · ")].filter(
        (line): line is string => Boolean(line)
      )}
      rating={batch.rating}
      price={batch.harga != null ? formatRupiah(batch.harga) : undefined}
      cta={
        <Link
          href={`/pelatihan/${batch.slug}`}
          className="inline-flex h-11 w-fit items-center justify-center rounded-lg border border-foreground px-5 text-base font-semibold text-foreground"
        >
          {detailLabel}
        </Link>
      }
    />
  );
}
