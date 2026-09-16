'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { QuoteRequestFormSchema } from '@/lib/validations/quote-request';
import { kirimPenawaranAction } from './actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { publicCtaPrimary, publicCtaSecondary } from '@/lib/public-ui';
import { cn } from '@/lib/utils';

type QuoteInput = z.infer<typeof QuoteRequestFormSchema>;

export function QuoteDialog({ productId }: { productId: number }) {
  const t = useTranslations('catalog');
  const tCommon = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [terkirim, setTerkirim] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput>({
    resolver: zodResolver(QuoteRequestFormSchema),
    defaultValues: {
      nama: '',
      perusahaan: '',
      email: '',
      whatsapp: '',
      kebutuhan: '',
      persetujuan: false,
    },
  });

  async function onSubmit(data: QuoteInput) {
    setPesanError(null);
    const hasil = await kirimPenawaranAction(productId, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    setTerkirim(true);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      reset();
      setPesanError(null);
      setTerkirim(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={cn(publicCtaPrimary, 'flex-1')}>
        {t('dialog.trigger')}
      </DialogTrigger>
      <DialogContent>
        {terkirim ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{t('dialog.successTitle')}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{t('dialog.successBody')}</p>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className={cn(publicCtaSecondary, 'w-full')}
            >
              {t('dialog.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <DialogHeader>
              <DialogTitle>{t('dialog.title')}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{t('dialog.subtitle')}</p>

            {pesanError && (
              <Alert variant="destructive">
                <AlertDescription>{pesanError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nama">{t('dialog.nameLabel')}</Label>
              <Input id="nama" autoComplete="name" {...register('nama')} />
              {errors.nama && <p className="text-sm text-destructive">{errors.nama.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="perusahaan">{t('dialog.companyLabel')}</Label>
              <Input id="perusahaan" autoComplete="organization" {...register('perusahaan')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t('dialog.emailLabel')}</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whatsapp">{t('dialog.whatsappLabel')}</Label>
              <Input id="whatsapp" type="tel" autoComplete="tel" {...register('whatsapp')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kebutuhan">{t('dialog.needsLabel')}</Label>
              <Textarea id="kebutuhan" rows={3} placeholder={t('dialog.needsPlaceholder')} {...register('kebutuhan')} />
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
                    {t('dialog.consentLabel')}
                  </Label>
                </div>
              )}
            />
            {errors.persetujuan && (
              <p className="text-sm text-destructive">{errors.persetujuan.message}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(publicCtaPrimary, 'w-full disabled:opacity-50')}
            >
              {isSubmitting ? tCommon('processing') : t('dialog.submit')}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
