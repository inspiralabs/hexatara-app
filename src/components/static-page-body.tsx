import { getTranslations } from "next-intl/server";

// Halaman statis (Tentang Kami, Ketentuan Layanan, dll) — draft konten
// fungsional, bukan final legal, isinya di messages.static.<namespace>.
export async function StaticPageBody({ namespace }: { namespace: string }) {
  const t = await getTranslations(`static.${namespace}`);
  const body = t.raw("body") as string[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h1>
      <div className="mt-6 flex flex-col gap-4 text-base leading-relaxed text-muted-foreground">
        {body.map((paragraf, i) => (
          <p key={i}>{paragraf}</p>
        ))}
      </div>
    </div>
  );
}
