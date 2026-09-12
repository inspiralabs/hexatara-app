import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { KategoriManager } from '@/components/admin/kategori-manager';
import {
  simpanKategoriProdukAction,
  hapusKategoriProdukAction,
  reorderKategoriProdukAction,
  toggleAktifKategoriProdukAction,
} from './actions';

export default async function AdminKategoriProdukPage() {
  await requireAdmin();

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from('product_categories')
    .select('id, nama_id, nama_en, urutan, is_active')
    .order('urutan', { ascending: true });

  if (error) console.error('[admin-kategori-produk] gagal memuat kategori:', error);

  return (
    <KategoriManager
      judul="Kategori Produk"
      items={data ?? []}
      simpanAction={simpanKategoriProdukAction}
      hapusAction={hapusKategoriProdukAction}
      reorderAction={reorderKategoriProdukAction}
      toggleAktifAction={toggleAktifKategoriProdukAction}
    />
  );
}
