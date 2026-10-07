'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateFreemiumLmsOpenAction } from './actions';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export function FreemiumLmsCard({ open }: { open: boolean }) {
  const [checked, setChecked] = useState(open);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<boolean | null>(null);
  const [pending, startTransition] = useTransition();

  function onSwitch(next: boolean) {
    setPendingTarget(next);
    setConfirmOpen(true);
  }

  function konfirmasi() {
    if (pendingTarget == null) return;
    const next = pendingTarget;
    startTransition(async () => {
      const hasil = await updateFreemiumLmsOpenAction(next);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        setConfirmOpen(false);
        setPendingTarget(null);
        return;
      }
      setChecked(next);
      setConfirmOpen(false);
      setPendingTarget(null);
      toast.success(next ? 'LMS Freemium dibuka untuk publik.' : 'LMS Freemium ditutup sementara.');
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Akses LMS Freemium</CardTitle>
          <CardDescription>
            Saat ditutup, publik tidak bisa membuka materi dan kuis. Admin tetap bisa pratinjau.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {checked ? 'Terbuka untuk publik' : 'Ditutup sementara'}
            </p>
          </div>
          <Switch
            checked={checked}
            onCheckedChange={onSwitch}
            disabled={pending}
            aria-label="Saklar akses LMS Freemium"
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          if (!o && !pending) {
            setConfirmOpen(false);
            setPendingTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingTarget
                ? 'Buka LMS Freemium untuk publik?'
                : 'Tutup LMS Freemium sementara?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingTarget
                ? 'Publik akan bisa membuka materi dan kuis lagi.'
                : 'Publik tidak bisa membuka materi dan kuis. Admin tetap bisa pratinjau.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={konfirmasi} disabled={pending}>
              {pending ? 'Menyimpan…' : 'Ya, lanjutkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
