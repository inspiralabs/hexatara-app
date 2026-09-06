'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleAktifBatchAction } from './actions';
import { Switch } from '@/components/ui/switch';

export function BatchActiveSwitch({ batchId, aktif }: { batchId: number; aktif: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(aktif);
  const [, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      const hasil = await toggleAktifBatchAction(batchId, next);
      if (!hasil.ok) {
        setChecked(!next);
        return;
      }
      router.refresh();
    });
  }

  return <Switch checked={checked} onCheckedChange={handleChange} aria-label="Tampilkan di halaman publik" />;
}
