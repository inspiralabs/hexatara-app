import Image from "next/image";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import { publicSectionHeading } from "@/lib/public-ui";

export async function CompanyProfileSection() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data, error } = await supabase
    .from("company_profile")
    .select("judul_id, judul_en, konten_id, konten_en, gambar_url")
    .eq("id", 1)
    .maybeSingle();

  if (error) console.error("[company-profile] gagal memuat:", error);
  if (!data || (!data.judul_id.trim() && !data.konten_id.trim())) return null;

  const judul = pick(data.judul_id, data.judul_en, locale);
  const konten = pick(data.konten_id, data.konten_en, locale);

  return (
    <section className="bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:flex sm:items-center sm:gap-8 md:py-24">
        {data.gambar_url && (
          <div className="group relative mb-6 aspect-video w-full overflow-hidden rounded-xl sm:mb-0 sm:w-1/2">
            <Image
              src={data.gambar_url}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 50vw"
              loading="lazy"
            />
          </div>
        )}
        <div className={data.gambar_url ? "sm:w-1/2" : ""}>
          {judul && <h2 className={publicSectionHeading}>{judul}</h2>}
          {konten && (
            // konten diisi lewat Tiptap di Admin Panel (ENGINEERING §5.8) — HTML dari
            // Admin, bukan input publik, jadi dangerouslySetInnerHTML aman di sini.
            <div
              className="mt-3 space-y-3 text-base text-muted-foreground [&_a]:underline [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: konten }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
