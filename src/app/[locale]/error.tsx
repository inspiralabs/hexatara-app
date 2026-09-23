"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { ForceLightDocument } from "@/components/shell/force-light-document";
import {
  publicCtaPrimary,
  publicCtaSecondary,
  publicSectionHeading,
} from "@/lib/public-ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      data-surface="public"
      className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-16 text-center text-foreground"
    >
      <ForceLightDocument surface="public" />
      <BrandLogo size={48} unoptimized={false} />
      <h1 className={`mt-6 ${publicSectionHeading}`}>{t("errorTitle")}</h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">{t("errorBody")}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className={publicCtaPrimary}>
          {t("errorRetry")}
        </button>
        <Link href="/" className={publicCtaSecondary}>
          {t("errorHome")}
        </Link>
      </div>
    </div>
  );
}
