import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { ForceLightDocument } from "@/components/shell/force-light-document";
import {
  publicCtaPrimary,
  publicCtaSecondary,
  publicSectionHeading,
} from "@/lib/public-ui";

export default async function NotFoundPage() {
  const t = await getTranslations("errors");

  return (
    <div
      data-surface="public"
      className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-16 text-center text-foreground"
    >
      <ForceLightDocument surface="public" />
      <BrandLogo size={48} priority unoptimized={false} />
      <h1 className={`mt-6 ${publicSectionHeading}`}>{t("notFoundTitle")}</h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">{t("notFoundBody")}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={publicCtaPrimary}>
          {t("notFoundHome")}
        </Link>
        <Link href="/verify" className={publicCtaSecondary}>
          {t("notFoundVerify")}
        </Link>
      </div>
    </div>
  );
}
