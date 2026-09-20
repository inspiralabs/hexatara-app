import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { BatchForm } from '../batch-form';
import type { BatchFormInput } from '@/lib/validations/batch-admin';

const DEFAULT_VALUES: BatchFormInput = {
  judul_id: '',
  judul_en: '',
  slug: '',
  category_id: null,
  rating: '',
  lokasi_id: '',
  lokasi_en: '',
  alamat: '',
  harga: '',
  status: 'upcoming',
  is_active: false,
  hero_gambar_url: '',
  gambar_detail_url: '',
  deskripsi_id: '',
  deskripsi_en: '',
  silabus_id: '',
  silabus_en: '',
  tanggal_mulai: null,
  tanggal_selesai: null,
  benefits: [],
  requirements: [],
  equipment: [],
  faqs: [],
  gallery: [],
};

export default async function AdminBatchBaruPage() {
  await requireAdmin();

  const supabaseAdmin = createAdminClient();
  const [{ data: kategoriList }, { data: batchList }] = await Promise.all([
    supabaseAdmin.from('batch_categories').select('id, nama_id').order('urutan', { ascending: true }),
    supabaseAdmin
      .from('batches')
      .select('id, judul_id, tanggal_mulai')
      .order('created_at', { ascending: false }),
  ]);

  const kategoriOptions = (kategoriList ?? []).map((k) => ({ value: k.id, label: k.nama_id }));
  const sumberBatchOptions = (batchList ?? []).map((b) => ({
    value: String(b.id),
    label: b.tanggal_mulai
      ? `${b.judul_id} · ${format(new Date(b.tanggal_mulai), 'd MMM yyyy', { locale: localeId })}`
      : b.judul_id,
  }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Tambah Batch</h1>
      <BatchForm
        mode="create"
        defaultValues={DEFAULT_VALUES}
        kategoriOptions={kategoriOptions}
        sumberBatchOptions={sumberBatchOptions}
      />
    </div>
  );
}
