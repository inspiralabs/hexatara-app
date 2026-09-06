import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DaftarForm } from './daftar-form';

export default function DaftarPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Daftar akun</CardTitle>
          <CardDescription>Buat akun untuk mengakses materi dan sertifikat gratis.</CardDescription>
        </CardHeader>
        <CardContent>
          <DaftarForm />
          <p className="mt-4 text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" className="underline underline-offset-4">
              Masuk
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
