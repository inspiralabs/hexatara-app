"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  MenuIcon,
  LayoutDashboardIcon,
  GraduationCapIcon,
  BadgeCheckIcon,
  ReceiptIcon,
  CalendarDaysIcon,
  SettingsIcon,
  PanelLeftIcon,
  PanelLeftCloseIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type MenuItem = { href: string; labelKey: string; icon: LucideIcon };

// Menu User sengaja flat (tanpa sub-menu Accordion seperti AdminSidebar) —
// enam tab, tidak ada satupun yang butuh grup. Komponen terpisah dari
// AdminSidebar (bukan digeneralisasi jadi satu shell): risiko regresi ke
// navbar Admin yang sudah DONE/teruji tidak sepadan untuk sekadar berbagi
// beberapa baris markup.
//
// ponytail: label nav diterjemahkan (dashboard.nav*) karena selalu tampil di
// semua halaman; isi halaman baru di bawah /dashboard sengaja masih ID-only
// untuk sekarang (pola yang sama dengan ADR-009 — ID dulu, migrasi dwibahasa
// belakangan) — lengkapi lewat namespace `dashboard` kalau Fase berikutnya
// butuh EN penuh di sana juga.
const MENU_USER: MenuItem[] = [
  { href: "/dashboard", labelKey: "navDashboard", icon: LayoutDashboardIcon },
  { href: "/dashboard/kursus", labelKey: "navKursus", icon: GraduationCapIcon },
  { href: "/dashboard/sertifikat", labelKey: "navSertifikat", icon: BadgeCheckIcon },
  { href: "/dashboard/transaksi", labelKey: "navTransaksi", icon: ReceiptIcon },
  { href: "/dashboard/pelatihan", labelKey: "navPelatihan", icon: CalendarDaysIcon },
  { href: "/dashboard/setting", labelKey: "navSetting", icon: SettingsIcon },
];

const COLLAPSE_KEY = "hexatara-user-sidebar-collapsed";

function itemAktif(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

function NavLink({
  item,
  label,
  aktif,
  onNavigate,
}: {
  item: MenuItem;
  label: string;
  aktif: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-md px-3 text-base",
        aktif
          ? "bg-warna-utama text-warna-latar"
          : "text-warna-teks-2 hover:bg-warna-latar-2 hover:text-warna-teks"
      )}
    >
      <Icon className="size-5 shrink-0" />
      {label}
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("dashboard");
  return (
    <nav className="flex flex-col gap-1">
      {MENU_USER.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          label={t(item.labelKey)}
          aktif={itemAktif(pathname, item.href)}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

function IconRail() {
  const pathname = usePathname();
  const t = useTranslations("dashboard");
  return (
    <nav className="flex flex-col items-center gap-1">
      {MENU_USER.map((item) => {
        const aktif = itemAktif(pathname, item.href);
        const Icon = item.icon;
        const label = t(item.labelKey);
        return (
          <Tooltip key={item.href}>
            <TooltipTrigger
              render={
                <Link
                  href={item.href}
                  aria-label={label}
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
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

export function UserSidebar({ namaLengkap }: { namaLengkap: string }) {
  const t = useTranslations("dashboard");
  const [terbuka, setTerbuka] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const namaTampil = namaLengkap || t("akunSaya");

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
          {!collapsed && (
            <p className="truncate text-base font-bold text-warna-utama" title={namaTampil}>
              {namaTampil}
            </p>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            aria-label={collapsed ? t("tampilkanNavbar") : t("sembunyikanNavbar")}
          >
            {collapsed ? <PanelLeftIcon className="size-5" /> : <PanelLeftCloseIcon className="size-5" />}
          </Button>
        </div>
        {collapsed ? <IconRail /> : <NavList />}
      </aside>

      <div className="flex h-14 items-center gap-3 border-b border-warna-latar-2 bg-warna-latar px-4 md:hidden">
        <Sheet open={terbuka} onOpenChange={setTerbuka}>
          <SheetTrigger render={<Button variant="ghost" className="size-11" aria-label={t("bukaMenuAkun")} />}>
            <MenuIcon className="size-6" />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>{namaTampil}</SheetTitle>
            </SheetHeader>
            <div className="px-4">
              <NavList onNavigate={() => setTerbuka(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <p className="truncate text-base font-semibold text-warna-teks">{namaTampil}</p>
      </div>
    </>
  );
}
