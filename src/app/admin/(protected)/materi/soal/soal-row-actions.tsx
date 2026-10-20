'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { hapusSoalAction } from './actions';
import { Button, buttonVariants } from '@/components/ui/button';
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

export function SoalRowActions({ id, pertanyaan }: { id: number; pertanyaan: string }) {
  const router = useRouter();
  const [hapusOpen, setHapusOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function konfirmasiHapus() {
    startTransition(async () => {
      const hasil = await hapusSoalAction(id);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      setHapusOpen(false);
      toast.success('Soal berhasil dihapus.');
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/admin/materi/soal/${id}`}
          aria-label={`Ubah soal ${pertanyaan}`}
          className={buttonVariants({ variant: 'edit', size: 'sm', className: 'h-9 min-w-9' })}
        >
          <PencilIcon />
          <span className="hidden md:inline">Ubah</span>
        </Link>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="h-9 min-w-9"
          aria-label={`Hapus soal ${pertanyaan}`}
          onClick={() => setHapusOpen(true)}
        >
          <Trash2Icon />
          <span className="hidden md:inline">Hapus</span>
        </Button>
      </div>

      <AlertDialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus soal ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Soal beserta keempat opsinya akan terhapus permanen dan tidak akan tampil lagi di /kuis. Tindakan ini
              tidak bisa dibatalkan.
            </AlertDialogDescription>
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
