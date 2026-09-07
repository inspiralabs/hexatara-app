import Image from "next/image";
import { GraduationCap, ShoppingBag } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";

export async function HeroSection() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("landing");
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, judul_id, judul_en, subjudul_id, subjudul_en, gambar_url, cta_teks_id, cta_teks_en, cta_url")
    .eq("is_active", true)
    .order("urutan", { ascending: true })
    .limit(1);

  if (error) console.error("[hero] gagal memuat:", error);
  const slide = data?.[0];

  return (
    <section className="w-full">
      {/* Dua penawaran inti — teks tetap, tidak bergantung isi database — supaya
          "hexatara menyelenggarakan pelatihan drone DAN jual drone" langsung
          terlihat tanpa scroll di 375px (PRD §1.3/§6.1), apa pun isi hero_slides. */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-6 sm:gap-6 sm:py-10">
        <div className="flex flex-col gap-2 rounded-xl border border-warna-latar-2 bg-warna-latar p-4 sm:p-6">
          <GraduationCap className="size-6 text-warna-utama sm:size-8" aria-hidden="true" />
          <h2 className="text-base font-bold leading-tight text-warna-teks sm:text-xl">
            {t("offerTrainingTitle")}
          </h2>
          <p className="hidden text-sm text-warna-teks-2 sm:block">{t("offerTrainingDesc")}</p>
          <a
            href="#jadwal"
            className="mt-auto inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-4 text-sm font-semibold text-warna-teks sm:text-base"
          >
            {t("offerTrainingCta")}
          </a>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-warna-latar-2 bg-warna-latar p-4 sm:p-6">
          <ShoppingBag className="size-6 text-warna-utama sm:size-8" aria-hidden="true" />
          <h2 className="text-base font-bold leading-tight text-warna-teks sm:text-xl">
            {t("offerRetailTitle")}
          </h2>
          <p className="hidden text-sm text-warna-teks-2 sm:block">{t("offerRetailDesc")}</p>
          <Link
            href="/katalog"
            className="mt-auto inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-4 text-sm font-semibold text-warna-teks sm:text-base"
          >
            {t("offerRetailCta")}
          </Link>
        </div>
      </div>

      {slide && (
        <div className="mx-auto max-w-6xl px-4 pb-6 sm:pb-10">
          <div className="overflow-hidden rounded-xl bg-warna-utama sm:flex sm:items-center">
            {slide.gambar_url && (
              <div className="relative aspect-video w-full sm:w-1/2">
                <Image
                  src={slide.gambar_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            )}
            <div className="flex flex-col gap-2 p-6 text-warna-latar sm:w-1/2">
              <h3 className="text-xl font-bold sm:text-2xl">{pick(slide.judul_id, slide.judul_en, locale)}</h3>
              {slide.subjudul_id && (
                <p className="text-base text-warna-latar/90">{pick(slide.subjudul_id, slide.subjudul_en, locale)}</p>
              )}
              {slide.cta_teks_id && slide.cta_url && (
                <a
                  href={slide.cta_url}
                  className="mt-2 inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
                >
                  {pick(slide.cta_teks_id, slide.cta_teks_en, locale)}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
