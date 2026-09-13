'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { teks, angka } from '@/lib/validations/batch-admin';
import { ProductFormSchema, type ProductFormInput } from '@/lib/validations/produk-admin';

function pesanGagalSimpan(error: { code?: string }) {
  if (error.code === '23505') {
    return 'Slug sudah dipakai produk lain. Pilih slug lain.';
  }
  return 'Gagal menyimpan produk. Coba lagi.';
}

export async function uploadGambarProdukAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false as const, pesan: 'Berkas tidak ditemukan.' };
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.storage.from('products').upload(path, file, {
    contentType: file.type,
  });
  if (error) {
    console.error('[admin-produk] gagal unggah gambar:', error);
    return { ok: false as const, pesan: 'Gagal mengunggah gambar. Coba lagi.' };
  }

  const { data } = supabaseAdmin.storage.from('products').getPublicUrl(path);
  return { ok: true as const, url: data.publicUrl };
}

export async function simpanProdukAction(id: number | null, input: ProductFormInput) {
  await requireAdmin();

  const parsed = ProductFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const { images, ...rest } = parsed.data;
  const produk = {
    nama_id: rest.nama_id,
    nama_en: teks(rest.nama_en),
    slug: rest.slug,
    kategori: teks(rest.kategori),
    category_id: teks(rest.category_id),
    rating: angka(rest.rating),
    harga: angka(rest.harga),
    tampilkan_harga: rest.tampilkan_harga,
    urutan: angka(rest.urutan) ?? 0,
    is_active: rest.is_active,
    deskripsi_id: teks(rest.deskripsi_id),
    deskripsi_en: teks(rest.deskripsi_en),
    spesifikasi_id: teks(rest.spesifikasi_id),
    spesifikasi_en: teks(rest.spesifikasi_en),
  };

  const supabaseAdmin = createAdminClient();

  let produkId = id;
  if (produkId == null) {
    const { data, error } = await supabaseAdmin.from('products').insert(produk).select('id').single();
    if (error || !data) {
      console.error('[admin-produk] gagal membuat produk:', error);
      return { ok: false as const, pesan: pesanGagalSimpan(error ?? {}) };
    }
    produkId = data.id;
  } else {
    const { error } = await supabaseAdmin.from('products').update(produk).eq('id', produkId);
    if (error) {
      console.error('[admin-produk] gagal mengubah produk:', error);
      return { ok: false as const, pesan: pesanGagalSimpan(error) };
    }
  }

  // Replace-all foto per produk — pola sama dengan batch_gallery (F01.12).
  const { error: hapusError } = await supabaseAdmin.from('product_images').delete().eq('product_id', produkId);
  if (hapusError) {
    console.error('[admin-produk] gagal hapus foto lama:', hapusError);
    return { ok: false as const, pesan: 'Gagal menyimpan foto produk. Coba lagi.' };
  }

  if (images.length > 0) {
    const { error: fotoError } = await supabaseAdmin.from('product_images').insert(
      images.map((item, index) => ({
        product_id: produkId,
        url: item.url,
        urutan: index,
      }))
    );
    if (fotoError) {
      console.error('[admin-produk] gagal simpan foto:', fotoError);
      return { ok: false as const, pesan: 'Gagal menyimpan foto produk. Coba lagi.' };
    }
  }

  return { ok: true as const, id: produkId };
}

export async function hapusProdukAction(id: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) {
    console.error('[admin-produk] gagal hapus produk:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}

// products.urutan TIDAK unique — aman di-update langsung per baris (pola sama hero_slides).
export async function reorderProdukAction(produkIds: number[]) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  for (const [index, id] of produkIds.entries()) {
    const { error } = await supabaseAdmin.from('products').update({ urutan: index }).eq('id', id);
    if (error) {
      console.error('[admin-produk] gagal reorder produk:', error);
      return { ok: false as const, pesan: 'Gagal mengubah urutan. Coba lagi.' };
    }
  }
  return { ok: true as const };
}
