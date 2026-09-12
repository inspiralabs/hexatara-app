'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { moveItem } from '@/lib/reorder';
import { reorderLampiranAction } from './lampiran-actions';
import { LampiranRowActions } from './lampiran-row-actions';
import { LampiranFormDialog } from './lampiran-form-dialog';
import type { LampiranFormInput } from '@/lib/validations/materi-lampiran-admin';
import type { Database } from '@/types/database';

type Lampiran = Database['public']['Tables']['material_chapter_files']['Row'];

function keDefaultValues(l: Lampiran): LampiranFormInput {
  return {
    judul_id: l.judul_id,
    judul_en: l.judul_en ?? '',
    deskripsi_id: l.deskripsi_id ?? '',
    deskripsi_en: l.deskripsi_en ?? '',
    url_file: l.url_file,
  };
}

export function LampiranList({ chapterId, lampiran }: { chapterId: number; lampiran: Lampiran[] }) {
  const router = useRouter();
  const [daftar, setDaftar] = useState(lampiran);
  // Setelah router.refresh(), Server Component ini re-fetch dan mengirim
  // `lampiran` baru sebagai prop — tapi useState hanya memakai initial value
  // SEKALI saat mount, jadi tanpa efek ini daftar lokal tetap basi sampai
  // reload manual.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaftar(lampiran);
  }, [lampiran]);
  const [pending, startTransition] = useTransition();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lampiran | null>(null);

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(l: Lampiran) {
    setEditing(l);
    setDialogOpen(true);
  }

  function pindah(index: number, arah: 'up' | 'down') {
    const baru = moveItem(daftar, index, arah);
    if (baru === daftar) return;
    setPesanError(null);
    setDaftar(baru);
    startTransition(async () => {
      const hasil = await reorderLampiranAction(
        chapterId,
        baru.map((l) => l.id)
      );
      if (!hasil.ok) {
        setPesanError(hasil.pesan);
        setDaftar(daftar);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={bukaTambah}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          <PlusIcon className="size-4" /> Tambah Lampiran
        </button>
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
                  Belum ada lampiran untuk bab ini.
                </TableCell>
              </TableRow>
            ) : (
              daftar.map((l, index) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <ReorderButtons
                      label={l.judul_id}
                      disabledUp={index === 0 || pending}
                      disabledDown={index === daftar.length - 1 || pending}
                      onUp={() => pindah(index, 'up')}
                      onDown={() => pindah(index, 'down')}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-warna-teks">{l.judul_id}</TableCell>
                  <TableCell className="text-right">
                    <LampiranRowActions lampiranId={l.id} judul={l.judul_id} onUbah={() => bukaUbah(l)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LampiranFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        chapterId={chapterId}
        lampiranId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
      />
    </div>
  );
}
