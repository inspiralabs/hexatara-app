'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { HeroSlideFormSchema, type HeroSlideFormInput } from '@/lib/validations/hero-slide-admin';
import { simpanHeroSlideAction } from './hero-slide-actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ImageUploadField } from '@/components/image-upload-field';
import { uploadGambarAdminAction } from '../actions';

const DEFAULT_VALUES: HeroSlideFormInput = {
  judul_id: '',
  judul_en: '',
  subjudul_id: '',
  subjudul_en: '',
  gambar_url: '',
  cta_url: '',
  urutan: 0,
  is_active: true,
};

export function HeroSlideFormDialog({
  open,
  onOpenChange,
  slideId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slideId: number | null;
  defaultValues: HeroSlideFormInput | null;
}) {
  const router = useRouter();
  const form = useForm<HeroSlideFormInput>({
    resolver: zodResolver(HeroSlideFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  // Form dipakai ulang untuk tambah maupun ubah — isi ulang setiap kali dialog
  // dibuka dengan slide yang berbeda (atau dikosongkan untuk tambah baru).
  useEffect(() => {
    if (open) {
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slideId]);

  async function onSubmit(data: HeroSlideFormInput) {
    const hasil = await simpanHeroSlideAction(slideId, data);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Hero slide berhasil disimpan.');
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{slideId == null ? 'Tambah Hero Slide' : 'Ubah Hero Slide'}</DialogTitle>
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
                name="subjudul_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjudul (Indonesia)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="subjudul_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjudul (Inggris)</FormLabel>
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
                  <FormLabel>Tautan (klik gambar)</FormLabel>
                  <FormControl>
                    <Input placeholder="/katalog atau https://..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>Seluruh gambar hero bisa diklik menuju tautan ini.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <FormLabel className="font-normal">Aktifkan slide ini</FormLabel>
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
                      label="Gambar"
                      aspectRatio={4 / 3}
                      lockSize
                      suggestedPx="1600×1200px"
                      value={field.value ?? null}
                      onChange={field.onChange}
                      onUpload={async (file) => {
                        const fd = new FormData();
                        fd.append('file', file);
                        return uploadGambarAdminAction(fd);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Gambar ini juga tampil di halaman Masuk, Daftar, dan Lupa Sandi.
                  </FormDescription>
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
