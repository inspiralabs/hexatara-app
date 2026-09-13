"use client";

import { useEffect, useState, useTransition } from "react";
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
  LogOutIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/[locale]/(user)/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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

type MenuItem = { href: string; labelKey: string; icon: LucideIcon };

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
  // Pathname locale-aware: /id/dashboard atau /en/dashboard
  const bare = pathname.replace(/^\/(id|en)(?=\/|$)/, "") || "/";
  return href === "/dashboard" ? bare === "/dashboard" : bare.startsWith(href);
}

function inisial(nama: string) {
  const parts = nama.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
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
        "flex min-h-10 items-center gap-2 rounded-md px-2.5 text-sm",
        aktif
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("dashboard");

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      <p className="px-2.5 pb-1 text-xs font-medium text-muted-foreground">Akun</p>
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
    <nav className="flex flex-col items-center gap-1 px-1">
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
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

function ProfileMenu({
  nama,
  email,
  collapsed,
  side = "top",
}: {
  nama: string;
  email: string;
  collapsed?: boolean;
  side?: "top" | "right" | "bottom";
}) {
  const t = useTranslations("dashboard");
  const [, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-sidebar-accent",
              collapsed && "justify-center"
            )}
          />
        }
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
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="truncate text-sm font-medium">{nama}</p>
            {email ? <p className="truncate text-xs text-muted-foreground">{email}</p> : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => startTransition(() => logoutAction())}
        >
          <LogOutIcon /> {t("keluar")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardUserShell({
  children,
  namaLengkap,
  email,
}: {
  children: React.ReactNode;
  namaLengkap: string;
  email: string;
}) {
  const t = useTranslations("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [, startTransition] = useTransition();
  const namaTampil = namaLengkap || t("akunSaya");

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
            "flex h-14 items-center border-b border-sidebar-border px-3",
            collapsed ? "justify-center" : "px-4"
          )}
        >
          {!collapsed && (
            <p className="truncate text-sm font-semibold" title={namaTampil}>
              {namaTampil}
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto py-3">{collapsed ? <IconRail /> : <NavList />}</div>
        <div className="border-t border-sidebar-border p-2">
          <ProfileMenu
            nama={namaTampil}
            email={email}
            collapsed={collapsed}
            side={collapsed ? "right" : "top"}
          />
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
                  aria-label={t("bukaMenuAkun")}
                />
              }
            >
              <MenuIcon className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
              <SheetHeader className="border-b border-sidebar-border px-4 py-3">
                <SheetTitle>{namaTampil}</SheetTitle>
              </SheetHeader>
              <div className="flex max-h-[calc(100dvh-8rem)] flex-col overflow-y-auto py-3">
                <NavList onNavigate={() => setDrawerOpen(false)} />
              </div>
              <div className="border-t border-sidebar-border p-2">
                <ProfileMenu nama={namaTampil} email={email} />
              </div>
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className="hidden size-9 md:inline-flex"
            onClick={toggleCollapsed}
            aria-label={collapsed ? t("tampilkanNavbar") : t("sembunyikanNavbar")}
          >
            <PanelLeftIcon className="size-4" />
          </Button>

          <Separator orientation="vertical" className="hidden h-6 md:block" />

          <p className="truncate text-sm font-medium md:hidden">{namaTampil}</p>

          <div className="flex-1" />

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" className="size-9" aria-label="Menu akun" />}
            >
              <Avatar size="sm">
                <AvatarFallback>{inisial(namaTampil)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-medium">{namaTampil}</p>
                  {email ? <p className="truncate text-xs text-muted-foreground">{email}</p> : null}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => startTransition(() => logoutAction())}
              >
                <LogOutIcon /> {t("keluar")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
