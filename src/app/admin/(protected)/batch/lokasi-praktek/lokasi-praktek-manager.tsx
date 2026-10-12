'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, MoreVerticalIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  PracticeLocationFormSchema,
  type PracticeLocationFormInput,
} from '@/lib/validations/practice-location-admin';
import {
  hapusLokasiPraktekAction,
  reorderLokasiPraktekAction,
  simpanLokasiPraktekAction,
  toggleAktifLokasiPraktekAction,
} from './actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { useReorderList } from '@/components/admin/use-reorder-list';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Database } from '@/types/database';

type Lokasi = Database['public']['Tables']['practice_locations']['Row'];

const DEFAULT_VALUES: PracticeLocationFormInput = {
  nama_kota: '',
  is_active: true,
};

function keDefaultValues(l: Lokasi): PracticeLocationFormInput {
  return {
    nama_kota: l.nama_kota,
    is_active: l.is_active,
  };
}

export function LokasiPraktekManager({ items }: { items: Lokasi[] }) {
  const router = useRouter();
  const {
    daftar,
    setDaftar,
    pending: reorderPending,
    pindah,
  } = useReorderList(items, reorderLokasiPraktekAction, 'Urutan lokasi praktek berhasil diubah.');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lokasi | null>(null);
  const [hapusTarget, setHapusTarget] = useState<Lokasi | null>(null);
  const [hapusPending, startHapus] = useTransition();
  const [, startToggle] = useTransition();

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(l: Lokasi) {
    setEditing(l);
    setDialogOpen(true);
  }

  function toggleAktif(l: Lokasi, next: boolean) {
    setDaftar((prev) => prev.map((item) => (item.id === l.id ? { ...item, is_active: next } : item)));
    startToggle(async () => {
      const hasil = await toggleAktifLokasiPraktekAction(l.id, next);
      if (!hasil.ok) {
        setDaftar((prev) => prev.map((item) => (item.id === l.id ? { ...item, is_active: !next } : item)));
        toast.error(hasil.pesan ?? 'Gagal mengubah status. Coba lagi.');
        return;
      }
      toast.success('Status berhasil diubah.');
      router.refresh();
    });
  }

  function konfirmasiHapus() {
    if (!hapusTarget) return;
    startHapus(async () => {
      const hasil = await hapusLokasiPraktekAction(hapusTarget.id);
      if (!hasil.ok) {
        toast.error(hasil.pesan ?? 'Gagal menghapus. Coba lagi.');
        return;
      }
      setDaftar((prev) => prev.filter((item) => item.id !== hapusTarget.id));
      setHapusTarget(null);
      toast.success('Lokasi praktek berhasil dihapus.');
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Lokasi Praktek</h1>
        <Button type="button" className="h-11 px-5" onClick={bukaTambah}>
          <PlusIcon className="size-4" /> Tambah Kota
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Urutan</TableHead>
              <TableHead>Kota</TableHead>
              <TableHead className="w-28">Status aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {daftar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Belum ada kota. Tambah kota praktek pertama.
                </TableCell>
              </TableRow>
            ) : (
              daftar.map((l, index) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <ReorderButtons
                      label={l.nama_kota}
                      disabledUp={index === 0 || reorderPending}
                      disabledDown={index === daftar.length - 1 || reorderPending}
                      onUp={() => pindah(l.id, 'up')}
                      onDown={() => pindah(l.id, 'down')}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{l.nama_kota}</TableCell>
                  <TableCell>
                    <Switch
                      checked={l.is_active}
                      onCheckedChange={(next) => toggleAktif(l, next)}
                      aria-label={`Aktifkan ${l.nama_kota}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" aria-label={`Aksi untuk ${l.nama_kota}`} />}
                      >
                        <MoreVerticalIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem variant="edit" onClick={() => bukaUbah(l)}>
                          Ubah
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setHapusTarget(l)}>
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LokasiFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
        onSaved={() => router.refresh()}
      />

      <AlertDialog open={hapusTarget != null} onOpenChange={(open) => !open && setHapusTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kota &quot;{hapusTarget?.nama_kota}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Kota yang sudah dipakai pendaftar tidak bisa dihapus — nonaktifkan saja. Tindakan ini tidak bisa
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={konfirmasiHapus} disabled={hapusPending}>
              {hapusPending ? 'Menghapus…' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LokasiFormDialog({
  open,
  onOpenChange,
  editingId,
  defaultValues,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: number | null;
  defaultValues: PracticeLocationFormInput | null;
  onSaved: () => void;
}) {
  const form = useForm<PracticeLocationFormInput>({
    resolver: zodResolver(PracticeLocationFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    if (open) {
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingId]);

  async function onSubmit(data: PracticeLocationFormInput) {
    const hasil = await simpanLokasiPraktekAction(editingId, data);
    if (!hasil.ok) {
      toast.error(hasil.pesan ?? 'Gagal menyimpan. Coba lagi.');
      return;
    }
    toast.success('Lokasi praktek berhasil disimpan.');
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingId == null ? 'Tambah Kota' : 'Ubah Kota'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={control}
              name="nama_kota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama kota *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Aktif</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} className="h-11 px-6">
                {isSubmitting ? 'Menyimpan…' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" className="h-11 px-6" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
