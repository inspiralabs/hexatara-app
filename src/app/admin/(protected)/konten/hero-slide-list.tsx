'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { moveItem } from '@/lib/reorder';
import { HeroCarousel } from '@/components/hero-carousel';
import { HeroSlideRowActions } from './hero-slide-row-actions';
import { HeroSlideActiveSwitch } from './hero-slide-active-switch';
import { HeroSlideFormDialog } from './hero-slide-form-dialog';
import { reorderHeroSlideAction } from './hero-slide-actions';
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
    cta_url: s.cta_url ?? '',
    urutan: s.urutan,
    is_active: s.is_active,
  };
}

export function HeroSlideList({ slides }: { slides: HeroSlide[] }) {
  const router = useRouter();
  const [daftar, setDaftar] = useState(slides);
  // Setelah router.refresh(), Server Component ini re-fetch dan mengirim
  // `slides` baru sebagai prop — tapi useState hanya memakai initial value
  // SEKALI saat mount, jadi tanpa efek ini daftar lokal tetap basi sampai
  // reload manual.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaftar(slides);
  }, [slides]);
  const [pending, startTransition] = useTransition();
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

  function pindah(index: number, arah: 'up' | 'down') {
    const baru = moveItem(daftar, index, arah);
    if (baru === daftar) return;
    setDaftar(baru);
    startTransition(async () => {
      const hasil = await reorderHeroSlideAction(baru.map((s) => s.id));
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        setDaftar(daftar);
        return;
      }
      toast.success('Urutan hero slide berhasil diubah.');
      router.refresh();
    });
  }

  const previewSlides = daftar
    .filter((s) => s.is_active)
    .map((s) => ({
      id: s.id,
      judul: s.judul_id,
      subjudul: s.subjudul_id,
      gambarUrl: s.gambar_url,
      ctaUrl: s.cta_url,
    }));

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-muted-foreground">Preview carousel (yang aktif, sesuai urutan)</p>
        {previewSlides.length > 0 ? (
          <div className="max-w-md">
            <HeroCarousel slides={previewSlides} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada slide aktif untuk dipratinjau.</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="button" className="h-11 px-5" onClick={bukaTambah}>
          <PlusIcon className="size-4" /> Tambah Hero Slide
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Urutan</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {daftar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Belum ada hero slide.
                </TableCell>
              </TableRow>
            ) : (
              daftar.map((slide, index) => (
                <TableRow key={slide.id}>
                  <TableCell>
                    <ReorderButtons
                      label={slide.judul_id}
                      disabledUp={index === 0 || pending}
                      disabledDown={index === daftar.length - 1 || pending}
                      onUp={() => pindah(index, 'up')}
                      onDown={() => pindah(index, 'down')}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{slide.judul_id}</TableCell>
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
