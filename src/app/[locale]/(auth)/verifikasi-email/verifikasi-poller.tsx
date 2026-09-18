'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { cekStatusVerifikasiAction } from './actions';

export function VerifikasiPoller({ sudahLogin }: { sudahLogin: boolean }) {
  const router = useRouter();
  const busy = useRef(false);
  const [mengecek, setMengecek] = useState(false);

  useEffect(() => {
    if (sudahLogin) {
      router.push('/dashboard');
      return;
    }

    const interval = setInterval(async () => {
      if (busy.current) return;
      busy.current = true;
      setMengecek(true);
      try {
        const hasil = await cekStatusVerifikasiAction();
        if (hasil.terverifikasi && !('gagalLogin' in hasil && hasil.gagalLogin)) {
          router.push('/dashboard');
        } else if (hasil.terverifikasi && 'gagalLogin' in hasil && hasil.gagalLogin) {
          router.push('/login?verified=1');
        }
      } finally {
        busy.current = false;
        setMengecek(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sudahLogin, router]);

  // Indikator visual kecil — page juga punya animasi envelope.
  if (!mengecek) return null;
  return (
    <p className="sr-only" aria-live="polite">
      Mengecek status verifikasi…
    </p>
  );
}
