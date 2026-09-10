import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import { ContentCard } from "@/components/content-card";

export default async function MateriPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("materi");

  // !inner memaksa hanya materials yang punya minimal 1 baris material_chapters
  // yang ikut terbawa — materi lama era flat PDF/PPT (belum berbab) otomatis
  // tersaring di sini, sekaligus mencegah user mendarat di halaman "belum
  // punya bab" (§12.5.4/ADR-018).
  const { data: materi, error } = await supabase
    .from("materials")
    .select("id, judul_id, judul_en, deskripsi_id, deskripsi_en, poster_url, material_chapters!inner(id)")
    .eq("is_active", true)
    .order("urutan");

  if (error) console.error("[materi] gagal memuat:", error);

  // Persis satu course berbab yang published -> langsung masuk LMS, tidak
  // berhenti di halaman ringkasan (PANDUAN §12.5.3, perbaikan wajib #2).
  if (materi && materi.length === 1) {
    redirect(`/materi/${materi[0]!.id}`);
  }

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
              <ContentCard
                key={m.id}
                image={m.poster_url ? { src: m.poster_url, alt: judul } : undefined}
                badges={
                  <span className="rounded-full bg-warna-sukses/10 px-2.5 py-0.5 text-xs font-medium text-warna-sukses">
                    {t("badgeGratis")}
                  </span>
                }
                title={judul}
                meta={deskripsi ? [deskripsi] : undefined}
                cta={
                  <Link
                    href={`/materi/${m.id}`}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks"
                  >
                    {t("mulaiSekarang")}
                  </Link>
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
