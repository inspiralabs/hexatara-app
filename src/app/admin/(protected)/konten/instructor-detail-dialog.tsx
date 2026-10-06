'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Database } from '@/types/database';

type Instructor = Database['public']['Tables']['instructors']['Row'];

function Baris({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm whitespace-pre-wrap break-words text-foreground">{value || '—'}</dd>
    </div>
  );
}

export function InstructorDetailDialog({ instructor }: { instructor: Instructor }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>Detail</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail instruktur</DialogTitle>
        </DialogHeader>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[12rem] overflow-hidden rounded-lg border border-border bg-muted">
          {instructor.foto_url ? (
            <Image
              src={instructor.foto_url}
              alt=""
              fill
              className="object-cover object-top"
              sizes="192px"
            />
          ) : null}
        </div>
        <dl className="pr-6">
          <Baris label="Nama" value={instructor.nama} />
          <Baris label="Jabatan (ID)" value={instructor.jabatan_id ?? ''} />
          <Baris label="Jabatan (EN)" value={instructor.jabatan_en ?? ''} />
          <Baris label="Catatan" value={instructor.bio_id ?? ''} />
          <Baris label="Status" value={instructor.is_active ? 'Aktif' : 'Nonaktif'} />
          <Baris label="Urutan" value={String(instructor.urutan)} />
        </dl>
      </DialogContent>
    </Dialog>
  );
}
