'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { hapusPesertaPendaftaranAction } from './actions';
import type { PesertaPendaftaranRow } from './peserta-types';

const LABEL_KATEGORI: Record<PesertaPendaftaranRow['kategori_peserta'], string> = {
  penerbitan_baru: 'Penerbitan baru',
  perpanjangan_renewal: 'Perpanjangan / renewal',
};

function Baris({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground whitespace-pre-wrap break-words">{value || '—'}</dd>
    </div>
  );
}

function FotoInline({
  label,
  src,
  onZoom,
}: {
  label: string;
  src: string | null;
  onZoom: (src: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {src ? (
        <button
          type="button"
          onClick={() => onZoom(src)}
          className="overflow-hidden rounded-lg border border-border bg-muted/30 text-left transition hover:opacity-90"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- signed URL bucket privat */}
          <img src={src} alt={label} className="max-h-48 w-full object-contain" />
        </button>
      ) : (
        <p className="text-sm text-muted-foreground">—</p>
      )}
    </div>
  );
}

export function PesertaPendaftaranDetail({ row }: { row: PesertaPendaftaranRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [hapusOpen, setHapusOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!zoomSrc) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setZoomSrc(null);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomSrc]);

  function konfirmasiHapus() {
    startTransition(async () => {
      const hasil = await hapusPesertaPendaftaranAction(row.id);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      setHapusOpen(false);
      setOpen(false);
      toast.success('Peserta berhasil dihapus.');
      router.refresh();
    });
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setZoomSrc(null);
        }}
      >
        <DialogTrigger render={<Button size="sm" variant="outline" />}>Detail</DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail peserta</DialogTitle>
          </DialogHeader>
          <dl className="pr-6">
            <Baris label="Nama" value={row.nama_lengkap ?? ''} />
            <Baris label="Email" value={row.email ?? ''} />
            <Baris label="WhatsApp" value={row.whatsapp ?? ''} />
            <Baris label="Batch" value={row.batchJudul} />
            <Baris label="Kategori" value={LABEL_KATEGORI[row.kategori_peserta]} />
            <Baris label="Akun" value={row.user_id ? 'Login' : 'Tanpa akun'} />
            <Baris label="Nomor KTP" value={row.nomor_ktp ?? ''} />
            <Baris label="Tempat lahir" value={row.tempat_lahir ?? ''} />
            <Baris
              label="Tanggal lahir"
              value={
                row.tanggal_lahir
                  ? format(new Date(row.tanggal_lahir), 'd MMMM yyyy', { locale: localeId })
                  : ''
              }
            />
            <Baris label="Alamat" value={row.alamat_lengkap ?? ''} />
            <Baris label="Sumber info" value={row.sumber_info ?? ''} />
            <Baris label="Kode referral" value={row.kode_referral ?? ''} />
            <Baris
              label="Disetujui"
              value={
                row.verified_at
                  ? format(new Date(row.verified_at), 'd MMM yyyy HH:mm', { locale: localeId })
                  : ''
              }
            />
          </dl>
          <div className="grid gap-4 sm:grid-cols-2">
            <FotoInline label="Foto KTP" src={row.fotoKtpUrl} onZoom={setZoomSrc} />
            <FotoInline label="Pas foto" src={row.pasFotoUrl} onZoom={setZoomSrc} />
          </div>
          <div className="mt-4 flex justify-end border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Hapus peserta ${row.nama_lengkap ?? ''}`}
              onClick={() => setHapusOpen(true)}
            >
              <Trash2Icon className="size-4 text-destructive" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus peserta &quot;{row.nama_lengkap ?? 'tanpa nama'}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Data pendaftaran dan dokumen identitas terkait akan dihapus. Tindakan ini tidak
              bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={konfirmasiHapus} disabled={pending}>
              {pending ? 'Menghapus…' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {zoomSrc ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
        >
          <button
            type="button"
            aria-label="Tutup pratinjau"
            className="absolute inset-0 cursor-default"
            onClick={() => setZoomSrc(null)}
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- signed URL bucket privat */}
          <img
            src={zoomSrc}
            alt="Pratinjau foto"
            className="relative max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
          />
          <button
            type="button"
            onClick={() => setZoomSrc(null)}
            className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-sm text-white hover:bg-black/80"
          >
            Tutup
          </button>
        </div>
      ) : null}
    </>
  );
}
