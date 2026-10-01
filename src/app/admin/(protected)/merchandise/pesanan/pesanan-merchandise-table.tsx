'use client';

import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { DownloadIcon } from 'lucide-react';
import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusPengirimanSelect } from '../../upgrade/status-pengiriman-select';
import { eksporPesananMerchandiseXlsx } from './pesanan-merchandise-export';
import type { Database } from '@/types/database';

const PAKET: Record<string, string> = {
  cert_merch: 'Sertifikat + Merchandise',
  merch_addon: 'Tambah Merchandise',
};

export type ItemPesanan = { nama: string; qty: number; harga: number };

export type PesananMerchandiseRow = {
  id: number;
  nama: string;
  namaPenerima: string;
  telepon: string;
  items: ItemPesanan[];
  paket: string;
  produk: string;
  alamat: string;
  alamatLengkap: string;
  kota: string;
  kodePos: string;
  status_pengiriman: Database['public']['Enums']['status_kirim'];
  created_at: string;
};

function rupiah(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function pesanKonfirmasi(row: Pick<PesananMerchandiseRow, 'items' | 'namaPenerima' | 'telepon' | 'alamatLengkap' | 'kota' | 'kodePos'>) {
  const barang = row.items
    .map((item) => `${item.nama}, ${item.qty} pcs, ${rupiah(item.harga)} per pcs`)
    .join('; ');
  return `Halo ${row.namaPenerima || 'pelanggan'}, pesanan Anda kami konfirmasi: ${barang}. Pesanan dikirim ke ${row.alamatLengkap}, ${row.kota} ${row.kodePos}, atas nama ${row.namaPenerima}, nomor ${row.telepon}.`;
}

function Baris({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm whitespace-pre-wrap break-words text-foreground">{value || '—'}</dd>
    </div>
  );
}

function DetailPesanan({ row }: { row: PesananMerchandiseRow }) {
  const angka = row.telepon.replace(/\D/g, '');
  const tautan = angka ? `https://wa.me/${angka}?text=${encodeURIComponent(pesanKonfirmasi(row))}` : null;
  const produk = row.items.map((item) => `${item.nama}, ${item.qty} pcs, ${rupiah(item.harga)}`).join('\n');
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>Detail</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail pesanan</DialogTitle>
        </DialogHeader>
        <dl>
          <Baris label="Pemesan" value={row.nama} />
          <Baris label="Nomor telepon (WhatsApp)" value={row.telepon} />
          <Baris label="Paket" value={PAKET[row.paket] ?? row.paket} />
          <Baris label="Produk" value={produk} />
          <Baris label="Alamat" value={[row.alamatLengkap, row.kota, row.kodePos].filter(Boolean).join(', ')} />
          <Baris label="Penerima" value={row.namaPenerima} />
        </dl>
        {tautan ? (
          <a href={tautan} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">
            Konfirmasi pesanan
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">Nomor telepon (WhatsApp) pemilik pesanan belum ada.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

const helper = createDataTableColumnHelper<PesananMerchandiseRow>();

const columns = [
  helper.accessor('nama', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
    cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  helper.accessor('paket', {
    id: 'paket',
    header: 'Paket',
    filterFn: 'equalsString',
    cell: (info) => PAKET[info.getValue()] ?? info.getValue(),
  }),
  helper.accessor('produk', { header: 'Produk' }),
  helper.accessor('alamat', { header: 'Alamat' }),
  helper.accessor('status_pengiriman', {
    id: 'status_pengiriman',
    header: 'Status Pengiriman',
    filterFn: 'equalsString',
    enableSorting: false,
    cell: ({ row }) => (
      <StatusPengirimanSelect orderId={row.original.id} statusSaatIni={row.original.status_pengiriman} />
    ),
  }),
  helper.accessor('created_at', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Tanggal" />,
    cell: (info) => format(new Date(info.getValue()), 'd MMM yyyy', { locale: localeId }),
  }),
  helper.display({
    id: 'detail',
    header: () => <span className="sr-only">Detail</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DetailPesanan row={row.original} />
      </div>
    ),
  }),
];

export function PesananMerchandiseTable({ rows }: { rows: PesananMerchandiseRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(row) => String(row.id)}
      searchColumnId="nama"
      searchPlaceholder="Cari nama..."
      emptyMessage="Belum ada pesanan merchandise yang disetujui."
      toolbarEnd={
        <Button type="button" onClick={() => eksporPesananMerchandiseXlsx(rows)} disabled={rows.length === 0} className="h-11 w-full shrink-0 gap-1.5 px-5 sm:w-auto">
          <DownloadIcon className="size-4" /> Ekspor Excel
        </Button>
      }
      columnFilters={[
          {
            id: 'paket',
            label: 'Paket',
            options: [
              { value: 'cert_merch', label: 'Sertifikat + Merchandise' },
              { value: 'merch_addon', label: 'Tambah Merchandise' },
            ],
          },
        ]}
    />
  );
}
