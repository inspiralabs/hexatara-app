import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { logoutAction } from '../actions';
import { SertifikatPreviewCard } from './sertifikat-preview-card';

export default async function DashboardPage() {
  const claims = await requireUser();
  const t = await getTranslations('dashboard');

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('nama_lengkap, free_track_selesai_at')
    .eq('id', claims.sub)
    .single();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">{t('pageTitle')}</h1>
        <form action={logoutAction}>
          <Button type="submit" variant="outline">
            {t('keluar')}
          </Button>
        </form>
      </div>

      <div className="mt-6">
        {profile?.free_track_selesai_at ? (
          <SertifikatPreviewCard namaLengkap={profile.nama_lengkap} />
        ) : (
          <div className="rounded-xl border border-warna-latar-2 bg-warna-latar-2 p-5">
            <p className="text-sm text-warna-teks-2">{t('belumSelesaiKuis')}</p>
            <Link
              href="/kuis"
              className="mt-3 inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks"
            >
              {t('mulaiKuis')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
