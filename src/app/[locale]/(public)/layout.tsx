import { getTranslations } from "next-intl/server";
import { ClockIcon, MailIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getOptionalUser } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { FloatingWhatsapp } from "@/components/floating-whatsapp";
import { PublicNavMobile } from "@/components/public-nav-mobile";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ForceLightDocument } from "@/components/shell/force-light-document";
import { PublicStickyHeader } from "@/components/public-sticky-header";
import { BrandLogo } from "@/components/brand-logo";
import { publicCtaSecondary } from "@/lib/public-ui";
import { DEFAULT_JAM_OPERASIONAL, type KontakSettings } from "@/lib/site-settings";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.28A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.13c-1.6 0-3.14-.43-4.48-1.24l-.32-.19-3.11.76.76-3.02-.21-.33a8.08 8.08 0 0 1-1.27-4.31c0-4.48 3.64-8.13 8.13-8.13 4.48 0 8.13 3.65 8.13 8.13s-3.65 8.13-8.13 8.13Zm4.47-6.09c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42-.14-.01-.31-.01-.47-.01a.9.9 0 0 0-.65.31c-.22.24-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.31.27 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.41-10.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
    </svg>
  );
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const tFooter = await getTranslations("footer");
  const claims = await getOptionalUser();
  const sudahLogin = Boolean(claims);

  const supabase = await createClient();
  const { data: kontakRow } = await supabase.from("site_settings").select("value").eq("key", "kontak").maybeSingle();
  const kontak = (kontakRow?.value ?? {}) as KontakSettings;

  const NAV_PUBLIK = [
    { href: "/", label: tNav("home") },
    { href: "/pelatihan", label: tNav("pelatihan") },
    { href: "/katalog", label: tNav("produk") },
  ];
  const hrefMasuk = sudahLogin ? "/dashboard" : "/login";

  const jamOperasional = kontak.jam_operasional?.trim() || tFooter("serviceHours") || DEFAULT_JAM_OPERASIONAL;

  return (
    <div data-surface="public" className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <ForceLightDocument surface="public" />
      <PublicStickyHeader>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
            <BrandLogo variant="default" size={32} priority />
            Hexatara
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_PUBLIK.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <LanguageSwitcher />
            <Link href={hrefMasuk} className={publicCtaSecondary}>
              {tNav("masuk")}
            </Link>
          </nav>

          <PublicNavMobile items={NAV_PUBLIK} hrefMasuk={hrefMasuk} labelMasuk={tNav("masuk")} />
        </div>
      </PublicStickyHeader>

      {/* HANYA `flex-1` (bukan `flex flex-col` juga) — kalau main jadi flex
          container, anak langsungnya yang punya `mx-auto` (section-section
          publik) kena bug margin-auto-menyerap-stretch: bukannya melebar
          penuh, section itu menyusut sesuai konten lalu di-center. Section
          berkonten lebar (grid Produk/Jadwal) menutupi bug ini secara
          kebetulan, section berkonten sempit (Instruktur, Testimoni, FAQ)
          langsung kelihatan "di tengah". */}
      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-muted">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-16 text-sm text-muted-foreground sm:grid-cols-3 md:py-24">
          <div>
            <div className="flex items-center gap-2 text-base font-bold text-foreground">
              <BrandLogo variant="default" size={28} />
              Hexatara
            </div>
            <p className="mt-3">{tCommon("footerTagline")}</p>
          </div>

          <div>
            <p className="font-heading font-semibold text-foreground">{tFooter("linksHeading")}</p>
            <nav className="mt-3 flex flex-col gap-2">
              <Link href="/pelatihan" className="hover:text-foreground">
                {tNav("pelatihan")}
              </Link>
              <Link href="/katalog" className="hover:text-foreground">
                {tNav("produk")}
              </Link>
              <Link href="/tentang-kami" className="hover:text-foreground">
                {tFooter("linkTentangKami")}
              </Link>
              <Link href="/faq" className="hover:text-foreground">
                {tFooter("linkFaq")}
              </Link>
              <Link href="/ketentuan-layanan" className="hover:text-foreground">
                {tFooter("linkKetentuanLayanan")}
              </Link>
              <Link href="/kebijakan-privasi" className="hover:text-foreground">
                {tFooter("linkKebijakanPrivasi")}
              </Link>
              <Link href="/syarat-ketentuan" className="hover:text-foreground">
                {tFooter("linkSyaratKetentuan")}
              </Link>
            </nav>
          </div>

          <div>
            <p className="font-heading font-semibold text-foreground">{tFooter("contactHeading")}</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {kontak.wa && (
                <a
                  href={`https://wa.me/${kontak.wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <WhatsAppIcon className="size-4 shrink-0" />
                  <span>+{kontak.wa}</span>
                </a>
              )}
              {kontak.instagram && (
                <a
                  href={kontak.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <InstagramIcon className="size-4 shrink-0" />
                  <span>@hexatara</span>
                </a>
              )}
              {kontak.email && (
                <a
                  href={`mailto:${kontak.email}`}
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <MailIcon className="size-4 shrink-0" />
                  <span>{kontak.email}</span>
                </a>
              )}
              <p className="inline-flex items-center gap-2">
                <ClockIcon className="size-4 shrink-0" aria-hidden />
                <span>{jamOperasional}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
          {tCommon("footerCopyright", { year: new Date().getFullYear() })}
        </div>
      </footer>

      <FloatingWhatsapp />
    </div>
  );
}
