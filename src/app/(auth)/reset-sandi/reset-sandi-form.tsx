'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { ResetSandiSchema } from '@/lib/validations/auth';
import { resetSandiAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ResetSandiInput = z.infer<typeof ResetSandiSchema>;

export function ResetSandiForm() {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetSandiInput>({
    resolver: zodResolver(ResetSandiSchema),
    defaultValues: { password: '', konfirmasiPassword: '' },
  });

  async function onSubmit(data: ResetSandiInput) {
    setPesanError(null);
    const hasil = await resetSandiAction(data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    router.push('/login');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Kata sandi baru</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="konfirmasiPassword">Konfirmasi kata sandi</Label>
        <Input
          id="konfirmasiPassword"
          type="password"
          autoComplete="new-password"
          {...register('konfirmasiPassword')}
        />
        {errors.konfirmasiPassword && (
          <p className="text-sm text-destructive">{errors.konfirmasiPassword.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan…' : 'Simpan kata sandi baru'}
      </Button>
    </form>
  );
}
