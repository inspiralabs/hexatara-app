'use client';

import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { imporSoalAction, type BarisGagal } from './actions';

type Laporan = { berhasil: number; gagal: BarisGagal[] };

export function ImporSoalForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [laporan, setLaporan] = useState<Laporan | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPesanError(null);
    setLaporan(null);

    const berkas = fileRef.current?.files?.[0];
    if (!berkas) {
      setPesanError('Pilih berkas CSV atau Excel terlebih dahulu.');
      return;
    }

    const formData = new FormData();
    formData.set('berkas', berkas);

    startTransition(async () => {
      const hasil = await imporSoalAction(formData);
      if (!hasil.ok) {
        setPesanError(hasil.pesan);
        toast.error(hasil.pesan);
        return;
      }
      setLaporan({ berhasil: hasil.berhasil, gagal: hasil.gagal });
      toast.success(`Impor selesai: ${hasil.berhasil} berhasil, ${hasil.gagal.length} gagal.`);
      if (fileRef.current) fileRef.current.value = '';
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Label htmlFor="berkas">Berkas CSV atau Excel</Label>
        <input
          ref={fileRef}
          id="berkas"
          name="berkas"
          type="file"
          accept=".csv,.xlsx,.xls"
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground file:mr-3 file:h-full file:border-0 file:bg-transparent file:font-medium file:text-primary"
        />
        <Button type="submit" disabled={pending} className="h-11 w-fit px-6">
          {pending ? 'Memproses…' : 'Impor'}
        </Button>
      </form>

      {pesanError && <p className="text-sm text-destructive">{pesanError}</p>}

      {laporan && (
        <div className="rounded-lg border border-border p-4">
          <p className="font-medium text-emerald-700 dark:text-emerald-400">Berhasil: {laporan.berhasil} baris</p>
          {laporan.gagal.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-destructive">Gagal: {laporan.gagal.length} baris</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                {laporan.gagal.map((g) => (
                  <li key={g.baris}>
                    Baris {g.baris} — {g.alasan}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
