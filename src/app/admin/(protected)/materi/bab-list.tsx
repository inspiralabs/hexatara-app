'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { moveItem } from '@/lib/reorder';
import { reorderBabAction } from './bab-actions';
import { BabRowActions } from './bab-row-actions';
import type { Database } from '@/types/database';

type Bab = Pick<Database['public']['Tables']['material_chapters']['Row'], 'id' | 'judul_id'>;

export function BabList({ materialId, bab }: { materialId: number; bab: Bab[] }) {
  const router = useRouter();
  const [daftar, setDaftar] = useState(bab);
  const [pending, startTransition] = useTransition();
  const [pesanError, setPesanError] = useState<string | null>(null);

  function pindah(index: number, arah: 'up' | 'down') {
    const baru = moveItem(daftar, index, arah);
    if (baru === daftar) return;
    setPesanError(null);
    setDaftar(baru);
    startTransition(async () => {
      const hasil = await reorderBabAction(
        materialId,
        baru.map((b) => b.id)
      );
      if (!hasil.ok) {
        setPesanError(hasil.pesan);
        setDaftar(daftar); // batalkan optimistic update
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-warna-teks">Daftar Materi</h2>
        <Link
          href="/admin/materi/baru"
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          <PlusIcon className="size-4" /> Tambah Materi
        </Link>
      </div>

      {pesanError && <p className="text-sm text-destructive">{pesanError}</p>}

      <div className="overflow-x-auto rounded-lg border border-warna-latar-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Urutan</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {daftar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-warna-teks-2">
                  Belum ada materi. Tambah materi pertama untuk mulai mengisi halaman ini.
                </TableCell>
              </TableRow>
            ) : (
              daftar.map((b, index) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <ReorderButtons
                      label={b.judul_id}
                      disabledUp={index === 0 || pending}
                      disabledDown={index === daftar.length - 1 || pending}
                      onUp={() => pindah(index, 'up')}
                      onDown={() => pindah(index, 'down')}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-warna-teks">{b.judul_id}</TableCell>
                  <TableCell className="text-right">
                    <BabRowActions babId={b.id} judul={b.judul_id} />
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
