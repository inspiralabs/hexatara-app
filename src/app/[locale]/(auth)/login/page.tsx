import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './login-form';

export default async function LoginPage() {
  const t = await getTranslations('auth.login');
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
            <Link href="/lupa-sandi" className="underline underline-offset-4">
              {t('forgotPassword')}
            </Link>
            <p>
              {t('noAccount')}{' '}
              <Link href="/daftar" className="underline underline-offset-4">
                {t('registerLink')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
