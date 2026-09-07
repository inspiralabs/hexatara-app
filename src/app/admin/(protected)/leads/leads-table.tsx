'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { DownloadIcon, Trash2Icon } from 'lucide-react';
import { hapusLeadAction } from './leads-actions';
import { eksporLeadsCsv } from './leads-export';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
        return;
      }
      setHapusOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="ghost" size="icon" aria-label={`Hapus lead ${nama}`} onClick={() => setHapusOpen(true)}>
        <Trash2Icon className="size-4" />
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

export function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => eksporLeadsCsv(leads)}
          disabled={leads.length === 0}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks disabled:opacity-50"
        >
          <DownloadIcon className="size-4" /> Ekspor CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-warna-latar-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-warna-teks-2">
                  Belum ada lead.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium text-warna-teks">{lead.nama}</TableCell>
                  <TableCell>{lead.whatsapp}</TableCell>
                  <TableCell>{lead.batches?.judul_id ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{LABEL_STATUS[lead.status]}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(lead.created_at), 'd MMM yyyy', { locale: localeId })}</TableCell>
                  <TableCell className="text-right">
                    <BarisHapus leadId={lead.id} nama={lead.nama} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
