'use client';

import { useId, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { ImagePlusIcon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { unggahIdentitasFotoAction } from './actions';

const FORMAT_DIIZINKAN = ['image/jpeg', 'image/png', 'image/webp'];
const UKURAN_MAKS = 5 * 1024 * 1024;

export function IdentitasFotoField({
  jenis,
  label,
  previewUrl,
  aspectClass = 'aspect-video',
}: {
  jenis: 'ktp' | 'pas_foto';
  label: string;
  previewUrl: string | null;
  aspectClass?: string;
}) {
  const router = useRouter();
  const inputId = useId();
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!FORMAT_DIIZINKAN.includes(file.type)) {
      toast.error('Format berkas harus JPG, PNG, atau WebP.');
      return;
    }
    if (file.size > UKURAN_MAKS) {
      toast.error('Ukuran berkas maksimal 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
      });
      const formData = new FormData();
      formData.set('file', new File([compressed], file.name, { type: compressed.type }));
      const hasil = await unggahIdentitasFotoAction(jenis, formData);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      toast.success(
        jenis === 'ktp' ? 'Foto KTP berhasil diunggah.' : 'Pas foto berhasil diunggah.',
      );
      router.refresh();
    } catch {
      toast.error('Gagal memproses gambar. Coba berkas lain.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className={
          uploading
            ? `pointer-events-none relative ${aspectClass} w-full cursor-not-allowed overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 opacity-60`
            : `relative ${aspectClass} w-full cursor-pointer overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 transition-colors hover:bg-muted`
        }
      >
        {previewUrl ? (
          // Bucket privat — signed URL, bukan next/image (hanya whitelist public storage).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
            {uploading ? (
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" aria-hidden />
            ) : (
              <ImagePlusIcon className="size-6 text-muted-foreground" aria-hidden />
            )}
            <span className="text-sm font-medium text-foreground">
              {uploading ? 'Mengunggah…' : 'Pilih gambar'}
            </span>
            <span className="text-xs text-muted-foreground">JPG, PNG, atau WebP · maks. 5 MB</span>
          </span>
        )}
        {previewUrl && uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2Icon className="size-6 animate-spin text-foreground" aria-hidden />
          </span>
        )}
      </label>
      {previewUrl && !uploading && (
        <p className="text-xs text-muted-foreground">Klik gambar untuk mengganti.</p>
      )}
    </div>
  );
}
