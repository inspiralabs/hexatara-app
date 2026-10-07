import { requireAdmin } from '@/lib/auth/guard';
import {
  getAdminNotifyEmail,
  getHargaUpgrade,
  getKontak,
  getKontakPelatihan,
  getRekening,
  isFreemiumLmsOpen,
} from '@/lib/site-settings';
import { PengaturanForms } from './pengaturan-forms';
import { FreemiumLmsCard } from './freemium-lms-card';

export default async function AdminPengaturanPage() {
  await requireAdmin();

  const [rekening, kontak, kontakPelatihan, notifyEmail, harga, freemiumOpen] = await Promise.all([
    getRekening(),
    getKontak(),
    getKontakPelatihan(),
    getAdminNotifyEmail(),
    getHargaUpgrade(),
    isFreemiumLmsOpen(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Pengaturan</h1>
      </div>
      <FreemiumLmsCard open={freemiumOpen} />
      <PengaturanForms
        rekening={rekening}
        kontak={kontak}
        kontakPelatihan={kontakPelatihan}
        notifyEmail={notifyEmail ?? ''}
        harga={harga}
      />
    </div>
  );
}
