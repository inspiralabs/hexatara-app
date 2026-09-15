'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { InstructorFormSchema, type InstructorFormInput } from '@/lib/validations/instructor-admin';
import { simpanInstructorAction } from './instructor-actions';
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

const DEFAULT_VALUES: InstructorFormInput = {
  nama: '',
  jabatan_id: '',
  jabatan_en: '',
  bio_id: '',
  bio_en: '',
  foto_url: '',
  urutan: 0,
  is_active: true,
};

export function InstructorFormDialog({
  open,
  onOpenChange,
  instructorId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructorId: number | null;
  defaultValues: InstructorFormInput | null;
}) {
  const router = useRouter();
  const form = useForm<InstructorFormInput>({
    resolver: zodResolver(InstructorFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  // Form dipakai ulang untuk tambah maupun ubah — isi ulang setiap kali dialog
  // dibuka dengan instruktur yang berbeda (atau dikosongkan untuk tambah baru).
  useEffect(() => {
    if (open) {
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, instructorId]);

  async function onSubmit(data: InstructorFormInput) {
    const hasil = await simpanInstructorAction(instructorId, data);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Instruktur berhasil disimpan.');
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{instructorId == null ? 'Tambah Instruktur' : 'Ubah Instruktur'}</DialogTitle>
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
                name="jabatan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jabatan (Indonesia)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="jabatan_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jabatan (Inggris)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="bio_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (Indonesia)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="bio_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (Inggris)</FormLabel>
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
                  <FormLabel className="font-normal">Aktifkan instruktur ini</FormLabel>
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
                      label="Foto"
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
