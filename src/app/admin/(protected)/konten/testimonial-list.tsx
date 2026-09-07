'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export function TestimonialList({ testimonials }: { testimonials: Testimonial[] }) {
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

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={bukaTambah}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          <PlusIcon className="size-4" /> Tambah Testimoni
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-warna-latar-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-warna-teks-2">
                  Belum ada testimoni.
                </TableCell>
              </TableRow>
            ) : (
              testimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell className="font-medium text-warna-teks">{testimonial.nama}</TableCell>
                  <TableCell>{testimonial.urutan}</TableCell>
                  <TableCell>
                    <TestimonialActiveSwitch testimonialId={testimonial.id} aktif={testimonial.is_active} />
                  </TableCell>
                  <TableCell className="text-right">
                    <TestimonialRowActions
                      testimonialId={testimonial.id}
                      nama={testimonial.nama}
                      onUbah={() => bukaUbah(testimonial)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TestimonialFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        testimonialId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
      />
    </div>
  );
}
