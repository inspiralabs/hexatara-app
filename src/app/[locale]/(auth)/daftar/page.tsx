import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DaftarForm } from './daftar-form';

export default async function DaftarPage({
  searchParams,
}: {
  searchParams: Promise<{ kuisSelesai?: string }>;
}) {
  const { kuisSelesai } = await searchParams;
  const t = await getTranslations('auth.daftar');
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DaftarForm kuisSelesai={kuisSelesai === '1'} />
          <p className="mt-4 text-sm text-muted-foreground">
            {t('haveAccount')}{' '}
            <Link href="/login" className="underline underline-offset-4">
              {t('loginLink')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
