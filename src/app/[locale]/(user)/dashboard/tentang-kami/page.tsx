import Image from 'next/image';
import { requireUser } from '@/lib/auth/guard';

export default async function UserTentangKamiPage() {
  await requireUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Tentang Kami</h1>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 rounded-xl border border-border bg-card p-8 text-center">
        <Image
          src="/hexatara-logo.png"
          alt="Hexatara"
          width={72}
          height={72}
          className="size-18"
        />
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Hexatara</h2>
          <p className="text-sm leading-relaxed text-balance text-muted-foreground">
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
