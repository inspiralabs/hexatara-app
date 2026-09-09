import { requireAdmin } from '@/lib/auth/guard';
import { ProdukForm } from '../produk-form';
import type { ProductFormInput } from '@/lib/validations/produk-admin';

const DEFAULT_VALUES: ProductFormInput = {
  nama_id: '',
  nama_en: '',
  slug: '',
  kategori: '',
  harga: '',
  tampilkan_harga: true,
  urutan: 0,
  is_active: true,
  deskripsi_id: '',
  deskripsi_en: '',
  spesifikasi_id: '',
  spesifikasi_en: '',
  images: [],
};

export default async function AdminProdukBaruPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Tambah Produk</h1>
      <ProdukForm mode="create" defaultValues={DEFAULT_VALUES} />
    </div>
  );
}
