'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { PendaftaranBatchRow } from './pendaftaran-batch-table';

const LABEL_KATEGORI: Record<PendaftaranBatchRow['kategori_peserta'], string> = {
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

export function PendaftaranBatchDetail({ row }: { row: PendaftaranBatchRow }) {
  const [open, setOpen] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!zoomSrc) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setZoomSrc(null);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomSrc]);

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
            <DialogTitle>Detail pendaftaran</DialogTitle>
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
              label="Diajukan"
              value={format(new Date(row.created_at), 'd MMM yyyy HH:mm', { locale: localeId })}
            />
          </dl>
          <div className="grid gap-4 sm:grid-cols-2">
            <FotoInline label="Foto KTP" src={row.fotoKtpUrl} onZoom={setZoomSrc} />
            <FotoInline label="Pas foto" src={row.pasFotoUrl} onZoom={setZoomSrc} />
          </div>
        </DialogContent>
      </Dialog>

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
