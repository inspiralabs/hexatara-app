'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { DownloadIcon, Trash2Icon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { hapusPenawaranAction } from './penawaran-actions';
import { PenawaranStatusSelect } from './penawaran-status-select';
import { eksporPenawaranXlsx } from './penawaran-export';
import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Database } from '@/types/database';

export type Penawaran = Database['public']['Tables']['quote_requests']['Row'] & {
  products: { nama_id: string; nama_en: string | null } | null;
};

function BarisHapus({ id, nama }: { id: number; nama: string }) {
  const router = useRouter();
  const [hapusOpen, setHapusOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function konfirmasiHapus() {
    startTransition(async () => {
      const hasil = await hapusPenawaranAction(id);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      setHapusOpen(false);
      toast.success('Permintaan penawaran berhasil dihapus.');
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="destructive" size="icon" aria-label={`Hapus permintaan penawaran ${nama}`} onClick={() => setHapusOpen(true)}>
        <Trash2Icon className="size-4 text-destructive" />
      </Button>

      <AlertDialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus permintaan penawaran &quot;{nama}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak bisa dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={konfirmasiHapus} disabled={pending}>
              {pending ? 'Menghapus…' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const LABEL_STATUS: Record<Penawaran['status'], string> = {
  baru: 'Baru',
  dihubungi: 'Dihubungi',
  selesai: 'Selesai',
};

function BarisDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm whitespace-pre-wrap break-words text-foreground">{value || '—'}</dd>
    </div>
  );
}

function PenawaranDetail({ row }: { row: Penawaran }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>Detail</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail permintaan penawaran</DialogTitle>
        </DialogHeader>
        <dl className="pr-6">
          <BarisDetail label="Nama" value={row.nama} />
          <BarisDetail label="Perusahaan" value={row.perusahaan ?? ''} />
          <BarisDetail label="Email" value={row.email} />
          <BarisDetail label="WhatsApp" value={row.whatsapp ?? ''} />
          <BarisDetail label="Produk" value={row.products?.nama_id ?? ''} />
          <BarisDetail label="Kebutuhan" value={row.kebutuhan ?? ''} />
          <BarisDetail label="Status" value={LABEL_STATUS[row.status]} />
          <BarisDetail
            label="Diajukan"
            value={format(new Date(row.created_at), 'd MMM yyyy HH:mm', { locale: localeId })}
          />
        </dl>
      </DialogContent>
    </Dialog>
  );
}

const columnHelper = createDataTableColumnHelper<Penawaran>();

const columns = [
  columnHelper.accessor('nama', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
    cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor((row) => row.perusahaan ?? '—', { id: 'perusahaan', header: 'Perusahaan' }),
  columnHelper.accessor('email', { header: (ctx) => <SortableHeader column={ctx.column} label="Email" /> }),
  columnHelper.accessor((row) => row.whatsapp ?? '—', { id: 'whatsapp', header: 'WhatsApp' }),
  columnHelper.accessor((row) => row.products?.nama_id ?? '—', { id: 'produk', header: 'Produk' }),
  columnHelper.display({
    id: 'kebutuhan',
    header: 'Kebutuhan',
    cell: ({ row }) => (
      <span className="block max-w-[200px] truncate" title={row.original.kebutuhan ?? ''}>
        {row.original.kebutuhan ?? '—'}
      </span>
    ),
  }),
  columnHelper.accessor('status', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Status" />,
    filterFn: 'equalsString',
    cell: ({ row }) => (
      <PenawaranStatusSelect id={row.original.id} statusSaatIni={row.original.status} />
    ),
  }),
  columnHelper.accessor('created_at', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Tanggal" />,
    cell: (info) => format(new Date(info.getValue()), 'd MMM yyyy', { locale: localeId }),
  }),
  columnHelper.display({
    id: 'aksi',
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <PenawaranDetail row={row.original} />
        <BarisHapus id={row.original.id} nama={row.original.nama} />
      </div>
    ),
  }),
];

export function PenawaranTable({ penawaran, judul }: { penawaran: Penawaran[]; judul: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground">{judul}</h1>
        <Button
          type="button"
          onClick={() => eksporPenawaranXlsx(penawaran)}
          disabled={penawaran.length === 0}
          className="h-11 shrink-0 gap-1.5 px-5"
        >
          <DownloadIcon className="size-4" /> Ekspor Excel
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={penawaran}
        getRowId={(row) => String(row.id)}
        searchColumnId="nama"
        searchPlaceholder="Cari nama..."
        emptyMessage="Belum ada permintaan penawaran."
        columnFilters={[
          {
            id: 'status',
            label: 'Status',
            options: [
              { value: 'baru', label: 'Baru' },
              { value: 'dihubungi', label: 'Dihubungi' },
              { value: 'selesai', label: 'Selesai' },
            ],
          },
        ]}
      />
    </div>
  );
}
