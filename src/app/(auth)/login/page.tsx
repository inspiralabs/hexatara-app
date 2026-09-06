import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
            <Link href="/lupa-sandi" className="underline underline-offset-4">
              Lupa kata sandi?
            </Link>
            <p>
              Belum punya akun?{' '}
              <Link href="/daftar" className="underline underline-offset-4">
                Daftar
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
