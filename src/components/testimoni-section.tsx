import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import { publicSectionHeading } from "@/lib/public-ui";

export async function TestimoniSection() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("landing");
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, nama, peran_id, peran_en, isi_id, isi_en, foto_url")
    .eq("is_active", true)
    .order("urutan", { ascending: true });

  if (error) console.error("[testimoni] gagal memuat:", error);
  if (!data || data.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <h2 className={publicSectionHeading}>{t("testimonialsHeading")}</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((testi) => (
          <figure
            key={testi.id}
            className="flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 shadow-none [transition:var(--transition-hover)] hover:-translate-y-0.5 hover:shadow-float-hover"
          >
            <blockquote className="text-base leading-relaxed text-foreground">
              &ldquo;{pick(testi.isi_id, testi.isi_en, locale)}&rdquo;
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
                {testi.foto_url && (
                  <Image src={testi.foto_url} alt="" fill className="object-cover" sizes="40px" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{testi.nama}</p>
                {testi.peran_id && (
                  <p className="text-sm text-muted-foreground">
                    {pick(testi.peran_id, testi.peran_en, locale)}
                  </p>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
