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
  | "kategori_id"
  | "kategori_en"
  | "lokasi_id"
  | "lokasi_en"
  | "harga"
  | "status"
  | "tanggal_mulai"
  | "tanggal_selesai"
>;

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
  const tanggal = formatTanggalBatch(batch.tanggal_mulai, batch.tanggal_selesai);
  const kategori = pick(batch.kategori_id, batch.kategori_en, locale);
  const lokasi = pick(batch.lokasi_id, batch.lokasi_en, locale);

  return (
    <ContentCard
      variant="public"
      badges={
        <>
          {kategori && <span className={publicBadgeKategori}>{kategori}</span>}
          <span className={publicStatusBatchClass[batch.status]}>{statusLabel}</span>
        </>
      }
      title={pick(batch.judul_id, batch.judul_en, locale)}
      meta={[tanggal, lokasi].filter((line): line is string => Boolean(line))}
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

export async function JadwalBatchSection({ limit = 6 }: { limit?: number } = {}) {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("landing");
  const tBatch = await getTranslations("batch");
  const { data, error } = await supabase
    .from("batches")
    .select(
      "id, slug, judul_id, judul_en, kategori_id, kategori_en, lokasi_id, lokasi_en, harga, status, tanggal_mulai, tanggal_selesai"
    )
    .eq("is_active", true)
    .order("tanggal_mulai", { ascending: true })
    .limit(limit);

  if (error) console.error("[jadwal-batch] gagal memuat:", error);
  if (!data || data.length === 0) return null;

  return (
    <section id="jadwal" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-24">
      <h2 className={publicSectionHeading}>{t("scheduleHeading")}</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((batch) => (
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
