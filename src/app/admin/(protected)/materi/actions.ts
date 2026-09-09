'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { teks, angka } from '@/lib/validations/batch-admin';
import { MateriFormSchema, type MateriFormInput } from '@/lib/validations/materi-admin';

const MIME_DIIZINKAN = new Set([
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);
const UKURAN_MAKS = 20 * 1024 * 1024; // 20MB, sama dengan batas bucket `materials`

export async function uploadBerkasMateriAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false as const, pesan: 'Berkas tidak ditemukan.' };
  }
  if (!MIME_DIIZINKAN.has(file.type)) {
    return { ok: false as const, pesan: 'Format berkas harus PDF atau PowerPoint (.pdf, .ppt, .pptx).' };
  }
  if (file.size > UKURAN_MAKS) {
    return { ok: false as const, pesan: 'Ukuran berkas maksimal 20MB.' };
  }

  const ext = file.name.split('.').pop() ?? 'pdf';
  const path = `${crypto.randomUUID()}.${ext}`;
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.storage.from('materials').upload(path, file, { contentType: file.type });
  if (error) {
    console.error('[admin-materi] gagal unggah berkas:', error);
    return { ok: false as const, pesan: 'Gagal mengunggah berkas. Coba lagi.' };
  }

  const { data } = supabaseAdmin.storage.from('materials').getPublicUrl(path);
  return { ok: true as const, url: data.publicUrl };
}

export async function simpanMateriAction(id: number | null, input: MateriFormInput) {
  await requireAdmin();

  const parsed = MateriFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const supabaseAdmin = createAdminClient();
  const materi = {
    judul_id: parsed.data.judul_id,
    judul_en: teks(parsed.data.judul_en),
    deskripsi_id: teks(parsed.data.deskripsi_id),
    deskripsi_en: teks(parsed.data.deskripsi_en),
    file_url: parsed.data.file_url,
    urutan: angka(parsed.data.urutan) ?? 0,
    is_active: parsed.data.is_active,
  };

  if (id == null) {
    const { error } = await supabaseAdmin.from('materials').insert(materi);
    if (error) {
      console.error('[admin-materi] gagal membuat materi:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan materi. Coba lagi.' };
    }
  } else {
    const { error } = await supabaseAdmin.from('materials').update(materi).eq('id', id);
    if (error) {
      console.error('[admin-materi] gagal mengubah materi:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan materi. Coba lagi.' };
    }
  }

  return { ok: true as const };
}

export async function hapusMateriAction(id: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('materials').delete().eq('id', id);
  if (error) {
    console.error('[admin-materi] gagal hapus materi:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}
