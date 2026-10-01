'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusPengirimanStepper } from './status-pengiriman-stepper';
import type { Database } from '@/types/database';

type StatusKirim = Database['public']['Enums']['status_kirim'];

const LABEL_STATUS: Record<string, string> = {
  menunggu_bukti: 'Menunggu bukti',
  menunggu_verifikasi: 'Menunggu verifikasi',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
};

export type ItemDetailMerch = { nama: string; qty: number; harga: number };

export type KartuMerch = {
  id: number;
  tanggal: string;
  status: string;
  statusPengiriman: StatusKirim;
  alasan: string | null;
  items: ItemDetailMerch[];
  alamat: string;
};

function rupiah(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export function DetailPesananMerch({ row }: { row: KartuMerch }) {
  const kirim = row.status === 'disetujui' && row.statusPengiriman !== 'tidak_ada';
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>Detail</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail pesanan</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {row.tanggal} · {LABEL_STATUS[row.status] ?? row.status}
        </p>
        {row.alasan ? <p className="text-sm text-destructive">{row.alasan}</p> : null}
        <ul className="flex flex-col gap-1 text-sm text-foreground">
          {row.items.length === 0 ? (
            <li>—</li>
          ) : (
            row.items.map((item, index) => (
              <li key={`${item.nama}-${index}`}>
                {item.nama}, {item.qty} pcs, {rupiah(item.harga)} per pcs
              </li>
            ))
          )}
        </ul>
        <p className="text-sm text-muted-foreground">{row.alamat || '—'}</p>
        {kirim ? <StatusPengirimanStepper status={row.statusPengiriman} /> : null}
      </DialogContent>
    </Dialog>
  );
}

export function KartuPesananBerjalan({ row }: { row: KartuMerch }) {
  const kirim = row.status === 'disetujui' && row.statusPengiriman !== 'tidak_ada';
  return (
    <article className="mt-4 flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          {row.tanggal} · {LABEL_STATUS[row.status] ?? row.status}
        </p>
        <DetailPesananMerch row={row} />
      </div>
      <p className="text-sm text-muted-foreground">{row.items.map((item) => `${item.nama} × ${item.qty}`).join(', ') || '—'}</p>
      {kirim ? <StatusPengirimanStepper status={row.statusPengiriman} /> : null}
    </article>
  );
}
