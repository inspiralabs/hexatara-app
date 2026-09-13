'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/i18n/navigation';
import { PesananSchema, type PesananInput } from '@/lib/validations/upgrade';
import type { HargaUpgrade } from '@/lib/site-settings';
import { buatPesananAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Paket = PesananInput['paket'];

const LABEL_PAKET: Record<Paket, string> = {
  cert_only: 'Sertifikat saja',
  cert_merch: 'Sertifikat + Merchandise',
  merch_addon: 'Tambah Merchandise',
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString('id-ID')}`;
}

export function PesananUpgradeForm({
  paketOptions,
  harga,
}: {
  paketOptions: Paket[];
  harga: HargaUpgrade;
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  // Dijamin tidak kosong oleh pemanggil (dashboard/upgrade & dashboard/merchandise) —
  // dipisah dari paketOptions[0] langsung supaya lolos noUncheckedIndexedAccess.
  const paketTunggal = paketOptions[0] as Paket;
  const [paketDipilih, setPaketDipilih] = useState<Paket>(paketTunggal);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PesananInput>({
    resolver: zodResolver(PesananSchema),
    defaultValues: { paket: paketTunggal },
  });

  const perluAlamat = paketDipilih !== 'cert_only';

  async function onSubmit(data: PesananInput) {
    setPesanError(null);
    const hasil = await buatPesananAction(data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}

      {paketOptions.length > 1 ? (
        <Controller
          control={control}
          name="paket"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={(value: Paket) => {
                field.onChange(value);
                setPaketDipilih(value);
              }}
              className="gap-3"
            >
              {paketOptions.map((paket) => (
                <Label
                  key={paket}
                  className="flex items-center gap-3 rounded-lg border border-warna-latar-2 p-4 font-normal"
                >
                  <RadioGroupItem value={paket} />
                  <span className="flex-1">{LABEL_PAKET[paket]}</span>
                  <span className="font-semibold text-warna-teks">
                    {formatRupiah(harga[paket])}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          )}
        />
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-warna-latar-2 p-4">
          <span>{LABEL_PAKET[paketTunggal]}</span>
          <span className="font-semibold text-warna-teks">{formatRupiah(harga[paketTunggal])}</span>
        </div>
      )}

      {perluAlamat && (
        <div className="flex flex-col gap-3 rounded-lg border border-warna-latar-2 p-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nama_penerima">Nama penerima</Label>
            <Input id="nama_penerima" {...register('alamat.nama_penerima')} />
            {errors.alamat?.nama_penerima && (
              <p className="text-sm text-destructive">{errors.alamat.nama_penerima.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="telepon">Nomor telepon</Label>
            <Input id="telepon" {...register('alamat.telepon')} />
            {errors.alamat?.telepon && (
              <p className="text-sm text-destructive">{errors.alamat.telepon.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alamat_lengkap">Alamat lengkap</Label>
            <Input id="alamat_lengkap" {...register('alamat.alamat_lengkap')} />
            {errors.alamat?.alamat_lengkap && (
              <p className="text-sm text-destructive">{errors.alamat.alamat_lengkap.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kota">Kota</Label>
            <Input id="kota" {...register('alamat.kota')} />
            {errors.alamat?.kota && (
              <p className="text-sm text-destructive">{errors.alamat.kota.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kode_pos">Kode pos</Label>
            <Input id="kode_pos" {...register('alamat.kode_pos')} />
            {errors.alamat?.kode_pos && (
              <p className="text-sm text-destructive">{errors.alamat.kode_pos.message}</p>
            )}
          </div>
        </div>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Memproses…' : 'Buat Pesanan'}
      </Button>
    </form>
  );
}
