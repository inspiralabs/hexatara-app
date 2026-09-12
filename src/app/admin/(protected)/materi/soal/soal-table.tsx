'use client';

import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { SoalRowActions } from './soal-row-actions';

export type Soal = { id: number; pertanyaan_id: string; urutan: number; is_active: boolean };

const columnHelper = createDataTableColumnHelper<Soal>();

const columns = [
  columnHelper.accessor('urutan', { header: (ctx) => <SortableHeader column={ctx.column} label="Urutan" /> }),
  columnHelper.accessor('pertanyaan_id', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Pertanyaan" />,
    cell: (info) => <span className="font-medium text-warna-teks">{info.getValue()}</span>,
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
        <SoalRowActions id={row.original.id} pertanyaan={row.original.pertanyaan_id} />
      </div>
    ),
  }),
];

export function SoalTable({ soal }: { soal: Soal[] }) {
  return (
    <DataTable
      columns={columns}
      data={soal}
      searchColumnId="pertanyaan_id"
      searchPlaceholder="Cari pertanyaan..."
      emptyMessage="Belum ada soal."
    />
  );
}
