'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HeroSlideRowActions } from './hero-slide-row-actions';
import { HeroSlideActiveSwitch } from './hero-slide-active-switch';
import { HeroSlideFormDialog } from './hero-slide-form-dialog';
import type { HeroSlideFormInput } from '@/lib/validations/hero-slide-admin';
import type { Database } from '@/types/database';

type HeroSlide = Database['public']['Tables']['hero_slides']['Row'];

function keDefaultValues(s: HeroSlide): HeroSlideFormInput {
  return {
    judul_id: s.judul_id,
    judul_en: s.judul_en ?? '',
    subjudul_id: s.subjudul_id ?? '',
    subjudul_en: s.subjudul_en ?? '',
    gambar_url: s.gambar_url ?? '',
    cta_teks_id: s.cta_teks_id ?? '',
    cta_teks_en: s.cta_teks_en ?? '',
    cta_url: s.cta_url ?? '',
    urutan: s.urutan,
    is_active: s.is_active,
  };
}

export function HeroSlideList({ slides }: { slides: HeroSlide[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(slide: HeroSlide) {
    setEditing(slide);
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
          <PlusIcon className="size-4" /> Tambah Hero Slide
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-warna-latar-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-warna-teks-2">
                  Belum ada hero slide.
                </TableCell>
              </TableRow>
            ) : (
              slides.map((slide) => (
                <TableRow key={slide.id}>
                  <TableCell className="font-medium text-warna-teks">{slide.judul_id}</TableCell>
                  <TableCell>{slide.urutan}</TableCell>
                  <TableCell>
                    <HeroSlideActiveSwitch slideId={slide.id} aktif={slide.is_active} />
                  </TableCell>
                  <TableCell className="text-right">
                    <HeroSlideRowActions
                      slideId={slide.id}
                      judul={slide.judul_id}
                      onUbah={() => bukaUbah(slide)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <HeroSlideFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        slideId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
      />
    </div>
  );
}
