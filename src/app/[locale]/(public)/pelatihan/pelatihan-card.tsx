import { Link } from "@/i18n/navigation";
import { formatRupiah, formatTanggalBatch, stripHtmlExcerpt } from "@/lib/batch";
import { pick } from "@/lib/i18n/pick";
import { ContentCard } from "@/components/content-card";
import {
  publicBadgeKategori,
  publicCtaSecondary,
  publicStatusBatchClass,
} from "@/lib/public-ui";
import type { Database } from "@/types/database";

export type PelatihanCardBatch = Pick<
  Database["public"]["Tables"]["batches"]["Row"],
  | "id"
  | "slug"
  | "judul_id"
  | "judul_en"
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
> & {
  batch_categories: { nama_id: string; nama_en: string | null } | null;
};

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
  const tanggal = formatTanggalBatch(batch.tanggal_mulai, batch.tanggal_selesai, locale);
  const kategori = pick(
    batch.batch_categories?.nama_id ?? null,
    batch.batch_categories?.nama_en ?? null,
    locale,
  );
  const lokasi = pick(batch.lokasi_id, batch.lokasi_en, locale);
  const deskripsi = pick(batch.deskripsi_id, batch.deskripsi_en, locale);
  const excerpt = stripHtmlExcerpt(deskripsi);
  const judul = pick(batch.judul_id, batch.judul_en, locale) ?? batch.judul_id;

  return (
    <ContentCard
      variant="public"
      image={batch.hero_gambar_url ? { src: batch.hero_gambar_url, alt: judul } : null}
      badges={
        <>
          {kategori && <span className={publicBadgeKategori}>{kategori}</span>}
          <span className={publicStatusBatchClass[batch.status]}>{statusLabel}</span>
        </>
      }
      title={judul}
      meta={[excerpt, [tanggal, lokasi].filter(Boolean).join(" · ")].filter(
        (line): line is string => Boolean(line)
      )}
      rating={batch.rating}
      price={batch.harga != null ? formatRupiah(batch.harga) : undefined}
      cta={
        <Link href={`/pelatihan/${batch.slug}`} className={publicCtaSecondary}>
          {detailLabel}
        </Link>
      }
    />
  );
}
