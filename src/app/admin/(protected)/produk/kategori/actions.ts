'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { teks } from '@/lib/validations/batch-admin';
import { KategoriFormSchema, type KategoriFormInput } from '@/lib/validations/kategori-admin';

export async function simpanKategoriProdukAction(id: string | null, input: KategoriFormInput) {
  await requireAdmin();

  const parsed = KategoriFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const kategori = { nama_id: parsed.data.nama_id, nama_en: teks(parsed.data.nama_en) };
  const supabaseAdmin = createAdminClient();

  if (id == null) {
    const { data: existing } = await supabaseAdmin
      .from('product_categories')
      .select('urutan')
      .order('urutan', { ascending: false })
      .limit(1)
      .maybeSingle();
    const urutan = (existing?.urutan ?? 0) + 1;

    const { error } = await supabaseAdmin.from('product_categories').insert({ ...kategori, urutan });
    if (error) {
      console.error('[admin-kategori-produk] gagal membuat kategori:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan kategori. Coba lagi.' };
    }
  } else {
    const { error } = await supabaseAdmin.from('product_categories').update(kategori).eq('id', id);
    if (error) {
      console.error('[admin-kategori-produk] gagal mengubah kategori:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan kategori. Coba lagi.' };
    }
  }

  return { ok: true as const };
}

export async function hapusKategoriProdukAction(id: string) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('product_categories').delete().eq('id', id);
  if (error) {
    console.error('[admin-kategori-produk] gagal hapus kategori:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}

export async function toggleAktifKategoriProdukAction(id: string, next: boolean) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('product_categories').update({ is_active: next }).eq('id', id);
  if (error) {
    console.error('[admin-kategori-produk] gagal ubah status aktif:', error);
    return { ok: false as const, pesan: 'Gagal mengubah status. Coba lagi.' };
  }
  return { ok: true as const };
}

export async function reorderKategoriProdukAction(ids: string[]) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.rpc('reorder_product_categories', { p_category_ids: ids });
  if (error) {
    console.error('[admin-kategori-produk] gagal reorder kategori:', error);
    return { ok: false as const, pesan: 'Gagal mengubah urutan. Coba lagi.' };
  }
  return { ok: true as const };
}
