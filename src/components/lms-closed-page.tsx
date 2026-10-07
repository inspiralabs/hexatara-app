import type { Metadata } from 'next';
import { BookOpenIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { publicCtaPrimary, publicSectionHeading } from '@/lib/public-ui';

export async function lmsClosedMetadata(locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'lmsClosed' });
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

/** Halaman ramah saat LMS Freemium ditutup (bukan 404). */
export async function LmsClosedPage() {
  const t = await getTranslations('lmsClosed');
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <BookOpenIcon className="size-7" aria-hidden />
      </div>
      <h1 className={`mt-6 ${publicSectionHeading}`}>{t('title')}</h1>
      <p className="mt-3 text-base text-muted-foreground">{t('description')}</p>
      <Link href="/pelatihan" className={`mt-8 ${publicCtaPrimary}`}>
        {t('backCta')}
      </Link>
    </main>
  );
}
