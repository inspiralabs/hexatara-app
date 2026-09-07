'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { LupaSandiSchema } from '@/lib/validations/auth';
import { lupaSandiAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

type LupaSandiInput = z.infer<typeof LupaSandiSchema>;

export function LupaSandiForm() {
  const t = useTranslations('auth.lupaSandi');
  const [pesan, setPesan] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LupaSandiInput>({
    resolver: zodResolver(LupaSandiSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: LupaSandiInput) {
    const hasil = await lupaSandiAction(data);
    setPesan(hasil.pesan);
  }

  if (pesan) {
    return (
      <Alert>
        <AlertDescription>{pesan}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? t('sending') : t('submit')}
      </Button>
    </form>
  );
}
