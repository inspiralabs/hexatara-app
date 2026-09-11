import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getOptionalUser } from "@/lib/auth/guard";
import { FloatingWhatsapp } from "@/components/floating-whatsapp";
import { PublicNavMobile } from "@/components/public-nav-mobile";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const claims = await getOptionalUser();
  const sudahLogin = Boolean(claims);

  const NAV_PUBLIK = [
    { href: "/", label: tNav("home") },
    { href: "/pelatihan", label: tNav("pelatihan") },
    { href: "/katalog", label: tNav("produk") },
  ];
  const hrefMasuk = sudahLogin ? "/dashboard" : "/login";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-warna-latar-2 bg-warna-latar">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-warna-utama">
            <Image src="/hexatara-logo.png" alt="Hexatara" width={32} height={32} className="h-8 w-8" priority />
            Hexatara
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_PUBLIK.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base text-warna-teks-2 hover:text-warna-utama"
              >
                {item.label}
              </Link>
            ))}
            <LanguageSwitcher />
            <Link
              href={hrefMasuk}
              className="flex min-h-11 items-center justify-center rounded-lg border border-warna-utama px-4 text-base font-semibold text-warna-utama"
            >
              {tNav("masuk")}
            </Link>
          </nav>

          <PublicNavMobile items={NAV_PUBLIK} hrefMasuk={hrefMasuk} labelMasuk={tNav("masuk")} />
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="border-t border-warna-latar-2 bg-warna-latar-2">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-warna-teks-2">
          <p className="font-semibold text-warna-teks">{tCommon("companyName")}</p>
          <p className="mt-1">{tCommon("footerTagline")}</p>
          <p className="mt-4 text-xs">{tCommon("footerCopyright", { year: new Date().getFullYear() })}</p>
        </div>
      </footer>

      <FloatingWhatsapp />
    </div>
  );
}
