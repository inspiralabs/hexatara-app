'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { LampiranFormSchema, type LampiranFormInput } from '@/lib/validations/materi-lampiran-admin';
import { simpanLampiranAction, uploadLampiranBabAction } from './lampiran-actions';
import { FileUploadField } from '@/components/file-upload-field';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const DEFAULT_VALUES: LampiranFormInput = {
  judul_id: '',
  judul_en: '',
  deskripsi_id: '',
  deskripsi_en: '',
  url_file: '',
};

const ACCEPT_LAMPIRAN = '.pdf,.ppt,.pptx,.xls,.xlsx,.doc,.docx';
const HINT_LAMPIRAN = 'PDF, PowerPoint, Excel, atau Word · maks. 20 MB';

export function LampiranFormDialog({
  open,
  onOpenChange,
  chapterId,
  lampiranId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterId: number;
  lampiranId: number | null;
  defaultValues: LampiranFormInput | null;
}) {
  const router = useRouter();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const form = useForm<LampiranFormInput>({
    resolver: zodResolver(LampiranFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = form;
  const urlFile = useWatch({ control, name: 'url_file' });

  async function onSubmit(data: LampiranFormInput) {
    let url = data.url_file?.trim() ?? '';
    if (pendingFile) {
      const fd = new FormData();
      fd.append('file', pendingFile);
      const hasilUpload = await uploadLampiranBabAction(fd);
      if (!hasilUpload.ok) {
        toast.error(hasilUpload.pesan);
        return;
      }
      url = hasilUpload.url;
    }
    if (!url) {
      toast.error('Pilih berkas lampiran terlebih dahulu.');
      return;
    }

    const hasil = await simpanLampiranAction(chapterId, lampiranId, { ...data, url_file: url });
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Lampiran berhasil disimpan.');
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{lampiranId == null ? 'Tambah Lampiran' : 'Ubah Lampiran'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      <Textarea rows={2} {...field} value={field.value ?? ''} />
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
                      <Textarea rows={2} {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FileUploadField
              label="Berkas (PDF/PPT/Excel/Word) *"
              accept={ACCEPT_LAMPIRAN}
              hint={HINT_LAMPIRAN}
              file={pendingFile}
              onFile={setPendingFile}
              existingUrl={urlFile || null}
              existingLabel="Lihat berkas saat ini"
              onClearExisting={() => setValue('url_file', '', { shouldValidate: true })}
              disabled={isSubmitting}
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
