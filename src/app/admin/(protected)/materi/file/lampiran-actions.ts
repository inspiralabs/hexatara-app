'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { teks } from '@/lib/validations/batch-admin';
import { LampiranFormSchema, type LampiranFormInput } from '@/lib/validations/materi-lampiran-admin';

// Lampiran bab (ADR-018): PDF slide, spreadsheet, atau dokumen referensi lain —
// bukan gambar (itu lewat uploadGambarAdminAction), bucket sama dengan materi (materials).
const MIME_DIIZINKAN = new Set([
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const UKURAN_MAKS = 20 * 1024 * 1024;

export async function uploadLampiranBabAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false as const, pesan: 'Berkas tidak ditemukan.' };
  }
  if (!MIME_DIIZINKAN.has(file.type)) {
    return { ok: false as const, pesan: 'Format berkas harus PDF, PowerPoint, Excel, atau Word.' };
  }
  if (file.size > UKURAN_MAKS) {
    return { ok: false as const, pesan: 'Ukuran berkas maksimal 20MB.' };
  }

  const ext = file.name.split('.').pop() ?? 'pdf';
  const path = `lampiran/${crypto.randomUUID()}.${ext}`;
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.storage.from('materials').upload(path, file, { contentType: file.type });
  if (error) {
    console.error('[admin-lampiran] gagal unggah berkas:', error);
    return { ok: false as const, pesan: 'Gagal mengunggah berkas. Coba lagi.' };
  }

  const { data } = supabaseAdmin.storage.from('materials').getPublicUrl(path);
  return { ok: true as const, url: data.publicUrl };
}

export async function simpanLampiranAction(chapterId: number, lampiranId: number | null, input: LampiranFormInput) {
  await requireAdmin();

  const parsed = LampiranFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const p = parsed.data;
  const lampiran = {
    judul_id: p.judul_id,
    judul_en: teks(p.judul_en),
    deskripsi_id: teks(p.deskripsi_id),
    deskripsi_en: teks(p.deskripsi_en),
    url_file: p.url_file,
  };

  const supabaseAdmin = createAdminClient();

  if (lampiranId == null) {
    const { data: existing } = await supabaseAdmin
      .from('material_chapter_files')
      .select('urutan')
      .eq('chapter_id', chapterId)
      .order('urutan', { ascending: false })
      .limit(1)
      .maybeSingle();
    const urutan = (existing?.urutan ?? 0) + 1;

    const { error } = await supabaseAdmin
      .from('material_chapter_files')
      .insert({ ...lampiran, chapter_id: chapterId, urutan });
    if (error) {
      console.error('[admin-lampiran] gagal membuat lampiran:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan lampiran. Coba lagi.' };
    }
  } else {
    const { error } = await supabaseAdmin.from('material_chapter_files').update(lampiran).eq('id', lampiranId);
    if (error) {
      console.error('[admin-lampiran] gagal mengubah lampiran:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan lampiran. Coba lagi.' };
    }
  }

  return { ok: true as const };
}

export async function hapusLampiranAction(lampiranId: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('material_chapter_files').delete().eq('id', lampiranId);
  if (error) {
    console.error('[admin-lampiran] gagal hapus lampiran:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}

export async function reorderLampiranAction(chapterId: number, lampiranIds: number[]) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.rpc('reorder_material_chapter_files', {
    p_chapter_id: chapterId,
    p_file_ids: lampiranIds,
  });
  if (error) {
    console.error('[admin-lampiran] gagal reorder lampiran:', error);
    return { ok: false as const, pesan: 'Gagal mengubah urutan. Coba lagi.' };
  }
  return { ok: true as const };
}
