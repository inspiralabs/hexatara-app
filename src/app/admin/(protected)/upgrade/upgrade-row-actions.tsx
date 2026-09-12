'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { setujuiPesananAction, tolakPesananAction } from './actions';
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

export function UpgradeRowActions({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [setujuiOpen, setSetujuiOpen] = useState(false);
  const [tolakOpen, setTolakOpen] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [pending, startTransition] = useTransition();
  const [pesanError, setPesanError] = useState<string | null>(null);

  function konfirmasiSetujui() {
    startTransition(async () => {
      setPesanError(null);
      const hasil = await setujuiPesananAction(orderId);
      if (!hasil.ok) {
        setPesanError(hasil.pesan);
        toast.error(hasil.pesan);
        return;
      }
      setSetujuiOpen(false);
      toast.success('Pesanan disetujui, sertifikat aktif.');
      router.refresh();
    });
  }

  function konfirmasiTolak() {
    startTransition(async () => {
      setPesanError(null);
      const hasil = await tolakPesananAction(orderId, alasan);
      if (!hasil.ok) {
        setPesanError(hasil.pesan);
        toast.error(hasil.pesan);
        return;
      }
      setTolakOpen(false);
      setAlasan('');
      toast.success('Pesanan ditolak.');
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" onClick={() => setSetujuiOpen(true)}>
        Setujui
      </Button>
      <Button size="sm" variant="outline" onClick={() => setTolakOpen(true)}>
        Tolak
      </Button>

      <AlertDialog open={setujuiOpen} onOpenChange={setSetujuiOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Setujui pesanan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Sertifikat free_track akan diterbitkan dan QR-nya langsung aktif. Tindakan ini tidak
              bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pesanError && <p className="px-4 text-sm text-destructive">{pesanError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={konfirmasiSetujui} disabled={pending}>
              {pending ? 'Memproses…' : 'Setujui'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={tolakOpen} onOpenChange={setTolakOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak pesanan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Pengguna akan melihat alasan ini di dashboard dan bisa mengunggah ulang bukti
              transfer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            placeholder="Alasan penolakan"
            className="mx-4 w-auto"
          />
          {pesanError && <p className="px-4 text-sm text-destructive">{pesanError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={konfirmasiTolak} disabled={pending || alasan.trim() === ''}>
              {pending ? 'Memproses…' : 'Tolak'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
