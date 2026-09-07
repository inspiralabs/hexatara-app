'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InstructorRowActions } from './instructor-row-actions';
import { InstructorActiveSwitch } from './instructor-active-switch';
import { InstructorFormDialog } from './instructor-form-dialog';
import type { InstructorFormInput } from '@/lib/validations/instructor-admin';
import type { Database } from '@/types/database';

type Instructor = Database['public']['Tables']['instructors']['Row'];

function keDefaultValues(i: Instructor): InstructorFormInput {
  return {
    nama: i.nama,
    jabatan_id: i.jabatan_id ?? '',
    jabatan_en: i.jabatan_en ?? '',
    bio_id: i.bio_id ?? '',
    bio_en: i.bio_en ?? '',
    foto_url: i.foto_url ?? '',
    urutan: i.urutan,
    is_active: i.is_active,
  };
}

export function InstructorList({ instructors }: { instructors: Instructor[] }) {
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

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={bukaTambah}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          <PlusIcon className="size-4" /> Tambah Instruktur
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
            {instructors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-warna-teks-2">
                  Belum ada instruktur.
                </TableCell>
              </TableRow>
            ) : (
              instructors.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell className="font-medium text-warna-teks">{instructor.nama}</TableCell>
                  <TableCell>{instructor.urutan}</TableCell>
                  <TableCell>
                    <InstructorActiveSwitch instructorId={instructor.id} aktif={instructor.is_active} />
                  </TableCell>
                  <TableCell className="text-right">
                    <InstructorRowActions
                      instructorId={instructor.id}
                      nama={instructor.nama}
                      onUbah={() => bukaUbah(instructor)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InstructorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        instructorId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
      />
    </div>
  );
}
