'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LampiranFormSchema, type LampiranFormInput } from '@/lib/validations/materi-lampiran-admin';
import { simpanLampiranAction, uploadLampiranBabAction } from './lampiran-actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DEFAULT_VALUES: LampiranFormInput = {
  judul_id: '',
  judul_en: '',
  deskripsi_id: '',
  deskripsi_en: '',
  url_file: '',
};

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function LampiranFormDialog({
  open,
  onOpenChange,
  chapterId,
  lampiranId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterId: number;
  lampiranId: number | null;
  defaultValues: LampiranFormInput | null;
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LampiranFormInput>({
    resolver: zodResolver(LampiranFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPesanError(null);
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lampiranId]);

  async function handleFile(file: File | undefined, onChange: (url: string) => void) {
    if (!file) return;
    setPesanError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const hasil = await uploadLampiranBabAction(fd);
      if (!hasil.ok) {
        setPesanError(hasil.pesan);
        return;
      }
      onChange(hasil.url);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: LampiranFormInput) {
    setPesanError(null);
    const hasil = await simpanLampiranAction(chapterId, lampiranId, data);
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
          <DialogTitle>{lampiranId == null ? 'Tambah Lampiran' : 'Ubah Lampiran'}</DialogTitle>
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

            <Field label="Deskripsi (Indonesia)" htmlFor="deskripsi_id">
              <Textarea id="deskripsi_id" rows={2} {...register('deskripsi_id')} />
            </Field>
            <Field label="Deskripsi (Inggris)" htmlFor="deskripsi_en">
              <Textarea id="deskripsi_en" rows={2} {...register('deskripsi_en')} />
            </Field>
          </div>

          <Controller
            control={control}
            name="url_file"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-warna-teks">Berkas (PDF/PPT/Excel/Word) *</span>
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
                    accept=".pdf,.ppt,.pptx,.xls,.xlsx,.doc,.docx"
                    disabled={uploading}
                    onChange={(e) => handleFile(e.target.files?.[0], field.onChange)}
                    className="text-sm text-warna-teks-2"
                  />
                )}
                {uploading && <p className="text-sm text-warna-teks-2">Mengunggah…</p>}
                {errors.url_file && <p className="text-sm text-destructive">{errors.url_file.message}</p>}
              </div>
            )}
          />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || uploading}
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
