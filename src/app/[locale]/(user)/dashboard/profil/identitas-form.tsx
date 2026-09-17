'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  IdentitasProfilSchema,
  type IdentitasProfilInput,
} from '@/lib/validations/identitas-profil';
import { DatePickerField } from '@/components/admin/date-picker-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IdentitasFotoField } from './identitas-foto-field';
import { simpanIdentitasAction } from './actions';

export function IdentitasForm({
  defaultValues,
  previewKtpUrl,
  previewPasFotoUrl,
}: {
  defaultValues: IdentitasProfilInput;
  previewKtpUrl: string | null;
  previewPasFotoUrl: string | null;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IdentitasProfilInput>({
    resolver: zodResolver(IdentitasProfilSchema),
    defaultValues,
  });

  async function onSubmit(data: IdentitasProfilInput) {
    const hasil = await simpanIdentitasAction(data);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Data identitas berhasil disimpan.');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="nomor_ktp">Nomor KTP</Label>
          <Input
            id="nomor_ktp"
            inputMode="numeric"
            autoComplete="off"
            maxLength={16}
            placeholder="16 digit"
            {...register('nomor_ktp')}
          />
          {errors.nomor_ktp && (
            <p className="text-sm text-destructive">{errors.nomor_ktp.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
          <Input id="tempat_lahir" {...register('tempat_lahir')} />
          {errors.tempat_lahir && (
            <p className="text-sm text-destructive">{errors.tempat_lahir.message}</p>
          )}
        </div>

        <Controller
          name="tanggal_lahir"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <DatePickerField
                label="Tanggal Lahir"
                value={field.value || null}
                onChange={(v) => field.onChange(v ?? '')}
                captionLayout="dropdown"
                reverseYears
                disableFuture
                startMonth={new Date(1940, 0)}
                endMonth={new Date()}
              />
              {errors.tanggal_lahir && (
                <p className="text-sm text-destructive">{errors.tanggal_lahir.message}</p>
              )}
            </div>
          )}
        />

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="alamat_lengkap">Alamat Lengkap</Label>
          <Textarea id="alamat_lengkap" rows={3} {...register('alamat_lengkap')} />
          {errors.alamat_lengkap && (
            <p className="text-sm text-destructive">{errors.alamat_lengkap.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <IdentitasFotoField
          jenis="ktp"
          label="Foto KTP"
          previewUrl={previewKtpUrl}
          aspectClass="aspect-video"
        />
        <IdentitasFotoField
          jenis="pas_foto"
          label="Pas Foto"
          previewUrl={previewPasFotoUrl}
          aspectClass="aspect-[3/4]"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? 'Menyimpan…' : 'Simpan Data Identitas'}
      </Button>
    </form>
  );
}
