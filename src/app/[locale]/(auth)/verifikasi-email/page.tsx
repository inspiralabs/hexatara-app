import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default async function VerifikasiEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const t = await getTranslations('auth.verifikasiEmail');
  const tAuth = await getTranslations('auth');

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
          ) : (
            <p className="text-sm text-muted-foreground">{t('sentMessage')}</p>
          )}
          <Link href="/login" className="text-sm underline underline-offset-4">
            {tAuth('backToLogin')}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
