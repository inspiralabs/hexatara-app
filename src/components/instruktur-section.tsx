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
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.map((instruktur) => (
          <div
            key={instruktur.id}
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center shadow-none [transition:var(--transition-hover)] hover:-translate-y-0.5 hover:shadow-float-hover"
          >
            <div className="relative size-24 overflow-hidden rounded-full bg-muted sm:size-28">
              {instruktur.foto_url && (
                <Image
                  src={instruktur.foto_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold leading-snug text-foreground">{instruktur.nama}</p>
              {instruktur.jabatan_id && (
                <p className="text-sm text-muted-foreground">
                  {pick(instruktur.jabatan_id, instruktur.jabatan_en, locale)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
