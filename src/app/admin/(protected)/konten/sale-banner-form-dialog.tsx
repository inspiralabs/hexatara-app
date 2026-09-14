'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { SaleBannerFormSchema, type SaleBannerFormInput } from '@/lib/validations/sale-banner-admin';
import { simpanSaleBannerAction } from './sale-banner-actions';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePickerField } from '@/components/admin/date-picker-field';

const DEFAULT_VALUES: SaleBannerFormInput = {
  judul_id: '',
  judul_en: '',
  teks_id: '',
  teks_en: '',
  urgensi_id: '',
  urgensi_en: '',
  tombol_teks_id: '',
  tombol_teks_en: '',
  tombol_url: '',
  tayang_mulai: null,
  tayang_selesai: null,
  is_active: false,
};

export function SaleBannerFormDialog({
  open,
  onOpenChange,
  bannerId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bannerId: number | null;
  defaultValues: SaleBannerFormInput | null;
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const form = useForm<SaleBannerFormInput>({
    resolver: zodResolver(SaleBannerFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  // Form dipakai ulang untuk tambah maupun ubah — isi ulang setiap kali dialog
  // dibuka dengan banner yang berbeda (atau dikosongkan untuk tambah baru).
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPesanError(null);
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bannerId]);

  async function onSubmit(data: SaleBannerFormInput) {
    setPesanError(null);
    const hasil = await simpanSaleBannerAction(bannerId, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Sale banner berhasil disimpan.');
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{bannerId == null ? 'Tambah Sale Banner' : 'Ubah Sale Banner'}</DialogTitle>
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
                name="teks_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teks Penawaran (Indonesia)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="teks_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teks Penawaran (Inggris)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="urgensi_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pesan Urgensi (Indonesia)</FormLabel>
                    <FormControl>
                      <Input placeholder="mis. Kuota terbatas bulan ini" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="urgensi_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pesan Urgensi (Inggris)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="tombol_teks_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teks Tombol (Indonesia)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="tombol_teks_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teks Tombol (Inggris)</FormLabel>
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
              name="tombol_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tautan Tombol</FormLabel>
                  <FormControl>
                    <Input placeholder="/katalog atau https://..." {...field} value={field.value ?? ''} />
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
                  <FormLabel className="font-normal">Aktifkan sale banner ini</FormLabel>
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
