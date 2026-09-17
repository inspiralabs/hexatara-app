'use client';

import { useEffect, useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import imageCompression from 'browser-image-compression';
import { ImagePlusIcon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';
import {
  PendaftaranBatchSchema,
  type PendaftaranBatchInput,
} from '@/lib/validations/pendaftaran-batch';
import { DatePickerField } from '@/components/admin/date-picker-field';
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
  'Instagram',
  'WhatsApp',
  'Teman / keluarga',
  'Website Hexatara',
  'Google',
  'Lainnya',
] as const;

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
}: {
  label: string;
  file: File | null;
  onFile: (f: File | null) => void;
  sudahAdaDiProfil: boolean;
}) {
  const inputId = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <label
        htmlFor={inputId}
        className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/40 px-3 text-center hover:bg-muted"
      >
        <ImagePlusIcon className="size-5 text-muted-foreground" aria-hidden />
        <span className="text-xs text-muted-foreground">
          {file
            ? file.name
            : sudahAdaDiProfil
              ? 'Sudah ada di profil — klik untuk ganti'
              : 'JPG/PNG/WebP · maks. 5 MB'}
        </span>
      </label>
    </div>
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
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>(loggedIn ? 'form' : 'pilih');
  const [waLink, setWaLink] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState('');
  const [fileKtp, setFileKtp] = useState<File | null>(null);
  const [filePas, setFilePas] = useState<File | null>(null);
  const [sumberPilihan, setSumberPilihan] = useState<string>('');
  const [sumberLainnya, setSumberLainnya] = useState('');
  const punyaFotoProfil = Boolean(prefill?.foto_ktp_url && prefill?.pas_foto_url);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PendaftaranBatchInput>({
    resolver: zodResolver(PendaftaranBatchSchema),
    defaultValues: {
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
    },
  });

  useEffect(() => {
    if (!open) return;
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
    }
  }, [open, prefill, reset]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setView(loggedIn ? 'form' : 'pilih');
      setWaLink(null);
      setPesanSukses('');
      setFileKtp(null);
      setFilePas(null);
      setSumberPilihan('');
      setSumberLainnya('');
      reset();
    }
  }

  async function onSubmit(data: PendaftaranBatchInput) {
    if (!fileKtp && !punyaFotoProfil) {
      toast.error('Foto KTP wajib diunggah.');
      return;
    }
    if (!filePas && !punyaFotoProfil) {
      toast.error('Pas foto wajib diunggah.');
      return;
    }

    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value != null && value !== '') formData.set(key, String(value));
    }
    formData.set('sumber_info', sumberPilihan);
    if (sumberPilihan === 'Lainnya') formData.set('sumber_info_lainnya', sumberLainnya);

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
      toast.error('Gagal memproses gambar. Coba berkas lain.');
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={cn(publicCtaPrimary, 'mt-4 w-full')}>
        Daftar Sekarang
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-w-lg">
        {view === 'pilih' && (
          <div className="flex flex-col gap-4 overflow-y-auto p-1">
            <DialogHeader>
              <DialogTitle>Daftar pelatihan</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Sudah punya akun Hexatara? Login dulu supaya data identitas bisa terisi otomatis.
              Atau daftar tanpa akun sekarang.
            </p>
            <Link
              href={loginHref}
              className={cn(publicCtaPrimary, 'w-full')}
              onClick={() => setOpen(false)}
            >
              Sudah punya akun? Login dulu
            </Link>
            <button
              type="button"
              className={cn(publicCtaSecondary, 'w-full')}
              onClick={() => setView('form')}
            >
              Daftar tanpa akun sekarang
            </button>
          </div>
        )}

        {view === 'sukses' && (
          <div className="flex flex-col gap-4 overflow-y-auto p-1">
            <DialogHeader>
              <DialogTitle>Pendaftaran diterima</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{pesanSukses}</p>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(publicCtaPrimary, 'w-full bg-emerald-600 hover:bg-emerald-600/90')}
              >
                Hubungi Admin via WhatsApp
              </a>
            )}
            <button
              type="button"
              className={cn(publicCtaSecondary, 'w-full')}
              onClick={() => handleOpenChange(false)}
            >
              Tutup
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
              <DialogTitle>Form pendaftaran pelatihan</DialogTitle>
            </DialogHeader>
            {loggedIn && prefill && (
              <p className="text-xs text-muted-foreground">
                Data identitas terisi dari profilmu — bisa kamu koreksi di form ini.
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nama_lengkap">Nama lengkap</Label>
              <Input id="nama_lengkap" autoComplete="name" {...register('nama_lengkap')} />
              {errors.nama_lengkap && (
                <p className="text-sm text-destructive">{errors.nama_lengkap.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" type="tel" autoComplete="tel" {...register('whatsapp')} />
              {errors.whatsapp && (
                <p className="text-sm text-destructive">{errors.whatsapp.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nomor_ktp">Nomor KTP</Label>
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
              <Label htmlFor="tempat_lahir">Tempat lahir</Label>
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
                    label="Tanggal lahir"
                    value={field.value || null}
                    onChange={(v) => field.onChange(v ?? '')}
                    captionLayout="dropdown"
                    reverseYears
                    disableFuture
                    startMonth={new Date(1940, 0)}
                    endMonth={new Date()}
                  />
                  {errors.tanggal_lahir && (
                    <p className="text-sm text-destructive">{errors.tanggal_lahir.message}</p>
                  )}
                </div>
              )}
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="alamat_lengkap">Alamat lengkap</Label>
              <Textarea id="alamat_lengkap" rows={3} {...register('alamat_lengkap')} />
              {errors.alamat_lengkap && (
                <p className="text-sm text-destructive">{errors.alamat_lengkap.message}</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FotoPicker
                label="Foto KTP"
                file={fileKtp}
                onFile={setFileKtp}
                sudahAdaDiProfil={Boolean(prefill?.foto_ktp_url)}
              />
              <FotoPicker
                label="Pas foto"
                file={filePas}
                onFile={setFilePas}
                sudahAdaDiProfil={Boolean(prefill?.pas_foto_url)}
              />
            </div>

            <Controller
              name="kategori_peserta"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground">Kategori peserta</span>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="gap-2"
                  >
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="penerbitan_baru" />
                      Penerbitan baru
                    </Label>
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="perpanjangan_renewal" />
                      Perpanjangan / renewal
                    </Label>
                  </RadioGroup>
                  {errors.kategori_peserta && (
                    <p className="text-sm text-destructive">{errors.kategori_peserta.message}</p>
                  )}
                </div>
              )}
            />

            <div className="flex flex-col gap-1.5">
              <Label>Darimana mengetahui pelatihan ini?</Label>
              <Select
                value={sumberPilihan || null}
                onValueChange={(v) => setSumberPilihan(v ?? '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih sumber (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {SUMBER_OPSI.map((opsi) => (
                    <SelectItem key={opsi} value={opsi}>
                      {opsi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sumberPilihan === 'Lainnya' && (
                <Input
                  placeholder="Sebutkan sumbernya"
                  value={sumberLainnya}
                  onChange={(e) => setSumberLainnya(e.target.value)}
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kode_referral">Kode referral (opsional)</Label>
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
                  Mengirim…
                </span>
              ) : (
                'Kirim pendaftaran'
              )}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
