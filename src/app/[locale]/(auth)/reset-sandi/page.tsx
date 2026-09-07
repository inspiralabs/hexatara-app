import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/server';
import { ResetSandiForm } from './reset-sandi-form';

export default async function ResetSandiPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const t = await getTranslations('auth.resetSandi');

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          {data?.claims && <CardDescription>{t('description')}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {data?.claims ? (
            <ResetSandiForm />
          ) : (
            <>
              <Alert variant="destructive">
                <AlertDescription>{t('invalidAlert')}</AlertDescription>
              </Alert>
              <Link href="/lupa-sandi" className="text-sm underline underline-offset-4">
                {t('requestNewLink')}
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
