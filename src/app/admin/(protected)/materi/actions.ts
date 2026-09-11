'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { teks } from '@/lib/validations/batch-admin';
import { MateriFormSchema, type MateriFormInput } from '@/lib/validations/materi-admin';

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
    file_url: parsed.data.file_url ?? '',
    poster_url: teks(parsed.data.poster_url),
    urutan: 0,
    is_active: parsed.data.is_active,
  };

  if (id == null) {
    const { data, error } = await supabaseAdmin.from('materials').insert(materi).select('id').single();
    if (error || !data) {
      console.error('[admin-materi] gagal membuat materi:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan materi. Coba lagi.' };
    }
    return { ok: true as const, id: data.id };
  }

  const { error } = await supabaseAdmin.from('materials').update(materi).eq('id', id);
  if (error) {
    console.error('[admin-materi] gagal mengubah materi:', error);
    return { ok: false as const, pesan: 'Gagal menyimpan materi. Coba lagi.' };
  }

  return { ok: true as const, id };
}
