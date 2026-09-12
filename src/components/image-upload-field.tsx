'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  cropToCanvas,
  type Crop,
  type PercentCrop,
  type PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { toast } from 'sonner';
import { ImagePlusIcon, XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type HasilUpload = { ok: true; url: string } | { ok: false; pesan: string };

const FORMAT_DIIZINKAN = ['image/jpeg', 'image/png', 'image/webp'];
const FORMAT_LABEL = 'JPG, PNG, atau WebP';
const UKURAN_MAKS = 5 * 1024 * 1024; // 5MB sebelum kompresi (ENGINEERING §5.3)

function formatMB(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Kompres di browser SEBELUM naik (ENGINEERING §5.3) — foto dari HP 5MB dan Lighthouse
// mobile >=90 (F05.2) tidak bisa hidup berdampingan tanpa ini.
export function ImageUploadField({
  label,
  value,
  onChange,
  onUpload,
  aspectRatio,
  suggestedPx,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<HasilUpload>;
  /** Rasio lebar/tinggi dikunci saat crop, mis. 16/9 atau 1. Kosongkan untuk crop bebas. */
  aspectRatio?: number;
  /** Contoh: "1920×1080px" — ditampilkan sebagai saran, bukan validasi keras. */
  suggestedPx?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState<{ file: File; objectUrl: string } | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!FORMAT_DIIZINKAN.includes(file.type)) {
      toast.error(`Format berkas tidak didukung. Gunakan ${FORMAT_LABEL}.`);
      return;
    }
    if (file.size > UKURAN_MAKS) {
      toast.error(`Ukuran berkas ${formatMB(file.size)} melebihi batas maksimal ${formatMB(UKURAN_MAKS)}.`);
      return;
    }
    setPending({ file, objectUrl: URL.createObjectURL(file) });
  }

  function tutupDialogCrop() {
    if (pending) URL.revokeObjectURL(pending.objectUrl);
    setPending(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (inputRef.current) inputRef.current.value = '';
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initial: PercentCrop = aspectRatio
      ? makeAspectCrop({ unit: '%', width: 90 }, aspectRatio, width, height)
      : { unit: '%', width: 90, height: 90, x: 5, y: 5 };
    setCrop(centerCrop(initial, width, height));
  }

  async function konfirmasiCrop() {
    if (!pending || !completedCrop || !imgRef.current) return;
    setUploading(true);
    try {
      const canvas = document.createElement('canvas');
      await cropToCanvas(imgRef.current, canvas, completedCrop);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, pending.file.type));
      if (!blob) throw new Error('gagal membuat blob dari crop');

      const cropped = new File([blob], pending.file.name, { type: pending.file.type });
      const compressed = await imageCompression(cropped, { maxSizeMB: 0.5, maxWidthOrHeight: 1920 });
      const hasil = await onUpload(new File([compressed], pending.file.name, { type: compressed.type }));
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      onChange(hasil.url);
      tutupDialogCrop();
    } catch {
      toast.error('Gagal memproses gambar. Coba berkas lain.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-warna-teks">{label}</span>
      {value ? (
        <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border border-warna-latar-2">
          <Image src={value} alt="" fill className="object-cover" sizes="320px" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Hapus gambar"
            className="absolute top-1 right-1 flex size-8 items-center justify-center rounded-full bg-warna-teks/70 text-warna-latar"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
            type="file"
            accept={FORMAT_DIIZINKAN.join(',')}
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="sr-only"
            id={inputId}
          />
          <label
            htmlFor={inputId}
            className="inline-flex h-11 w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-warna-utama px-5 text-base font-semibold text-warna-utama [transition:var(--transition-hover)] hover:bg-warna-utama/5 has-disabled:pointer-events-none has-disabled:opacity-50"
          >
            <ImagePlusIcon className="size-4" /> Pilih Gambar
          </label>
          <p className="text-xs text-warna-teks-2">
            Format {FORMAT_LABEL}, maksimal {formatMB(UKURAN_MAKS)} sebelum kompresi.
            {suggestedPx && <> Disarankan sekitar {suggestedPx}.</>}
          </p>
        </div>
      )}
      {uploading && !pending && <p className="text-sm text-warna-teks-2">Mengunggah…</p>}

      <Dialog open={pending != null} onOpenChange={(open) => !open && tutupDialogCrop()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Sesuaikan Area Gambar</DialogTitle>
          </DialogHeader>
          {pending && (
            <div className="flex flex-col gap-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                className="mx-auto max-h-[60vh]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- object URL sementara, next/image tidak perlu di sini */}
                <img ref={imgRef} src={pending.objectUrl} alt="" onLoad={onImageLoad} className="max-h-[60vh]" />
              </ReactCrop>
              <p className="text-xs text-warna-teks-2">
                Geser dan sesuaikan area yang akan tampil{aspectRatio ? '' : ' — bebas, tidak terkunci rasio tertentu'}.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={konfirmasiCrop}
                  disabled={uploading || !completedCrop}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks disabled:opacity-50"
                >
                  {uploading ? 'Mengunggah…' : 'Gunakan Gambar Ini'}
                </button>
                <button
                  type="button"
                  onClick={tutupDialogCrop}
                  disabled={uploading}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-warna-latar-2 px-6 text-base font-semibold text-warna-teks disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
