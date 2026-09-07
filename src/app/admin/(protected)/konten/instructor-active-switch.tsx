'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleAktifInstructorAction } from './instructor-actions';
import { Switch } from '@/components/ui/switch';

export function InstructorActiveSwitch({ instructorId, aktif }: { instructorId: number; aktif: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(aktif);
  const [, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      const hasil = await toggleAktifInstructorAction(instructorId, next);
      if (!hasil.ok) {
        setChecked(!next);
        return;
      }
      router.refresh();
    });
  }

  return <Switch checked={checked} onCheckedChange={handleChange} aria-label="Aktifkan instruktur" />;
}
