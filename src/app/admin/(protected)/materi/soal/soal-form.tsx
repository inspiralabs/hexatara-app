'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { SoalFormSchema, type SoalFormInput } from '@/lib/validations/soal-admin';
import { simpanSoalAction } from './actions';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';

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
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
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
        <p className="text-xs text-muted-foreground">Jawaban benar tidak butuh penjelasan.</p>
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
  const form = useForm<SoalFormInput>({
    resolver: zodResolver(SoalFormSchema),
    defaultValues,
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const jawabanBenar = useWatch({ control, name: 'jawaban_benar' });

  async function onSubmit(data: SoalFormInput) {
    setPesanError(null);
    const hasil = await simpanSoalAction(mode === 'edit' ? (soalId ?? null) : null, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Soal berhasil disimpan.');
    router.push('/admin/materi/soal');
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        {pesanError && (
          <Alert variant="destructive">
            <AlertDescription>{pesanError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={control}
          name="pertanyaan_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pertanyaan (Indonesia) *</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="pertanyaan_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pertanyaan (Inggris)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="jawaban_benar"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-3">
                  <OpsiBlock huruf="a" jawabanBenar={jawabanBenar} register={register} errors={errors} />
                  <OpsiBlock huruf="b" jawabanBenar={jawabanBenar} register={register} errors={errors} />
                  <OpsiBlock huruf="c" jawabanBenar={jawabanBenar} register={register} errors={errors} />
                  <OpsiBlock huruf="d" jawabanBenar={jawabanBenar} register={register} errors={errors} />
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="font-normal">Aktif — tampil di /kuis publik</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6">
            {isSubmitting ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
