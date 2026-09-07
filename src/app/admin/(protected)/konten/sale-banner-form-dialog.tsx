'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaleBannerFormSchema, type SaleBannerFormInput } from '@/lib/validations/sale-banner-admin';
import { simpanSaleBannerAction } from './sale-banner-actions';
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

const DEFAULT_VALUES: SaleBannerFormInput = {
  judul_id: '',
  judul_en: '',
  teks_id: '',
  teks_en: '',
  urgensi_id: '',
  urgensi_en: '',
  tombol_teks_id: '',
  tombol_teks_en: '',
  tombol_url: '',
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

export function SaleBannerFormDialog({
  open,
  onOpenChange,
  bannerId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bannerId: number | null;
  defaultValues: SaleBannerFormInput | null;
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SaleBannerFormInput>({
    resolver: zodResolver(SaleBannerFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });

  // Form dipakai ulang untuk tambah maupun ubah — isi ulang setiap kali dialog
  // dibuka dengan banner yang berbeda (atau dikosongkan untuk tambah baru).
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPesanError(null);
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bannerId]);

  async function onSubmit(data: SaleBannerFormInput) {
    setPesanError(null);
    const hasil = await simpanSaleBannerAction(bannerId, data);
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
          <DialogTitle>{bannerId == null ? 'Tambah Sale Banner' : 'Ubah Sale Banner'}</DialogTitle>
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

            <Field label="Teks Penawaran (Indonesia)" htmlFor="teks_id">
              <Input id="teks_id" {...register('teks_id')} />
            </Field>
            <Field label="Teks Penawaran (Inggris)" htmlFor="teks_en">
              <Input id="teks_en" {...register('teks_en')} />
            </Field>

            <Field label="Pesan Urgensi (Indonesia)" htmlFor="urgensi_id">
              <Input id="urgensi_id" placeholder="mis. Kuota terbatas bulan ini" {...register('urgensi_id')} />
            </Field>
            <Field label="Pesan Urgensi (Inggris)" htmlFor="urgensi_en">
              <Input id="urgensi_en" {...register('urgensi_en')} />
            </Field>

            <Field label="Teks Tombol (Indonesia)" htmlFor="tombol_teks_id">
              <Input id="tombol_teks_id" {...register('tombol_teks_id')} />
            </Field>
            <Field label="Teks Tombol (Inggris)" htmlFor="tombol_teks_en">
              <Input id="tombol_teks_en" {...register('tombol_teks_en')} />
            </Field>
          </div>

          <Field label="Tautan Tombol" htmlFor="tombol_url">
            <Input id="tombol_url" placeholder="/katalog atau https://..." {...register('tombol_url')} />
          </Field>

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
                  Aktifkan sale banner ini
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
