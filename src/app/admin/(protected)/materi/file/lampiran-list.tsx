'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PlusIcon,
  PresentationIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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

function ekstensiDariUrl(url: string) {
  const path = url.split('?')[0] ?? '';
  const bagian = path.split('.');
  return (bagian[bagian.length - 1] ?? '').toLowerCase();
}

function IkonTipeFile({ url }: { url: string }) {
  const ext = ekstensiDariUrl(url);
  const Icon =
    ext === 'pdf'
      ? FileTextIcon
      : ext === 'xls' || ext === 'xlsx'
        ? FileSpreadsheetIcon
        : ext === 'ppt' || ext === 'pptx'
          ? PresentationIcon
          : ext === 'doc' || ext === 'docx'
            ? FileTextIcon
            : FileIcon;

  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <Icon className="size-6" aria-hidden />
    </div>
  );
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lampiran | null>(null);
  const [dialogSession, setDialogSession] = useState(0);

  function bukaTambah() {
    setEditing(null);
    setDialogSession((s) => s + 1);
    setDialogOpen(true);
  }

  function bukaUbah(l: Lampiran) {
    setEditing(l);
    setDialogSession((s) => s + 1);
    setDialogOpen(true);
  }

  function pindah(index: number, arah: 'up' | 'down') {
    const baru = moveItem(daftar, index, arah);
    if (baru === daftar) return;
    setDaftar(baru);
    startTransition(async () => {
      const hasil = await reorderLampiranAction(
        chapterId,
        baru.map((l) => l.id)
      );
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        setDaftar(daftar);
        return;
      }
      toast.success('Urutan lampiran berhasil diubah.');
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button type="button" onClick={bukaTambah} className="h-11 gap-1.5 px-5">
          <PlusIcon className="size-4" /> Tambah Lampiran
        </Button>
      </div>

      {daftar.length === 0 ? (
        <p className="rounded-lg border border-border p-4 text-center text-sm text-muted-foreground">
          Belum ada lampiran untuk bab ini.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {daftar.map((l, index) => (
            <li
              key={l.id}
              className="flex items-start gap-2 rounded-lg border border-border p-3 sm:gap-3 sm:p-4"
            >
              <ReorderButtons
                label={l.judul_id}
                disabledUp={index === 0 || pending}
                disabledDown={index === daftar.length - 1 || pending}
                onUp={() => pindah(index, 'up')}
                onDown={() => pindah(index, 'down')}
              />
              <IkonTipeFile url={l.url_file} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{l.judul_id}</p>
                {l.deskripsi_id ? (
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{l.deskripsi_id}</p>
                ) : null}
              </div>
              <LampiranRowActions lampiranId={l.id} judul={l.judul_id} onUbah={() => bukaUbah(l)} />
            </li>
          ))}
        </ul>
      )}

      <LampiranFormDialog
        key={`${dialogSession}-${editing?.id ?? 'baru'}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        chapterId={chapterId}
        lampiranId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
      />
    </div>
  );
}
