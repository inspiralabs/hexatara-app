'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addYears, format, parse } from 'date-fns';
import { SertifikatFormSchema, type SertifikatFormInput } from '@/lib/validations/sertifikat-admin';
import { simpanSertifikatAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerField } from '@/components/admin/date-picker-field';

const JENIS_OPTIONS: { value: SertifikatFormInput['jenis']; label: string }[] = [
  { value: 'existing_manual', label: 'Existing Manual (2 tahun)' },
  { value: 'rpc_certified', label: 'RPC Certified (2 tahun)' },
  { value: 'free_track', label: 'Free Track (tanpa masa berlaku)' },
];

function tambahDuaTahun(tanggalTerbit: string) {
  return format(addYears(parse(tanggalTerbit, 'yyyy-MM-dd', new Date()), 2), 'yyyy-MM-dd');
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function SertifikatForm({
  mode,
  sertifikatId,
  defaultValues,
}: {
  mode: 'create' | 'edit';
  sertifikatId?: string;
  defaultValues: SertifikatFormInput;
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SertifikatFormInput>({
    resolver: zodResolver(SertifikatFormSchema),
    defaultValues,
  });

  const jenis = useWatch({ control, name: 'jenis' });
  const tanpaMasaBerlaku = jenis === 'free_track';

  async function onSubmit(data: SertifikatFormInput) {
    setPesanError(null);
    const hasil = await simpanSertifikatAction(mode === 'edit' ? (sertifikatId ?? null) : null, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    router.push('/admin/sertifikat');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}

      <Field label="Nomor Sertifikat" htmlFor="nomor_sertifikat">
        <Input
          id="nomor_sertifikat"
          placeholder="(otomatis saat disimpan)"
          {...register('nomor_sertifikat')}
        />
        <p className="text-xs text-warna-teks-2">
          Kosongkan untuk dibuatkan otomatis sesuai jenis, atau isi manual bila perlu mencocokkan sertifikat fisik.
        </p>
      </Field>

      <Field label="Jenis Sertifikat *" htmlFor="jenis">
        <Controller
          control={control}
          name="jenis"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                const terbit = getValues('tanggal_terbit');
                if (value === 'free_track') {
                  setValue('tanggal_kedaluwarsa', null);
                } else if (terbit) {
                  setValue('tanggal_kedaluwarsa', tambahDuaTahun(terbit));
                }
              }}
            >
              <SelectTrigger id="jenis" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JENIS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field label="Nama Lengkap *" htmlFor="nama_lengkap">
        <Input id="nama_lengkap" {...register('nama_lengkap')} />
        {errors.nama_lengkap && <p className="text-sm text-destructive">{errors.nama_lengkap.message}</p>}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="tanggal_terbit"
          render={({ field }) => (
            <div>
              <DatePickerField
                label="Tanggal Terbit *"
                value={field.value ?? null}
                onChange={(value) => {
                  field.onChange(value);
                  if (value && jenis !== 'free_track') {
                    setValue('tanggal_kedaluwarsa', tambahDuaTahun(value));
                  }
                }}
              />
              {errors.tanggal_terbit && (
                <p className="mt-1 text-sm text-destructive">{errors.tanggal_terbit.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          control={control}
          name="tanggal_kedaluwarsa"
          render={({ field }) => (
            <div>
              <DatePickerField
                label="Tanggal Kedaluwarsa"
                value={tanpaMasaBerlaku ? null : (field.value ?? null)}
                onChange={field.onChange}
                disabled={tanpaMasaBerlaku}
              />
              <p className="mt-1 text-xs text-warna-teks-2">
                {tanpaMasaBerlaku
                  ? 'Free track tidak pernah kedaluwarsa — kolom ini dinonaktifkan.'
                  : 'Terisi otomatis dari tanggal terbit + 2 tahun, bisa ditimpa bila sertifikat fisik berbeda.'}
              </p>
              {errors.tanggal_kedaluwarsa && (
                <p className="mt-1 text-sm text-destructive">{errors.tanggal_kedaluwarsa.message}</p>
              )}
            </div>
          )}
        />
      </div>

      <Controller
        control={control}
        name="qr_aktif"
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Switch id="qr_aktif" checked={field.value} onCheckedChange={field.onChange} />
            <Label htmlFor="qr_aktif" className="font-normal">
              QR aktif — bisa diverifikasi publik di /verify
            </Label>
          </div>
        )}
      />

      <Field label="Catatan" htmlFor="catatan">
        <Textarea id="catatan" rows={3} {...register('catatan')} />
      </Field>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
