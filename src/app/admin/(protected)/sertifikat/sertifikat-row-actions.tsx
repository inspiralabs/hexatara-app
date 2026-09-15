'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MoreVerticalIcon } from 'lucide-react';
import { toast } from 'sonner';
import { hapusSertifikatAction } from './actions';
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

export function SertifikatRowActions({ id, nomor }: { id: string; nomor: string }) {
  const router = useRouter();
  const [hapusOpen, setHapusOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function konfirmasiHapus() {
    startTransition(async () => {
      const hasil = await hapusSertifikatAction(id);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      setHapusOpen(false);
      toast.success('Sertifikat berhasil dihapus.');
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={`Aksi untuk ${nomor}`} />}>
          <MoreVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/admin/sertifikat/${id}`} />}>Ubah</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setHapusOpen(true)}>
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus sertifikat &quot;{nomor}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Sertifikat ini akan terhapus permanen dan tidak akan bisa diverifikasi lagi di /verify. Tindakan ini
              tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
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
