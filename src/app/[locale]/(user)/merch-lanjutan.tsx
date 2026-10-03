'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export function PilihanOrderDitolak({ unggah, form }: { unggah: ReactNode; form: ReactNode }) {
  const [mode, setMode] = useState<'unggah' | 'baru' | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="h-11 px-5" variant={mode === 'unggah' ? 'default' : 'outline'} onClick={() => setMode('unggah')}>
          Unggah Ulang Bukti
        </Button>
        <Button type="button" className="h-11 px-5" variant={mode === 'baru' ? 'default' : 'outline'} onClick={() => setMode('baru')}>
          Buat Pesanan Baru
        </Button>
      </div>
      {mode === 'unggah' ? unggah : null}
      {mode === 'baru' ? form : null}
    </div>
  );
}
