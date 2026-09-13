'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { SaleBannerRowActions } from './sale-banner-row-actions';
import { SaleBannerActiveSwitch } from './sale-banner-active-switch';
import { SaleBannerFormDialog } from './sale-banner-form-dialog';
import type { SaleBannerFormInput } from '@/lib/validations/sale-banner-admin';
import type { Database } from '@/types/database';

type SaleBanner = Database['public']['Tables']['sale_banners']['Row'];

function keDefaultValues(b: SaleBanner): SaleBannerFormInput {
  return {
    judul_id: b.judul_id,
    judul_en: b.judul_en ?? '',
    teks_id: b.teks_id ?? '',
    teks_en: b.teks_en ?? '',
    urgensi_id: b.urgensi_id ?? '',
    urgensi_en: b.urgensi_en ?? '',
    tombol_teks_id: b.tombol_teks_id ?? '',
    tombol_teks_en: b.tombol_teks_en ?? '',
    tombol_url: b.tombol_url ?? '',
    tayang_mulai: b.tayang_mulai,
    tayang_selesai: b.tayang_selesai,
    is_active: b.is_active,
  };
}

const columnHelper = createDataTableColumnHelper<SaleBanner>();

export function SaleBannerList({ banners, judul }: { banners: SaleBanner[]; judul: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SaleBanner | null>(null);

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(banner: SaleBanner) {
    setEditing(banner);
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
      cell: ({ row }) => <SaleBannerActiveSwitch bannerId={row.original.id} aktif={row.original.is_active} />,
    }),
    columnHelper.display({
      id: 'aksi',
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <SaleBannerRowActions
            bannerId={row.original.id}
            judul={row.original.judul_id}
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
          <PlusIcon className="size-4" /> Tambah Sale Banner
        </button>
      </div>

      <DataTable
        columns={columns}
        data={banners}
        getRowId={(row) => String(row.id)}
        searchColumnId="judul_id"
        searchPlaceholder="Cari judul banner..."
        emptyMessage="Belum ada sale banner."
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

      <SaleBannerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bannerId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
      />
    </div>
  );
}
