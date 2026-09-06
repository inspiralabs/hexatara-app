'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PopupRowActions } from './popup-row-actions';
import { PopupActiveSwitch } from './popup-active-switch';
import { PopupFormDialog } from './popup-form-dialog';
import type { PopupFormInput } from '@/lib/validations/popup-admin';
import type { Database } from '@/types/database';

type Popup = Database['public']['Tables']['popups']['Row'];

function keDefaultValues(p: Popup): PopupFormInput {
  return {
    judul_id: p.judul_id,
    judul_en: p.judul_en ?? '',
    isi_id: p.isi_id,
    isi_en: p.isi_en ?? '',
    gambar_url: p.gambar_url ?? '',
    cta_teks_id: p.cta_teks_id ?? '',
    cta_teks_en: p.cta_teks_en ?? '',
    cta_url: p.cta_url ?? '',
    tayang_mulai: p.tayang_mulai,
    tayang_selesai: p.tayang_selesai,
    is_active: p.is_active,
  };
}

export function PopupList({ popups }: { popups: Popup[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Popup | null>(null);

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(popup: Popup) {
    setEditing(popup);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={bukaTambah}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          <PlusIcon className="size-4" /> Tambah Pop-up
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-warna-latar-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Tayang</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {popups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-warna-teks-2">
                  Belum ada pop-up.
                </TableCell>
              </TableRow>
            ) : (
              popups.map((popup) => (
                <TableRow key={popup.id}>
                  <TableCell className="font-medium text-warna-teks">{popup.judul_id}</TableCell>
                  <TableCell>
                    {popup.tayang_mulai || popup.tayang_selesai
                      ? `${popup.tayang_mulai ?? '…'} – ${popup.tayang_selesai ?? '…'}`
                      : 'Tanpa batas'}
                  </TableCell>
                  <TableCell>
                    <PopupActiveSwitch popupId={popup.id} aktif={popup.is_active} />
                  </TableCell>
                  <TableCell className="text-right">
                    <PopupRowActions popupId={popup.id} judul={popup.judul_id} onUbah={() => bukaUbah(popup)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PopupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        popupId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
      />
    </div>
  );
}
