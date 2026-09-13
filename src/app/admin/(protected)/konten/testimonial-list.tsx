'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { TestimonialRowActions } from './testimonial-row-actions';
import { TestimonialActiveSwitch } from './testimonial-active-switch';
import { TestimonialFormDialog } from './testimonial-form-dialog';
import type { TestimonialFormInput } from '@/lib/validations/testimonial-admin';
import type { Database } from '@/types/database';

type Testimonial = Database['public']['Tables']['testimonials']['Row'];

function keDefaultValues(t: Testimonial): TestimonialFormInput {
  return {
    nama: t.nama,
    peran_id: t.peran_id ?? '',
    peran_en: t.peran_en ?? '',
    isi_id: t.isi_id,
    isi_en: t.isi_en ?? '',
    foto_url: t.foto_url ?? '',
    urutan: t.urutan,
    is_active: t.is_active,
  };
}

const columnHelper = createDataTableColumnHelper<Testimonial>();

export function TestimonialList({
  testimonials,
  judul,
}: {
  testimonials: Testimonial[];
  judul: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(testimonial: Testimonial) {
    setEditing(testimonial);
    setDialogOpen(true);
  }

  const columns = [
    columnHelper.accessor('nama', {
      header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
      cell: (info) => <span className="font-medium text-warna-teks">{info.getValue()}</span>,
    }),
    columnHelper.accessor('urutan', {
      header: (ctx) => <SortableHeader column={ctx.column} label="Urutan" />,
    }),
    columnHelper.accessor((row) => String(row.is_active), {
      id: 'is_active',
      header: 'Aktif',
      filterFn: 'equalsString',
      enableSorting: false,
      cell: ({ row }) => <TestimonialActiveSwitch testimonialId={row.original.id} aktif={row.original.is_active} />,
    }),
    columnHelper.display({
      id: 'aksi',
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <TestimonialRowActions
            testimonialId={row.original.id}
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
        <h1 className="text-xl font-bold text-warna-teks">{judul}</h1>
        <button
          type="button"
          onClick={bukaTambah}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          <PlusIcon className="size-4" /> Tambah Testimoni
        </button>
      </div>

      <DataTable
        columns={columns}
        data={testimonials}
        getRowId={(row) => String(row.id)}
        searchColumnId="nama"
        searchPlaceholder="Cari nama..."
        emptyMessage="Belum ada testimoni."
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

      <TestimonialFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        testimonialId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
      />
    </div>
  );
}
