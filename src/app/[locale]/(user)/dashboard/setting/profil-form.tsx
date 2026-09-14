'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfilSchema, type ProfilInput } from '@/lib/validations/profil';
import { simpanProfilAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function ProfilForm({
  defaultValues,
  variant,
}: {
  defaultValues: ProfilInput;
  /** profil = nama; kontak = WhatsApp (nilai lain ikut terkirim agar tidak terhapus) */
  variant: 'profil' | 'kontak';
}) {
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfilInput>({ resolver: zodResolver(ProfilSchema), defaultValues });

  async function onSubmit(data: ProfilInput) {
    setPesanError(null);
    setPesanSukses(null);
    const hasil = await simpanProfilAction(data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    setPesanSukses(variant === 'profil' ? 'Profil berhasil disimpan.' : 'Nomor WhatsApp berhasil disimpan.');
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

      {variant === 'profil' ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
          <Input id="nama_lengkap" {...register('nama_lengkap')} />
          {errors.nama_lengkap && <p className="text-sm text-destructive">{errors.nama_lengkap.message}</p>}
          <input type="hidden" {...register('whatsapp')} />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" {...register('whatsapp')} placeholder="08…" />
          <input type="hidden" {...register('nama_lengkap')} />
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? 'Menyimpan…' : variant === 'profil' ? 'Simpan Profil' : 'Simpan WhatsApp'}
      </Button>
    </form>
  );
}
