'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { TestimonialFormSchema, type TestimonialFormInput } from '@/lib/validations/testimonial-admin';
import { simpanTestimonialAction } from './testimonial-actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ImageUploadField } from '@/components/image-upload-field';
import { uploadGambarAdminAction } from '../actions';

const DEFAULT_VALUES: TestimonialFormInput = {
  nama: '',
  peran_id: '',
  peran_en: '',
  isi_id: '',
  isi_en: '',
  foto_url: '',
  urutan: 0,
  is_active: true,
};

export function TestimonialFormDialog({
  open,
  onOpenChange,
  testimonialId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonialId: number | null;
  defaultValues: TestimonialFormInput | null;
}) {
  const router = useRouter();
  const form = useForm<TestimonialFormInput>({
    resolver: zodResolver(TestimonialFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  // Form dipakai ulang untuk tambah maupun ubah — isi ulang setiap kali dialog
  // dibuka dengan testimoni yang berbeda (atau dikosongkan untuk tambah baru).
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, testimonialId]);

  async function onSubmit(data: TestimonialFormInput) {
    const hasil = await simpanTestimonialAction(testimonialId, data);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Testimoni berhasil disimpan.');
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{testimonialId == null ? 'Tambah Testimoni' : 'Ubah Testimoni'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>

            <FormField
              control={control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={control}
                name="peran_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peran (Indonesia)</FormLabel>
                    <FormControl>
                      <Input placeholder="mis. Peserta RPC Batch 3" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="peran_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peran (Inggris)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="isi_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Isi Testimoni (Indonesia) *</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="isi_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Isi Testimoni (Inggris)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="urutan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urutan</FormLabel>
                  <FormControl>
                    <Input type="number" step={1} {...field} value={field.value ?? ''} className="max-w-[8rem]" />
                  </FormControl>
                  <FormDescription>Angka lebih kecil tampil lebih dulu.</FormDescription>
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
                  <FormLabel className="font-normal">Aktifkan testimoni ini</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="foto_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploadField
                      label="Foto (opsional)"
                      aspectRatio={1}
                      suggestedPx="800×800px"
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

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} className="h-11 px-6">
                {isSubmitting ? 'Menyimpan…' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" className="h-11 px-6" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
