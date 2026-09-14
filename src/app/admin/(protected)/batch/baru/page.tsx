import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { BatchForm } from '../batch-form';
import type { BatchFormInput } from '@/lib/validations/batch-admin';

const DEFAULT_VALUES: BatchFormInput = {
  judul_id: '',
  judul_en: '',
  slug: '',
  kategori_id: '',
  kategori_en: '',
  category_id: null,
  rating: '',
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

  const supabaseAdmin = createAdminClient();
  const { data: kategoriList } = await supabaseAdmin
    .from('batch_categories')
    .select('id, nama_id')
    .order('urutan', { ascending: true });
  // Admin Panel Bahasa Indonesia saja (ENGINEERING.md §6.3) — label combobox
  // pakai nama_id langsung, tidak perlu pick() dwibahasa di sini.
  const kategoriOptions = (kategoriList ?? []).map((k) => ({ value: k.id, label: k.nama_id }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Tambah Batch</h1>
      <BatchForm mode="create" defaultValues={DEFAULT_VALUES} kategoriOptions={kategoriOptions} />
    </div>
  );
}
