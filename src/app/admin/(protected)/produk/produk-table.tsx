'use client';

import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { ProdukRowActions } from './produk-row-actions';

function formatRupiah(nilai: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(nilai);
}

export type ProdukRow = {
  id: number;
  nama_id: string;
  kategori: string | null;
  harga: number | null;
  tampilkan_harga: boolean;
  is_active: boolean;
  urutan: number;
};

const columnHelper = createDataTableColumnHelper<ProdukRow>();

const columns = [
  columnHelper.accessor('urutan', { header: (ctx) => <SortableHeader column={ctx.column} label="Urutan" /> }),
  columnHelper.accessor('nama_id', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
    cell: (info) => <span className="font-medium text-warna-teks">{info.getValue()}</span>,
  }),
  columnHelper.accessor((row) => row.kategori ?? '—', { id: 'kategori', header: 'Kategori' }),
  columnHelper.display({
    id: 'harga',
    header: 'Harga',
    cell: ({ row }) =>
      row.original.tampilkan_harga ? (row.original.harga != null ? formatRupiah(row.original.harga) : '—') : 'Tersembunyi',
  }),
  columnHelper.display({
    id: 'aktif',
    header: 'Aktif',
    cell: ({ row }) => (row.original.is_active ? 'Ya' : 'Tidak'),
  }),
  columnHelper.display({
    id: 'aksi',
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <ProdukRowActions id={row.original.id} nama={row.original.nama_id} />
      </div>
    ),
  }),
];

export function ProdukTable({ produk }: { produk: ProdukRow[] }) {
  return (
    <DataTable columns={columns} data={produk} searchColumnId="nama_id" searchPlaceholder="Cari nama produk..." emptyMessage="Belum ada produk." />
  );
}
