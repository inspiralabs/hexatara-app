'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, MoreVerticalIcon } from 'lucide-react';
import { toast } from 'sonner';
import { KategoriFormSchema, type KategoriFormInput } from '@/lib/validations/kategori-admin';
import { moveItem } from '@/lib/reorder';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<KategoriRow | null>(null);
  const [hapusTarget, setHapusTarget] = useState<KategoriRow | null>(null);
  const [hapusPending, startHapus] = useTransition();

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
    setDaftar(baru);
    startTransition(async () => {
      const hasil = await reorderAction(baru.map((k) => k.id));
      if (!hasil.ok) {
        const pesan = hasil.pesan ?? 'Gagal mengubah urutan. Coba lagi.';
        toast.error(pesan);
        setDaftar(daftar);
        return;
      }
      toast.success('Urutan kategori berhasil diubah.');
      router.refresh();
    });
  }

  function toggleAktif(k: KategoriRow, next: boolean) {
    setDaftar((prev) => prev.map((item) => (item.id === k.id ? { ...item, is_active: next } : item)));
    startTransition(async () => {
      const hasil = await toggleAktifAction(k.id, next);
      if (!hasil.ok) {
        setDaftar((prev) => prev.map((item) => (item.id === k.id ? { ...item, is_active: !next } : item)));
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
      const hasil = await hapusAction(hapusTarget.id);
      if (!hasil.ok) {
        const pesan = hasil.pesan ?? 'Gagal menghapus. Coba lagi.';
        toast.error(pesan);
        return;
      }
      setDaftar((prev) => prev.filter((item) => item.id !== hapusTarget.id));
      setHapusTarget(null);
      toast.success('Kategori berhasil dihapus.');
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{judul}</h1>
        <Button type="button" className="h-11 px-5" onClick={bukaTambah}>
          <PlusIcon className="size-4" /> Tambah Kategori
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
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
                <TableCell colSpan={4} className="text-center text-muted-foreground">
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
                  <TableCell className="font-medium text-foreground">{k.nama_id}</TableCell>
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
  const form = useForm<KategoriFormInput>({
    resolver: zodResolver(KategoriFormSchema),
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

  async function onSubmit(data: KategoriFormInput) {
    const hasil = await simpanAction(editingId, data);
    if (!hasil.ok) {
      const pesan = hasil.pesan ?? 'Gagal menyimpan kategori. Coba lagi.';
      toast.error(pesan);
      return;
    }
    toast.success('Kategori berhasil disimpan.');
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingId == null ? 'Tambah Kategori' : 'Ubah Kategori'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>

            <FormField
              control={control}
              name="nama_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama (Indonesia) *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="nama_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama (Inggris)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
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
