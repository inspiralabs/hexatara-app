'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HeroSlideFormSchema, type HeroSlideFormInput } from '@/lib/validations/hero-slide-admin';
import { simpanHeroSlideAction } from './hero-slide-actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { uploadGambarAdminAction } from '../actions';

const DEFAULT_VALUES: HeroSlideFormInput = {
  judul_id: '',
  judul_en: '',
  subjudul_id: '',
  subjudul_en: '',
  gambar_url: '',
  cta_teks_id: '',
  cta_teks_en: '',
  cta_url: '',
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

export function HeroSlideFormDialog({
  open,
  onOpenChange,
  slideId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slideId: number | null;
  defaultValues: HeroSlideFormInput | null;
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HeroSlideFormInput>({
    resolver: zodResolver(HeroSlideFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });

  // Form dipakai ulang untuk tambah maupun ubah — isi ulang setiap kali dialog
  // dibuka dengan slide yang berbeda (atau dikosongkan untuk tambah baru).
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPesanError(null);
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slideId]);

  async function onSubmit(data: HeroSlideFormInput) {
    setPesanError(null);
    const hasil = await simpanHeroSlideAction(slideId, data);
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
          <DialogTitle>{slideId == null ? 'Tambah Hero Slide' : 'Ubah Hero Slide'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {pesanError && (
            <Alert variant="destructive">
              <AlertDescription>{pesanError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Judul (Indonesia) *" htmlFor="judul_id">
              <Input id="judul_id" {...register('judul_id')} />
              {errors.judul_id && <p className="text-sm text-destructive">{errors.judul_id.message}</p>}
            </Field>
            <Field label="Judul (Inggris)" htmlFor="judul_en">
              <Input id="judul_en" {...register('judul_en')} />
            </Field>

            <Field label="Subjudul (Indonesia)" htmlFor="subjudul_id">
              <Input id="subjudul_id" {...register('subjudul_id')} />
            </Field>
            <Field label="Subjudul (Inggris)" htmlFor="subjudul_en">
              <Input id="subjudul_en" {...register('subjudul_en')} />
            </Field>

            <Field label="Teks Tombol (Indonesia)" htmlFor="cta_teks_id">
              <Input id="cta_teks_id" {...register('cta_teks_id')} />
            </Field>
            <Field label="Teks Tombol (Inggris)" htmlFor="cta_teks_en">
              <Input id="cta_teks_en" {...register('cta_teks_en')} />
            </Field>
          </div>

          <Field label="Tautan Tombol" htmlFor="cta_url">
            <Input id="cta_url" placeholder="/katalog atau https://..." {...register('cta_url')} />
          </Field>

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
                  Aktifkan slide ini
                </Label>
              </div>
            )}
          />

          <Controller
            control={control}
            name="gambar_url"
            render={({ field }) => (
              <ImageUploadField
                label="Gambar"
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
