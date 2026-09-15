import { GraduationCap, ShoppingBag } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWhatsappAdmin } from "@/lib/site-settings";
import { pick } from "@/lib/i18n/pick";
import { HeroCarousel, type HeroSlideItem } from "@/components/hero-carousel";

export async function HeroSection() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("landing");
  const tCommon = await getTranslations("common");
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, judul_id, judul_en, subjudul_id, subjudul_en, gambar_url, cta_url")
    .eq("is_active", true)
    .order("urutan", { ascending: true });

  if (error) console.error("[hero] gagal memuat:", error);

  const slides: HeroSlideItem[] = (data ?? []).map((s) => ({
    id: s.id,
    judul: pick(s.judul_id, s.judul_en, locale) ?? s.judul_id,
    subjudul: pick(s.subjudul_id, s.subjudul_en, locale),
    gambarUrl: s.gambar_url,
    ctaUrl: s.cta_url,
  }));

  const nomorWa = await getWhatsappAdmin();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="grid grid-cols-1 gap-6 sm:gap-10 md:grid-cols-2 md:items-center">
        {/* Dua penawaran inti — teks tetap, tidak bergantung isi database — supaya
            "hexatara menyelenggarakan pelatihan drone DAN jual drone" langsung
            terlihat tanpa scroll di 375px (PRD §1.3/§6.1). */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-4">
              <GraduationCap className="size-6 text-foreground" aria-hidden="true" />
              <h2 className="text-base font-bold leading-tight text-foreground">{t("offerTrainingTitle")}</h2>
              <p className="hidden text-sm text-muted-foreground sm:block">{t("offerTrainingDesc")}</p>
            </div>
            <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-4">
              <ShoppingBag className="size-6 text-foreground" aria-hidden="true" />
              <h2 className="text-base font-bold leading-tight text-foreground">{t("offerRetailTitle")}</h2>
              <p className="hidden text-sm text-muted-foreground sm:block">{t("offerRetailDesc")}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/pelatihan"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-base font-semibold text-primary-foreground shadow-float hover:shadow-float-hover [transition:var(--transition-hover)]"
            >
              {t("offerTrainingCta")}
            </Link>
            <Link
              href="/katalog"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-base font-semibold text-primary-foreground shadow-float hover:shadow-float-hover [transition:var(--transition-hover)]"
            >
              {t("offerRetailCta")}
            </Link>
            {nomorWa && (
              <a
                href={`https://wa.me/${nomorWa}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tCommon("whatsappAriaLabel")}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-foreground px-5 text-base font-semibold text-foreground [transition:var(--transition-hover)] hover:bg-primary/5"
              >
                {t("contactCta")}
              </a>
            )}
          </div>
        </div>

        <HeroCarousel slides={slides} />
      </div>
    </section>
  );
}
