'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FileUploadField } from '@/components/file-upload-field';
import { imporSoalAction, type BarisGagal } from './actions';

type Laporan = { berhasil: number; gagal: BarisGagal[] };

export function ImporSoalForm() {
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const [laporan, setLaporan] = useState<Laporan | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLaporan(null);

    if (!file) {
      toast.error('Pilih berkas CSV atau Excel terlebih dahulu.');
      return;
    }

    const formData = new FormData();
    formData.set('berkas', file);

    startTransition(async () => {
      const hasil = await imporSoalAction(formData);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      setLaporan({ berhasil: hasil.berhasil, gagal: hasil.gagal });
      toast.success(`Impor selesai: ${hasil.berhasil} berhasil, ${hasil.gagal.length} gagal.`);
      setFile(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <FileUploadField
          label="Berkas CSV atau Excel"
          accept=".csv,.xlsx,.xls"
          hint="CSV atau Excel (.csv, .xlsx, .xls)"
          file={file}
          onFile={setFile}
          disabled={pending}
        />
        <Button type="submit" disabled={pending || !file} className="h-11 w-fit px-6">
          {pending ? 'Memproses…' : 'Impor'}
        </Button>
      </form>

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
