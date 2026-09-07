'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleAktifHeroSlideAction } from './hero-slide-actions';
import { Switch } from '@/components/ui/switch';

export function HeroSlideActiveSwitch({ slideId, aktif }: { slideId: number; aktif: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(aktif);
  const [, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      const hasil = await toggleAktifHeroSlideAction(slideId, next);
      if (!hasil.ok) {
        setChecked(!next);
        return;
      }
      router.refresh();
    });
  }

  return <Switch checked={checked} onCheckedChange={handleChange} aria-label="Aktifkan hero slide" />;
}
