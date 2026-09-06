import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LupaSandiForm } from './lupa-sandi-form';

export default async function LupaSandiPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Lupa kata sandi</CardTitle>
          <CardDescription>Masukkan email akun kamu untuk menerima tautan reset.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status === 'gagal' && (
            <Alert variant="destructive">
              <AlertDescription>
                Tautan reset sudah tidak berlaku atau sudah dipakai. Minta tautan baru di bawah.
              </AlertDescription>
            </Alert>
          )}
          <LupaSandiForm />
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="underline underline-offset-4">
              Kembali ke halaman masuk
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
