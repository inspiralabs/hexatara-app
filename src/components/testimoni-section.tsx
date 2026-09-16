import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        {data.map((testi) => {
          const peran = pick(testi.peran_id, testi.peran_en, locale);
          const initials = testi.nama
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase();

          return (
            <figure
              key={testi.id}
              className="flex flex-col rounded-xl border border-border bg-gradient-to-b from-card to-muted/20 p-4 text-start shadow-none [transition:var(--transition-hover)] hover:-translate-y-0.5 hover:from-card hover:to-muted/40 hover:shadow-float-hover sm:p-6"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  size="lg"
                  className="size-12 rounded-md after:rounded-md data-[size=lg]:size-12"
                >
                  {testi.foto_url ? (
                    <AvatarImage
                      src={testi.foto_url}
                      alt=""
                      className="rounded-md"
                    />
                  ) : null}
                  <AvatarFallback className="rounded-md bg-muted text-sm font-medium text-muted-foreground">
                    {initials || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col items-start">
                  <figcaption className="truncate text-base font-semibold leading-none text-foreground">
                    {testi.nama}
                  </figcaption>
                  {peran && <p className="mt-1 truncate text-sm text-muted-foreground">{peran}</p>}
                </div>
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {pick(testi.isi_id, testi.isi_en, locale)}
              </blockquote>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
