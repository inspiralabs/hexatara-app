'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { PopupFormSchema, type PopupFormInput } from '@/lib/validations/popup-admin';
import { simpanPopupAction } from './popup-actions';
import { uploadGambarAdminAction } from '../actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePickerField } from '@/components/admin/date-picker-field';
import { ImageUploadField } from '@/components/image-upload-field';

const DEFAULT_VALUES: PopupFormInput = {
  judul_id: '',
  judul_en: '',
  gambar_mobile_url: '',
  gambar_desktop_url: '',
  cta_url: '',
  tayang_mulai: null,
  tayang_selesai: null,
  is_active: false,
};

export function PopupFormDialog({
  open,
  onOpenChange,
  popupId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  popupId: number | null;
  defaultValues: PopupFormInput | null;
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const form = useForm<PopupFormInput>({
    resolver: zodResolver(PopupFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  // Form dipakai ulang untuk tambah maupun ubah — isi ulang setiap kali dialog
  // dibuka dengan popup yang berbeda (atau dikosongkan untuk tambah baru).
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPesanError(null);
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, popupId]);

  async function onSubmit(data: PopupFormInput) {
    setPesanError(null);
    const hasil = await simpanPopupAction(popupId, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Pop-up berhasil disimpan.');
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{popupId == null ? 'Tambah Pop-up' : 'Ubah Pop-up'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {pesanError && (
              <Alert variant="destructive">
                <AlertDescription>{pesanError}</AlertDescription>
              </Alert>
            )}

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
                    <FormDescription>Untuk aksesibilitas (alt text) — tidak ditampilkan di popup.</FormDescription>
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
            </div>

            <FormField
              control={control}
              name="cta_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tautan (opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="/katalog atau https://..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>
                    Kalau diisi, seluruh gambar popup jadi bisa diklik menuju tautan ini.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="gambar_mobile_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploadField
                      label="Gambar Mobile (potret)"
                      aspectRatio={9 / 16}
                      suggestedPx="1080×1920px"
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
              name="gambar_desktop_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploadField
                      label="Gambar Desktop (lanskap)"
                      aspectRatio={16 / 9}
                      suggestedPx="1920×1080px"
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={control}
                name="tayang_mulai"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DatePickerField
                        label="Tayang Mulai"
                        value={field.value ?? null}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="tayang_selesai"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DatePickerField
                        label="Tayang Selesai"
                        value={field.value ?? null}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground">Kosongkan salah satu atau keduanya untuk tayang tanpa batas.</p>

            <FormField
              control={control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Aktifkan pop-up ini</FormLabel>
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
