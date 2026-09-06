'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BatchLeadFormSchema } from '@/lib/validations/batch-lead';
import { daftarMinatAction } from './actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

type BatchLeadInput = z.infer<typeof BatchLeadFormSchema>;

export function DaftarMinatDialog({ batchId }: { batchId: number }) {
  const [open, setOpen] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null | undefined>(undefined);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BatchLeadInput>({
    resolver: zodResolver(BatchLeadFormSchema),
    defaultValues: { nama: '', whatsapp: '', persetujuan: false },
  });

  async function onSubmit(data: BatchLeadInput) {
    setPesanError(null);
    const hasil = await daftarMinatAction(batchId, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    setWaLink(hasil.waLink);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      reset();
      setPesanError(null);
      setWaLink(undefined);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks">
        Daftar Sekarang
      </DialogTrigger>
      <DialogContent>
        {waLink !== undefined ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Pendaftaran Minat Tersimpan</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-warna-teks-2">
              Terima kasih! Data kamu sudah tersimpan. Lanjutkan ke WhatsApp Admin untuk proses
              selanjutnya — ini bukan pendaftaran resmi peserta, seleksi dan pembayaran tetap
              berjalan manual lewat WhatsApp.
            </p>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-warna-sukses px-5 text-base font-semibold text-warna-latar"
              >
                Lanjut ke WhatsApp
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <DialogHeader>
              <DialogTitle>Daftar Minat Batch</DialogTitle>
            </DialogHeader>

            {pesanError && (
              <Alert variant="destructive">
                <AlertDescription>{pesanError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nama">Nama lengkap</Label>
              <Input id="nama" autoComplete="name" {...register('nama')} />
              {errors.nama && <p className="text-sm text-destructive">{errors.nama.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
              <Input id="whatsapp" type="tel" autoComplete="tel" {...register('whatsapp')} />
              {errors.whatsapp && (
                <p className="text-sm text-destructive">{errors.whatsapp.message}</p>
              )}
            </div>

            <Controller
              control={control}
              name="persetujuan"
              render={({ field }) => (
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="persetujuan"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                  <Label htmlFor="persetujuan" className="font-normal">
                    Saya menyetujui data ini disimpan Hexatara untuk keperluan pendaftaran minat.
                  </Label>
                </div>
              )}
            />
            {errors.persetujuan && (
              <p className="text-sm text-destructive">{errors.persetujuan.message}</p>
            )}

            <p className="text-xs text-warna-teks-2">
              Ini bukan pendaftaran resmi peserta. Seleksi dan pembayaran tetap berjalan manual
              lewat WhatsApp.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses…' : 'Kirim'}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
