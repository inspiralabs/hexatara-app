import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";

export default async function MateriPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("materi");

  const { data: materi, error } = await supabase
    .from("materials")
    .select("id, judul_id, judul_en, deskripsi_id, deskripsi_en, file_url")
    .eq("is_active", true)
    .order("urutan");

  if (error) console.error("[materi] gagal memuat:", error);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">{t("pageTitle")}</h1>
      <p className="mt-2 text-base text-warna-teks-2">{t("pageSubtitle")}</p>

      <div className="mt-6 flex flex-col gap-4">
        {!materi || materi.length === 0 ? (
          <p className="rounded-xl border border-warna-latar-2 bg-warna-latar-2 p-5 text-sm text-warna-teks-2">
            {t("kosong")}
          </p>
        ) : (
          materi.map((m) => {
            const judul = pick(m.judul_id, m.judul_en, locale) ?? m.judul_id;
            const deskripsi = pick(m.deskripsi_id, m.deskripsi_en, locale);
            return (
              <article key={m.id} className="rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
                <h2 className="text-lg font-bold text-warna-teks">{judul}</h2>
                {deskripsi && <p className="mt-1 text-sm text-warna-teks-2">{deskripsi}</p>}
                <a
                  href={m.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex h-11 items-center justify-center rounded-lg border border-warna-utama px-5 text-base font-semibold text-warna-utama"
                >
                  {t("buka")}
                </a>
              </article>
            );
          })
        )}
      </div>

      <div className="mt-10 rounded-xl border border-warna-sukses/30 bg-warna-sukses/5 p-5">
        <h2 className="text-lg font-bold text-warna-teks">{t("ctaHeading")}</h2>
        <p className="mt-1 text-sm text-warna-teks-2">{t("ctaBody")}</p>
        <Link
          href="/kuis"
          className="mt-3 inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks"
        >
          {t("ctaButton")}
        </Link>
      </div>
    </div>
  );
}
