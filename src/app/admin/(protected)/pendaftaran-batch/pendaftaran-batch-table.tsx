'use client';

import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { PendaftaranBatchDetail } from './pendaftaran-batch-detail';
import { PendaftaranBatchRowActions } from './pendaftaran-batch-row-actions';
import type { Database } from '@/types/database';

export type PendaftaranBatchRow = {
  id: number;
  nama_lengkap: string | null;
  email: string | null;
  whatsapp: string | null;
  nomor_ktp: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  alamat_lengkap: string | null;
  kategori_peserta: Database['public']['Enums']['kategori_peserta_rpc'];
  sumber_info: string | null;
  kode_referral: string | null;
  user_id: string | null;
  created_at: string;
  batchJudul: string;
  fotoKtpUrl: string | null;
  pasFotoUrl: string | null;
};

const LABEL_KATEGORI: Record<PendaftaranBatchRow['kategori_peserta'], string> = {
  penerbitan_baru: 'Penerbitan baru',
  perpanjangan_renewal: 'Perpanjangan / renewal',
};

const columnHelper = createDataTableColumnHelper<PendaftaranBatchRow>();

const columns = [
  columnHelper.accessor((row) => row.nama_lengkap ?? '—', {
    id: 'nama',
    header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
    cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor((row) => row.batchJudul, {
    id: 'batch',
    header: (ctx) => <SortableHeader column={ctx.column} label="Batch" />,
  }),
  columnHelper.accessor((row) => (row.user_id ? 'login' : 'anon'), {
    id: 'akun',
    header: 'Akun',
    filterFn: 'equalsString',
    cell: (info) => (
      <Badge variant="secondary">{info.getValue() === 'login' ? 'Login' : 'Tanpa akun'}</Badge>
    ),
  }),
  columnHelper.accessor('kategori_peserta', {
    id: 'kategori',
    header: 'Kategori',
    filterFn: 'equalsString',
    cell: (info) => LABEL_KATEGORI[info.getValue()],
  }),
  columnHelper.accessor('created_at', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Diajukan" />,
    cell: (info) => format(new Date(info.getValue()), 'd MMM yyyy', { locale: localeId }),
  }),
  columnHelper.display({
    id: 'aksi',
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <PendaftaranBatchDetail row={row.original} />
        <PendaftaranBatchRowActions registrasiId={row.original.id} />
      </div>
    ),
  }),
];

export function PendaftaranBatchTable({ rows }: { rows: PendaftaranBatchRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(row) => String(row.id)}
      searchColumnId="nama"
      searchPlaceholder="Cari nama..."
      emptyMessage="Tidak ada pendaftaran menunggu verifikasi."
      columnFilters={[
        {
          id: 'kategori',
          label: 'Kategori',
          options: [
            { value: 'penerbitan_baru', label: 'Penerbitan baru' },
            { value: 'perpanjangan_renewal', label: 'Perpanjangan / renewal' },
          ],
        },
        {
          id: 'akun',
          label: 'Akun',
          options: [
            { value: 'login', label: 'Login' },
            { value: 'anon', label: 'Tanpa akun' },
          ],
        },
      ]}
    />
  );
}
