import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { KategoriManager } from '@/components/admin/kategori-manager';
import {
  simpanKategoriBatchAction,
  hapusKategoriBatchAction,
  reorderKategoriBatchAction,
  toggleAktifKategoriBatchAction,
} from './actions';

export default async function AdminKategoriBatchPage() {
  await requireAdmin();

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from('batch_categories')
      .select(
        'id, nama_id, nama_en, urutan, is_active, butuh_lokasi_praktek, butuh_ukuran_baju, butuh_kategori_peserta, butuh_metode_kelas_teori',
      )
    .order('urutan', { ascending: true });

  if (error) console.error('[admin-kategori-batch] gagal memuat kategori:', error);

  return (
    <KategoriManager
      judul="Kategori Pelatihan"
      items={data ?? []}
      simpanAction={simpanKategoriBatchAction}
      hapusAction={hapusKategoriBatchAction}
      reorderAction={reorderKategoriBatchAction}
      toggleAktifAction={toggleAktifKategoriBatchAction}
      programFlags
    />
  );
}
