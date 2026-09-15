'use client';

import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addYears, format, parse } from 'date-fns';
import { toast } from 'sonner';
import { SertifikatFormSchema, type SertifikatFormInput } from '@/lib/validations/sertifikat-admin';
import { simpanSertifikatAction } from './actions';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePickerField } from '@/components/admin/date-picker-field';

const JENIS_OPTIONS: { value: SertifikatFormInput['jenis']; label: string }[] = [
  { value: 'existing_manual', label: 'Existing Manual (2 tahun)' },
  { value: 'rpc_certified', label: 'RPC Certified (2 tahun)' },
  { value: 'free_track', label: 'Free Track (tanpa masa berlaku)' },
];

function tambahDuaTahun(tanggalTerbit: string) {
  return format(addYears(parse(tanggalTerbit, 'yyyy-MM-dd', new Date()), 2), 'yyyy-MM-dd');
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
  const form = useForm<SertifikatFormInput>({
    resolver: zodResolver(SertifikatFormSchema),
    defaultValues,
  });
  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { isSubmitting },
  } = form;

  const jenis = useWatch({ control, name: 'jenis' });
  const tanpaMasaBerlaku = jenis === 'free_track';

  async function onSubmit(data: SertifikatFormInput) {
    const hasil = await simpanSertifikatAction(mode === 'edit' ? (sertifikatId ?? null) : null, data);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Sertifikat berhasil disimpan.');
    router.push('/admin/sertifikat');
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>

        <FormField
          control={control}
          name="nomor_sertifikat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Sertifikat</FormLabel>
              <FormControl>
                <Input placeholder="(otomatis saat disimpan)" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>
                Kosongkan untuk dibuatkan otomatis sesuai jenis, atau isi manual bila perlu mencocokkan sertifikat
                fisik.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="jenis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Sertifikat *</FormLabel>
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
                <FormControl>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {JENIS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="nama_lengkap"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="tanggal_terbit"
            render={({ field }) => (
              <FormItem>
                <FormControl>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="tanggal_kedaluwarsa"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DatePickerField
                    label="Tanggal Kedaluwarsa"
                    value={tanpaMasaBerlaku ? null : (field.value ?? null)}
                    onChange={field.onChange}
                    disabled={tanpaMasaBerlaku}
                  />
                </FormControl>
                <FormDescription>
                  {tanpaMasaBerlaku
                    ? 'Free track tidak pernah kedaluwarsa — kolom ini dinonaktifkan.'
                    : 'Terisi otomatis dari tanggal terbit + 2 tahun, bisa ditimpa bila sertifikat fisik berbeda.'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="qr_aktif"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="font-normal">QR aktif — bisa diverifikasi publik di /verify</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="catatan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
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
