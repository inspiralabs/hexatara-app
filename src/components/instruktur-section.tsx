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
      {/* Lebih kecil dari Produk/Pelatihan: aspect-video + grid lebih padat */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {data.map((instruktur) => (
          <article
            key={instruktur.id}
            className="group overflow-hidden rounded-xl border border-border bg-card shadow-none [transition:var(--transition-hover)] hover:-translate-y-0.5 hover:shadow-float-hover"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              {instruktur.foto_url ? (
                <Image
                  src={instruktur.foto_url}
                  alt=""
                  fill
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  loading="lazy"
                />
              ) : null}
            </div>
            <div className="px-3 py-3">
              <p className="text-sm font-semibold leading-snug text-foreground sm:text-base">
                {instruktur.nama}
              </p>
              {instruktur.jabatan_id && (
                <p className="mt-0.5 text-sm text-muted-foreground">
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
