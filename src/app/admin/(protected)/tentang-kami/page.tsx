import { requireAdmin } from '@/lib/auth/guard';
import { BrandLogo } from '@/components/brand-logo';

export default async function AdminTentangKamiPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Tentang Kami</h1>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 rounded-xl border border-border bg-card p-8 text-center">
        <BrandLogo variant="auto" size={72} className="size-18" />
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Hexatara</h2>
          <p className="text-sm leading-relaxed text-muted-foreground text-balance">
            Hexatara adalah platform pelatihan dan sertifikasi pilot drone yang menghubungkan
            calon pilot dengan jalur belajar terstruktur — mulai dari materi gratis Ready to Fly,
            pelatihan bersertifikat mengikuti ketentuan DKPPU, hingga verifikasi sertifikat resmi
            yang bisa dicek publik. Selain pelatihan, Hexatara juga menyediakan drone profesional
            Autel untuk kebutuhan survei, pemetaan, dan operasional industri.
          </p>
        </div>
      </div>
    </div>
  );
}
