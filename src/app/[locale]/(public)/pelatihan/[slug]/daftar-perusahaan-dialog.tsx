'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  CompanyRegistrationFormSchema,
  type CompanyRegistrationFormInput,
} from '@/lib/validations/company-registration';
import type { BarisGagal } from '@/lib/company-registration/import';
import { UKURAN_BAJU } from '@/lib/validations/pendaftaran-batch';
import { FileUploadField } from '@/components/file-upload-field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { publicCtaPrimary, publicCtaSecondary } from '@/lib/public-ui';
import { cn } from '@/lib/utils';
import { daftarPerusahaanAction } from './daftar-perusahaan-actions';

const EMPTY_FORM: CompanyRegistrationFormInput = {
  nama_pic: '',
  whatsapp_pic: '',
  email_pic: '',
  nama_perusahaan: '',
  catatan: '',
};

async function unduhTemplate(opts: {
  butuhLokasi: boolean;
  butuhUkuran: boolean;
  kota: string[];
}) {
  const XLSX = await import('xlsx');
  const header = ['Nama Lengkap', 'WhatsApp', 'Email'];
  if (opts.butuhLokasi) header.push('Lokasi Praktek');
  if (opts.butuhUkuran) header.push('Ukuran Baju');
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([header]), 'Peserta');
  if (opts.butuhLokasi || opts.butuhUkuran) {
    const head: string[] = [];
    if (opts.butuhLokasi) head.push('Lokasi Praktek');
    if (opts.butuhUkuran) head.push('Ukuran Baju');
    const n = Math.max(opts.butuhLokasi ? opts.kota.length : 0, opts.butuhUkuran ? UKURAN_BAJU.length : 0);
    const rows: string[][] = [head];
    for (let i = 0; i < n; i++) {
      const row: string[] = [];
      if (opts.butuhLokasi) row.push(opts.kota[i] ?? '');
      if (opts.butuhUkuran) row.push(UKURAN_BAJU[i] ?? '');
      rows.push(row);
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Daftar Pilihan');
  }
  XLSX.writeFile(wb, 'template-peserta-pelatihan.xlsx');
}

export function DaftarPerusahaanDialog({
  batchId,
  judulBatch,
  butuhLokasiPraktek = false,
  butuhUkuranBaju = false,
  lokasiPraktekOptions = [],
}: {
  batchId: number;
  judulBatch: string;
  butuhLokasiPraktek?: boolean;
  butuhUkuranBaju?: boolean;
  lokasiPraktekOptions?: { id: number; nama_kota: string }[];
}) {
  const t = useTranslations('batch.registerCompany');
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'form' | 'sukses'>('form');
  const [file, setFile] = useState<File | null>(null);
  const [gagal, setGagal] = useState<BarisGagal[]>([]);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);
  const [jumlahPeserta, setJumlahPeserta] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyRegistrationFormInput>({
    resolver: zodResolver(CompanyRegistrationFormSchema),
    defaultValues: EMPTY_FORM,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setView('form');
      setFile(null);
      setGagal([]);
      setPesanError(null);
      setWaLink(null);
      setJumlahPeserta(0);
      reset(EMPTY_FORM);
    }
  }

  async function onSubmit(data: CompanyRegistrationFormInput) {
    if (!file) {
      toast.error(t('errFile'));
      return;
    }
    setGagal([]);
    setPesanError(null);
    const hasil = await daftarPerusahaanAction(batchId, data, file);
    if (!hasil.ok) {
      if (hasil.gagal && hasil.gagal.length > 0) {
        setGagal(hasil.gagal);
        toast.error(hasil.pesan);
        return;
      }
      setPesanError(hasil.pesan);
      toast.error(hasil.pesan);
      return;
    }
    setJumlahPeserta(hasil.jumlahPeserta);
    setWaLink(hasil.waLink);
    setView('sukses');
    toast.success(t('successToast'));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={cn(publicCtaSecondary, 'w-full')}>{t('trigger')}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-w-lg">
        {view === 'sukses' ? (
          <div className="flex flex-col gap-4 overflow-y-auto p-1">
            <DialogHeader>
              <DialogTitle>{t('successTitle')}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {t('successBody', { count: jumlahPeserta, judul: judulBatch })}
            </p>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(publicCtaPrimary, 'w-full bg-emerald-600 hover:bg-emerald-600/90')}
              >
                {t('continueWhatsapp')}
              </a>
            )}
            <button
              type="button"
              className={cn(publicCtaSecondary, 'w-full')}
              onClick={() => handleOpenChange(false)}
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden"
          >
            <div className="flex flex-col gap-4 overflow-y-auto p-1">
              <DialogHeader>
                <DialogTitle>{t('formTitle')}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{t('formHint')}</p>

              <div className="space-y-1.5">
                <Label htmlFor="nama_pic">{t('picNameLabel')}</Label>
                <Input id="nama_pic" autoComplete="name" {...register('nama_pic')} />
                {errors.nama_pic && (
                  <p className="text-sm text-destructive">{errors.nama_pic.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp_pic">{t('picWhatsappLabel')}</Label>
                <Input id="whatsapp_pic" inputMode="tel" {...register('whatsapp_pic')} />
                {errors.whatsapp_pic && (
                  <p className="text-sm text-destructive">{errors.whatsapp_pic.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email_pic">{t('picEmailLabel')}</Label>
                <Input id="email_pic" type="email" autoComplete="email" {...register('email_pic')} />
                {errors.email_pic && (
                  <p className="text-sm text-destructive">{errors.email_pic.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nama_perusahaan">{t('companyLabel')}</Label>
                <Input id="nama_perusahaan" {...register('nama_perusahaan')} />
                <p className="text-sm text-muted-foreground">{t('companyHint')}</p>
                {errors.nama_perusahaan && (
                  <p className="text-sm text-destructive">{errors.nama_perusahaan.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="catatan">{t('notesLabel')}</Label>
                <Textarea id="catatan" rows={2} {...register('catatan')} />
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium text-foreground">{t('excelHeading')}</p>
                <p className="text-sm text-muted-foreground">
                  {butuhLokasiPraktek || butuhUkuranBaju ? t('excelHintPilihan') : t('excelHint')}
                </p>
                <p className="text-sm font-medium text-foreground">{t('minPesertaHint')}</p>
                <button
                  type="button"
                  className={cn(publicCtaSecondary, 'w-full')}
                  onClick={() =>
                    void unduhTemplate({
                      butuhLokasi: butuhLokasiPraktek,
                      butuhUkuran: butuhUkuranBaju,
                      kota: lokasiPraktekOptions.map((k) => k.nama_kota),
                    })
                  }
                >
                  {t('downloadTemplate')}
                </button>
                <p className="text-sm text-muted-foreground">{t('downloadHint')}</p>
                <FileUploadField
                  label={t('uploadLabel')}
                  accept=".xlsx,.xls,.csv"
                  hint={t('uploadHint')}
                  file={file}
                  onFile={(f) => {
                    setFile(f);
                    setGagal([]);
                    setPesanError(null);
                  }}
                />
              </div>

              {(gagal.length > 0 || pesanError) && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm"
                >
                  {gagal.length > 0 ? (
                    <>
                      <p className="font-medium text-destructive">{t('errorListHeading')}</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-destructive">
                        {gagal.map((g) => (
                          <li key={`${g.baris}-${g.alasan}`}>
                            {t('errorRow', { baris: g.baris, alasan: g.alasan })}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="font-medium text-destructive">{pesanError}</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 shrink-0 border-t border-border pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(publicCtaPrimary, 'w-full')}
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" aria-hidden />
                    {t('submitting')}
                  </>
                ) : (
                  t('submit')
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
