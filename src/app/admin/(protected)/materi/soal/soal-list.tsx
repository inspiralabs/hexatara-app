'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { moveItem } from '@/lib/reorder';
import { reorderSoalAction } from './actions';
import { SoalRowActions } from './soal-row-actions';

export type Soal = { id: number; pertanyaan_id: string; urutan: number; is_active: boolean };

// Table polos + ReorderButtons (ADR-014), sama pola dengan BabList —
// bukan DataTable, karena reorder butuh seluruh daftar tampil sekaligus
// (tidak terpotong pagination) supaya urutan naik/turun tetap benar.
export function SoalList({ soal }: { soal: Soal[] }) {
  const router = useRouter();
  const [daftar, setDaftar] = useState(soal);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaftar(soal);
  }, [soal]);
  const [pending, startTransition] = useTransition();

  function pindah(index: number, arah: 'up' | 'down') {
    const baru = moveItem(daftar, index, arah);
    if (baru === daftar) return;
    setDaftar(baru);
    startTransition(async () => {
      const hasil = await reorderSoalAction(baru.map((s) => s.id));
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        setDaftar(daftar); // batalkan optimistic update
        return;
      }
      toast.success('Urutan soal berhasil diubah.');
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Urutan</TableHead>
              <TableHead>Pertanyaan</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {daftar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Belum ada soal.
                </TableCell>
              </TableRow>
            ) : (
              daftar.map((s, index) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <ReorderButtons
                      label={s.pertanyaan_id}
                      disabledUp={index === 0 || pending}
                      disabledDown={index === daftar.length - 1 || pending}
                      onUp={() => pindah(index, 'up')}
                      onDown={() => pindah(index, 'down')}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{s.pertanyaan_id}</TableCell>
                  <TableCell>{s.is_active ? 'Ya' : 'Tidak'}</TableCell>
                  <TableCell className="text-right">
                    <SoalRowActions id={s.id} pertanyaan={s.pertanyaan_id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
