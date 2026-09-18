'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { setujuiPendaftaranBatchAction, tolakPendaftaranBatchAction } from './actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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

export function PendaftaranBatchRowActions({ registrasiId }: { registrasiId: number }) {
  const router = useRouter();
  const [setujuiOpen, setSetujuiOpen] = useState(false);
  const [tolakOpen, setTolakOpen] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [pending, startTransition] = useTransition();

  function konfirmasiSetujui() {
    startTransition(async () => {
      const hasil = await setujuiPendaftaranBatchAction(registrasiId);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      setSetujuiOpen(false);
      toast.success('Pendaftaran disetujui.');
      router.refresh();
    });
  }

  function konfirmasiTolak() {
    startTransition(async () => {
      const hasil = await tolakPendaftaranBatchAction(registrasiId, alasan);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      setTolakOpen(false);
      setAlasan('');
      toast.success('Pendaftaran ditolak.');
      router.refresh();
    });
  }

  return (
    <>
      <Button size="sm" variant="success" onClick={() => setSetujuiOpen(true)}>
        Setuju
      </Button>
      <Button size="sm" variant="destructive" onClick={() => setTolakOpen(true)}>
        Tolak
      </Button>

      <AlertDialog open={setujuiOpen} onOpenChange={setSetujuiOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Setujui pendaftaran ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Status berubah menjadi disetujui. Tindakan ini tidak bisa dibatalkan dari sini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction variant="success" onClick={konfirmasiSetujui} disabled={pending}>
              {pending ? 'Memproses…' : 'Setuju'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={tolakOpen} onOpenChange={setTolakOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak pendaftaran ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Alasan penolakan tersimpan di baris pendaftaran untuk catatan Admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            placeholder="Alasan penolakan"
            className="mx-4 w-auto"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={konfirmasiTolak} disabled={pending || alasan.trim() === ''}>
              {pending ? 'Memproses…' : 'Tolak'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
