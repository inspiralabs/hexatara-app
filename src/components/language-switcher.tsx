"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: "id" | "en") {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="flex items-center gap-1 text-sm" aria-label="Pilih bahasa">
      <button
        type="button"
        onClick={() => switchTo("id")}
        disabled={isPending || locale === "id"}
        aria-current={locale === "id"}
        className="min-h-11 px-2 font-medium text-warna-teks-2 disabled:text-warna-utama disabled:font-semibold"
      >
        {t("switchToId")}
      </button>
      <span aria-hidden="true" className="text-warna-teks-2">/</span>
      <button
        type="button"
        onClick={() => switchTo("en")}
        disabled={isPending || locale === "en"}
        aria-current={locale === "en"}
        className="min-h-11 px-2 font-medium text-warna-teks-2 disabled:text-warna-utama disabled:font-semibold"
      >
        {t("switchToEn")}
      </button>
    </div>
  );
}
