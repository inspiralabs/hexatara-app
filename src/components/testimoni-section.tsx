import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";

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
      <h2 className="text-xl font-bold text-warna-teks sm:text-2xl">{t("testimonialsHeading")}</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((testi) => (
          <figure
            key={testi.id}
            className="flex flex-col gap-3 rounded-xl border border-warna-latar-2 bg-warna-latar p-4 shadow-float hover:-translate-y-0.5 hover:shadow-float-hover [transition:var(--transition-hover)]"
          >
            <blockquote className="text-base text-warna-teks">
              &ldquo;{pick(testi.isi_id, testi.isi_en, locale)}&rdquo;
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-warna-latar-2">
                {testi.foto_url && (
                  <Image src={testi.foto_url} alt="" fill className="object-cover" sizes="40px" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-warna-teks">{testi.nama}</p>
                {testi.peran_id && (
                  <p className="text-sm text-warna-teks-2">{pick(testi.peran_id, testi.peran_en, locale)}</p>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
