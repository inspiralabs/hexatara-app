'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { moveItem } from '@/lib/reorder';
import { hapusSoalBatchAction, reorderSoalAction } from './actions';
import { SoalRowActions } from './soal-row-actions';

export type Soal = { id: number; pertanyaan_id: string; urutan: number; is_active: boolean };

// Kolom Aksi sticky: TableCell bawaan whitespace-nowrap, jadi teks panjang
// melebarkan tabel dan mendorong Aksi keluar layar.
const aksiSticky = 'sticky right-0 border-l border-border bg-background';

// Table polos + ReorderButtons (ADR-014), sama pola dengan BabList —
// bukan DataTable, karena reorder butuh seluruh daftar tampil sekaligus
// (tidak terpotong pagination) supaya urutan naik/turun tetap benar.
export function SoalList({ soal }: { soal: Soal[] }) {
  const router = useRouter();
  const [daftar, setDaftar] = useState(soal);
  const [terpilih, setTerpilih] = useState<Set<number>>(new Set());
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaftar(soal);
    setTerpilih((prev) => new Set([...prev].filter((id) => soal.some((s) => s.id === id))));
  }, [soal]);
  const [pending, startTransition] = useTransition();
  const [hapusOpen, setHapusOpen] = useState(false);

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

  function toggle(id: number, on: boolean) {
    setTerpilih((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const semua = daftar.length > 0 && daftar.every((s) => terpilih.has(s.id));

  function hapusTerpilih() {
    const ids = [...terpilih];
    startTransition(async () => {
      const hasil = await hapusSoalBatchAction(ids);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      setHapusOpen(false);
      setTerpilih(new Set());
      toast.success(`${ids.length} soal dihapus.`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {terpilih.size > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2">
          <span className="text-sm font-medium">{terpilih.size} dipilih</span>
          <Button type="button" variant="destructive" size="sm" disabled={pending} onClick={() => setHapusOpen(true)}>
            Hapus terpilih
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => setTerpilih(new Set())}>
            Batal pilih
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Pilih semua soal"
                  checked={semua}
                  disabled={pending || daftar.length === 0}
                  onCheckedChange={(on) => setTerpilih(on ? new Set(daftar.map((s) => s.id)) : new Set())}
                />
              </TableHead>
              <TableHead className="w-16">Urutan</TableHead>
              <TableHead className="min-w-64">Pertanyaan</TableHead>
              <TableHead className="w-16">Aktif</TableHead>
              <TableHead className={`w-px text-right ${aksiSticky}`}>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {daftar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Belum ada soal.
                </TableCell>
              </TableRow>
            ) : (
              daftar.map((s, index) => (
                <TableRow key={s.id} data-state={terpilih.has(s.id) ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Pilih soal ${s.pertanyaan_id}`}
                      checked={terpilih.has(s.id)}
                      disabled={pending}
                      onCheckedChange={(on) => toggle(s.id, on)}
                    />
                  </TableCell>
                  <TableCell>
                    <ReorderButtons
                      label={s.pertanyaan_id}
                      disabledUp={index === 0 || pending}
                      disabledDown={index === daftar.length - 1 || pending}
                      onUp={() => pindah(index, 'up')}
                      onDown={() => pindah(index, 'down')}
                    />
                  </TableCell>
                  <TableCell className="max-w-xl whitespace-normal font-medium text-foreground">
                    <span className="line-clamp-2" title={s.pertanyaan_id}>
                      {s.pertanyaan_id}
                    </span>
                  </TableCell>
                  <TableCell>{s.is_active ? 'Ya' : 'Tidak'}</TableCell>
                  <TableCell className={`text-right ${aksiSticky}`}>
                    <SoalRowActions id={s.id} pertanyaan={s.pertanyaan_id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {terpilih.size} soal terpilih?</AlertDialogTitle>
            <AlertDialogDescription>
              {terpilih.size} soal beserta seluruh opsinya akan terhapus permanen dan tidak akan tampil lagi di /kuis.
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={hapusTerpilih} disabled={pending}>
              {pending ? 'Menghapus…' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
