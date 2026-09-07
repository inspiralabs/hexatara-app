'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleAktifTestimonialAction } from './testimonial-actions';
import { Switch } from '@/components/ui/switch';

export function TestimonialActiveSwitch({ testimonialId, aktif }: { testimonialId: number; aktif: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(aktif);
  const [, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      const hasil = await toggleAktifTestimonialAction(testimonialId, next);
      if (!hasil.ok) {
        setChecked(!next);
        return;
      }
      router.refresh();
    });
  }

  return <Switch checked={checked} onCheckedChange={handleChange} aria-label="Aktifkan testimoni" />;
}
