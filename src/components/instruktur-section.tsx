import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import { publicSectionHeading } from "@/lib/public-ui";

export async function InstrukturSection({ limit }: { limit?: number } = {}) {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("landing");
  let query = supabase
    .from("instructors")
    .select("id, nama, foto_url, jabatan_id, jabatan_en")
    .eq("is_active", true)
    .order("urutan", { ascending: true });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;

  if (error) console.error("[instruktur] gagal memuat:", error);
  if (!data || data.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <h2 className={publicSectionHeading}>{t("instructorsHeading")}</h2>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((instruktur) => (
          <article
            key={instruktur.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-none [transition:var(--transition-hover)] hover:-translate-y-0.5 hover:shadow-float-hover"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
              {instruktur.foto_url ? (
                <Image
                  src={instruktur.foto_url}
                  alt=""
                  fill
                  className="object-cover object-top transition-transform duration-300 hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              ) : null}
            </div>
            <div className="px-4 py-4">
              <p className="font-heading text-base font-semibold leading-snug text-foreground">
                {instruktur.nama}
              </p>
              {instruktur.jabatan_id && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {pick(instruktur.jabatan_id, instruktur.jabatan_en, locale)}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
