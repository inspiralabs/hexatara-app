'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MoreVerticalIcon } from 'lucide-react';
import { hapusBatchAction } from './actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export function BatchRowActions({ batchId, judul }: { batchId: number; judul: string }) {
  const router = useRouter();
  const [hapusOpen, setHapusOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [pesanError, setPesanError] = useState<string | null>(null);

  function konfirmasiHapus() {
    startTransition(async () => {
      const hasil = await hapusBatchAction(batchId);
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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" aria-label={`Aksi untuk ${judul}`} />}
        >
          <MoreVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/admin/batch/${batchId}`} />}>Ubah</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setHapusOpen(true)}>
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus batch &quot;{judul}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Data batch beserta benefit, peralatan, FAQ, dan galerinya akan terhapus permanen.
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
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
