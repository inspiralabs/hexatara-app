import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { getKategoriMerchandiseId } from '@/lib/merchandise';
import { ProdukForm } from '../../produk/produk-form';
import type { ProductFormInput } from '@/lib/validations/produk-admin';

export default async function AdminMerchandiseBaruPage() {
  await requireAdmin();
  const kategoriId = await getKategoriMerchandiseId();
  if (!kategoriId) {
    return <p className="text-sm text-muted-foreground">Buat kategori Merchandise dulu di Kategori Produk.</p>;
  }

  const supabaseAdmin = createAdminClient();
  const { data: kategoriList } = await supabaseAdmin
    .from('product_categories')
    .select('id, nama_id')
    .order('urutan', { ascending: true });
  const kategoriOptions = (kategoriList ?? []).map((k) => ({ value: k.id, label: k.nama_id }));
  const defaults: ProductFormInput = {
    nama_id: '',
    nama_en: '',
    slug: '',
    category_id: kategoriId,
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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Tambah Merchandise</h1>
      <ProdukForm
        mode="create"
        defaultValues={defaults}
        kategoriOptions={kategoriOptions}
        afterSaveHref="/admin/merchandise"
      />
    </div>
  );
}
