'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { BatchLeadFormSchema } from '@/lib/validations/batch-lead';
import { daftarMinatAction } from './actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { publicCtaPrimary } from '@/lib/public-ui';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type BatchLeadInput = z.infer<typeof BatchLeadFormSchema>;

export function DaftarMinatDialog({ batchId }: { batchId: number }) {
  const t = useTranslations('batch');
  const tCommon = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [waLink, setWaLink] = useState<string | null | undefined>(undefined);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BatchLeadInput>({
    resolver: zodResolver(BatchLeadFormSchema),
    defaultValues: { nama: '', whatsapp: '', persetujuan: false },
  });

  async function onSubmit(data: BatchLeadInput) {
    const hasil = await daftarMinatAction(batchId, data);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success(t('dialog.successTitle'));
    setWaLink(hasil.waLink);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      reset();
      setWaLink(undefined);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={cn(publicCtaPrimary, 'mt-4 w-full')}>
        {t('registerNow')}
      </DialogTrigger>
      <DialogContent>
        {waLink !== undefined ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{t('dialog.successTitle')}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{t('dialog.successBody')}</p>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(publicCtaPrimary, 'w-full bg-emerald-600 hover:bg-emerald-600/90')}
              >
                {t('dialog.continueWhatsapp')}
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <DialogHeader>
              <DialogTitle>{t('dialog.title')}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nama">{t('dialog.nameLabel')}</Label>
              <Input id="nama" autoComplete="name" {...register('nama')} />
              {errors.nama && <p className="text-sm text-destructive">{errors.nama.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whatsapp">{t('dialog.whatsappLabel')}</Label>
              <Input id="whatsapp" type="tel" autoComplete="tel" {...register('whatsapp')} />
              {errors.whatsapp && (
                <p className="text-sm text-destructive">{errors.whatsapp.message}</p>
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
                    {t('dialog.consentLabel')}
                  </Label>
                </div>
              )}
            />
            {errors.persetujuan && (
              <p className="text-sm text-destructive">{errors.persetujuan.message}</p>
            )}

            <p className="text-xs text-muted-foreground">{t('dialog.disclaimer')}</p>

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
