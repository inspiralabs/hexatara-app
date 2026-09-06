import { requireAdmin } from '@/lib/auth/guard';
import { BatchForm } from '../batch-form';
import type { BatchFormInput } from '@/lib/validations/batch-admin';

const DEFAULT_VALUES: BatchFormInput = {
  judul_id: '',
  judul_en: '',
  slug: '',
  kategori_id: '',
  kategori_en: '',
  lokasi_id: '',
  lokasi_en: '',
  alamat: '',
  harga: '',
  status: 'upcoming',
  is_active: false,
  hero_gambar_url: '',
  deskripsi_id: '',
  deskripsi_en: '',
  silabus_id: '',
  silabus_en: '',
  tanggal_mulai: null,
  tanggal_selesai: null,
  benefits: [],
  equipment: [],
  faqs: [],
  gallery: [],
};

export default async function AdminBatchBaruPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Tambah Batch</h1>
      <BatchForm mode="create" defaultValues={DEFAULT_VALUES} />
    </div>
  );
}
