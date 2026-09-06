import { SaleBanner } from "@/components/sale-banner";
import { PopupPembuka } from "@/components/popup-pembuka";
import { HeroSection } from "@/components/hero-section";
import { JadwalBatchSection } from "@/components/jadwal-batch-section";
import { TestimoniSection } from "@/components/testimoni-section";
import { InstrukturSection } from "@/components/instruktur-section";
import { CompanyProfileSection } from "@/components/company-profile-section";

// Pop-up dan sale banner dikelola Admin lewat database dan bisa berubah kapan saja
// (F01.1/F01.2) — halaman ini WAJIB dynamic, bukan di-prerender statis saat build,
// supaya perubahan is_active/tayang_mulai/tayang_selesai langsung terlihat tanpa deploy.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SaleBanner />
      <PopupPembuka />
      <HeroSection />
      <JadwalBatchSection />
      <TestimoniSection />
      <InstrukturSection />
      <CompanyProfileSection />
    </div>
  );
}
