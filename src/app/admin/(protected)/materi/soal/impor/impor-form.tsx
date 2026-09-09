'use client';

import { useRef, useState, useTransition } from 'react';
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
        return;
      }
      setLaporan({ berhasil: hasil.berhasil, gagal: hasil.gagal });
      if (fileRef.current) fileRef.current.value = '';
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label htmlFor="berkas" className="text-sm font-medium text-warna-teks">
          Berkas CSV atau Excel
        </label>
        <input
          ref={fileRef}
          id="berkas"
          name="berkas"
          type="file"
          accept=".csv,.xlsx,.xls"
          className="h-11 w-full rounded-lg border border-warna-latar-2 px-3 text-sm text-warna-teks file:mr-3 file:h-full file:border-0 file:bg-transparent file:font-medium file:text-warna-utama"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks disabled:opacity-50"
        >
          {pending ? 'Memproses…' : 'Impor'}
        </button>
      </form>

      {pesanError && <p className="text-sm text-destructive">{pesanError}</p>}

      {laporan && (
        <div className="rounded-lg border border-warna-latar-2 p-4">
          <p className="font-medium text-warna-sukses">Berhasil: {laporan.berhasil} baris</p>
          {laporan.gagal.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-warna-bahaya">Gagal: {laporan.gagal.length} baris</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-warna-teks-2">
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
