'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { DownloadIcon, Trash2Icon } from 'lucide-react';
import { hapusPenawaranAction } from './penawaran-actions';
import { eksporPenawaranCsv } from './penawaran-export';
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
        <Trash2Icon className="size-4" />
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

      <div className="overflow-x-auto rounded-lg border border-warna-latar-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Perusahaan</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Kebutuhan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {penawaran.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-warna-teks-2">
                  Belum ada permintaan penawaran.
                </TableCell>
              </TableRow>
            ) : (
              penawaran.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-warna-teks">{p.nama}</TableCell>
                  <TableCell>{p.perusahaan ?? '—'}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.whatsapp ?? '—'}</TableCell>
                  <TableCell>{p.products?.nama_id ?? '—'}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={p.kebutuhan ?? ''}>
                    {p.kebutuhan ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{LABEL_STATUS[p.status]}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(p.created_at), 'd MMM yyyy', { locale: localeId })}</TableCell>
                  <TableCell className="text-right">
                    <BarisHapus id={p.id} nama={p.nama} />
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
