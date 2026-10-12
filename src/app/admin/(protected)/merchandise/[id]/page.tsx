import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { getKategoriMerchandiseId } from '@/lib/merchandise';
import { ProdukForm } from '../../produk/produk-form';
import type { ProductFormInput } from '@/lib/validations/produk-admin';

export default async function AdminMerchandiseUbahPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const kategoriMerch = await getKategoriMerchandiseId();

  const supabase = await createClient();
  const [{ data: produk }, { data: gambar }, { data: kategoriList }] = await Promise.all([
    supabase.from('products').select('*').eq('id', Number(id)).maybeSingle(),
    supabase.from('product_images').select('url').eq('product_id', Number(id)).order('urutan'),
    supabase.from('product_categories').select('id, nama_id').order('urutan', { ascending: true }),
  ]);
  if (!produk) notFound();
  if (!kategoriMerch || produk.category_id !== kategoriMerch) {
    return (
      <p className="text-sm text-muted-foreground">
        Produk ini bukan merchandise.{' '}
        <Link href="/admin/produk" className="underline underline-offset-4">
          Buka di menu Produk
        </Link>
      </p>
    );
  }

  const kategoriOptions = (kategoriList ?? []).map((k) => ({ value: k.id, label: k.nama_id }));
  const defaultValues: ProductFormInput = {
    nama_id: produk.nama_id,
    nama_en: produk.nama_en ?? '',
    slug: produk.slug,
    category_id: produk.category_id,
    rating: produk.rating ?? '',
    harga: produk.harga ?? '',
    tampilkan_harga: produk.tampilkan_harga,
    is_active: produk.is_active,
    deskripsi_id: produk.deskripsi_id ?? '',
    deskripsi_en: produk.deskripsi_en ?? '',
    spesifikasi_id: produk.spesifikasi_id ?? '',
    spesifikasi_en: produk.spesifikasi_en ?? '',
    thumbnail_url: produk.thumbnail_url ?? '',
    images: (gambar ?? []).map((g) => ({ url: g.url })),
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Ubah Merchandise</h1>
      <ProdukForm
        mode="edit"
        produkId={produk.id}
        defaultValues={defaultValues}
        kategoriOptions={kategoriOptions}
        afterSaveHref="/admin/merchandise"
      />
    </div>
  );
}
