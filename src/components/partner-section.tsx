import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { publicSectionHeading } from "@/lib/public-ui";

export async function PartnerSection() {
  const supabase = await createClient();
  const t = await getTranslations("landing");
  const { data, error } = await supabase
    .from("partners")
    .select("id, nama, logo_url")
    .eq("is_active", true)
    .order("urutan", { ascending: true })
    .order("id", { ascending: true });

  if (error) console.error("[partner] gagal memuat:", error);
  if (!data || data.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <h2 className={publicSectionHeading}>{t("partnersHeading")}</h2>
      <ul className="mt-8 flex flex-wrap items-stretch justify-center gap-3 sm:gap-4">
        {data.map((partner) => (
          <li
            key={partner.id}
            className="flex w-[calc(50%-0.375rem)] flex-col items-center sm:w-[calc(33.333%-0.75rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)]"
          >
            {/* Latar netral terang agar logo gelap tetap terbaca di mode gelap */}
            <div className="flex h-24 w-full items-center justify-center rounded-xl border border-border bg-white p-4 sm:h-28">
              <div className="relative h-full w-full">
                <Image
                  src={partner.logo_url}
                  alt={partner.nama}
                  fill
                  className="object-contain"
                  sizes="(min-width: 1024px) 12vw, (min-width: 640px) 20vw, 45vw"
                  quality={90}
                  loading="lazy"
                />
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-center text-sm font-medium text-foreground">
              {partner.nama}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
