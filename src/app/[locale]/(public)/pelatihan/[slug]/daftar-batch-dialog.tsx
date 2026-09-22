'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import imageCompression from 'browser-image-compression';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  PendaftaranBatchSchema,
  type PendaftaranBatchInput,
} from '@/lib/validations/pendaftaran-batch';
import { DatePickerField } from '@/components/admin/date-picker-field';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { publicCtaPrimary, publicCtaSecondary } from '@/lib/public-ui';
import { cn } from '@/lib/utils';
import { daftarBatchAction } from './daftar-batch-actions';

const SUMBER_OPSI = [
  { value: 'Instagram', labelKey: 'sumberInstagram' },
  { value: 'WhatsApp', labelKey: 'sumberWhatsapp' },
  { value: 'Teman / keluarga', labelKey: 'sumberTeman' },
  { value: 'Website Hexatara', labelKey: 'sumberWebsite' },
  { value: 'Google', labelKey: 'sumberGoogle' },
  { value: 'Lainnya', labelKey: 'sumberLainnya' },
] as const;

const EMPTY_FORM: PendaftaranBatchInput = {
  nama_lengkap: '',
  email: '',
  whatsapp: '',
  nomor_ktp: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  alamat_lengkap: '',
  kategori_peserta: 'penerbitan_baru',
  sumber_info: '',
  kode_referral: '',
};

type Prefill = {
  nama_lengkap: string;
  email: string;
  whatsapp: string;
  nomor_ktp: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat_lengkap: string;
  foto_ktp_url: string | null;
  pas_foto_url: string | null;
};

type View = 'pilih' | 'form' | 'sukses';

function FotoPicker({
  label,
  file,
  onFile,
  sudahAdaDiProfil,
  hintAda,
  hintKosong,
}: {
  label: string;
  file: File | null;
  onFile: (f: File | null) => void;
  sudahAdaDiProfil: boolean;
  hintAda: string;
  hintKosong: string;
}) {
  return (
    <FileUploadField
      label={label}
      accept="image/jpeg,image/png,image/webp"
      hint={sudahAdaDiProfil ? hintAda : hintKosong}
      file={file}
      onFile={onFile}
    />
  );
}

export function DaftarBatchDialog({
  batchId,
  slug,
  loggedIn,
  prefill,
}: {
  batchId: number;
  slug: string;
  loggedIn: boolean;
  prefill: Prefill | null;
}) {
  const t = useTranslations('batch.register');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('pilih');
  const [sebagaiTamu, setSebagaiTamu] = useState(false);
  const [waLink, setWaLink] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState('');
  const [fileKtp, setFileKtp] = useState<File | null>(null);
  const [filePas, setFilePas] = useState<File | null>(null);
  const [sumberPilihan, setSumberPilihan] = useState<string>('');
  const [sumberLainnya, setSumberLainnya] = useState('');
  const pakaiProfil = loggedIn && !sebagaiTamu;
  const punyaFotoProfil = Boolean(
    pakaiProfil && prefill?.foto_ktp_url && prefill?.pas_foto_url,
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PendaftaranBatchInput>({
    resolver: zodResolver(PendaftaranBatchSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!open || sebagaiTamu || !prefill) return;
    reset({
      nama_lengkap: prefill.nama_lengkap,
      email: prefill.email,
      whatsapp: prefill.whatsapp,
      nomor_ktp: prefill.nomor_ktp,
      tempat_lahir: prefill.tempat_lahir,
      tanggal_lahir: prefill.tanggal_lahir,
      alamat_lengkap: prefill.alamat_lengkap,
      kategori_peserta: 'penerbitan_baru',
      sumber_info: '',
      kode_referral: '',
    });
  }, [open, sebagaiTamu, prefill, reset]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setView('pilih');
      setSebagaiTamu(false);
      setWaLink(null);
      setPesanSukses('');
      setFileKtp(null);
      setFilePas(null);
      setSumberPilihan('');
      setSumberLainnya('');
      reset(EMPTY_FORM);
    }
  }

  function mulaiDenganAkun() {
    setSebagaiTamu(false);
    setFileKtp(null);
    setFilePas(null);
    if (prefill) {
      reset({
        nama_lengkap: prefill.nama_lengkap,
        email: prefill.email,
        whatsapp: prefill.whatsapp,
        nomor_ktp: prefill.nomor_ktp,
        tempat_lahir: prefill.tempat_lahir,
        tanggal_lahir: prefill.tanggal_lahir,
        alamat_lengkap: prefill.alamat_lengkap,
        kategori_peserta: 'penerbitan_baru',
        sumber_info: '',
        kode_referral: '',
      });
    } else {
      reset(EMPTY_FORM);
    }
    setView('form');
  }

  function mulaiSebagaiTamu() {
    setSebagaiTamu(true);
    setFileKtp(null);
    setFilePas(null);
    reset(EMPTY_FORM);
    setView('form');
  }

  async function onSubmit(data: PendaftaranBatchInput) {
    if (!fileKtp && !punyaFotoProfil) {
      toast.error(t('errFotoKtp'));
      return;
    }
    if (!filePas && !punyaFotoProfil) {
      toast.error(t('errPasFoto'));
      return;
    }

    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value != null && value !== '') formData.set(key, String(value));
    }
    formData.set('sumber_info', sumberPilihan);
    if (sumberPilihan === 'Lainnya') formData.set('sumber_info_lainnya', sumberLainnya);
    if (sebagaiTamu) formData.set('sebagai_tamu', '1');

    try {
      if (fileKtp) {
        const compressed = await imageCompression(fileKtp, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
        });
        formData.set('foto_ktp', new File([compressed], fileKtp.name, { type: compressed.type }));
      }
      if (filePas) {
        const compressed = await imageCompression(filePas, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
        });
        formData.set('pas_foto', new File([compressed], filePas.name, { type: compressed.type }));
      }
    } catch {
      toast.error(t('errGambar'));
      return;
    }

    const hasil = await daftarBatchAction(batchId, formData);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }

    toast.success(hasil.pesan);
    setPesanSukses(hasil.pesan);
    setWaLink(hasil.waLink);
    setView('sukses');
  }

  const loginHref = `/login?next=${encodeURIComponent(`/pelatihan/${slug}`)}`;
  // ponytail: copy lokal di sini — messages/*.json ditambah kalau Alif minta i18n penuh
  const labelDenganAkun =
    locale === 'en' ? 'Register with this account' : 'Daftar dengan akun ini';
  const labelTanpaTaut =
    locale === 'en' ? 'Register without linking account' : 'Daftar tanpa taut akun';
  const bodyLoggedIn =
    locale === 'en'
      ? 'Use your profile data, or register without linking this account.'
      : 'Pakai data profilmu, atau daftar tanpa menautkan akun ini.';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={cn(publicCtaPrimary, 'mt-4 w-full')}>
        {t('trigger')}
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-w-lg">
        {view === 'pilih' && (
          <div className="flex flex-col gap-4 overflow-y-auto p-1">
            <DialogHeader>
              <DialogTitle>{t('chooseTitle')}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {loggedIn ? bodyLoggedIn : t('chooseBody')}
            </p>
            {loggedIn ? (
              <>
                <button
                  type="button"
                  className={cn(publicCtaPrimary, 'w-full')}
                  onClick={mulaiDenganAkun}
                >
                  {labelDenganAkun}
                </button>
                <button
                  type="button"
                  className={cn(publicCtaSecondary, 'w-full')}
                  onClick={mulaiSebagaiTamu}
                >
                  {labelTanpaTaut}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={loginHref}
                  className={cn(publicCtaPrimary, 'w-full')}
                  onClick={() => setOpen(false)}
                >
                  {t('loginFirst')}
                </Link>
                <button
                  type="button"
                  className={cn(publicCtaSecondary, 'w-full')}
                  onClick={mulaiSebagaiTamu}
                >
                  {t('guestContinue')}
                </button>
              </>
            )}
          </div>
        )}

        {view === 'sukses' && (
          <div className="flex flex-col gap-4 overflow-y-auto p-1">
            <DialogHeader>
              <DialogTitle>{t('successTitle')}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{pesanSukses}</p>
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
        )}

        {view === 'form' && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1"
            noValidate
          >
            <DialogHeader>
              <DialogTitle>{t('formTitle')}</DialogTitle>
            </DialogHeader>
            {pakaiProfil && prefill && (
              <p className="text-sm text-muted-foreground">{t('prefillHint')}</p>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nama_lengkap">{t('nameLabel')}</Label>
              <Input id="nama_lengkap" autoComplete="name" {...register('nama_lengkap')} />
              {errors.nama_lengkap && (
                <p className="text-sm text-destructive">{errors.nama_lengkap.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whatsapp">{t('whatsappLabel')}</Label>
              <Input id="whatsapp" type="tel" autoComplete="tel" {...register('whatsapp')} />
              {errors.whatsapp && (
                <p className="text-sm text-destructive">{errors.whatsapp.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nomor_ktp">{t('ktpLabel')}</Label>
              <Input
                id="nomor_ktp"
                inputMode="numeric"
                maxLength={16}
                {...register('nomor_ktp')}
              />
              {errors.nomor_ktp && (
                <p className="text-sm text-destructive">{errors.nomor_ktp.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tempat_lahir">{t('birthPlaceLabel')}</Label>
              <Input id="tempat_lahir" {...register('tempat_lahir')} />
              {errors.tempat_lahir && (
                <p className="text-sm text-destructive">{errors.tempat_lahir.message}</p>
              )}
            </div>

            <Controller
              name="tanggal_lahir"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <DatePickerField
                    label={t('birthDateLabel')}
                    value={field.value || null}
                    onChange={(v) => field.onChange(v ?? '')}
                    captionLayout="dropdown"
                    reverseYears
                    disableFuture
                    startMonth={new Date(1940, 0)}
                    endMonth={new Date()}
                    locale={locale}
                    placeholder={t('birthDateLabel')}
                  />
                  {errors.tanggal_lahir && (
                    <p className="text-sm text-destructive">{errors.tanggal_lahir.message}</p>
                  )}
                </div>
              )}
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="alamat_lengkap">{t('addressLabel')}</Label>
              <Textarea id="alamat_lengkap" rows={3} {...register('alamat_lengkap')} />
              {errors.alamat_lengkap && (
                <p className="text-sm text-destructive">{errors.alamat_lengkap.message}</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FotoPicker
                label={t('fotoKtpLabel')}
                file={fileKtp}
                onFile={setFileKtp}
                sudahAdaDiProfil={Boolean(pakaiProfil && prefill?.foto_ktp_url)}
                hintAda={t('fotoAdaProfil')}
                hintKosong={t('fotoHint')}
              />
              <FotoPicker
                label={t('pasFotoLabel')}
                file={filePas}
                onFile={setFilePas}
                sudahAdaDiProfil={Boolean(pakaiProfil && prefill?.pas_foto_url)}
                hintAda={t('fotoAdaProfil')}
                hintKosong={t('fotoHint')}
              />
            </div>

            <Controller
              name="kategori_peserta"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground">{t('kategoriLabel')}</span>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="gap-2"
                  >
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="penerbitan_baru" />
                      {t('kategoriBaru')}
                    </Label>
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="perpanjangan_renewal" />
                      {t('kategoriRenewal')}
                    </Label>
                  </RadioGroup>
                  {errors.kategori_peserta && (
                    <p className="text-sm text-destructive">{errors.kategori_peserta.message}</p>
                  )}
                </div>
              )}
            />

            <div className="flex flex-col gap-1.5">
              <Label>{t('sumberLabel')}</Label>
              <Select
                value={sumberPilihan || null}
                onValueChange={(v) => setSumberPilihan(v ?? '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('sumberPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {SUMBER_OPSI.map((opsi) => (
                    <SelectItem key={opsi.value} value={opsi.value}>
                      {t(opsi.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sumberPilihan === 'Lainnya' && (
                <Input
                  placeholder={t('sumberLainnyaPlaceholder')}
                  value={sumberLainnya}
                  onChange={(e) => setSumberLainnya(e.target.value)}
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kode_referral">{t('referralLabel')}</Label>
              <Input id="kode_referral" {...register('kode_referral')} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(publicCtaPrimary, 'w-full disabled:opacity-50')}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2Icon className="size-4 animate-spin" aria-hidden />
                  {t('submitting')}
                </span>
              ) : (
                t('submit')
              )}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
