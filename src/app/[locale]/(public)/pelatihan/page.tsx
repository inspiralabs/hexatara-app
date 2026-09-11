import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { BatchCard } from "@/components/jadwal-batch-section";

export default async function PelatihanPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("pelatihan");
  const tBatch = await getTranslations("batch");

  const { data, error } = await supabase
    .from("batches")
    .select(
      "id, slug, judul_id, judul_en, kategori_id, kategori_en, lokasi_id, lokasi_en, harga, status, tanggal_mulai, tanggal_selesai"
    )
    .eq("is_active", true)
    .order("tanggal_mulai", { ascending: true });

  if (error) console.error("[pelatihan] gagal memuat:", error);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">{t("pageTitle")}</h1>
      <p className="mt-2 text-base text-warna-teks-2">{t("pageSubtitle")}</p>

      {!data || data.length === 0 ? (
        <p className="mt-6 rounded-xl border border-warna-latar-2 bg-warna-latar-2 p-5 text-sm text-warna-teks-2">
          {t("kosong")}
        </p>
      ) : (
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
      )}
    </div>
  );
}
