'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SoalFormSchema, type SoalFormInput } from '@/lib/validations/soal-admin';
import { simpanSoalAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

// Empat opsi TETAP — bukan useFieldArray, karena kuis correctable (PRD §8.5)
// selalu punya persis 4 opsi, tidak pernah kurang atau lebih.
function OpsiBlock({
  huruf,
  jawabanBenar,
  register,
  errors,
}: {
  huruf: 'a' | 'b' | 'c' | 'd';
  jawabanBenar: string;
  register: ReturnType<typeof useForm<SoalFormInput>>['register'];
  errors: ReturnType<typeof useForm<SoalFormInput>>['formState']['errors'];
}) {
  const benar = jawabanBenar === huruf;
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-warna-latar-2 p-4">
      <div className="flex items-center gap-2">
        <RadioGroupItem value={huruf} id={`benar-${huruf}`} />
        <Label htmlFor={`benar-${huruf}`} className="font-normal">
          Opsi {huruf.toUpperCase()} adalah jawaban benar
        </Label>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Input placeholder={`Teks opsi ${huruf.toUpperCase()} (Indonesia) *`} {...register(`opsi_${huruf}.label_id`)} />
          {errors[`opsi_${huruf}`]?.label_id && (
            <p className="mt-1 text-sm text-destructive">{errors[`opsi_${huruf}`]?.label_id?.message}</p>
          )}
        </div>
        <Input placeholder={`Teks opsi ${huruf.toUpperCase()} (Inggris)`} {...register(`opsi_${huruf}.label_en`)} />
      </div>
      {benar ? (
        <p className="text-xs text-warna-teks-2">Jawaban benar tidak butuh penjelasan.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Textarea rows={2} placeholder="Penjelasan kalau opsi ini dipilih (Indonesia)" {...register(`opsi_${huruf}.penjelasan_id`)} />
          <Textarea rows={2} placeholder="Penjelasan kalau opsi ini dipilih (Inggris)" {...register(`opsi_${huruf}.penjelasan_en`)} />
        </div>
      )}
    </div>
  );
}

export function SoalForm({
  mode,
  soalId,
  defaultValues,
}: {
  mode: 'create' | 'edit';
  soalId?: number;
  defaultValues: SoalFormInput;
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SoalFormInput>({
    resolver: zodResolver(SoalFormSchema),
    defaultValues,
  });

  const jawabanBenar = useWatch({ control, name: 'jawaban_benar' });

  async function onSubmit(data: SoalFormInput) {
    setPesanError(null);
    const hasil = await simpanSoalAction(mode === 'edit' ? (soalId ?? null) : null, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    router.push('/admin/materi/soal');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}

      <Field label="Pertanyaan (Indonesia) *" htmlFor="pertanyaan_id">
        <Textarea id="pertanyaan_id" rows={2} {...register('pertanyaan_id')} />
        {errors.pertanyaan_id && <p className="text-sm text-destructive">{errors.pertanyaan_id.message}</p>}
      </Field>

      <Field label="Pertanyaan (Inggris)" htmlFor="pertanyaan_en">
        <Textarea id="pertanyaan_en" rows={2} {...register('pertanyaan_en')} />
      </Field>

      <Controller
        control={control}
        name="jawaban_benar"
        render={({ field }) => (
          <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-3">
            <OpsiBlock huruf="a" jawabanBenar={jawabanBenar} register={register} errors={errors} />
            <OpsiBlock huruf="b" jawabanBenar={jawabanBenar} register={register} errors={errors} />
            <OpsiBlock huruf="c" jawabanBenar={jawabanBenar} register={register} errors={errors} />
            <OpsiBlock huruf="d" jawabanBenar={jawabanBenar} register={register} errors={errors} />
          </RadioGroup>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Urutan" htmlFor="urutan">
          <Input id="urutan" type="number" {...register('urutan')} />
        </Field>
        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <div className="flex items-center gap-2 self-end pb-2.5">
              <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
              <Label htmlFor="is_active" className="font-normal">
                Aktif — tampil di /kuis publik
              </Label>
            </div>
          )}
        />
      </div>

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
