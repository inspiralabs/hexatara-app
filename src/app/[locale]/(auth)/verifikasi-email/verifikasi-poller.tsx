'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

// Tidak ada panggilan Supabase JS di browser saat verifikasi terjadi (semuanya
// lewat redirect server /auth/confirm), jadi onAuthStateChange tidak pernah
// terpicu di tab ini. router.refresh() menghitung ulang Server Component
// dengan cookie terbaru — begitu tab lain menyelesaikan verifikasi, cookie
// sesi baru langsung terbaca karena satu browser berbagi cookie yang sama.
export function VerifikasiPoller({ sudahLogin }: { sudahLogin: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (sudahLogin) {
      router.push('/dashboard');
      return;
    }

    const interval = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(interval);
  }, [sudahLogin, router]);

  return null;
}
