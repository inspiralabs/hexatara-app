import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProdukForm } from '../produk-form';
import type { ProductFormInput } from '@/lib/validations/produk-admin';

const DEFAULT_VALUES: ProductFormInput = {
  nama_id: '',
  nama_en: '',
  slug: '',
  category_id: null,
  rating: '',
  harga: '',
  tampilkan_harga: true,
  urutan: 0,
  is_active: true,
  deskripsi_id: '',
  deskripsi_en: '',
  spesifikasi_id: '',
  spesifikasi_en: '',
  thumbnail_url: '',
  images: [],
};

export default async function AdminProdukBaruPage() {
  await requireAdmin();

  const supabaseAdmin = createAdminClient();
  const { data: kategoriList } = await supabaseAdmin
    .from('product_categories')
    .select('id, nama_id')
    .order('urutan', { ascending: true });
  // Admin Panel Bahasa Indonesia saja (ENGINEERING.md §6.3) — label combobox
  // pakai nama_id langsung, tidak perlu pick() dwibahasa di sini.
  const kategoriOptions = (kategoriList ?? []).map((k) => ({ value: k.id, label: k.nama_id }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Tambah Produk</h1>
      <ProdukForm mode="create" defaultValues={DEFAULT_VALUES} kategoriOptions={kategoriOptions} />
    </div>
  );
}
