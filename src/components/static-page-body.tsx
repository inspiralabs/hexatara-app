import { getTranslations } from "next-intl/server";
import { PublicHeroMist } from "@/components/public-hero-mist";
import { publicSectionHeading } from "@/lib/public-ui";

// Halaman statis (Tentang Kami, Ketentuan Layanan, dll) — draft konten
// fungsional, bukan final legal, isinya di messages.static.<namespace>.
export async function StaticPageBody({ namespace }: { namespace: string }) {
  const t = await getTranslations(`static.${namespace}`);
  const body = t.raw("body") as string[];

  return (
    <div className="bg-background pb-16">
      <PublicHeroMist className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center md:py-16">
          <h1 className={publicSectionHeading}>{t("title")}</h1>
        </div>
      </PublicHeroMist>
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <div className="flex flex-col gap-4 text-base leading-relaxed text-muted-foreground">
          {body.map((paragraf, i) => (
            <p key={i}>{paragraf}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
