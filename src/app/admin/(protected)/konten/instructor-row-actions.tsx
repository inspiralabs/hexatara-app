'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVerticalIcon } from 'lucide-react';
import { toast } from 'sonner';
import { hapusInstructorAction } from './instructor-actions';
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

export function InstructorRowActions({
  instructorId,
  nama,
  onUbah,
}: {
  instructorId: number;
  nama: string;
  onUbah: () => void;
}) {
  const router = useRouter();
  const [hapusOpen, setHapusOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function konfirmasiHapus() {
    startTransition(async () => {
      const hasil = await hapusInstructorAction(instructorId);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      setHapusOpen(false);
      toast.success('Instruktur berhasil dihapus.');
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" aria-label={`Aksi untuk ${nama}`} />}
        >
          <MoreVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onUbah}>Ubah</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setHapusOpen(true)}>
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus instruktur &quot;{nama}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak bisa dibatalkan.</AlertDialogDescription>
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
