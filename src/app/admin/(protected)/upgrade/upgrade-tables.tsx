'use client';

import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { UpgradeRowActions } from './upgrade-row-actions';
import { StatusPengirimanSelect } from './status-pengiriman-select';
import type { Database } from '@/types/database';

const PAKET_LABEL: Record<string, string> = {
  cert_only: 'Sertifikat saja',
  cert_merch: 'Sertifikat + Merchandise',
  merch_addon: 'Tambah Merchandise',
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString('id-ID')}`;
}

function alamatRingkas(alamat: unknown) {
  const a = alamat as { nama_penerima?: string; kota?: string } | null;
  if (!a) return '—';
  return `${a.nama_penerima ?? '—'}, ${a.kota ?? '—'}`;
}

export type AntreanRow = {
  id: number;
  nama: string;
  paket: Database['public']['Enums']['paket_upgrade'];
  nominal: number;
  alamat_pengiriman: unknown;
  buktiUrl: string | null;
};

const antreanColumnHelper = createDataTableColumnHelper<AntreanRow>();

const antreanColumns = [
  antreanColumnHelper.accessor('nama', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
    cell: (info) => <span className="font-medium text-warna-teks">{info.getValue()}</span>,
  }),
  antreanColumnHelper.accessor((row) => PAKET_LABEL[row.paket] ?? row.paket, { id: 'paket', header: 'Paket' }),
  antreanColumnHelper.accessor('nominal', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Nominal" />,
    cell: (info) => formatRupiah(info.getValue()),
  }),
  antreanColumnHelper.accessor((row) => alamatRingkas(row.alamat_pengiriman), { id: 'alamat', header: 'Alamat' }),
  antreanColumnHelper.display({
    id: 'bukti',
    header: 'Bukti',
    cell: ({ row }) =>
      row.original.buktiUrl ? (
        <a href={row.original.buktiUrl} target="_blank" rel="noopener noreferrer" className="text-warna-utama underline underline-offset-4">
          Lihat bukti
        </a>
      ) : (
        '—'
      ),
  }),
  antreanColumnHelper.display({
    id: 'aksi',
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <UpgradeRowActions orderId={row.original.id} />
      </div>
    ),
  }),
];

export function AntreanTable({ antrean }: { antrean: AntreanRow[] }) {
  return (
    <DataTable
      columns={antreanColumns}
      data={antrean}
      searchColumnId="nama"
      searchPlaceholder="Cari nama..."
      emptyMessage="Tidak ada pesanan menunggu verifikasi."
    />
  );
}

export type PengirimanRow = {
  id: number;
  nama: string;
  paket: Database['public']['Enums']['paket_upgrade'];
  alamat_pengiriman: unknown;
  status_pengiriman: Database['public']['Enums']['status_kirim'];
};

const pengirimanColumnHelper = createDataTableColumnHelper<PengirimanRow>();

const pengirimanColumns = [
  pengirimanColumnHelper.accessor('nama', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
    cell: (info) => <span className="font-medium text-warna-teks">{info.getValue()}</span>,
  }),
  pengirimanColumnHelper.accessor((row) => PAKET_LABEL[row.paket] ?? row.paket, { id: 'paket', header: 'Paket' }),
  pengirimanColumnHelper.accessor((row) => alamatRingkas(row.alamat_pengiriman), { id: 'alamat', header: 'Alamat' }),
  pengirimanColumnHelper.display({
    id: 'status_pengiriman',
    header: 'Status Pengiriman',
    cell: ({ row }) => (
      <StatusPengirimanSelect orderId={row.original.id} statusSaatIni={row.original.status_pengiriman} />
    ),
  }),
];

export function PengirimanTable({ pengiriman }: { pengiriman: PengirimanRow[] }) {
  return (
    <DataTable
      columns={pengirimanColumns}
      data={pengiriman}
      searchColumnId="nama"
      searchPlaceholder="Cari nama..."
      emptyMessage="Tidak ada merchandise yang perlu dikirim."
    />
  );
}
