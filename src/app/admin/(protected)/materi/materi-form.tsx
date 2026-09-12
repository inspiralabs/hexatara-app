'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { MateriFormSchema, type MateriFormInput } from '@/lib/validations/materi-admin';
import { simpanMateriAction } from './actions';
import { uploadGambarAdminAction } from '../actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUploadField } from '@/components/image-upload-field';

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function MateriForm({
  mode,
  materiId,
  defaultValues,
}: {
  mode: 'create' | 'edit';
  materiId?: number;
  defaultValues: MateriFormInput;
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MateriFormInput>({
    resolver: zodResolver(MateriFormSchema),
    defaultValues,
  });

  async function onSubmit(data: MateriFormInput) {
    setPesanError(null);
    const hasil = await simpanMateriAction(mode === 'edit' ? (materiId ?? null) : null, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Materi berhasil disimpan.');
    router.push('/admin/materi');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}

      <Field label="Judul (Indonesia) *" htmlFor="judul_id">
        <Input id="judul_id" {...register('judul_id')} />
        {errors.judul_id && <p className="text-sm text-destructive">{errors.judul_id.message}</p>}
      </Field>

      <Field label="Judul (Inggris)" htmlFor="judul_en">
        <Input id="judul_en" {...register('judul_en')} />
      </Field>

      <Field label="Deskripsi (Indonesia)" htmlFor="deskripsi_id">
        <Textarea id="deskripsi_id" rows={3} {...register('deskripsi_id')} />
      </Field>

      <Field label="Deskripsi (Inggris)" htmlFor="deskripsi_en">
        <Textarea id="deskripsi_en" rows={3} {...register('deskripsi_en')} />
      </Field>

      <Controller
        control={control}
        name="poster_url"
        render={({ field }) => (
          <ImageUploadField
            label="Poster (tampil di kartu halaman Materi publik)"
            aspectRatio={16 / 9}
            suggestedPx="1200×675px"
            value={field.value ?? null}
            onChange={field.onChange}
            onUpload={async (file) => {
              const fd = new FormData();
              fd.append('file', file);
              return uploadGambarAdminAction(fd);
            }}
          />
        )}
      />

      <Controller
        control={control}
        name="is_active"
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
            <Label htmlFor="is_active" className="font-normal">
              Aktif — tampil di halaman Materi publik
            </Label>
          </div>
        )}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
