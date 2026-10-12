'use client';

import { useEffect, useRef, useState } from 'react';
import { logoutAdminAction } from '@/app/admin/(protected)/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Uji lokal: ganti jadi 60_000 dan 30_000 (1 menit / peringatan 30 detik).
// Kembalikan ke 30 menit dan 28 menit sebelum push produksi.
export const ADMIN_IDLE_MS = 30 * 60 * 1000;
export const ADMIN_IDLE_WARN_MS = 28 * 60 * 1000;
//export const ADMIN_IDLE_MS = 60_000;
//export const ADMIN_IDLE_WARN_MS = 30_000;
// extension of ADMIN IDLE WARNS 

export function AdminIdleTimeout() {
  const last = useRef(0);
  const loggingOut = useRef(false);
  const [warn, setWarn] = useState(false);

  function stay() {
    last.current = Date.now();
    setWarn(false);
  }

  useEffect(() => {
    last.current = Date.now();
    let moveAt = 0;
    function bump(event: Event) {
      if (event.type === 'mousemove') {
        const now = Date.now();
        if (now - moveAt < 1000) return;
        moveAt = now;
      }
      last.current = Date.now();
      setWarn(false);
    }
    const opts = { capture: true, passive: true } as const;
    const types = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'] as const;
    for (const type of types) window.addEventListener(type, bump, opts);

    const id = window.setInterval(() => {
      const idle = Date.now() - last.current;
      if (idle >= ADMIN_IDLE_MS) {
        if (loggingOut.current) return;
        loggingOut.current = true;
        void logoutAdminAction();
        return;
      }
      if (idle >= ADMIN_IDLE_WARN_MS) setWarn(true);
    }, 1000);

    return () => {
      for (const type of types) window.removeEventListener(type, bump, opts);
      window.clearInterval(id);
    };
  }, []);

  return (
    <Dialog open={warn} onOpenChange={(open) => { if (!open) stay(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sesi akan berakhir</DialogTitle>
          <DialogDescription>
            Sesi akan berakhir dalam 2 menit karena tidak ada aktivitas. Klik untuk tetap login.
          </DialogDescription>
        </DialogHeader>
        <Button type="button" onClick={stay}>
          Tetap login
        </Button>
      </DialogContent>
    </Dialog>
  );
}
