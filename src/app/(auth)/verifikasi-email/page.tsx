import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default async function VerifikasiEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Verifikasi email</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status === 'gagal' ? (
            <Alert variant="destructive">
              <AlertDescription>
                Tautan verifikasi tidak valid atau sudah kadaluwarsa. Daftar ulang untuk
                mendapatkan tautan baru.
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-muted-foreground">
              Kami sudah mengirim tautan verifikasi ke email kamu. Klik tautan itu untuk
              mengaktifkan akun sebelum bisa masuk.
            </p>
          )}
          <Link href="/login" className="text-sm underline underline-offset-4">
            Kembali ke halaman masuk
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
