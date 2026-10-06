'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { PartnerFormSchema, type PartnerFormInput } from '@/lib/validations/partner-admin';
import { simpanPartnerAction, uploadLogoPartnerAction } from './partner-actions';
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

const DEFAULT_VALUES: PartnerFormInput = {
  nama: '',
  logo_url: '',
  urutan: 0,
  is_active: true,
};

export function PartnerFormDialog({
  open,
  onOpenChange,
  partnerId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: number | null;
  defaultValues: PartnerFormInput | null;
}) {
  const router = useRouter();
  const form = useForm<PartnerFormInput>({
    resolver: zodResolver(PartnerFormSchema),
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
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, partnerId]);

  async function onSubmit(data: PartnerFormInput) {
    const hasil = await simpanPartnerAction(partnerId, data);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Partner berhasil disimpan.');
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{partnerId == null ? 'Tambah Partner' : 'Ubah Partner'}</DialogTitle>
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

            <FormField
              control={control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploadField
                      label="Logo *"
                      skipCrop
                      previewFit="contain"
                      compression="logo"
                      suggestedNote="Disarankan logo transparan (PNG/WebP), lebar minimal 400px."
                      value={field.value || null}
                      onChange={(url) => field.onChange(url ?? '')}
                      onUpload={async (file) => {
                        const fd = new FormData();
                        fd.append('file', file);
                        return uploadLogoPartnerAction(fd);
                      }}
                    />
                  </FormControl>
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
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? '' : e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>Angka lebih kecil tampil lebih awal.</FormDescription>
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
                  <FormLabel className="font-normal">Aktifkan partner ini</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
