'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfilSchema, type ProfilInput } from '@/lib/validations/profil';
import { simpanProfilAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ProfilForm({ defaultValues }: { defaultValues: ProfilInput }) {
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
    setPesanSukses('Profil berhasil disimpan.');
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
        <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
        <Input id="nama_lengkap" {...register('nama_lengkap')} />
        {errors.nama_lengkap && <p className="text-sm text-destructive">{errors.nama_lengkap.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input id="whatsapp" {...register('whatsapp')} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks disabled:opacity-50"
      >
        {isSubmitting ? 'Menyimpan…' : 'Simpan Profil'}
      </button>
    </form>
  );
}
