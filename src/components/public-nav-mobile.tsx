"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function PublicNavMobile({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <Sheet open={terbuka} onOpenChange={setTerbuka}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            className="size-11 md:hidden"
            aria-label="Buka menu navigasi"
          />
        }
      >
        <MenuIcon className="size-6" />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
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
        </nav>
      </SheetContent>
    </Sheet>
  );
}
