import { getTranslations } from 'next-intl/server';
import { MailIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/auth-shell';
import { createClient } from '@/lib/supabase/server';
import { VerifikasiPoller } from './verifikasi-poller';

export default async function VerifikasiEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; email?: string }>;
}) {
  const { status, email } = await searchParams;
  const t = await getTranslations('auth.verifikasiEmail');
  const tAuth = await getTranslations('auth');

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sudahLogin = !!data?.claims;

  const menunggu = status !== 'gagal' && !sudahLogin;

  return (
    <AuthShell
      title={t('title')}
      description={
        status === 'gagal' ? undefined : sudahLogin ? t('verifiedMessage') : t('sentMessage')
      }
    >
      <div className="flex flex-col gap-4">
        {status === 'gagal' ? (
          <Alert variant="destructive">
            <AlertDescription>{t('invalidAlert')}</AlertDescription>
          </Alert>
        ) : null}

        {menunggu ? (
          <div className="flex flex-col items-center gap-3 py-2" aria-hidden="true">
            <span className="relative flex size-16 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <span className="relative flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MailIcon className="size-7 animate-bounce" />
              </span>
            </span>
            <p className="text-center text-sm text-muted-foreground">
              {t('waitingHint')}
              <span className="inline-flex w-6 justify-start">
                <span className="animate-pulse">…</span>
              </span>
            </p>
            {email ? (
              <p className="text-center text-xs text-muted-foreground break-all">{email}</p>
            ) : null}
          </div>
        ) : null}

        {status !== 'gagal' && sudahLogin ? (
          <Button
            nativeButton={false}
            render={<Link href="/dashboard" />}
            size="lg"
            className="w-full"
          >
            {t('goToDashboard')}
          </Button>
        ) : (
          <Button
            nativeButton={false}
            render={<Link href="/login" />}
            variant="outline"
            size="lg"
            className="w-full"
          >
            {tAuth('backToLogin')}
          </Button>
        )}
      </div>
      {status !== 'gagal' && <VerifikasiPoller sudahLogin={sudahLogin} />}
    </AuthShell>
  );
}
