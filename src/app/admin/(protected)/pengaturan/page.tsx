import { requireAdmin } from '@/lib/auth/guard';
import {
  getAdminNotifyEmail,
  getHargaUpgrade,
  getKontak,
  getRekening,
} from '@/lib/site-settings';
import { PengaturanForms } from './pengaturan-forms';

export default async function AdminPengaturanPage() {
  await requireAdmin();

  const [rekening, kontak, notifyEmail, harga] = await Promise.all([
    getRekening(),
    getKontak(),
    getAdminNotifyEmail(),
    getHargaUpgrade(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-warna-teks">Pengaturan</h1>
      </div>
      <PengaturanForms
        rekening={rekening}
        kontak={kontak}
        notifyEmail={notifyEmail ?? ''}
        harga={harga}
      />
    </div>
  );
}
