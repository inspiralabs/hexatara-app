'use client';

import { useState } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { XIcon } from 'lucide-react';

type HasilUpload = { ok: true; url: string } | { ok: false; pesan: string };

// Kompres di browser SEBELUM naik (ENGINEERING §5.3) — foto dari HP 5MB dan Lighthouse
// mobile >=90 (F05.2) tidak bisa hidup berdampingan tanpa ini.
export function ImageUploadField({
  label,
  value,
  onChange,
  onUpload,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<HasilUpload>;
}) {
  const [uploading, setUploading] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setPesanError(null);
    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1600,
      });
      const hasil = await onUpload(new File([compressed], file.name, { type: compressed.type }));
      if (!hasil.ok) {
        setPesanError(hasil.pesan);
        return;
      }
      onChange(hasil.url);
    } catch {
      setPesanError('Gagal memproses gambar. Coba berkas lain.');
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
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="text-sm text-warna-teks-2"
        />
      )}
      {uploading && <p className="text-sm text-warna-teks-2">Mengunggah…</p>}
      {pesanError && <p className="text-sm text-destructive">{pesanError}</p>}
    </div>
  );
}
