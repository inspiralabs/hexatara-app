'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { BabFormSchema, type BabFormInput } from '@/lib/validations/materi-bab-admin';
import { simpanBabAction } from './bab-actions';
import { uploadGambarAdminAction } from '../actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploadField } from '@/components/image-upload-field';

export function BabForm({
  mode,
  materialId,
  babId,
  defaultValues,
}: {
  mode: 'create' | 'edit';
  materialId: number;
  babId?: number;
  defaultValues: BabFormInput;
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const form = useForm<BabFormInput>({
    resolver: zodResolver(BabFormSchema),
    defaultValues,
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(data: BabFormInput) {
    setPesanError(null);
    const hasil = await simpanBabAction(materialId, mode === 'edit' ? (babId ?? null) : null, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Bab berhasil disimpan.');
    router.push(mode === 'create' ? `/admin/materi/${hasil.id}` : '/admin/materi');
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
          name="konten_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konten (Indonesia) *</FormLabel>
              <FormControl>
                <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="konten_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konten (Inggris)</FormLabel>
              <FormControl>
                <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="video_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Video (opsional)</FormLabel>
              <FormControl>
                <Input placeholder="https://www.youtube.com/embed/..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>URL embed, tampil sebagai video pengantar di atas konten materi.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="gambar_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUploadField
                  label="Gambar Pendukung (opsional)"
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

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6">
            {isSubmitting ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
