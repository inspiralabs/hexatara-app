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

function FlagId({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 15"
      width={20}
      height={15}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="20" height="15" rx="1.5" fill="#fff" />
      <rect width="20" height="7.5" fill="#CE1126" />
      <rect y="7.5" width="20" height="7.5" fill="#fff" />
      <rect
        width="20"
        height="15"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.15"
      />
    </svg>
  );
}

function FlagUk({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 15"
      width={20}
      height={15}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="20" height="15" rx="1.5" fill="#012169" />
      <path d="M0 0 L20 15 M20 0 L0 15" stroke="#fff" strokeWidth="3" />
      <path d="M0 0 L20 15 M20 0 L0 15" stroke="#C8102E" strokeWidth="1.5" />
      <path d="M10 0 V15 M0 7.5 H20" stroke="#fff" strokeWidth="5" />
      <path d="M10 0 V15 M0 7.5 H20" stroke="#C8102E" strokeWidth="2.5" />
      <rect
        width="20"
        height="15"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.15"
      />
    </svg>
  );
}

const BENDERA = {
  id: FlagId,
  en: FlagUk,
} as const;

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale() as "id" | "en";
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const TriggerFlag = BENDERA[locale];

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
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-warna-latar-2"
          />
        }
      >
        <TriggerFlag />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => switchTo("id")}
          aria-current={locale === "id"}
          className="gap-2"
        >
          <FlagId /> {t("switchToId")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchTo("en")}
          aria-current={locale === "en"}
          className="gap-2"
        >
          <FlagUk /> {t("switchToEn")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
