'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';
import {
  MerchandisePublikSchema,
  type MerchandisePublikInput,
} from '@/lib/validations/merchandise-publik';
import { kirimPesananMerchandisePublikAction } from './actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { publicCtaPrimary, publicCtaSecondary } from '@/lib/public-ui';
import { cn } from '@/lib/utils';

export function BeliMerchandiseDialog({
  productId,
  namaProduk,
}: {
  productId: number;
  namaProduk: string;
}) {
  const [open, setOpen] = useState(false);
  const [waLink, setWaLink] = useState<string | null>(null);
  const [terkirim, setTerkirim] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MerchandisePublikInput>({
    resolver: zodResolver(MerchandisePublikSchema),
    defaultValues: { nama_lengkap: '', qty: 1, catatan: '' },
  });

  async function onSubmit(data: MerchandisePublikInput) {
    const hasil = await kirimPesananMerchandisePublikAction(productId, data);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    setWaLink(hasil.waLink);
    setTerkirim(true);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      reset();
      setTerkirim(false);
      setWaLink(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={cn(publicCtaPrimary, 'flex-1')}>Beli</DialogTrigger>
      <DialogContent>
        {terkirim ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Pesanan tercatat</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Lanjut ke WhatsApp supaya Admin bisa membalas pesanan {namaProduk}.
            </p>
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className={cn(publicCtaPrimary, 'w-full text-center')}>
                Lanjut ke WhatsApp
              </a>
            )}
            <button type="button" onClick={() => handleOpenChange(false)} className={cn(publicCtaSecondary, 'w-full')}>
              Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto" noValidate>
            <DialogHeader>
              <DialogTitle>Beli {namaProduk}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link href="/dashboard/transaksi" className="underline underline-offset-4">
                Beli lewat Dashboard
              </Link>{' '}
              biar bisa dibundling dengan sertifikat.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nama_lengkap">Nama lengkap</Label>
              <Input id="nama_lengkap" {...register('nama_lengkap')} />
              {errors.nama_lengkap && <p className="text-sm text-destructive">{errors.nama_lengkap.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qty">Jumlah</Label>
              <Input id="qty" type="number" min={1} {...register('qty', { valueAsNumber: true })} />
              {errors.qty && <p className="text-sm text-destructive">{errors.qty.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nama_penerima">Nama penerima</Label>
              <Input id="nama_penerima" {...register('alamat.nama_penerima')} />
              {errors.alamat?.nama_penerima && <p className="text-sm text-destructive">{errors.alamat.nama_penerima.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telepon">Nomor telepon (WhatsApp)</Label>
              <Input id="telepon" {...register('alamat.telepon')} />
              {errors.alamat?.telepon && <p className="text-sm text-destructive">{errors.alamat.telepon.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="alamat_lengkap">Alamat lengkap</Label>
              <Input id="alamat_lengkap" {...register('alamat.alamat_lengkap')} />
              {errors.alamat?.alamat_lengkap && <p className="text-sm text-destructive">{errors.alamat.alamat_lengkap.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kota">Kota</Label>
              <Input id="kota" {...register('alamat.kota')} />
              {errors.alamat?.kota && <p className="text-sm text-destructive">{errors.alamat.kota.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kode_pos">Kode pos</Label>
              <Input id="kode_pos" {...register('alamat.kode_pos')} />
              {errors.alamat?.kode_pos && <p className="text-sm text-destructive">{errors.alamat.kode_pos.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="catatan">Catatan (opsional)</Label>
              <Textarea id="catatan" {...register('catatan')} />
            </div>
            <button type="submit" disabled={isSubmitting} className={cn(publicCtaPrimary, 'w-full')}>
              {isSubmitting ? 'Menyimpan…' : 'Simpan pesanan'}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
