'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlusIcon } from 'lucide-react';
import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { InstructorRowActions } from './instructor-row-actions';
import { InstructorActiveSwitch } from './instructor-active-switch';
import { InstructorFormDialog } from './instructor-form-dialog';
import { InstructorDetailDialog } from './instructor-detail-dialog';
import { InstructorPortraitBadge } from './instructor-portrait-badge';
import type { InstructorFormInput } from '@/lib/validations/instructor-admin';
import type { Database } from '@/types/database';

type Instructor = Database['public']['Tables']['instructors']['Row'];

function keDefaultValues(i: Instructor): InstructorFormInput {
  return {
    nama: i.nama,
    jabatan_id: i.jabatan_id ?? '',
    jabatan_en: i.jabatan_en ?? '',
    bio_id: i.bio_id ?? '',
    foto_url: i.foto_url ?? '',
    urutan: i.urutan,
    is_active: i.is_active,
  };
}

function potong(teks: string | null, maks = 48) {
  if (!teks) return '—';
  const t = teks.trim();
  if (t.length <= maks) return t;
  return `${t.slice(0, maks - 1)}…`;
}

const columnHelper = createDataTableColumnHelper<Instructor>();

export function InstructorList({
  instructors,
  judul,
}: {
  instructors: Instructor[];
  judul: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Instructor | null>(null);

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(instructor: Instructor) {
    setEditing(instructor);
    setDialogOpen(true);
  }

  const columns = [
    columnHelper.display({
      id: 'foto',
      header: 'Foto',
      cell: ({ row }) => {
        const url = row.original.foto_url;
        return (
          <div className="flex items-center gap-2">
            <div className="relative aspect-[4/5] h-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
              {url ? (
                <Image src={url} alt="" fill className="object-cover object-top" sizes="56px" />
              ) : null}
            </div>
            {url ? <InstructorPortraitBadge key={url} src={url} /> : null}
          </div>
        );
      },
    }),
    columnHelper.accessor('nama', {
      header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
      cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => row.bio_id ?? '', {
      id: 'catatan',
      header: 'Catatan',
      cell: (info) => (
        <span className="block max-w-[14rem] truncate text-sm text-muted-foreground" title={info.getValue()}>
          {potong(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('urutan', {
      header: (ctx) => <SortableHeader column={ctx.column} label="Urutan" />,
    }),
    columnHelper.accessor((row) => String(row.is_active), {
      id: 'is_active',
      header: 'Aktif',
      filterFn: 'equalsString',
      enableSorting: false,
      cell: ({ row }) => <InstructorActiveSwitch instructorId={row.original.id} aktif={row.original.is_active} />,
    }),
    columnHelper.display({
      id: 'aksi',
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <InstructorDetailDialog instructor={row.original} />
          <InstructorRowActions
            instructorId={row.original.id}
            nama={row.original.nama}
            onUbah={() => bukaUbah(row.original)}
          />
        </div>
      ),
    }),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">{judul}</h1>
        <Button type="button" className="h-11 shrink-0 px-5" onClick={bukaTambah}>
          <PlusIcon className="size-4" /> Tambah Instruktur
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={instructors}
        getRowId={(row) => String(row.id)}
        searchColumnId="nama"
        searchPlaceholder="Cari nama instruktur..."
        emptyMessage="Belum ada instruktur."
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

      <InstructorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        instructorId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
      />
    </div>
  );
}
