"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language-switcher";

export function PublicNavMobile({
  items,
  hrefMasuk,
  labelMasuk,
}: {
  items: { href: string; label: string }[];
  hrefMasuk: string;
  labelMasuk: string;
}) {
  const t = useTranslations("common");
  const [terbuka, setTerbuka] = useState(false);

  return (
    <Sheet open={terbuka} onOpenChange={setTerbuka}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            className="size-11 md:hidden"
            aria-label={t("openMenuAriaLabel")}
          />
        }
      >
        <MenuIcon className="size-6" />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{t("menuLabel")}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setTerbuka(false)}
              className="flex min-h-11 items-center text-base text-warna-teks hover:text-warna-utama"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={hrefMasuk}
            onClick={() => setTerbuka(false)}
            className="flex min-h-11 items-center text-base font-semibold text-warna-utama"
          >
            {labelMasuk}
          </Link>
        </nav>
        <div className="px-4 pt-2">
          <LanguageSwitcher />
        </div>
      </SheetContent>
    </Sheet>
  );
}
