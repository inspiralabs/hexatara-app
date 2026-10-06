'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlusIcon } from 'lucide-react';
import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { PartnerRowActions } from './partner-row-actions';
import { PartnerActiveSwitch } from './partner-active-switch';
import { PartnerFormDialog } from './partner-form-dialog';
import type { PartnerFormInput } from '@/lib/validations/partner-admin';
import type { Database } from '@/types/database';

type Partner = Database['public']['Tables']['partners']['Row'];

function keDefaultValues(p: Partner): PartnerFormInput {
  return {
    nama: p.nama,
    logo_url: p.logo_url,
    urutan: p.urutan,
    is_active: p.is_active,
  };
}

const columnHelper = createDataTableColumnHelper<Partner>();

export function PartnerList({
  partners,
  judul,
}: {
  partners: Partner[];
  judul: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(partner: Partner) {
    setEditing(partner);
    setDialogOpen(true);
  }

  const columns = [
    columnHelper.display({
      id: 'logo',
      header: 'Logo',
      cell: ({ row }) => {
        const url = row.original.logo_url;
        return (
          <div className="relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-white">
            {url ? (
              <Image src={url} alt="" fill className="object-contain p-1" sizes="64px" />
            ) : null}
          </div>
        );
      },
    }),
    columnHelper.accessor('nama', {
      header: (ctx) => <SortableHeader column={ctx.column} label="Nama" />,
      cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor('urutan', {
      header: (ctx) => <SortableHeader column={ctx.column} label="Urutan" />,
    }),
    columnHelper.accessor((row) => String(row.is_active), {
      id: 'is_active',
      header: 'Aktif',
      filterFn: 'equalsString',
      enableSorting: false,
      cell: ({ row }) => <PartnerActiveSwitch partnerId={row.original.id} aktif={row.original.is_active} />,
    }),
    columnHelper.display({
      id: 'aksi',
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <PartnerRowActions
            partnerId={row.original.id}
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
          <PlusIcon className="size-4" /> Tambah Partner
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={partners}
        getRowId={(row) => String(row.id)}
        searchColumnId="nama"
        searchPlaceholder="Cari nama partner..."
        emptyMessage="Belum ada partner."
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

      <PartnerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        partnerId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
      />
    </div>
  );
}
