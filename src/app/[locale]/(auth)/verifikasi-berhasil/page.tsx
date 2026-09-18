import { CheckCircle2Icon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { AuthShell } from '@/components/auth/auth-shell';

export default async function VerifikasiBerhasilPage() {
  const t = await getTranslations('auth.verifikasiBerhasil');

  return (
    <AuthShell title={t('title')} description={t('description')}>
      <div className="flex flex-col items-center gap-4 py-4">
        <span className="relative flex size-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
          <CheckCircle2Icon
            className="relative size-16 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
        </span>
        <p className="text-center text-sm text-muted-foreground">{t('hint')}</p>
      </div>
    </AuthShell>
  );
}
