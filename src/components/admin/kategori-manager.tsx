'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, MoreVerticalIcon } from 'lucide-react';
import { KategoriFormSchema, type KategoriFormInput } from '@/lib/validations/kategori-admin';
import { moveItem } from '@/lib/reorder';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

export type KategoriRow = {
  id: string;
  nama_id: string;
  nama_en: string | null;
  urutan: number;
  is_active: boolean;
};

type ActionResult = { ok: boolean; pesan?: string };

const DEFAULT_VALUES: KategoriFormInput = { nama_id: '', nama_en: '' };

function keDefaultValues(k: KategoriRow): KategoriFormInput {
  return { nama_id: k.nama_id, nama_en: k.nama_en ?? '' };
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function KategoriManager({
  judul,
  items,
  simpanAction,
  hapusAction,
  reorderAction,
  toggleAktifAction,
}: {
  judul: string;
  items: KategoriRow[];
  simpanAction: (id: string | null, input: KategoriFormInput) => Promise<ActionResult>;
  hapusAction: (id: string) => Promise<ActionResult>;
  reorderAction: (ids: string[]) => Promise<ActionResult>;
  toggleAktifAction: (id: string, next: boolean) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [daftar, setDaftar] = useState(items);
  // Setelah router.refresh(), Server Component ini re-fetch dan mengirim `items`
  // baru sebagai prop — tapi useState hanya memakai initial value SEKALI saat
  // mount, jadi tanpa efek ini daftar lokal tetap basi sampai reload manual.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaftar(items);
  }, [items]);
  const [pending, startTransition] = useTransition();
  const [pesanError, setPesanError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<KategoriRow | null>(null);
  const [hapusTarget, setHapusTarget] = useState<KategoriRow | null>(null);
  const [hapusPending, startHapus] = useTransition();
  const [hapusError, setHapusError] = useState<string | null>(null);

  function bukaTambah() {
    setEditing(null);
    setDialogOpen(true);
  }

  function bukaUbah(k: KategoriRow) {
    setEditing(k);
    setDialogOpen(true);
  }

  function pindah(index: number, arah: 'up' | 'down') {
    const baru = moveItem(daftar, index, arah);
    if (baru === daftar) return;
    setPesanError(null);
    setDaftar(baru);
    startTransition(async () => {
      const hasil = await reorderAction(baru.map((k) => k.id));
      if (!hasil.ok) {
        setPesanError(hasil.pesan ?? 'Gagal mengubah urutan. Coba lagi.');
        setDaftar(daftar);
        return;
      }
      router.refresh();
    });
  }

  function toggleAktif(k: KategoriRow, next: boolean) {
    setDaftar((prev) => prev.map((item) => (item.id === k.id ? { ...item, is_active: next } : item)));
    startTransition(async () => {
      const hasil = await toggleAktifAction(k.id, next);
      if (!hasil.ok) {
        setDaftar((prev) => prev.map((item) => (item.id === k.id ? { ...item, is_active: !next } : item)));
        return;
      }
      router.refresh();
    });
  }

  function konfirmasiHapus() {
    if (!hapusTarget) return;
    startHapus(async () => {
      const hasil = await hapusAction(hapusTarget.id);
      if (!hasil.ok) {
        setHapusError(hasil.pesan ?? 'Gagal menghapus. Coba lagi.');
        return;
      }
      setDaftar((prev) => prev.filter((item) => item.id !== hapusTarget.id));
      setHapusTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-warna-teks">{judul}</h1>
        <button
          type="button"
          onClick={bukaTambah}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          <PlusIcon className="size-4" /> Tambah Kategori
        </button>
      </div>

      {pesanError && <p className="text-sm text-destructive">{pesanError}</p>}

      <div className="overflow-x-auto rounded-lg border border-warna-latar-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Urutan</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {daftar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-warna-teks-2">
                  Belum ada kategori. Tambah kategori pertama untuk mulai mengisi filter publik.
                </TableCell>
              </TableRow>
            ) : (
              daftar.map((k, index) => (
                <TableRow key={k.id}>
                  <TableCell>
                    <ReorderButtons
                      label={k.nama_id}
                      disabledUp={index === 0 || pending}
                      disabledDown={index === daftar.length - 1 || pending}
                      onUp={() => pindah(index, 'up')}
                      onDown={() => pindah(index, 'down')}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-warna-teks">{k.nama_id}</TableCell>
                  <TableCell>
                    <Switch
                      checked={k.is_active}
                      onCheckedChange={(next) => toggleAktif(k, next)}
                      aria-label={`Aktifkan kategori ${k.nama_id}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" aria-label={`Aksi untuk kategori ${k.nama_id}`} />}
                      >
                        <MoreVerticalIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => bukaUbah(k)}>Ubah</DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            setHapusError(null);
                            setHapusTarget(k);
                          }}
                        >
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

      <KategoriFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingId={editing?.id ?? null}
        defaultValues={editing ? keDefaultValues(editing) : null}
        simpanAction={simpanAction}
        onSaved={() => router.refresh()}
      />

      <AlertDialog open={hapusTarget != null} onOpenChange={(open) => !open && setHapusTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kategori &quot;{hapusTarget?.nama_id}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Produk/batch yang sudah dikaitkan ke kategori ini akan kehilangan kategorinya. Tindakan ini tidak bisa
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {hapusError && <p className="px-4 text-sm text-destructive">{hapusError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={konfirmasiHapus} disabled={hapusPending}>
              {hapusPending ? 'Menghapus…' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function KategoriFormDialog({
  open,
  onOpenChange,
  editingId,
  defaultValues,
  simpanAction,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  defaultValues: KategoriFormInput | null;
  simpanAction: (id: string | null, input: KategoriFormInput) => Promise<ActionResult>;
  onSaved: () => void;
}) {
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<KategoriFormInput>({
    resolver: zodResolver(KategoriFormSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPesanError(null);
      reset(defaultValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingId]);

  async function onSubmit(data: KategoriFormInput) {
    setPesanError(null);
    const hasil = await simpanAction(editingId, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan ?? 'Gagal menyimpan kategori. Coba lagi.');
      return;
    }
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingId == null ? 'Tambah Kategori' : 'Ubah Kategori'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {pesanError && (
            <Alert variant="destructive">
              <AlertDescription>{pesanError}</AlertDescription>
            </Alert>
          )}

          <Field label="Nama (Indonesia) *" htmlFor="nama_id">
            <Input id="nama_id" {...register('nama_id')} />
            {errors.nama_id && <p className="text-sm text-destructive">{errors.nama_id.message}</p>}
          </Field>
          <Field label="Nama (Inggris)" htmlFor="nama_en">
            <Input id="nama_en" {...register('nama_en')} />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-warna-latar-2 px-6 text-base font-semibold text-warna-teks"
            >
              Batal
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
