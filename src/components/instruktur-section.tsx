import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";

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
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">{t("instructorsHeading")}</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.map((instruktur) => (
          <div key={instruktur.id} className="flex flex-col items-center gap-2 text-center">
            <div className="relative size-24 overflow-hidden rounded-full bg-muted sm:size-32">
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
            <p className="text-base font-semibold text-foreground">{instruktur.nama}</p>
            {instruktur.jabatan_id && (
              <p className="text-sm text-muted-foreground">{pick(instruktur.jabatan_id, instruktur.jabatan_en, locale)}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
