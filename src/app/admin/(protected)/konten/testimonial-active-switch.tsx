'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
        toast.error(hasil.pesan);
        return;
      }
      toast.success('Status berhasil diubah.');
      router.refresh();
    });
  }

  return <Switch checked={checked} onCheckedChange={handleChange} aria-label="Aktifkan testimoni" />;
}
