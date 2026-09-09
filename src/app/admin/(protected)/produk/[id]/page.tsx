import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { ProdukForm } from '../produk-form';
import type { ProductFormInput } from '@/lib/validations/produk-admin';

export default async function AdminProdukUbahPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();
  const [{ data: produk }, { data: gambar }] = await Promise.all([
    supabase.from('products').select('*').eq('id', Number(id)).maybeSingle(),
    supabase.from('product_images').select('url').eq('product_id', Number(id)).order('urutan'),
  ]);
  if (!produk) notFound();

  const defaultValues: ProductFormInput = {
    nama_id: produk.nama_id,
    nama_en: produk.nama_en ?? '',
    slug: produk.slug,
    kategori: produk.kategori ?? '',
    harga: produk.harga ?? '',
    tampilkan_harga: produk.tampilkan_harga,
    urutan: produk.urutan,
    is_active: produk.is_active,
    deskripsi_id: produk.deskripsi_id ?? '',
    deskripsi_en: produk.deskripsi_en ?? '',
    spesifikasi_id: produk.spesifikasi_id ?? '',
    spesifikasi_en: produk.spesifikasi_en ?? '',
    images: (gambar ?? []).map((g) => ({ url: g.url })),
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Ubah Produk</h1>
      <ProdukForm mode="edit" produkId={produk.id} defaultValues={defaultValues} />
    </div>
  );
}
