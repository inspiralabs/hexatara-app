'use client';

import { useId, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { ImagePlusIcon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { unggahBuktiTransferAction } from './actions';

// Kompres di browser SEBELUM naik (ENGINEERING §5.3) — sama seperti ImageUploadField
// Admin, tapi bucket-nya privat jadi tidak ada preview next/image dari URL publik.
export function BuktiTransferUpload({ orderId }: { orderId: number }) {
  const router = useRouter();
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [namaFile, setNamaFile] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setNamaFile(file.name);
    setUploading(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1600 });
      const formData = new FormData();
      formData.set('file', new File([compressed], file.name, { type: compressed.type }));
      const hasil = await unggahBuktiTransferAction(orderId, formData);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      toast.success('Bukti transfer berhasil diunggah.');
      router.refresh();
    } catch {
      toast.error('Gagal memproses gambar. Coba berkas lain.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-foreground">Unggah Bukti Transfer</p>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className={
          uploading
            ? 'pointer-events-none flex h-28 w-full cursor-not-allowed flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 opacity-60'
            : 'flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 transition-colors hover:bg-muted'
        }
      >
        {uploading ? (
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <ImagePlusIcon className="size-6 text-muted-foreground" aria-hidden />
        )}
        <span className="text-sm font-medium text-foreground">
          {uploading ? 'Mengunggah…' : 'Pilih gambar bukti transfer'}
        </span>
        <span className="text-xs text-muted-foreground">JPG, PNG, atau WebP</span>
      </label>
      {namaFile && !uploading && (
        <p className="text-xs text-muted-foreground">Terpilih: {namaFile}</p>
      )}
    </div>
  );
}
