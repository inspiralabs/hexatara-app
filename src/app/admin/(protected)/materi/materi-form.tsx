'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { MateriFormSchema, type MateriFormInput } from '@/lib/validations/materi-admin';
import { simpanMateriAction } from './actions';
import { uploadGambarAdminAction } from '../actions';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ImageUploadField } from '@/components/image-upload-field';

export function MateriForm({
  mode,
  materiId,
  defaultValues,
}: {
  mode: 'create' | 'edit';
  materiId?: number;
  defaultValues: MateriFormInput;
}) {
  const router = useRouter();
  const form = useForm<MateriFormInput>({
    resolver: zodResolver(MateriFormSchema),
    defaultValues,
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(data: MateriFormInput) {
    const hasil = await simpanMateriAction(mode === 'edit' ? (materiId ?? null) : null, data);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Materi berhasil disimpan.');
    router.push('/admin/materi');
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <FormField
          control={control}
          name="judul_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul (Indonesia) *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="judul_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul (Inggris)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="deskripsi_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Indonesia)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="deskripsi_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Inggris)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="poster_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUploadField
                  label="Poster (tampil di kartu halaman Materi publik)"
                  aspectRatio={16 / 9}
                  suggestedPx="1200×675px"
                  value={field.value ?? null}
                  onChange={field.onChange}
                  onUpload={async (file) => {
                    const fd = new FormData();
                    fd.append('file', file);
                    return uploadGambarAdminAction(fd);
                  }}
                />
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
              <FormLabel className="font-normal">Aktif — tampil di halaman Materi publik</FormLabel>
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
