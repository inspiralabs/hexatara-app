'use client';

import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { useRouter } from '@/i18n/navigation';
import { unggahBuktiTransferAction } from './actions';

// Kompres di browser SEBELUM naik (ENGINEERING §5.3) — sama seperti ImageUploadField
// Admin, tapi bucket-nya privat jadi tidak ada preview next/image dari URL publik.
export function BuktiTransferUpload({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setPesanError(null);
    setUploading(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1600 });
      const formData = new FormData();
      formData.set('file', new File([compressed], file.name, { type: compressed.type }));
      const hasil = await unggahBuktiTransferAction(orderId, formData);
      if (!hasil.ok) {
        setPesanError(hasil.pesan);
        return;
      }
      router.refresh();
    } catch {
      setPesanError('Gagal memproses gambar. Coba berkas lain.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="text-sm text-warna-teks-2"
      />
      {uploading && <p className="text-sm text-warna-teks-2">Mengunggah…</p>}
      {pesanError && <p className="text-sm text-destructive">{pesanError}</p>}
    </div>
  );
}
