"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MenuIcon,
  HomeIcon,
  CalendarDaysIcon,
  ImageIcon,
  InboxIcon,
  BadgeCheckIcon,
  ArrowUpCircleIcon,
  BookOpenIcon,
  PackageIcon,
  SettingsIcon,
  PanelLeftIcon,
  PanelLeftCloseIcon,
  type LucideIcon,
} from "lucide-react";
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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type MenuItem = { href: string; label: string };
type MenuGroup = { label: string; icon: LucideIcon; children: MenuItem[] };
type MenuFlat = { href: string; label: string; icon: LucideIcon };

const MENU_ADMIN: (MenuFlat | MenuGroup)[] = [
  { href: "/admin", label: "Beranda", icon: HomeIcon },
  {
    label: "Batch",
    icon: CalendarDaysIcon,
    children: [
      { href: "/admin/batch", label: "Daftar Batch" },
      { href: "/admin/batch/kategori", label: "Kategori Pelatihan" },
    ],
  },
  {
    label: "Konten",
    icon: ImageIcon,
    children: [
      { href: "/admin/konten/popup", label: "Popup" },
      { href: "/admin/konten/banner", label: "Banner" },
      { href: "/admin/konten/hero", label: "Hero" },
      { href: "/admin/konten/instruktur", label: "Instruktur" },
      { href: "/admin/konten/company", label: "Company Profile" },
      { href: "/admin/konten/testimoni", label: "Testimoni" },
    ],
  },
  {
    label: "Leads",
    icon: InboxIcon,
    children: [
      { href: "/admin/leads/minat", label: "Pendaftaran Minat" },
      { href: "/admin/leads/penawaran", label: "Permintaan Penawaran" },
    ],
  },
  {
    label: "Sertifikat",
    icon: BadgeCheckIcon,
    children: [
      { href: "/admin/sertifikat", label: "Daftar" },
      { href: "/admin/sertifikat/baru", label: "Tambah Satuan" },
      { href: "/admin/sertifikat/impor", label: "Import Massal" },
    ],
  },
  { href: "/admin/upgrade", label: "Upgrade", icon: ArrowUpCircleIcon },
  {
    label: "Materi",
    icon: BookOpenIcon,
    children: [
      { href: "/admin/materi", label: "Materi & Bab" },
      { href: "/admin/materi/file", label: "File" },
      { href: "/admin/materi/soal", label: "Bank Soal" },
    ],
  },
  {
    label: "Produk",
    icon: PackageIcon,
    children: [
      { href: "/admin/produk", label: "Daftar Produk" },
      { href: "/admin/produk/kategori", label: "Kategori Produk" },
    ],
  },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: SettingsIcon },
];

const COLLAPSE_KEY = "hexatara-admin-sidebar-collapsed";

function isGroup(item: MenuFlat | MenuGroup): item is MenuGroup {
  return "children" in item;
}

// Dua kasus prefix bertumpuk berbeda di sini:
// 1. Siblings tanpa hubungan prefix (materi/file vs materi/soal) — tidak masalah.
// 2. Satu child adalah prefix dari child lain (batch vs batch/kategori,
//    produk vs produk/kategori, sertifikat vs sertifikat/baru) — child yang
//    HREF-nya lebih panjang selalu lebih spesifik. Kalau child lain yang lebih
//    spesifik itu cocok dengan pathname, dia yang menang, bukan yang pendek.
function childAktif(pathname: string, href: string, children: MenuItem[]) {
  const lebihSpesifikCocok = children.some(
    (c) => c.href !== href && c.href.length > href.length && pathname.startsWith(c.href)
  );
  if (lebihSpesifikCocok) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

function groupAktif(pathname: string, group: MenuGroup) {
  return group.children.some((c) => childAktif(pathname, c.href, group.children));
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
      if (isGroup(item) && groupAktif(pathname, item)) grup.add(item.label);
    }
    return grup;
  });

  useEffect(() => {
    for (const item of MENU_ADMIN) {
      if (isGroup(item) && groupAktif(pathname, item)) {
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

// Strip ikon saat navbar desktop di-collapse. Grup tidak punya flyout sub-menu —
// klik ikon grup langsung ke sub-item pertamanya. Ini disengaja sederhana:
// satu Admin non-teknis, expand navbar kalau butuh pilih sub-item lain.
function IconRail() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col items-center gap-1">
      {MENU_ADMIN.map((item) => {
        const aktif = isGroup(item)
          ? groupAktif(pathname, item)
          : item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        const href = isGroup(item) ? item.children[0]!.href : item.href;
        const Icon = item.icon;

        return (
          <Tooltip key={item.label}>
            <TooltipTrigger
              render={
                <Link
                  href={href}
                  aria-label={item.label}
                  className={cn(
                    "flex size-11 items-center justify-center rounded-md",
                    aktif
                      ? "bg-warna-utama text-warna-latar"
                      : "text-warna-teks-2 hover:bg-warna-latar-2 hover:text-warna-teks"
                  )}
                />
              }
            >
              <Icon className="size-5" />
            </TooltipTrigger>
            <TooltipContent>{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const [terbuka, setTerbuka] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // localStorage bisa gagal di private window — biarkan default terbuka.
    }
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      // Preferensi tampilan saja — gagal simpan tidak menghalangi toggle jalan.
    }
  }

  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 border-r border-warna-latar-2 bg-warna-latar p-4 md:block",
          collapsed ? "w-[4.5rem]" : "w-56"
        )}
      >
        <div className={cn("mb-4 flex items-center", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && <p className="text-lg font-bold text-warna-utama">Hexatara Admin</p>}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Tampilkan navbar" : "Sembunyikan navbar"}
          >
            {collapsed ? <PanelLeftIcon className="size-5" /> : <PanelLeftCloseIcon className="size-5" />}
          </Button>
        </div>
        {collapsed ? <IconRail /> : <NavList />}
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
