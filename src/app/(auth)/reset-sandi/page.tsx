import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/server';
import { ResetSandiForm } from './reset-sandi-form';

export default async function ResetSandiPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Atur ulang kata sandi</CardTitle>
          {data?.claims && <CardDescription>Pilih kata sandi baru untuk akun kamu.</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {data?.claims ? (
            <ResetSandiForm />
          ) : (
            <>
              <Alert variant="destructive">
                <AlertDescription>
                  Tautan reset tidak valid atau sudah kadaluwarsa. Minta tautan baru.
                </AlertDescription>
              </Alert>
              <Link href="/lupa-sandi" className="text-sm underline underline-offset-4">
                Minta tautan reset baru
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
