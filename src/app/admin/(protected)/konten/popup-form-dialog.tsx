'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PopupFormSchema, type PopupFormInput } from '@/lib/validations/popup-admin';
import { simpanPopupAction } from './popup-actions';
import { uploadGambarAdminAction } from '../actions';
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
import { DatePickerField } from '@/components/admin/date-picker-field';
import { ImageUploadField } from '@/components/image-upload-field';

const DEFAULT_VALUES: PopupFormInput = {
  judul_id: '',
  judul_en: '',
  gambar_mobile_url: '',
  gambar_desktop_url: '',
  cta_url: '',
  tayang_mulai: null,
  tayang_selesai: null,
  is_active: false,
};

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function PopupFormDialog({
  open,
  onOpenChange,
  popupId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  popupId: number | null;
  defaultValues: PopupFormInput | null;
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PopupFormInput>({
    resolver: zodResolver(PopupFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });

  // Form dipakai ulang untuk tambah maupun ubah — isi ulang setiap kali dialog
  // dibuka dengan popup yang berbeda (atau dikosongkan untuk tambah baru).
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPesanError(null);
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, popupId]);

  async function onSubmit(data: PopupFormInput) {
    setPesanError(null);
    const hasil = await simpanPopupAction(popupId, data);
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
          <DialogTitle>{popupId == null ? 'Tambah Pop-up' : 'Ubah Pop-up'}</DialogTitle>
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
              <p className="text-xs text-warna-teks-2">Untuk aksesibilitas (alt text) — tidak ditampilkan di popup.</p>
            </Field>
            <Field label="Judul (Inggris)" htmlFor="judul_en">
              <Input id="judul_en" {...register('judul_en')} />
            </Field>
          </div>

          <Field label="Tautan (opsional)" htmlFor="cta_url">
            <Input id="cta_url" placeholder="/katalog atau https://..." {...register('cta_url')} />
            <p className="text-xs text-warna-teks-2">Kalau diisi, seluruh gambar popup jadi bisa diklik menuju tautan ini.</p>
          </Field>

          <Controller
            control={control}
            name="gambar_mobile_url"
            render={({ field }) => (
              <ImageUploadField
                label="Gambar Mobile (potret) — disarankan 1080×1920px"
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
            name="gambar_desktop_url"
            render={({ field }) => (
              <ImageUploadField
                label="Gambar Desktop (lanskap) — disarankan 1920×1080px"
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Controller
              control={control}
              name="tayang_mulai"
              render={({ field }) => (
                <DatePickerField label="Tayang Mulai" value={field.value ?? null} onChange={field.onChange} />
              )}
            />
            <Controller
              control={control}
              name="tayang_selesai"
              render={({ field }) => (
                <DatePickerField label="Tayang Selesai" value={field.value ?? null} onChange={field.onChange} />
              )}
            />
          </div>
          <p className="text-xs text-warna-teks-2">Kosongkan salah satu atau keduanya untuk tayang tanpa batas.</p>

          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                <Label htmlFor="is_active" className="font-normal">
                  Aktifkan pop-up ini
                </Label>
              </div>
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
