'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { LampiranFormSchema, type LampiranFormInput } from '@/lib/validations/materi-lampiran-admin';
import { simpanLampiranAction, uploadLampiranBabAction } from './lampiran-actions';
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
  const [uploading, setUploading] = useState(false);
  const form = useForm<LampiranFormInput>({
    resolver: zodResolver(LampiranFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lampiranId]);

  async function handleFile(file: File | undefined, onChange: (url: string) => void) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const hasil = await uploadLampiranBabAction(fd);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      onChange(hasil.url);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: LampiranFormInput) {
    const hasil = await simpanLampiranAction(chapterId, lampiranId, data);
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

            <FormField
              control={control}
              name="url_file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Berkas (PDF/PPT/Excel/Word) *</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href={field.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary underline"
                        >
                          Lihat berkas saat ini
                        </a>
                        <Button type="button" variant="ghost" size="sm" onClick={() => field.onChange('')}>
                          Ganti
                        </Button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx,.xls,.xlsx,.doc,.docx"
                        disabled={uploading}
                        onChange={(e) => handleFile(e.target.files?.[0], field.onChange)}
                        className="text-sm text-muted-foreground"
                      />
                    )}
                  </FormControl>
                  {uploading && <p className="text-sm text-muted-foreground">Mengunggah…</p>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting || uploading} className="h-11 px-6">
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
