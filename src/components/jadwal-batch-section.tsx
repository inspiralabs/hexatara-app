import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggalBatch } from "@/lib/batch";
import { pick } from "@/lib/i18n/pick";
import { ContentCard } from "@/components/content-card";
import { publicBadgeKategori, publicCtaPrimary, publicSectionHeading, publicStatusBatchClass } from "@/lib/public-ui";
import type { Database } from "@/types/database";

export type Batch = Pick<
  Database["public"]["Tables"]["batches"]["Row"],
  | "id"
  | "slug"
  | "judul_id"
  | "judul_en"
  | "lokasi_id"
  | "lokasi_en"
  | "harga"
  | "status"
  | "rating"
  | "hero_gambar_url"
  | "tanggal_mulai"
  | "tanggal_selesai"
> & {
  batch_categories: { nama_id: string; nama_en: string | null } | null;
};

export function BatchCard({
  batch,
  locale,
  statusLabel,
  registerNowLabel,
}: {
  batch: Batch;
  locale: string;
  statusLabel: string;
  registerNowLabel: string;
}) {
  const tanggal = formatTanggalBatch(batch.tanggal_mulai, batch.tanggal_selesai, locale);
  const kategori = pick(
    batch.batch_categories?.nama_id ?? null,
    batch.batch_categories?.nama_en ?? null,
    locale,
  );
  const lokasi = pick(batch.lokasi_id, batch.lokasi_en, locale);
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
      meta={[tanggal, lokasi].filter((line): line is string => Boolean(line))}
      rating={batch.rating}
      price={batch.harga != null ? formatRupiah(batch.harga) : undefined}
      cta={
        batch.status !== "closed" && (
          <Link href={`/pelatihan/${batch.slug}`} className={publicCtaPrimary}>
            {registerNowLabel}
          </Link>
        )
      }
    />
  );
}

/** Beranda: hanya open/upcoming yang belum lewat tanggal selesai. */
function batchMasihTayang(batch: Batch, hariIni: string) {
  if (batch.status === "closed") return false;
  const akhir = batch.tanggal_selesai ?? batch.tanggal_mulai;
  return !akhir || akhir >= hariIni;
}

export async function JadwalBatchSection({ limit = 6 }: { limit?: number } = {}) {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("landing");
  const tBatch = await getTranslations("batch");
  const hariIni = new Date().toISOString().slice(0, 10);

  // Ambil lebih banyak lalu filter di server component — tanggal_selesai null
  // + status closed tidak aman hanya dengan satu .limit() di query.
  const { data, error } = await supabase
    .from("batches")
    .select(
      "id, slug, judul_id, judul_en, lokasi_id, lokasi_en, harga, status, rating, hero_gambar_url, tanggal_mulai, tanggal_selesai, batch_categories(nama_id, nama_en)"
    )
    .eq("is_active", true)
    .in("status", ["open", "upcoming"])
    .order("tanggal_mulai", { ascending: true })
    .limit(Math.max(limit * 4, 24));

  if (error) console.error("[jadwal-batch] gagal memuat:", error);

  const dataTayang = (data ?? []).filter((b) => batchMasihTayang(b, hariIni)).slice(0, limit);
  if (dataTayang.length === 0) return null;

  return (
    <section id="jadwal" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-24">
      <h2 className={publicSectionHeading}>{t("scheduleHeading")}</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dataTayang.map((batch) => (
          <BatchCard
            key={batch.id}
            batch={batch}
            locale={locale}
            statusLabel={tBatch(`status.${batch.status}`)}
            registerNowLabel={tBatch("registerNow")}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link href="/pelatihan" className={publicCtaPrimary}>
          {t("lihatSemuaPelatihan")}
        </Link>
      </div>
    </section>
  );
}
