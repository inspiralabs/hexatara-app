import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATUS_BATCH_LABEL, formatRupiah, formatTanggalBatch } from "@/lib/batch";
import { pick } from "@/lib/i18n/pick";
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
  const status = STATUS_BATCH_LABEL[batch.status];
  const kategori = pick(batch.kategori_id, batch.kategori_en, locale);
  const lokasi = pick(batch.lokasi_id, batch.lokasi_en, locale);

  return (
    <article className="flex flex-col gap-2 rounded-xl border border-warna-latar-2 bg-warna-latar p-4">
      <div className="flex flex-wrap items-center gap-2">
        {kategori && (
          <span className="rounded-full bg-warna-utama/10 px-2.5 py-0.5 text-xs font-medium text-warna-utama">
            {kategori}
          </span>
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
          {statusLabel}
        </span>
      </div>
      <h3 className="text-lg font-bold text-warna-teks">{pick(batch.judul_id, batch.judul_en, locale)}</h3>
      {tanggal && <p className="text-sm text-warna-teks-2">{tanggal}</p>}
      {lokasi && <p className="text-sm text-warna-teks-2">{lokasi}</p>}
      {batch.harga != null && (
        <p className="text-base font-semibold text-warna-teks">{formatRupiah(batch.harga)}</p>
      )}
      {batch.status !== "closed" && (
        <Link
          href={`/batch/${batch.slug}`}
          className="mt-2 inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          {registerNowLabel}
        </Link>
      )}
    </article>
  );
}

export async function JadwalBatchSection() {
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
    .order("tanggal_mulai", { ascending: true });

  if (error) console.error("[jadwal-batch] gagal memuat:", error);
  if (!data || data.length === 0) return null;

  return (
    <section id="jadwal" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10">
      <h2 className="text-xl font-bold text-warna-teks sm:text-2xl">{t("scheduleHeading")}</h2>
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
    </section>
  );
}
