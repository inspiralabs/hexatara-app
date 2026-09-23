import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SaleBanner } from "@/components/sale-banner";
import { PopupPembuka } from "@/components/popup-pembuka";
import { HeroSection } from "@/components/hero-section";
import { JadwalBatchSection } from "@/components/jadwal-batch-section";
import { ProdukSection } from "@/components/produk-section";
import { VerifyCtaSection } from "@/components/verify-cta-section";
import { CompanyProfileSection } from "@/components/company-profile-section";
import { InstrukturSection } from "@/components/instruktur-section";
import { TestimoniSection } from "@/components/testimoni-section";
import { FaqSection } from "@/components/faq-section";
import { pageMetadata } from "@/lib/seo/page-metadata";

// Pop-up dan sale banner dikelola Admin lewat database dan bisa berubah kapan saja
// (F01.1/F01.2) — halaman ini WAJIB dynamic, bukan di-prerender statis saat build,
// supaya perubahan is_active/tayang_mulai/tayang_selesai langsung terlihat tanpa deploy.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return pageMetadata({
    locale,
    path: "/",
    title: t("homeTitle"),
    description: t("homeDescription"),
    absoluteTitle: true,
  });
}

export default function Home() {
  // Bukan div flex-col (lihat catatan di layout.tsx) — stacking blok biasa
  // sudah cukup, dan menghindari bug margin-auto-menyerap-stretch pada
  // section berkonten sempit (Instruktur/Testimoni/FAQ).
  return (
    <>
      <PopupPembuka />
      <HeroSection />
      <SaleBanner />
      <JadwalBatchSection limit={6} />
      <ProdukSection limit={6} />
      <VerifyCtaSection />
      <CompanyProfileSection />
      <InstrukturSection />
      <TestimoniSection />
      <FaqSection />
    </>
  );
}
