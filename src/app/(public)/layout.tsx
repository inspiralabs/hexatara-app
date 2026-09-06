import Image from "next/image";
import Link from "next/link";
import { FloatingWhatsapp } from "@/components/floating-whatsapp";
import { PublicNavMobile } from "@/components/public-nav-mobile";

const NAV_PUBLIK = [
  { href: "/", label: "Beranda" },
  { href: "/verify", label: "Verifikasi Sertifikat" },
  { href: "/materi", label: "Materi & Kuis" },
  { href: "/katalog", label: "Katalog Produk" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
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
            {/* Pemilih bahasa masuk di sini setelah migrasi dwibahasa (Fase 9) */}
          </nav>

          <PublicNavMobile items={NAV_PUBLIK} />
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="border-t border-warna-latar-2 bg-warna-latar-2">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-warna-teks-2">
          <p className="font-semibold text-warna-teks">Hexatara Indonesia</p>
          <p className="mt-1">
            Pelatihan pilot drone bersertifikat &amp; penjualan drone profesional Autel — Bekasi.
          </p>
          <p className="mt-4 text-xs">
            &copy; {new Date().getFullYear()} Hexatara Indonesia.
          </p>
        </div>
      </footer>

      <FloatingWhatsapp />
    </div>
  );
}
