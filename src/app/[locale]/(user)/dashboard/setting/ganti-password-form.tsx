'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ResetSandiSchema } from '@/lib/validations/auth';
import { ubahPasswordAction } from './actions';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/auth/password-input';

type UbahPasswordInput = z.infer<typeof ResetSandiSchema>;

export function GantiPasswordForm() {
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
    const hasil = await ubahPasswordAction(data);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Kata sandi berhasil diubah.');
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Kata Sandi Baru</Label>
        <PasswordInput id="password" autoComplete="new-password" {...register('password')} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="konfirmasiPassword">Konfirmasi Kata Sandi</Label>
        <PasswordInput
          id="konfirmasiPassword"
          autoComplete="new-password"
          {...register('konfirmasiPassword')}
        />
        {errors.konfirmasiPassword && (
          <p className="text-sm text-destructive">{errors.konfirmasiPassword.message}</p>
        )}
      </div>

      <Button type="submit" variant="outline" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? 'Menyimpan…' : 'Ubah Kata Sandi'}
      </Button>
    </form>
  );
}
