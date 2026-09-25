import { CheckCircle2Icon, ClockIcon } from 'lucide-react';
import { PesananUpgradeForm } from './pesanan-upgrade-form';
import type { HargaUpgrade } from '@/lib/site-settings';
import { BuktiTransferUpload } from './bukti-transfer-upload';
import type { Database } from '@/types/database';

type Paket = Database['public']['Enums']['paket_upgrade'];
type StatusKirim = Database['public']['Enums']['status_kirim'];
type Order = {
  id: number;
  status: Database['public']['Enums']['status_order'];
  alasan_tolak: string | null;
  status_pengiriman: StatusKirim;
};
type Rekening = { bank?: string; nomor?: string; atas_nama?: string } | undefined;

const LABEL_STATUS_KIRIM: Record<StatusKirim, string> = {
  tidak_ada: 'Tidak Ada',
  belum_diproses: 'Belum Diproses',
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  diterima: 'Diterima',
};

// Dipakai bersama oleh /dashboard/transaksi (utama), /dashboard/upgrade (redirect),
// dan /dashboard/merchandise — alur status sama persis per kelompok paket.
export function PesananStatusSection({
  order,
  rekening,
  paketOptions,
  harga,
  paket,
}: {
  order: Order | null;
  rekening: Rekening;
  paketOptions: Paket[];
  harga: HargaUpgrade;
  paket?: Paket;
}) {
  if (!order) {
    return <PesananUpgradeForm paketOptions={paketOptions} harga={harga} />;
  }

  if (order.status === 'menunggu_verifikasi') {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4">
        <div className="flex items-center gap-2 text-foreground">
          <ClockIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <p className="font-medium">Bukti transfer sedang diperiksa Admin</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Kami akan menghubungi kamu setelah verifikasi selesai. Tidak perlu mengunggah ulang kecuali
          diminta.
        </p>
      </div>
    );
  }

  if (order.status === 'disetujui') {
    const kirim =
      order.status_pengiriman !== 'tidak_ada' ? LABEL_STATUS_KIRIM[order.status_pengiriman] : null;
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-emerald-600/30 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2 text-foreground">
          <CheckCircle2Icon className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
          <p className="font-medium">
            {paket === 'merch_addon'
              ? 'Pesanan merchandise sudah disetujui'
              : paket === 'cert_merch'
                ? 'Sertifikat + merchandise sudah disetujui'
                : 'Sertifikat saja sudah disetujui'}
          </p>
        </div>
        {paket === 'merch_addon' ? (
          <p className="text-sm text-muted-foreground">
            Sertifikat Anda tidak berubah. Merchandise sedang diurus pengirimannya
            {kirim ? ` (${kirim})` : ''}.
          </p>
        ) : paket === 'cert_merch' ? (
          <p className="text-sm text-muted-foreground">
            QR sertifikat sudah aktif. Merchandise sedang diurus pengirimannya
            {kirim ? ` (${kirim})` : ''}.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            QR sertifikat sudah aktif di menu Sertifikat Saya. Paket ini tidak termasuk merchandise.
          </p>
        )}
      </div>
    );
  }

  // menunggu_bukti atau ditolak — keduanya butuh instruksi transfer + form unggah.
  return (
    <div className="flex flex-col gap-4">
      {order.status === 'ditolak' && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">Bukti transfer ditolak</p>
          <p className="mt-1 text-sm text-muted-foreground">{order.alasan_tolak}</p>
        </div>
      )}
      {order.status === 'menunggu_bukti' && (
        <p className="text-sm text-muted-foreground">
          Pesanan sudah dibuat. Transfer sesuai instruksi di bawah, lalu unggah bukti pembayarannya.
        </p>
      )}
      {rekening && (
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">Instruksi Transfer</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {rekening.bank} — {rekening.nomor} a.n. {rekening.atas_nama}
          </p>
        </div>
      )}
      <BuktiTransferUpload orderId={order.id} />
    </div>
  );
}
