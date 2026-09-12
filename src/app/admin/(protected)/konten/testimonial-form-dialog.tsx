'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TestimonialFormSchema, type TestimonialFormInput } from '@/lib/validations/testimonial-admin';
import { simpanTestimonialAction } from './testimonial-actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUploadField } from '@/components/image-upload-field';
import { uploadGambarAdminAction } from '../actions';

const DEFAULT_VALUES: TestimonialFormInput = {
  nama: '',
  peran_id: '',
  peran_en: '',
  isi_id: '',
  isi_en: '',
  foto_url: '',
  urutan: 0,
  is_active: true,
};

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function TestimonialFormDialog({
  open,
  onOpenChange,
  testimonialId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonialId: number | null;
  defaultValues: TestimonialFormInput | null;
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormInput>({
    resolver: zodResolver(TestimonialFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });

  // Form dipakai ulang untuk tambah maupun ubah — isi ulang setiap kali dialog
  // dibuka dengan testimoni yang berbeda (atau dikosongkan untuk tambah baru).
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPesanError(null);
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, testimonialId]);

  async function onSubmit(data: TestimonialFormInput) {
    setPesanError(null);
    const hasil = await simpanTestimonialAction(testimonialId, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{testimonialId == null ? 'Tambah Testimoni' : 'Ubah Testimoni'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {pesanError && (
            <Alert variant="destructive">
              <AlertDescription>{pesanError}</AlertDescription>
            </Alert>
          )}

          <Field label="Nama *" htmlFor="nama">
            <Input id="nama" {...register('nama')} />
            {errors.nama && <p className="text-sm text-destructive">{errors.nama.message}</p>}
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Peran (Indonesia)" htmlFor="peran_id">
              <Input id="peran_id" placeholder="mis. Peserta RPC Batch 3" {...register('peran_id')} />
            </Field>
            <Field label="Peran (Inggris)" htmlFor="peran_en">
              <Input id="peran_en" {...register('peran_en')} />
            </Field>

            <Field label="Isi Testimoni (Indonesia) *" htmlFor="isi_id">
              <Textarea id="isi_id" rows={3} {...register('isi_id')} />
              {errors.isi_id && <p className="text-sm text-destructive">{errors.isi_id.message}</p>}
            </Field>
            <Field label="Isi Testimoni (Inggris)" htmlFor="isi_en">
              <Textarea id="isi_en" rows={3} {...register('isi_en')} />
            </Field>
          </div>

          <Field label="Urutan" htmlFor="urutan">
            <Input id="urutan" type="number" step={1} {...register('urutan')} className="max-w-[8rem]" />
          </Field>
          <p className="-mt-2 text-xs text-warna-teks-2">Angka lebih kecil tampil lebih dulu.</p>

          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                <Label htmlFor="is_active" className="font-normal">
                  Aktifkan testimoni ini
                </Label>
              </div>
            )}
          />

          <Controller
            control={control}
            name="foto_url"
            render={({ field }) => (
              <ImageUploadField
                label="Foto (opsional)"
                aspectRatio={1}
                suggestedPx="800×800px"
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

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-warna-latar-2 px-6 text-base font-semibold text-warna-teks"
            >
              Batal
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
