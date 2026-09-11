"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BENDERA: Record<"id" | "en", string> = { id: "🇮🇩", en: "🇬🇧" };

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale() as "id" | "en";
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: "id" | "en") {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        render={
          <button
            type="button"
            aria-label={t("languageAriaLabel")}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-xl hover:bg-warna-latar-2"
          />
        }
      >
        {BENDERA[locale]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchTo("id")} aria-current={locale === "id"} className="gap-2">
          <span aria-hidden="true">{BENDERA.id}</span> {t("switchToId")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchTo("en")} aria-current={locale === "en"} className="gap-2">
          <span aria-hidden="true">{BENDERA.en}</span> {t("switchToEn")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
