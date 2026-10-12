'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { moveItem } from '@/lib/reorder';

// Pola reorder bersama (ADR-014 / F15.7) — dipakai Produk, Hero, Lokasi
// Praktek, Instruktur, Partner, Testimoni. Reorder selalu terhadap daftar
// penuh (bukan hasil filter/pencarian) agar index tetap konsisten.
export function useReorderList<T extends { id: number }>(
  items: T[],
  reorderAction: (ids: number[]) => Promise<{ ok: true } | { ok: false; pesan: string }>,
  pesanSukses: string
) {
  const router = useRouter();
  const [daftar, setDaftar] = useState(items);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaftar(items);
  }, [items]);

  const [pending, startTransition] = useTransition();

  function pindah(id: number, arah: 'up' | 'down') {
    const index = daftar.findIndex((item) => item.id === id);
    if (index < 0) return;
    const baru = moveItem(daftar, index, arah);
    if (baru === daftar) return;
    setDaftar(baru);
    startTransition(async () => {
      const hasil = await reorderAction(baru.map((item) => item.id));
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        setDaftar(daftar);
        return;
      }
      toast.success(pesanSukses);
      router.refresh();
    });
  }

  return { daftar, setDaftar, pending, pindah };
}
