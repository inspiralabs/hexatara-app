import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getOptionalUser } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { FloatingWhatsapp } from "@/components/floating-whatsapp";
import { PublicNavMobile } from "@/components/public-nav-mobile";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ForceLightDocument } from "@/components/shell/force-light-document";
import { DEFAULT_JAM_OPERASIONAL, type KontakSettings } from "@/lib/site-settings";

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
    <div className="flex min-h-full flex-1 flex-col">
      <ForceLightDocument />
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

      {/* HANYA `flex-1` (bukan `flex flex-col` juga) — kalau main jadi flex
          container, anak langsungnya yang punya `mx-auto` (section-section
          publik) kena bug margin-auto-menyerap-stretch: bukannya melebar
          penuh, section itu menyusut sesuai konten lalu di-center. Section
          berkonten lebar (grid Produk/Jadwal) menutupi bug ini secara
          kebetulan, section berkonten sempit (Instruktur, Testimoni, FAQ)
          langsung kelihatan "di tengah". */}
      <main className="flex-1">{children}</main>

      <footer className="border-t border-warna-latar-2 bg-warna-latar-2">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-16 text-sm text-warna-teks-2 sm:grid-cols-3 md:py-24">
          <div>
            <div className="flex items-center gap-2 text-base font-bold text-warna-utama">
              <Image src="/hexatara-logo.png" alt="Hexatara" width={28} height={28} className="h-7 w-7" />
              Hexatara
            </div>
            <p className="mt-3">{tCommon("footerTagline")}</p>
          </div>

          <div>
            <p className="font-semibold text-warna-teks">{tFooter("linksHeading")}</p>
            <nav className="mt-3 flex flex-col gap-2">
              <Link href="/pelatihan" className="hover:text-warna-utama">
                {tNav("pelatihan")}
              </Link>
              <Link href="/katalog" className="hover:text-warna-utama">
                {tNav("produk")}
              </Link>
              <Link href="/tentang-kami" className="hover:text-warna-utama">
                {tFooter("linkTentangKami")}
              </Link>
              <Link href="/faq" className="hover:text-warna-utama">
                {tFooter("linkFaq")}
              </Link>
              <Link href="/ketentuan-layanan" className="hover:text-warna-utama">
                {tFooter("linkKetentuanLayanan")}
              </Link>
              <Link href="/kebijakan-privasi" className="hover:text-warna-utama">
                {tFooter("linkKebijakanPrivasi")}
              </Link>
              <Link href="/syarat-ketentuan" className="hover:text-warna-utama">
                {tFooter("linkSyaratKetentuan")}
              </Link>
            </nav>
          </div>

          <div>
            <p className="font-semibold text-warna-teks">{tFooter("contactHeading")}</p>
            <div className="mt-3 flex flex-col gap-2">
              {kontak.wa && (
                <a href={`https://wa.me/${kontak.wa}`} target="_blank" rel="noopener noreferrer" className="hover:text-warna-utama">
                  WhatsApp: +{kontak.wa}
                </a>
              )}
              {kontak.email && (
                <a href={`mailto:${kontak.email}`} className="hover:text-warna-utama">
                  {kontak.email}
                </a>
              )}
              {kontak.instagram && (
                <a href={kontak.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-warna-utama">
                  Instagram
                </a>
              )}
              <p>{jamOperasional}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-warna-latar-2 px-4 py-4 text-center text-xs text-warna-teks-2">
          {tCommon("footerCopyright", { year: new Date().getFullYear() })}
        </div>
      </footer>

      <FloatingWhatsapp />
    </div>
  );
}
