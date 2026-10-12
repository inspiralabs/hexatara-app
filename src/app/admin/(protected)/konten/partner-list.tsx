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
import { PartnerRowActions } from './partner-row-actions';
import { PartnerActiveSwitch } from './partner-active-switch';
import { PartnerFormDialog } from './partner-form-dialog';
import { reorderPartnerAction } from './partner-actions';
import type { PartnerFormInput } from '@/lib/validations/partner-admin';
import type { Database } from '@/types/database';

type Partner = Database['public']['Tables']['partners']['Row'];

const STATUS_SEMUA = 'semua';

function keDefaultValues(p: Partner): PartnerFormInput {
  return {
    nama: p.nama,
    logo_url: p.logo_url,
    is_active: p.is_active,
  };
}

export function PartnerList({
  partners,
  judul,
}: {
  partners: Partner[];
  judul: string;
}) {
  const { daftar, pending, pindah } = useReorderList(partners, reorderPartnerAction, 'Urutan partner berhasil diubah.');
  const [cari, setCari] = useState('');
  const [status, setStatus] = useState(STATUS_SEMUA);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);

  const terfilter = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return daftar.filter((p) => {
      if (q && !p.nama.toLowerCase().includes(q)) return false;
      if (status !== STATUS_SEMUA && String(p.is_active) !== status) return false;
      return true;
    });
  }, [daftar, cari, status]);

  const filterAktif = Boolean(cari.trim()) || status !== STATUS_SEMUA;

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(partner: Partner) {
    setEditing(partner);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">{judul}</h1>
        <Button type="button" className="h-11 shrink-0 px-5" onClick={bukaTambah}>
          <PlusIcon className="size-4" /> Tambah Partner
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari nama partner..."
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
              <TableHead>Logo</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Aksi</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terfilter.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Belum ada partner.
                </TableCell>
              </TableRow>
            ) : (
              terfilter.map((row) => {
                const indexPenuh = daftar.findIndex((p) => p.id === row.id);
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
                      <div className="relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-white">
                        {row.logo_url ? (
                          <Image src={row.logo_url} alt="" fill className="object-contain p-1" sizes="64px" />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{row.nama}</TableCell>
                    <TableCell>
                      <PartnerActiveSwitch partnerId={row.id} aktif={row.is_active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PartnerRowActions partnerId={row.id} nama={row.nama} onUbah={() => bukaUbah(row)} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <PartnerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        partnerId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
      />
    </div>
  );
}
