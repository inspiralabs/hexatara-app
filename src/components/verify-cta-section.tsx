import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function VerifyCtaSection() {
  const t = await getTranslations("landing");

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-muted p-8 text-center sm:p-12">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">{t("verifyHeading")}</h2>
        <p className="max-w-xl text-base text-muted-foreground">{t("verifyDesc")}</p>
        <Link
          href="/verify"
          className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-float hover:shadow-float-hover [transition:var(--transition-hover)]"
        >
          {t("verifyCta")}
        </Link>
      </div>
    </section>
  );
}
