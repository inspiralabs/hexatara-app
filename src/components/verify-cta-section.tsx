import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { publicCtaPrimary, publicSectionHeading } from "@/lib/public-ui";

export async function VerifyCtaSection() {
  const t = await getTranslations("landing");

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-none sm:p-12">
        <h2 className={publicSectionHeading}>{t("verifyHeading")}</h2>
        <p className="max-w-xl text-base text-muted-foreground">{t("verifyDesc")}</p>
        <Link href="/verify" className={`mt-2 ${publicCtaPrimary}`}>
          {t("verifyCta")}
        </Link>
      </div>
    </section>
  );
}
