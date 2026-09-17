'use client';

import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { DownloadIcon } from 'lucide-react';
import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { AdminBatchFilter } from '@/components/admin/admin-batch-filter';
import { Button } from '@/components/ui/button';
import { PesertaPendaftaranDetail } from './peserta-pendaftaran-detail';
import { eksporPesertaPendaftaranXlsx } from './peserta-export';
import type { PesertaPendaftaranRow } from './peserta-types';

export type { PesertaPendaftaranRow };

const columnHelper = createDataTableColumnHelper<PesertaPendaftaranRow>();

const columns = [
  columnHelper.accessor((row) => row.nama_lengkap ?? '—', {
    id: 'nama',
    header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
    cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor((row) => row.email ?? '—', { id: 'email', header: 'Email' }),
  columnHelper.accessor((row) => row.batchJudul, {
    id: 'batch',
    header: (ctx) => <SortableHeader column={ctx.column} label="Batch" />,
  }),
  columnHelper.accessor('verified_at', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Disetujui" />,
    cell: (info) => {
      const v = info.getValue();
      return v ? format(new Date(v), 'd MMM yyyy', { locale: localeId }) : '—';
    },
  }),
  columnHelper.display({
    id: 'detail',
    header: () => <span className="sr-only">Detail</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <PesertaPendaftaranDetail row={row.original} />
      </div>
    ),
  }),
];

export function PesertaPendaftaranTable({
  rows,
  batchOptions,
  batchValue,
}: {
  rows: PesertaPendaftaranRow[];
  batchOptions: { value: string; label: string }[];
  batchValue?: string;
}) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(row) => String(row.id)}
      searchColumnId="nama"
      searchPlaceholder="Cari nama..."
      emptyMessage="Belum ada peserta disetujui."
      toolbarStart={<AdminBatchFilter options={batchOptions} value={batchValue} />}
      toolbarEnd={
        <Button
          type="button"
          onClick={() => eksporPesertaPendaftaranXlsx(rows)}
          disabled={rows.length === 0}
          className="h-11 w-full shrink-0 gap-1.5 px-5 sm:w-auto"
        >
          <DownloadIcon className="size-4" /> Ekspor Excel
        </Button>
      }
    />
  );
}
