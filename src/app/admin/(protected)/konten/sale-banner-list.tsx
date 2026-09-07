'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export function SaleBannerList({ banners }: { banners: SaleBanner[] }) {
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

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={bukaTambah}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          <PlusIcon className="size-4" /> Tambah Sale Banner
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
            {banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-warna-teks-2">
                  Belum ada sale banner.
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell className="font-medium text-warna-teks">{banner.judul_id}</TableCell>
                  <TableCell>
                    {banner.tayang_mulai || banner.tayang_selesai
                      ? `${banner.tayang_mulai ?? '…'} – ${banner.tayang_selesai ?? '…'}`
                      : 'Tanpa batas'}
                  </TableCell>
                  <TableCell>
                    <SaleBannerActiveSwitch bannerId={banner.id} aktif={banner.is_active} />
                  </TableCell>
                  <TableCell className="text-right">
                    <SaleBannerRowActions
                      bannerId={banner.id}
                      judul={banner.judul_id}
                      onUbah={() => bukaUbah(banner)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SaleBannerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bannerId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
      />
    </div>
  );
}
