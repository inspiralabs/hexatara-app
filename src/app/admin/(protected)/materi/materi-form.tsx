'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MateriFormSchema, type MateriFormInput } from '@/lib/validations/materi-admin';
import { simpanMateriAction, uploadBerkasMateriAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MateriFormInput>({
    resolver: zodResolver(MateriFormSchema),
    defaultValues,
  });

  async function handleFile(file: File | undefined, onChange: (url: string) => void) {
    if (!file) return;
    setPesanError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set('file', file);
      const hasil = await uploadBerkasMateriAction(formData);
      if (!hasil.ok) {
        setPesanError(hasil.pesan);
        return;
      }
      onChange(hasil.url);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: MateriFormInput) {
    setPesanError(null);
    const hasil = await simpanMateriAction(mode === 'edit' ? (materiId ?? null) : null, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
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
        name="file_url"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-warna-teks">Berkas Materi (PDF/PPT) *</span>
            {field.value ? (
              <div className="flex items-center gap-3">
                <a href={field.value} target="_blank" rel="noopener noreferrer" className="text-sm text-warna-utama underline">
                  Lihat berkas saat ini
                </a>
                <button type="button" onClick={() => field.onChange('')} className="text-sm text-destructive">
                  Ganti
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept=".pdf,.ppt,.pptx"
                disabled={uploading}
                onChange={(e) => handleFile(e.target.files?.[0], field.onChange)}
                className="text-sm text-warna-teks-2"
              />
            )}
            {uploading && <p className="text-sm text-warna-teks-2">Mengunggah…</p>}
            {errors.file_url && <p className="text-sm text-destructive">{errors.file_url.message}</p>}
          </div>
        )}
      />

      <Field label="Urutan" htmlFor="urutan">
        <Input id="urutan" type="number" {...register('urutan')} />
      </Field>

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
          disabled={isSubmitting || uploading}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
