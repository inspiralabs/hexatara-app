'use client';

import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { SertifikatRowActions } from './sertifikat-row-actions';

const JENIS_LABEL: Record<string, string> = {
  free_track: 'Free Track',
  existing_manual: 'Existing Manual',
  rpc_certified: 'RPC Certified',
};

const formatTanggalId = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
function formatTanggal(tanggal: string | null) {
  return tanggal ? formatTanggalId.format(new Date(tanggal)) : '—';
}

export type SertifikatRow = {
  id: string;
  nomor_sertifikat: string;
  jenis: string;
  nama_lengkap: string;
  tanggal_terbit: string | null;
  tanggal_kedaluwarsa: string | null;
  qr_aktif: boolean;
  invalid: boolean;
};

const columnHelper = createDataTableColumnHelper<SertifikatRow>();

const columns = [
  columnHelper.accessor('nomor_sertifikat', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Nomor" />,
    cell: (info) => <span className="font-medium text-warna-teks">{info.getValue()}</span>,
  }),
  columnHelper.accessor('jenis', {
    id: 'jenis',
    header: (ctx) => <SortableHeader column={ctx.column} label="Jenis" />,
    filterFn: 'equalsString',
    cell: (info) => JENIS_LABEL[info.getValue()] ?? info.getValue(),
  }),
  columnHelper.accessor('nama_lengkap', { header: (ctx) => <SortableHeader column={ctx.column} label="Nama" /> }),
  columnHelper.accessor((row) => formatTanggal(row.tanggal_terbit), { id: 'terbit', header: 'Terbit' }),
  columnHelper.display({
    id: 'kedaluwarsa',
    header: 'Kedaluwarsa',
    cell: ({ row }) =>
      row.original.tanggal_kedaluwarsa === null ? 'Tanpa masa berlaku' : formatTanggal(row.original.tanggal_kedaluwarsa),
  }),
  columnHelper.accessor((row) => (row.invalid ? 'invalid' : 'berlaku'), {
    id: 'status',
    header: 'Status',
    filterFn: 'equalsString',
    enableSorting: false,
    cell: ({ row }) => (
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          row.original.invalid ? 'bg-warna-bahaya/10 text-warna-bahaya' : 'bg-warna-sukses/10 text-warna-sukses'
        }`}
      >
        {row.original.invalid ? 'Invalid' : 'Berlaku'}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'qr_aktif',
    header: 'QR Aktif',
    cell: ({ row }) => (row.original.qr_aktif ? 'Ya' : 'Tidak'),
  }),
  columnHelper.display({
    id: 'aksi',
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <SertifikatRowActions id={row.original.id} nomor={row.original.nomor_sertifikat} />
      </div>
    ),
  }),
];

export function SertifikatTable({ sertifikat }: { sertifikat: SertifikatRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={sertifikat}
      getRowId={(row) => row.id}
      searchColumnId="nomor_sertifikat"
      searchPlaceholder="Cari nomor sertifikat..."
      emptyMessage="Belum ada sertifikat."
      columnFilters={[
        {
          id: 'jenis',
          label: 'Jenis',
          options: [
            { value: 'free_track', label: 'Free Track' },
            { value: 'existing_manual', label: 'Existing Manual' },
            { value: 'rpc_certified', label: 'RPC Certified' },
          ],
        },
        {
          id: 'status',
          label: 'Status',
          options: [
            { value: 'berlaku', label: 'Berlaku' },
            { value: 'invalid', label: 'Invalid' },
          ],
        },
      ]}
    />
  );
}
