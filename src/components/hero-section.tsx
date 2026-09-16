import { GraduationCap, ShoppingBag } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWhatsappAdmin } from "@/lib/site-settings";
import { pick } from "@/lib/i18n/pick";
import { HeroCarousel, type HeroSlideItem } from "@/components/hero-carousel";
import { publicCtaPrimary, publicCtaSecondary } from "@/lib/public-ui";

const cardCtaClass = `${publicCtaPrimary} mt-auto w-full px-3 text-sm sm:px-5 sm:text-base`;

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
    <section className="relative overflow-hidden bg-background bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Dekorasi soft — hanya hero, tanpa foto stok */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -right-20 size-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-secondary/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 gap-6 sm:gap-10 md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-card/90 p-4 shadow-none backdrop-blur-sm">
                <GraduationCap className="size-6 text-primary" aria-hidden="true" />
                <h2 className="font-heading text-base font-semibold leading-tight text-foreground">
                  {t("offerTrainingTitle")}
                </h2>
                <p className="hidden text-sm text-muted-foreground sm:block">{t("offerTrainingDesc")}</p>
                <Link href="/pelatihan" className={cardCtaClass}>
                  {t("offerTrainingCta")}
                </Link>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-border bg-card/90 p-4 shadow-none backdrop-blur-sm">
                <ShoppingBag className="size-6 text-primary" aria-hidden="true" />
                <h2 className="font-heading text-base font-semibold leading-tight text-foreground">
                  {t("offerRetailTitle")}
                </h2>
                <p className="hidden text-sm text-muted-foreground sm:block">{t("offerRetailDesc")}</p>
                <Link href="/katalog" className={cardCtaClass}>
                  {t("offerRetailCta")}
                </Link>
              </div>
            </div>

            {nomorWa && (
              <div className="flex flex-col items-start gap-3 rounded-xl border border-border/80 bg-card/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground sm:text-base">{t("contactPrompt")}</p>
                <a
                  href={`https://wa.me/${nomorWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={tCommon("whatsappAriaLabel")}
                  className={publicCtaSecondary}
                >
                  {t("contactCta")}
                </a>
              </div>
            )}
          </div>

          <HeroCarousel slides={slides} />
        </div>
      </div>
    </section>
  );
}
