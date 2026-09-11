'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BabFormSchema, type BabFormInput } from '@/lib/validations/materi-bab-admin';
import { simpanBabAction } from './bab-actions';
import { uploadGambarAdminAction } from '../actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploadField } from '@/components/image-upload-field';

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function BabForm({
  mode,
  materialId,
  babId,
  defaultValues,
}: {
  mode: 'create' | 'edit';
  materialId: number;
  babId?: number;
  defaultValues: BabFormInput;
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BabFormInput>({
    resolver: zodResolver(BabFormSchema),
    defaultValues,
  });

  async function onSubmit(data: BabFormInput) {
    setPesanError(null);
    const hasil = await simpanBabAction(materialId, mode === 'edit' ? (babId ?? null) : null, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    router.push(mode === 'create' ? `/admin/materi/${hasil.id}` : '/admin/materi');
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

      <Field label="Konten (Indonesia) *" htmlFor="konten_id">
        <Controller
          control={control}
          name="konten_id"
          render={({ field }) => <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />}
        />
        {errors.konten_id && <p className="text-sm text-destructive">{errors.konten_id.message}</p>}
      </Field>

      <Field label="Konten (Inggris)" htmlFor="konten_en">
        <Controller
          control={control}
          name="konten_en"
          render={({ field }) => <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />}
        />
      </Field>

      <Field label="URL Video (opsional)" htmlFor="video_url">
        <Input id="video_url" placeholder="https://www.youtube.com/embed/..." {...register('video_url')} />
        <p className="text-xs text-warna-teks-2">URL embed, tampil sebagai video pengantar di atas konten materi.</p>
      </Field>

      <Controller
        control={control}
        name="gambar_url"
        render={({ field }) => (
          <ImageUploadField
            label="Gambar Pendukung (opsional)"
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
