"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MenuIcon,
  HomeIcon,
  CalendarDaysIcon,
  ImageIcon,
  InboxIcon,
  BadgeCheckIcon,
  BookOpenIcon,
  PackageIcon,
  SettingsIcon,
  PanelLeftIcon,
  LogOutIcon,
  UserIcon,
  InfoIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAdminAction } from "@/app/admin/(protected)/actions";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/shell/theme-toggle";

type MenuLink = { href: string; label: string; icon?: LucideIcon };
type MenuSection = { section: string; icon: LucideIcon; items: MenuLink[] };

const MENU_ADMIN: MenuSection[] = [
  {
    section: "Utama",
    icon: HomeIcon,
    items: [{ href: "/admin", label: "Beranda", icon: HomeIcon }],
  },
  {
    section: "Batch",
    icon: CalendarDaysIcon,
    items: [
      { href: "/admin/batch", label: "Daftar Batch" },
      { href: "/admin/batch/kategori", label: "Kategori Pelatihan" },
    ],
  },
  {
    section: "Konten",
    icon: ImageIcon,
    items: [
      { href: "/admin/konten/popup", label: "Popup" },
      { href: "/admin/konten/banner", label: "Banner" },
      { href: "/admin/konten/hero", label: "Hero" },
      { href: "/admin/konten/instruktur", label: "Instruktur" },
      { href: "/admin/konten/company", label: "Company Profile" },
      { href: "/admin/konten/testimoni", label: "Testimoni" },
    ],
  },
  {
    section: "Leads",
    icon: InboxIcon,
    items: [
      { href: "/admin/leads/minat", label: "Pendaftaran Minat" },
      { href: "/admin/leads/penawaran", label: "Permintaan Penawaran" },
      { href: "/admin/pendaftaran-batch", label: "Pendaftaran Batch" },
      { href: "/admin/peserta-pendaftaran", label: "Peserta Pendaftaran" },
    ],
  },
  {
    section: "Sertifikat",
    icon: BadgeCheckIcon,
    items: [
      { href: "/admin/sertifikat", label: "Daftar" },
      { href: "/admin/upgrade", label: "Upgrade" },
    ],
  },
  {
    section: "Materi",
    icon: BookOpenIcon,
    items: [
      { href: "/admin/materi", label: "Materi & Bab" },
      { href: "/admin/materi/file", label: "File" },
      { href: "/admin/materi/soal", label: "Bank Soal" },
    ],
  },
  {
    section: "Produk",
    icon: PackageIcon,
    items: [
      { href: "/admin/produk", label: "Daftar Produk" },
      { href: "/admin/produk/kategori", label: "Kategori Produk" },
    ],
  },
];

const COLLAPSE_KEY = "hexatara-admin-sidebar-collapsed";

function childAktif(pathname: string, href: string, siblings: MenuLink[]) {
  const lebihSpesifikCocok = siblings.some(
    (c) => c.href !== href && c.href.length > href.length && pathname.startsWith(c.href)
  );
  if (lebihSpesifikCocok) return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

function sectionAktif(pathname: string, section: MenuSection) {
  return section.items.some((c) => childAktif(pathname, c.href, section.items));
}

function inisial(nama: string) {
  const parts = nama.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

function NavLink({
  href,
  label,
  aktif,
  onNavigate,
  icon: Icon,
}: {
  href: string;
  label: string;
  aktif: boolean;
  onNavigate?: () => void;
  icon?: LucideIcon;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex min-h-10 items-center gap-2 rounded-md px-2.5 text-sm",
        aktif
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0" /> : null}
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const sectionDariPath =
    MENU_ADMIN.find((s) => s.items.length > 1 && sectionAktif(pathname, s))?.section ?? null;

  // Satu panel terbuka: buka grup aktif route; pengguna boleh tutup semua.
  const [open, setOpen] = useState<string[]>(() => (sectionDariPath ? [sectionDariPath] : []));

  useEffect(() => {
    if (!sectionDariPath) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync accordion ke route aktif
    setOpen((prev) => (prev[0] === sectionDariPath ? prev : [sectionDariPath]));
  }, [sectionDariPath]);

  const flatAwal = MENU_ADMIN.filter((s) => s.items.length === 1 && s.section === "Utama");
  const grup = MENU_ADMIN.filter((s) => s.items.length > 1);
  const flatAkhir = MENU_ADMIN.filter((s) => s.items.length === 1 && s.section !== "Utama");

  return (
    <nav className="flex flex-col gap-1 px-2">
      {flatAwal.map((section) => {
        const item = section.items[0]!;
        return (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon ?? section.icon}
            aktif={childAktif(pathname, item.href, section.items)}
            onNavigate={onNavigate}
          />
        );
      })}

      <Accordion
        multiple={false}
        value={open}
        onValueChange={setOpen}
        className="gap-0.5"
      >
        {grup.map((section) => (
          <AccordionItem key={section.section} value={section.section} className="border-none">
            <AccordionTrigger
              className={cn(
                "min-h-10 items-center rounded-md px-2.5 py-0 text-sm font-normal hover:no-underline",
                sectionAktif(pathname, section)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <section.icon className="size-4 shrink-0" />
                {section.section}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-0 [&_a]:no-underline [&_a]:hover:text-inherit">
              <div className="ml-3 flex flex-col gap-0.5 border-l border-sidebar-border py-1 pl-2">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    aktif={childAktif(pathname, item.href, section.items)}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {flatAkhir.map((section) => {
        const item = section.items[0]!;
        return (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon ?? section.icon}
            aktif={childAktif(pathname, item.href, section.items)}
            onNavigate={onNavigate}
          />
        );
      })}
    </nav>
  );
}

function IconRail() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col items-center gap-1 px-1">
      {MENU_ADMIN.map((section) => {
        const aktif = sectionAktif(pathname, section);
        const href = section.items[0]!.href;
        const Icon = section.icon;

        return (
          <Tooltip key={section.section}>
            <TooltipTrigger
              render={
                <Link
                  href={href}
                  aria-label={section.section}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-md",
                    aktif
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                />
              }
            >
              <Icon className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="right">{section.section}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

function AccountMenuItems({ onLogout }: { onLogout: () => void }) {
  return (
    <>
      <DropdownMenuItem render={<Link href="/admin/profil" />}>
        <UserIcon /> Profil
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link href="/admin/tentang-kami" />}>
        <InfoIcon /> Tentang Kami
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link href="/admin/pengaturan" />}>
        <SettingsIcon /> Pengaturan
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" onClick={onLogout}>
        <LogOutIcon /> Keluar
      </DropdownMenuItem>
    </>
  );
}

function AccountSidebarCard({
  nama,
  email,
  collapsed,
}: {
  nama: string;
  email: string;
  collapsed?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-md p-2 text-left",
        collapsed && "justify-center"
      )}
    >
      <Avatar size="sm">
        <AvatarFallback>{inisial(nama)}</AvatarFallback>
      </Avatar>
      {!collapsed && (
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-sidebar-foreground">{nama}</span>
          {email ? (
            <span className="block truncate text-xs text-muted-foreground">{email}</span>
          ) : null}
        </span>
      )}
    </div>
  );
}

export function AdminShell({
  children,
  nama,
  email,
}: {
  children: React.ReactNode;
  nama: string;
  email: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // private window
    }
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      // preferensi tampilan
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex",
          collapsed ? "w-14" : "w-60"
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center gap-2 border-b border-sidebar-border px-3",
            collapsed ? "justify-center" : "px-4"
          )}
        >
          <BrandLogo variant="auto" size={28} className="size-7 shrink-0" />
          {!collapsed && <p className="truncate text-sm font-semibold">Hexatara Admin</p>}
        </div>
        <div className="flex-1 overflow-y-auto py-3">{collapsed ? <IconRail /> : <NavList />}</div>
        <div className="border-t border-sidebar-border p-2">
          <AccountSidebarCard nama={nama} email={email} collapsed={collapsed} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background px-3 md:px-4">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 md:hidden"
                  aria-label="Buka menu admin"
                />
              }
            >
              <MenuIcon className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
              <SheetHeader className="border-b border-sidebar-border px-4 py-3">
                <SheetTitle>Hexatara Admin</SheetTitle>
              </SheetHeader>
              <div className="flex max-h-[calc(100dvh-8rem)] flex-col overflow-y-auto py-3">
                <NavList onNavigate={() => setDrawerOpen(false)} />
              </div>
              <div className="border-t border-sidebar-border p-2">
                <AccountSidebarCard nama={nama} email={email} />
              </div>
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className="hidden size-9 md:inline-flex"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
          >
            <PanelLeftIcon className="size-4" />
          </Button>

          <Separator orientation="vertical" className="hidden h-6 md:block" />

          <p className="truncate text-sm font-medium md:hidden">Hexatara Admin</p>

          <div className="flex-1" />

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" className="size-9" aria-label="Menu akun" />}
            >
              <Avatar size="sm">
                <AvatarFallback>{inisial(nama)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-medium">{nama}</p>
                  {email ? <p className="truncate text-xs text-muted-foreground">{email}</p> : null}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <AccountMenuItems onLogout={() => startTransition(() => logoutAdminAction())} />
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
