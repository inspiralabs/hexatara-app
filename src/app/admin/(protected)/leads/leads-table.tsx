'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { DownloadIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { hapusLeadAction } from './leads-actions';
import { eksporLeadsXlsx } from './leads-export';
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

export type Lead = Database['public']['Tables']['batch_leads']['Row'] & {
  batches: { judul_id: string } | null;
};

const LABEL_STATUS: Record<Lead['status'], string> = {
  baru: 'Baru',
  dihubungi: 'Dihubungi',
  selesai: 'Selesai',
};

function BarisHapus({ leadId, nama }: { leadId: number; nama: string }) {
  const router = useRouter();
  const [hapusOpen, setHapusOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [pesanError, setPesanError] = useState<string | null>(null);

  function konfirmasiHapus() {
    startTransition(async () => {
      const hasil = await hapusLeadAction(leadId);
      if (!hasil.ok) {
        setPesanError(hasil.pesan);
        toast.error(hasil.pesan);
        return;
      }
      setHapusOpen(false);
      toast.success('Lead berhasil dihapus.');
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="ghost" size="icon" aria-label={`Hapus lead ${nama}`} onClick={() => setHapusOpen(true)}>
        <Trash2Icon className="size-4 text-warna-bahaya" />
      </Button>

      <AlertDialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus lead &quot;{nama}&quot;?</AlertDialogTitle>
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

const columnHelper = createDataTableColumnHelper<Lead>();

const columns = [
  columnHelper.accessor('nama', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
    cell: (info) => <span className="font-medium text-warna-teks">{info.getValue()}</span>,
  }),
  columnHelper.accessor('whatsapp', { header: 'WhatsApp' }),
  columnHelper.accessor((row) => row.batches?.judul_id ?? '—', {
    id: 'batch',
    header: (ctx) => <SortableHeader column={ctx.column} label="Batch" />,
  }),
  columnHelper.accessor('status', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Status" />,
    filterFn: 'equalsString',
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
        <BarisHapus leadId={row.original.id} nama={row.original.nama} />
      </div>
    ),
  }),
];

export function LeadsTable({ leads, judul }: { leads: Lead[]; judul: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-warna-teks">{judul}</h1>
        <button
          type="button"
          onClick={() => eksporLeadsXlsx(leads)}
          disabled={leads.length === 0}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks disabled:opacity-50"
        >
          <DownloadIcon className="size-4" /> Ekspor Excel
        </button>
      </div>

      <DataTable
        columns={columns}
        data={leads}
        getRowId={(row) => String(row.id)}
        searchColumnId="nama"
        searchPlaceholder="Cari nama..."
        emptyMessage="Belum ada lead."
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
