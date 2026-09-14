'use client';

import { STATUS_BATCH_LABEL, formatTanggalBatch } from '@/lib/batch';
import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { BatchRowActions } from './batch-row-actions';
import { BatchActiveSwitch } from './batch-active-switch';
import type { Database } from '@/types/database';

type Batch = Pick<
  Database['public']['Tables']['batches']['Row'],
  'id' | 'judul_id' | 'kategori_id' | 'status' | 'is_active' | 'tanggal_mulai' | 'tanggal_selesai'
>;

const columnHelper = createDataTableColumnHelper<Batch>();

const columns = [
  columnHelper.accessor('judul_id', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Judul" />,
    cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor('kategori_id', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Kategori" />,
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.display({
    id: 'tanggal',
    header: 'Tanggal',
    cell: ({ row }) => formatTanggalBatch(row.original.tanggal_mulai, row.original.tanggal_selesai) ?? '—',
  }),
  columnHelper.accessor('status', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Status" />,
    filterFn: 'equalsString',
    cell: (info) => {
      const status = STATUS_BATCH_LABEL[info.getValue()];
      return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
      );
    },
  }),
  columnHelper.accessor((row) => String(row.is_active), {
    id: 'is_active',
    header: 'Aktif',
    filterFn: 'equalsString',
    enableSorting: false,
    cell: ({ row }) => <BatchActiveSwitch batchId={row.original.id} aktif={row.original.is_active} />,
  }),
  columnHelper.display({
    id: 'aksi',
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <BatchRowActions batchId={row.original.id} judul={row.original.judul_id} />
      </div>
    ),
  }),
];

export function BatchTable({ batches }: { batches: Batch[] }) {
  return (
    <DataTable
      columns={columns}
      data={batches}
      getRowId={(row) => String(row.id)}
      searchColumnId="judul_id"
      searchPlaceholder="Cari judul batch..."
      emptyMessage="Belum ada batch."
      columnFilters={[
        {
          id: 'status',
          label: 'Status',
          options: [
            { value: 'upcoming', label: 'Akan Datang' },
            { value: 'open', label: 'Pendaftaran Dibuka' },
            { value: 'closed', label: 'Ditutup' },
          ],
        },
        {
          id: 'is_active',
          label: 'Aktif',
          options: [
            { value: 'true', label: 'Aktif' },
            { value: 'false', label: 'Nonaktif' },
          ],
        },
      ]}
    />
  );
}
