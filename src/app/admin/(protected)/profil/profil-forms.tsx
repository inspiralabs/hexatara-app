'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { AdminProfilSchema } from '@/lib/validations/pengaturan-admin';
import { ResetSandiSchema } from '@/lib/validations/auth';
import {
  simpanProfilAdminAction,
  ubahPasswordAdminAction,
} from '../pengaturan/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from '@/components/auth/password-input';

type ProfilInput = z.infer<typeof AdminProfilSchema>;
type SandiFormValues = z.infer<typeof ResetSandiSchema>;

export function ProfilAdminForms({
  namaLengkap,
  email,
}: {
  namaLengkap: string;
  email: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <ProfilForm defaults={namaLengkap} email={email} />
      <PasswordForm />
    </div>
  );
}

function ProfilForm({ defaults, email }: { defaults: string; email: string }) {
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfilInput>({
    resolver: zodResolver(AdminProfilSchema),
    defaultValues: { nama_lengkap: defaults },
  });

  async function onSubmit(data: ProfilInput) {
    setPending(true);
    const hasil = await simpanProfilAdminAction(data);
    setPending(false);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Profil disimpan');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled readOnly />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nama_lengkap">Nama lengkap</Label>
            <Input id="nama_lengkap" {...register('nama_lengkap')} />
            {errors.nama_lengkap && (
              <p className="text-sm text-destructive">{errors.nama_lengkap.message}</p>
            )}
          </div>
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? 'Menyimpan…' : 'Simpan profil'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SandiFormValues>({
    resolver: zodResolver(ResetSandiSchema),
    defaultValues: { password: '', konfirmasiPassword: '' },
  });

  async function onSubmit(data: SandiFormValues) {
    setPending(true);
    const hasil = await ubahPasswordAdminAction(data);
    setPending(false);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Kata sandi diubah');
    reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganti kata sandi</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Kata sandi baru</Label>
            <PasswordInput id="password" autoComplete="new-password" {...register('password')} />
            <p className="text-xs text-muted-foreground">Minimal 8 karakter</p>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="konfirmasiPassword">Konfirmasi kata sandi</Label>
            <PasswordInput
              id="konfirmasiPassword"
              autoComplete="new-password"
              {...register('konfirmasiPassword')}
            />
            {errors.konfirmasiPassword && (
              <p className="text-sm text-destructive">{errors.konfirmasiPassword.message}</p>
            )}
          </div>
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? 'Menyimpan…' : 'Simpan kata sandi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
