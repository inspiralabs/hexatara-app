'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { PlusIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { useReorderList } from '@/components/admin/use-reorder-list';
import { InstructorRowActions } from './instructor-row-actions';
import { InstructorActiveSwitch } from './instructor-active-switch';
import { InstructorFormDialog } from './instructor-form-dialog';
import { InstructorDetailDialog } from './instructor-detail-dialog';
import { InstructorPortraitBadge } from './instructor-portrait-badge';
import { reorderInstructorAction } from './instructor-actions';
import type { InstructorFormInput } from '@/lib/validations/instructor-admin';
import type { Database } from '@/types/database';

type Instructor = Database['public']['Tables']['instructors']['Row'];

const STATUS_SEMUA = 'semua';

function keDefaultValues(i: Instructor): InstructorFormInput {
  return {
    nama: i.nama,
    jabatan_id: i.jabatan_id ?? '',
    jabatan_en: i.jabatan_en ?? '',
    bio_id: i.bio_id ?? '',
    foto_url: i.foto_url ?? '',
    is_active: i.is_active,
  };
}

function potong(teks: string | null, maks = 48) {
  if (!teks) return '—';
  const t = teks.trim();
  if (t.length <= maks) return t;
  return `${t.slice(0, maks - 1)}…`;
}

export function InstructorList({
  instructors,
  judul,
}: {
  instructors: Instructor[];
  judul: string;
}) {
  const { daftar, pending, pindah } = useReorderList(
    instructors,
    reorderInstructorAction,
    'Urutan instruktur berhasil diubah.'
  );
  const [cari, setCari] = useState('');
  const [status, setStatus] = useState(STATUS_SEMUA);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Instructor | null>(null);

  const terfilter = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return daftar.filter((i) => {
      if (q && !i.nama.toLowerCase().includes(q)) return false;
      if (status !== STATUS_SEMUA && String(i.is_active) !== status) return false;
      return true;
    });
  }, [daftar, cari, status]);

  const filterAktif = Boolean(cari.trim()) || status !== STATUS_SEMUA;

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(instructor: Instructor) {
    setEditing(instructor);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">{judul}</h1>
        <Button type="button" className="h-11 shrink-0 px-5" onClick={bukaTambah}>
          <PlusIcon className="size-4" /> Tambah Instruktur
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari nama instruktur..."
          className="h-11 w-full max-w-sm sm:w-56"
        />
        <Select value={status} onValueChange={(v: string | null) => setStatus(v ?? STATUS_SEMUA)}>
          <SelectTrigger className="h-11 w-full sm:w-44" aria-label="Aktif">
            <SelectValue placeholder="Aktif">
              {status === STATUS_SEMUA ? 'Aktif: Semua' : status === 'true' ? 'Aktif' : 'Nonaktif'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={STATUS_SEMUA}>Semua</SelectItem>
            <SelectItem value="true">Aktif</SelectItem>
            <SelectItem value="false">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Urutan</TableHead>
              <TableHead>Foto</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Catatan</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Aksi</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terfilter.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Belum ada instruktur.
                </TableCell>
              </TableRow>
            ) : (
              terfilter.map((row) => {
                const indexPenuh = daftar.findIndex((i) => i.id === row.id);
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <ReorderButtons
                        label={row.nama}
                        disabledUp={indexPenuh <= 0 || pending || filterAktif}
                        disabledDown={
                          indexPenuh < 0 || indexPenuh >= daftar.length - 1 || pending || filterAktif
                        }
                        onUp={() => pindah(row.id, 'up')}
                        onDown={() => pindah(row.id, 'down')}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="relative aspect-[4/5] h-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                          {row.foto_url ? (
                            <Image src={row.foto_url} alt="" fill className="object-cover object-top" sizes="56px" />
                          ) : null}
                        </div>
                        {row.foto_url ? <InstructorPortraitBadge key={row.foto_url} src={row.foto_url} /> : null}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{row.nama}</TableCell>
                    <TableCell>
                      <span className="block max-w-[14rem] truncate text-sm text-muted-foreground" title={row.bio_id ?? ''}>
                        {potong(row.bio_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <InstructorActiveSwitch instructorId={row.id} aktif={row.is_active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <InstructorDetailDialog instructor={row} />
                        <InstructorRowActions instructorId={row.id} nama={row.nama} onUbah={() => bukaUbah(row)} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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
