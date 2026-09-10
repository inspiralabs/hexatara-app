'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { z } from 'zod';
import { DaftarSchema } from '@/lib/validations/auth';
import { bacaProgresSesi, hapusProgresSesi } from '@/lib/materi/session-progress';
import { daftarAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

type DaftarInput = z.infer<typeof DaftarSchema>;

export function DaftarForm({ kuisSelesai = false }: { kuisSelesai?: boolean }) {
  const t = useTranslations('auth.daftar');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DaftarInput>({
    resolver: zodResolver(DaftarSchema),
    defaultValues: { nama_lengkap: '', email: '', password: '', persetujuan: false },
  });

  async function onSubmit(data: DaftarInput) {
    setPesanError(null);
    const progresBab = bacaProgresSesi();
    const hasil = await daftarAction(data, kuisSelesai, progresBab ?? undefined);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    hapusProgresSesi();
    router.push('/verifikasi-email');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nama_lengkap">{t('nameLabel')}</Label>
        <Input id="nama_lengkap" autoComplete="name" {...register('nama_lengkap')} />
        {errors.nama_lengkap && (
          <p className="text-sm text-destructive">{errors.nama_lengkap.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t('passwordLabel')}</Label>
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

      <Controller
        control={control}
        name="persetujuan"
        render={({ field }) => (
          <div className="flex items-start gap-2">
            <Checkbox
              id="persetujuan"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked)}
            />
            <Label htmlFor="persetujuan" className="font-normal">
              {t('consentLabel')}
            </Label>
          </div>
        )}
      />
      {errors.persetujuan && (
        <p className="text-sm text-destructive">{errors.persetujuan.message}</p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? tCommon('processing') : t('submit')}
      </Button>
    </form>
  );
}
