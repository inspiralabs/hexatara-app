"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MENU_ADMIN = [
  { href: "/admin", label: "Beranda" },
  { href: "/admin/batch", label: "Batch" },
  { href: "/admin/konten", label: "Konten" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/sertifikat", label: "Sertifikat" },
  { href: "/admin/upgrade", label: "Upgrade" },
  { href: "/admin/materi", label: "Materi" },
  { href: "/admin/produk", label: "Produk" },
  { href: "/admin/pengaturan", label: "Pengaturan" },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {MENU_ADMIN.map((item) => {
        const aktif =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center rounded-md px-3 text-base",
              aktif
                ? "bg-warna-utama text-warna-latar"
                : "text-warna-teks-2 hover:bg-warna-latar-2 hover:text-warna-teks"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-warna-latar-2 bg-warna-latar p-4 md:block">
        <p className="mb-4 text-lg font-bold text-warna-utama">Hexatara Admin</p>
        <NavList />
      </aside>

      <div className="flex h-14 items-center gap-3 border-b border-warna-latar-2 bg-warna-latar px-4 md:hidden">
        <Sheet open={terbuka} onOpenChange={setTerbuka}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                className="size-11"
                aria-label="Buka menu admin"
              />
            }
          >
            <MenuIcon className="size-6" />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Hexatara Admin</SheetTitle>
            </SheetHeader>
            <div className="px-4">
              <NavList onNavigate={() => setTerbuka(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <p className="text-base font-semibold text-warna-teks">Hexatara Admin</p>
      </div>
    </>
  );
}
