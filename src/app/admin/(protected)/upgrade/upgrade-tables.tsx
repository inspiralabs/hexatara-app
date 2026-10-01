'use client';

import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { UpgradeRowActions } from './upgrade-row-actions';
import { LihatBukti } from './lihat-bukti';
import type { Database } from '@/types/database';

const PAKET_LABEL: Record<string, string> = {
  cert_only: 'Sertifikat saja',
  cert_merch: 'Sertifikat + Merchandise',
  merch_addon: 'Tambah Merchandise',
};

const PAKET_FILTER_SERTIFIKAT = [
  { value: 'cert_only', label: 'Sertifikat saja' },
  { value: 'cert_merch', label: 'Sertifikat + Merchandise' },
];

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
  merchandise?: string;
};

const antreanColumnHelper = createDataTableColumnHelper<AntreanRow>();

const antreanColumns = [
  antreanColumnHelper.accessor('nama', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
    cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  antreanColumnHelper.accessor('paket', {
    id: 'paket',
    header: 'Paket',
    filterFn: 'equalsString',
    cell: (info) => (
      <span>
        {PAKET_LABEL[info.getValue()] ?? info.getValue()}
        {info.row.original.merchandise ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">{info.row.original.merchandise}</span>
        ) : null}
      </span>
    ),
  }),
  antreanColumnHelper.accessor('nominal', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Nominal" />,
    cell: (info) => formatRupiah(info.getValue()),
  }),
  antreanColumnHelper.accessor((row) => alamatRingkas(row.alamat_pengiriman), { id: 'alamat', header: 'Alamat' }),
  antreanColumnHelper.display({
    id: 'bukti',
    header: 'Bukti',
    cell: ({ row }) =>
      row.original.buktiUrl ? <LihatBukti url={row.original.buktiUrl} /> : '—',
  }),
  antreanColumnHelper.display({
    id: 'aksi',
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <UpgradeRowActions orderId={row.original.id} merchandise={row.original.paket === 'merch_addon'} />
      </div>
    ),
  }),
];

export function AntreanTable({ antrean, merchandise = false }: { antrean: AntreanRow[]; merchandise?: boolean }) {
  return (
    <DataTable
      columns={antreanColumns}
      data={antrean}
      getRowId={(row) => String(row.id)}
      searchColumnId="nama"
      searchPlaceholder="Cari nama..."
      emptyMessage={merchandise ? 'Tidak ada pesanan merchandise menunggu verifikasi.' : 'Tidak ada pesanan menunggu verifikasi.'}
      columnFilters={merchandise ? undefined : [{ id: 'paket', label: 'Paket', options: PAKET_FILTER_SERTIFIKAT }]}
    />
  );
}

export type DitolakRow = {
  id: number;
  nama: string;
  paket: Database['public']['Enums']['paket_upgrade'];
  alasan_tolak: string | null;
  created_at: string;
  whatsapp: string | null;
};

const ditolakColumnHelper = createDataTableColumnHelper<DitolakRow>();

const ditolakColumns = [
  ditolakColumnHelper.accessor('nama', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
    cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  ditolakColumnHelper.accessor('paket', {
    id: 'paket',
    header: 'Paket',
    filterFn: 'equalsString',
    cell: (info) => PAKET_LABEL[info.getValue()] ?? info.getValue(),
  }),
  ditolakColumnHelper.accessor('alasan_tolak', {
    header: 'Alasan Ditolak',
    cell: (info) => info.getValue() || '—',
  }),
  ditolakColumnHelper.accessor('created_at', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Tanggal" />,
    cell: (info) =>
      new Date(info.getValue()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
  }),
  ditolakColumnHelper.display({
    id: 'wa',
    header: 'WhatsApp',
    cell: ({ row }) => {
      const angka = row.original.whatsapp?.replace(/\D/g, '') ?? '';
      if (!angka) return '—';
      return (
        <a href={`https://wa.me/${angka}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
          Hubungi WA
        </a>
      );
    },
  }),
];

export function SertifikatDitolakTable({
  rows,
  emptyMessage = 'Tidak ada sertifikat yang ditolak.',
  tanpaFilter = false,
}: {
  rows: DitolakRow[];
  emptyMessage?: string;
  tanpaFilter?: boolean;
}) {
  return (
    <DataTable
      columns={ditolakColumns}
      data={rows}
      getRowId={(row) => String(row.id)}
      searchColumnId="nama"
      searchPlaceholder="Cari nama..."
      emptyMessage={emptyMessage}
      columnFilters={tanpaFilter ? undefined : [{ id: 'paket', label: 'Paket', options: PAKET_FILTER_SERTIFIKAT }]}
    />
  );
}
