import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/auth-shell';
import { createClient } from '@/lib/supabase/server';
import { VerifikasiPoller } from './verifikasi-poller';

export default async function VerifikasiEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const t = await getTranslations('auth.verifikasiEmail');
  const tAuth = await getTranslations('auth');

  // Halaman ini punya dua konteks berbeda yang kebetulan sama URL-nya:
  // (1) baru submit form daftar, BELUM verifikasi — via router.push() client-side,
  //     tidak lewat /auth/confirm sama sekali, tidak ada sesi.
  // (2) baru klik link email, /auth/confirm BARU SAJA menukar code jadi sesi,
  //     redirect ke sini SUDAH login. getClaims() (bukan requireUser()) supaya
  //     kondisi (1) tidak pernah kena redirect paksa — cuma beda konten yang tampil.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sudahLogin = !!data?.claims;

  return (
    <AuthShell title={t('title')} description={status === 'gagal' ? undefined : sudahLogin ? t('verifiedMessage') : t('sentMessage')}>
      <div className="flex flex-col gap-4">
        {status === 'gagal' ? (
          <Alert variant="destructive">
            <AlertDescription>{t('invalidAlert')}</AlertDescription>
          </Alert>
        ) : null}

        {status !== 'gagal' && sudahLogin ? (
          <Button render={<Link href="/dashboard" />} size="lg" className="w-full">
            {t('goToDashboard')}
          </Button>
        ) : (
          <Button render={<Link href="/login" />} variant="outline" size="lg" className="w-full">
            {tAuth('backToLogin')}
          </Button>
        )}
      </div>
      {status !== 'gagal' && <VerifikasiPoller sudahLogin={sudahLogin} />}
    </AuthShell>
  );
}
