import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { getKategoriMerchandiseId } from '@/lib/merchandise';
import { buttonVariants } from '@/components/ui/button';
import { cn } from 'cn';
import { ProdukTable } from '../produk/produk-table';

export default async function AdminMerchandisePage() {
  await requireAdmin();
  const kategoriId = await getKategoriMerchandiseId();
  if (!kategoriId) {
    return (
      <p className="text-sm text-muted-foreground">
        Buat kategori Merchandise dulu di Kategori Produk.
      </p>
    );
  }

  const supabase = await createClient();
  const { data: produk, error } = await supabase
    .from('products')
    .select('id, nama_id, harga, tampilkan_harga, is_active, urutan, product_categories(nama_id)')
    .eq('category_id', kategoriId)
    .order('urutan');
  if (error) console.error('[admin-merchandise] gagal memuat:', error);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Merchandise</h1>
        <Link href="/admin/merchandise/baru" className={cn(buttonVariants(), 'h-11 px-5')}>
          Tambah Produk
        </Link>
      </div>
      <ProdukTable
        basePath="/admin/merchandise"
        produk={(produk ?? []).map((p) => ({
          id: p.id,
          nama_id: p.nama_id,
          kategoriNama: p.product_categories?.nama_id ?? null,
          harga: p.harga,
          tampilkan_harga: p.tampilkan_harga,
          is_active: p.is_active,
          urutan: p.urutan,
        }))}
      />
    </div>
  );
}
