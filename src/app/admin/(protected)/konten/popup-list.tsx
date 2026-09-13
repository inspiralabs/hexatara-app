'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
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
    gambar_mobile_url: p.gambar_mobile_url ?? '',
    gambar_desktop_url: p.gambar_desktop_url ?? '',
    cta_url: p.cta_url ?? '',
    tayang_mulai: p.tayang_mulai,
    tayang_selesai: p.tayang_selesai,
    is_active: p.is_active,
  };
}

const columnHelper = createDataTableColumnHelper<Popup>();

export function PopupList({ popups, judul }: { popups: Popup[]; judul: string }) {
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

  const columns = [
    columnHelper.accessor('judul_id', {
      header: (ctx) => <SortableHeader column={ctx.column} label="Judul" />,
      cell: (info) => <span className="font-medium text-warna-teks">{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: 'tayang',
      header: 'Tayang',
      cell: ({ row }) =>
        row.original.tayang_mulai || row.original.tayang_selesai
          ? `${row.original.tayang_mulai ?? '…'} – ${row.original.tayang_selesai ?? '…'}`
          : 'Tanpa batas',
    }),
    columnHelper.accessor((row) => String(row.is_active), {
      id: 'is_active',
      header: 'Aktif',
      filterFn: 'equalsString',
      enableSorting: false,
      cell: ({ row }) => <PopupActiveSwitch popupId={row.original.id} aktif={row.original.is_active} />,
    }),
    columnHelper.display({
      id: 'aksi',
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <PopupRowActions popupId={row.original.id} judul={row.original.judul_id} onUbah={() => bukaUbah(row.original)} />
        </div>
      ),
    }),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-warna-teks">{judul}</h1>
        <button
          type="button"
          onClick={bukaTambah}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          <PlusIcon className="size-4" /> Tambah Pop-up
        </button>
      </div>

      <DataTable
        columns={columns}
        data={popups}
        getRowId={(row) => String(row.id)}
        searchColumnId="judul_id"
        searchPlaceholder="Cari judul pop-up..."
        emptyMessage="Belum ada pop-up."
        columnFilters={[
          {
            id: 'is_active',
            label: 'Aktif',
            options: [
              { value: 'true', label: 'Aktif' },
              { value: 'false', label: 'Nonaktif' },
            ],
          },
        ]}
      />

      <PopupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        popupId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
      />
    </div>
  );
}
