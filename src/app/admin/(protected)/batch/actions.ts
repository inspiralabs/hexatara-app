'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { BatchFormSchema, teks, angka, type BatchFormInput } from '@/lib/validations/batch-admin';

function pesanGagalSimpan(error: { code?: string }) {
  if (error.code === '23505') {
    return 'Slug sudah dipakai batch lain. Pilih slug lain.';
  }
  return 'Gagal menyimpan batch. Coba lagi.';
}

export async function simpanBatchAction(batchId: number | null, input: BatchFormInput) {
  await requireAdmin();

  const parsed = BatchFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const { benefits, equipment, faqs, gallery, ...rest } = parsed.data;
  const batch = {
    judul_id: rest.judul_id,
    judul_en: teks(rest.judul_en),
    slug: rest.slug,
    kategori_id: teks(rest.kategori_id),
    kategori_en: teks(rest.kategori_en),
    category_id: teks(rest.category_id),
    rating: angka(rest.rating),
    lokasi_id: teks(rest.lokasi_id),
    lokasi_en: teks(rest.lokasi_en),
    alamat: teks(rest.alamat),
    harga: angka(rest.harga),
    status: rest.status,
    is_active: rest.is_active,
    hero_gambar_url: teks(rest.hero_gambar_url),
    deskripsi_id: teks(rest.deskripsi_id),
    deskripsi_en: teks(rest.deskripsi_en),
    silabus_id: teks(rest.silabus_id),
    silabus_en: teks(rest.silabus_en),
    tanggal_mulai: teks(rest.tanggal_mulai),
    tanggal_selesai: teks(rest.tanggal_selesai),
  };
  const supabaseAdmin = createAdminClient();

  let id = batchId;
  if (id == null) {
    const { data, error } = await supabaseAdmin.from('batches').insert(batch).select('id').single();
    if (error) {
      console.error('[admin-batch] gagal membuat batch:', error);
      return { ok: false as const, pesan: pesanGagalSimpan(error) };
    }
    id = data.id;
  } else {
    const { error } = await supabaseAdmin.from('batches').update(batch).eq('id', id);
    if (error) {
      console.error('[admin-batch] gagal mengubah batch:', error);
      return { ok: false as const, pesan: pesanGagalSimpan(error) };
    }
  }

  // Replace-all per batch — lebih sederhana daripada diff per baris, dan wajar
  // untuk daftar sekecil ini (Admin jarang mengedit, beberapa baris saja).
  const { error: hapusBenefits } = await supabaseAdmin.from('batch_benefits').delete().eq('batch_id', id);
  const { error: hapusEquipment } = await supabaseAdmin.from('batch_equipment').delete().eq('batch_id', id);
  const { error: hapusFaqs } = await supabaseAdmin.from('batch_faqs').delete().eq('batch_id', id);
  const { error: hapusGallery } = await supabaseAdmin.from('batch_gallery').delete().eq('batch_id', id);
  if (hapusBenefits || hapusEquipment || hapusFaqs || hapusGallery) {
    console.error('[admin-batch] gagal hapus detail lama:', {
      hapusBenefits,
      hapusEquipment,
      hapusFaqs,
      hapusGallery,
    });
    return { ok: false as const, pesan: 'Gagal menyimpan detail batch. Coba lagi.' };
  }

  if (benefits.length > 0) {
    const { error } = await supabaseAdmin.from('batch_benefits').insert(
      benefits.map((item, index) => ({
        teks_id: item.teks_id,
        teks_en: teks(item.teks_en),
        ikon: teks(item.ikon),
        batch_id: id,
        urutan: index,
      }))
    );
    if (error) {
      console.error('[admin-batch] gagal simpan benefit:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan detail batch. Coba lagi.' };
    }
  }

  if (equipment.length > 0) {
    const { error } = await supabaseAdmin.from('batch_equipment').insert(
      equipment.map((item, index) => ({
        teks_id: item.teks_id,
        teks_en: teks(item.teks_en),
        batch_id: id,
        urutan: index,
      }))
    );
    if (error) {
      console.error('[admin-batch] gagal simpan peralatan:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan detail batch. Coba lagi.' };
    }
  }

  if (faqs.length > 0) {
    const { error } = await supabaseAdmin.from('batch_faqs').insert(
      faqs.map((item, index) => ({
        tanya_id: item.tanya_id,
        tanya_en: teks(item.tanya_en),
        jawab_id: item.jawab_id,
        jawab_en: teks(item.jawab_en),
        batch_id: id,
        urutan: index,
      }))
    );
    if (error) {
      console.error('[admin-batch] gagal simpan FAQ:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan detail batch. Coba lagi.' };
    }
  }

  if (gallery.length > 0) {
    const { error } = await supabaseAdmin.from('batch_gallery').insert(
      gallery.map((item, index) => ({
        gambar_url: item.gambar_url,
        caption_id: teks(item.caption_id),
        caption_en: teks(item.caption_en),
        batch_id: id,
        urutan: index,
      }))
    );
    if (error) {
      console.error('[admin-batch] gagal simpan galeri:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan detail batch. Coba lagi.' };
    }
  }

  return { ok: true as const, id };
}

export async function hapusBatchAction(batchId: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('batches').delete().eq('id', batchId);
  if (error) {
    console.error('[admin-batch] gagal hapus batch:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}

export async function toggleAktifBatchAction(batchId: number, aktif: boolean) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('batches').update({ is_active: aktif }).eq('id', batchId);
  if (error) {
    console.error('[admin-batch] gagal ubah status aktif:', error);
    return { ok: false as const, pesan: 'Gagal mengubah status. Coba lagi.' };
  }
  return { ok: true as const };
}
