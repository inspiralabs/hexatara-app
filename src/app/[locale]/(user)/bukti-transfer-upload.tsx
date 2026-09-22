'use client';

import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { FileUploadField } from '@/components/file-upload-field';
import { Button } from '@/components/ui/button';
import { unggahBuktiTransferAction } from './actions';

export function BuktiTransferUpload({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function unggah() {
    if (!file) {
      toast.error('Pilih gambar bukti transfer terlebih dahulu.');
      return;
    }
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
      setFile(null);
      router.refresh();
    } catch {
      toast.error('Gagal memproses gambar. Coba berkas lain.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <FileUploadField
        label="Unggah Bukti Transfer"
        accept="image/jpeg,image/png,image/webp"
        hint="JPG, PNG, atau WebP · preview dulu, lalu klik Unggah"
        file={file}
        onFile={setFile}
        disabled={uploading}
      />
      <Button type="button" onClick={unggah} disabled={uploading || !file} className="h-11 w-fit px-6">
        {uploading ? 'Mengunggah…' : 'Unggah bukti'}
      </Button>
    </div>
  );
}
