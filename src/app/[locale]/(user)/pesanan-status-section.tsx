import { PesananUpgradeForm } from './pesanan-upgrade-form';
import { BuktiTransferUpload } from './bukti-transfer-upload';
import type { Database } from '@/types/database';

type Paket = Database['public']['Enums']['paket_upgrade'];
type Order = {
  id: number;
  status: Database['public']['Enums']['status_order'];
  alasan_tolak: string | null;
};
type Rekening = { bank?: string; nomor?: string; atas_nama?: string } | undefined;

// Dipakai bersama oleh /dashboard/upgrade (F03.5+F03.6) dan /dashboard/merchandise
// (F03.10) — keduanya cuma beda paket mana yang ditawarkan, alur statusnya sama persis.
export function PesananStatusSection({
  order,
  rekening,
  paketOptions,
}: {
  order: Order | null;
  rekening: Rekening;
  paketOptions: Paket[];
}) {
  if (!order) {
    return <PesananUpgradeForm paketOptions={paketOptions} />;
  }

  if (order.status === 'menunggu_verifikasi') {
    return <p className="text-warna-teks-2">Bukti transfer sedang diperiksa Admin.</p>;
  }

  if (order.status === 'disetujui') {
    return <p className="text-warna-teks-2">Pesanan sudah disetujui.</p>;
  }

  // menunggu_bukti atau ditolak — keduanya butuh instruksi transfer + form unggah.
  return (
    <div className="flex flex-col gap-4">
      {order.status === 'ditolak' && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">Bukti transfer ditolak</p>
          <p className="mt-1 text-sm text-warna-teks-2">{order.alasan_tolak}</p>
        </div>
      )}
      {rekening && (
        <div className="rounded-lg border border-warna-latar-2 bg-warna-latar-2 p-4">
          <p className="text-sm font-medium text-warna-teks">Instruksi Transfer</p>
          <p className="mt-1 text-sm text-warna-teks-2">
            {rekening.bank} — {rekening.nomor} a.n. {rekening.atas_nama}
          </p>
        </div>
      )}
      <BuktiTransferUpload orderId={order.id} />
    </div>
  );
}
