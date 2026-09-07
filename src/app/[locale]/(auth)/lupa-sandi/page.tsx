import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LupaSandiForm } from './lupa-sandi-form';

export default async function LupaSandiPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const t = await getTranslations('auth.lupaSandi');
  const tAuth = await getTranslations('auth');

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status === 'gagal' && (
            <Alert variant="destructive">
              <AlertDescription>{t('expiredAlert')}</AlertDescription>
            </Alert>
          )}
          <LupaSandiForm />
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="underline underline-offset-4">
              {tAuth('backToLogin')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
