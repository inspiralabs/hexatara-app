'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { PesananSchema, type PesananInput } from '@/lib/validations/upgrade';
import type { HargaUpgrade } from '@/lib/site-settings';
import { buatPesananAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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

export type ProdukMerchandiseForm = { id: number; nama: string; harga: number };

export function PesananUpgradeForm({
  paketOptions,
  harga,
  merchandise = [],
}: {
  paketOptions: Paket[];
  harga: HargaUpgrade;
  merchandise?: ProdukMerchandiseForm[];
}) {
  const router = useRouter();
  // Dijamin tidak kosong oleh pemanggil (dashboard/transaksi & dashboard/merchandise) —
  // dipisah dari paketOptions[0] langsung supaya lolos noUncheckedIndexedAccess.
  const paketTunggal = paketOptions[0] as Paket;
  const [paketDipilih, setPaketDipilih] = useState<Paket>(paketTunggal);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PesananInput>({
    resolver: zodResolver(PesananSchema),
    defaultValues: { paket: paketTunggal, produk: [] },
  });

  const perluAlamat = paketDipilih !== 'cert_only';
  const [qty, setQty] = useState<Record<number, number>>({});

  function ubahQty(id: number, next: number) {
    const pilihan = { ...qty, [id]: next };
    if (next <= 0) delete pilihan[id];
    setQty(pilihan);
    setValue(
      'produk',
      Object.entries(pilihan).map(([productId, jumlah]) => ({
        product_id: Number(productId),
        qty: jumlah,
      })),
      { shouldValidate: true },
    );
  }

  const subtotal = merchandise.reduce((sum, item) => sum + item.harga * (qty[item.id] ?? 0), 0);
  const totalBayar = paketDipilih === 'cert_merch' ? harga.cert_only + subtotal : subtotal;

  async function onSubmit(data: PesananInput) {
    const hasil = await buatPesananAction(data);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Pesanan berhasil dibuat. Silakan unggah bukti transfer.');
    // Pastikan RSC Transaksi memuat ulang order baru → UI ganti ke unggah bukti
    // tanpa butuh hard refresh (revalidatePath di action + refresh di sini).
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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
                  className="flex items-center gap-3 rounded-lg border border-border p-4 font-normal"
                >
                  <RadioGroupItem value={paket} />
                  <span className="flex-1">{LABEL_PAKET[paket]}</span>
                  <span className="font-semibold text-foreground">
                    {paket === 'cert_only' ? formatRupiah(harga.cert_only) : 'Sesuai produk'}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          )}
        />
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <span>{LABEL_PAKET[paketTunggal]}</span>
          <span className="font-semibold text-foreground">
            {paketTunggal === 'cert_only' ? formatRupiah(harga.cert_only) : 'Sesuai produk'}
          </span>
        </div>
      )}

      {perluAlamat && (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <p className="text-sm font-medium text-foreground">Produk merchandise</p>
          {merchandise.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada produk merchandise tersedia, hubungi Admin.
            </p>
          ) : (
            merchandise.map((item) => (
              <label key={item.id} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={(qty[item.id] ?? 0) > 0}
                  onChange={(e) => ubahQty(item.id, e.target.checked ? 1 : 0)}
                />
                <span className="flex-1">{item.nama}</span>
                <span>{formatRupiah(item.harga)}</span>
                {(qty[item.id] ?? 0) > 0 && (
                  <Input
                    type="number"
                    min={1}
                    className="w-20"
                    value={qty[item.id]}
                    onChange={(e) => ubahQty(item.id, Number(e.target.value) || 1)}
                    aria-label={`Jumlah ${item.nama}`}
                  />
                )}
              </label>
            ))
          )}
          {errors.produk && <p className="text-sm text-destructive">{errors.produk.message}</p>}
          <p className="text-sm text-foreground">
            {paketDipilih === 'cert_merch'
              ? `Total: ${formatRupiah(totalBayar)} (termasuk sertifikat ${formatRupiah(harga.cert_only)})`
              : `Total: ${formatRupiah(subtotal)}`}
          </p>
        </div>
      )}

      {perluAlamat && (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
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
