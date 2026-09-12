'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ResetSandiSchema } from '@/lib/validations/auth';
import { ubahPasswordAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

type UbahPasswordInput = z.infer<typeof ResetSandiSchema>;

export function GantiPasswordForm() {
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UbahPasswordInput>({
    resolver: zodResolver(ResetSandiSchema),
    defaultValues: { password: '', konfirmasiPassword: '' },
  });

  async function onSubmit(data: UbahPasswordInput) {
    setPesanError(null);
    setPesanSukses(null);
    const hasil = await ubahPasswordAction(data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    setPesanSukses('Kata sandi berhasil diubah.');
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}
      {pesanSukses && (
        <Alert>
          <AlertDescription>{pesanSukses}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Kata Sandi Baru</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="konfirmasiPassword">Konfirmasi Kata Sandi</Label>
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-fit items-center justify-center rounded-lg border border-warna-utama px-6 text-base font-semibold text-warna-utama disabled:opacity-50"
      >
        {isSubmitting ? 'Menyimpan…' : 'Ubah Kata Sandi'}
      </button>
    </form>
  );
}
