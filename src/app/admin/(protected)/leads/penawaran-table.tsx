'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { DownloadIcon, Trash2Icon } from 'lucide-react';
import { hapusPenawaranAction } from './penawaran-actions';
import { eksporPenawaranCsv } from './penawaran-export';
import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
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

const LABEL_STATUS: Record<Penawaran['status'], string> = {
  baru: 'Baru',
  dihubungi: 'Dihubungi',
  selesai: 'Selesai',
};

function BarisHapus({ id, nama }: { id: number; nama: string }) {
  const router = useRouter();
  const [hapusOpen, setHapusOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [pesanError, setPesanError] = useState<string | null>(null);

  function konfirmasiHapus() {
    startTransition(async () => {
      const hasil = await hapusPenawaranAction(id);
      if (!hasil.ok) {
        setPesanError(hasil.pesan);
        return;
      }
      setHapusOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="ghost" size="icon" aria-label={`Hapus permintaan penawaran ${nama}`} onClick={() => setHapusOpen(true)}>
        <Trash2Icon className="size-4 text-warna-bahaya" />
      </Button>

      <AlertDialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus permintaan penawaran &quot;{nama}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak bisa dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          {pesanError && <p className="px-4 text-sm text-destructive">{pesanError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={konfirmasiHapus} disabled={pending}>
              {pending ? 'Menghapus…' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const columnHelper = createDataTableColumnHelper<Penawaran>();

const columns = [
  columnHelper.accessor('nama', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
    cell: (info) => <span className="font-medium text-warna-teks">{info.getValue()}</span>,
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
    cell: (info) => <Badge variant="secondary">{LABEL_STATUS[info.getValue()]}</Badge>,
  }),
  columnHelper.accessor('created_at', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Tanggal" />,
    cell: (info) => format(new Date(info.getValue()), 'd MMM yyyy', { locale: localeId }),
  }),
  columnHelper.display({
    id: 'aksi',
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <BarisHapus id={row.original.id} nama={row.original.nama} />
      </div>
    ),
  }),
];

export function PenawaranTable({ penawaran }: { penawaran: Penawaran[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => eksporPenawaranCsv(penawaran)}
          disabled={penawaran.length === 0}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks disabled:opacity-50"
        >
          <DownloadIcon className="size-4" /> Ekspor CSV
        </button>
      </div>

      <DataTable
        columns={columns}
        data={penawaran}
        searchColumnId="nama"
        searchPlaceholder="Cari nama..."
        emptyMessage="Belum ada permintaan penawaran."
      />
    </div>
  );
}
