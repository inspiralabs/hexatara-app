"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MenuItem = { href: string; label: string };
type MenuGroup = { label: string; children: MenuItem[] };

const MENU_ADMIN: (MenuItem | MenuGroup)[] = [
  { href: "/admin", label: "Beranda" },
  { href: "/admin/batch", label: "Batch" },
  { href: "/admin/konten", label: "Konten" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/sertifikat", label: "Sertifikat" },
  { href: "/admin/upgrade", label: "Upgrade" },
  {
    label: "LMS",
    children: [
      { href: "/admin/materi", label: "Materi" },
      { href: "/admin/materi/file", label: "File" },
      { href: "/admin/materi/soal", label: "Kuis" },
    ],
  },
  { href: "/admin/produk", label: "Produk" },
  { href: "/admin/pengaturan", label: "Pengaturan" },
];

function isGroup(item: MenuItem | MenuGroup): item is MenuGroup {
  return "children" in item;
}

// Prefix-nya bertumpuk (/admin/materi/file dan /admin/materi/soal sama-sama
// diawali /admin/materi) — cek anak yang lebih spesifik dulu.
function childAktif(pathname: string, href: string, children: MenuItem[]) {
  const lain = children.filter((c) => c.href !== href);
  if (lain.some((c) => pathname.startsWith(c.href))) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  href,
  label,
  aktif,
  onNavigate,
  className,
}: {
  href: string;
  label: string;
  aktif: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex min-h-11 items-center rounded-md px-3 text-base",
        aktif
          ? "bg-warna-utama text-warna-latar"
          : "text-warna-teks-2 hover:bg-warna-latar-2 hover:text-warna-teks",
        className
      )}
    >
      {label}
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  // Accordion Base UI menganggap defaultValue yang berubah antar render sebagai
  // "uncontrolled berubah setelah init" (warning) — grup dibuka via state terkontrol,
  // cuma AUTO-BUKA saat masuk ke section itu, tidak pernah auto-tutup saat pengguna
  // membuka sendiri lalu pindah ke section lain.
  const [grupTerbuka, setGrupTerbuka] = useState<Set<string>>(() => {
    const grup = new Set<string>();
    for (const item of MENU_ADMIN) {
      if (isGroup(item) && item.children.some((c) => childAktif(pathname, c.href, item.children))) {
        grup.add(item.label);
      }
    }
    return grup;
  });

  useEffect(() => {
    for (const item of MENU_ADMIN) {
      if (isGroup(item) && item.children.some((c) => childAktif(pathname, c.href, item.children))) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGrupTerbuka((prev) => (prev.has(item.label) ? prev : new Set(prev).add(item.label)));
      }
    }
  }, [pathname]);

  return (
    <nav className="flex flex-col gap-1">
      {MENU_ADMIN.map((item) => {
        if (isGroup(item)) {
          return (
            <Accordion
              key={item.label}
              value={grupTerbuka.has(item.label) ? [item.label] : []}
              onValueChange={(value) =>
                setGrupTerbuka((prev) => {
                  const next = new Set(prev);
                  if (value.includes(item.label)) next.add(item.label);
                  else next.delete(item.label);
                  return next;
                })
              }
            >
              <AccordionItem value={item.label} className="border-none">
                <AccordionTrigger className="min-h-11 rounded-md px-3 py-0 text-base font-normal text-warna-teks-2 hover:bg-warna-latar-2 hover:text-warna-teks hover:no-underline data-open:text-warna-teks">
                  {item.label}
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="flex flex-col gap-1 border-l border-warna-latar-2 py-1 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.href}
                        href={child.href}
                        label={child.label}
                        aktif={childAktif(pathname, child.href, item.children)}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        }

        const aktif = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return <NavLink key={item.href} href={item.href} label={item.label} aktif={aktif} onNavigate={onNavigate} />;
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
