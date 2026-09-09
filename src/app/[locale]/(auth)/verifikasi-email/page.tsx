import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status === 'gagal' ? (
            <Alert variant="destructive">
              <AlertDescription>{t('invalidAlert')}</AlertDescription>
            </Alert>
          ) : sudahLogin ? (
            <p className="text-sm text-muted-foreground">{t('verifiedMessage')}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t('sentMessage')}</p>
          )}
          {status !== 'gagal' && sudahLogin ? (
            <Link href="/dashboard" className="text-sm underline underline-offset-4">
              {t('goToDashboard')}
            </Link>
          ) : (
            <Link href="/login" className="text-sm underline underline-offset-4">
              {tAuth('backToLogin')}
            </Link>
          )}
        </CardContent>
      </Card>
      {status !== 'gagal' && <VerifikasiPoller sudahLogin={sudahLogin} />}
    </div>
  );
}
