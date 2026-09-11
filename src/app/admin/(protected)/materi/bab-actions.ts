'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { teks } from '@/lib/validations/batch-admin';
import { BabFormSchema, type BabFormInput } from '@/lib/validations/materi-bab-admin';

export async function simpanBabAction(materialId: number, babId: number | null, input: BabFormInput) {
  await requireAdmin();

  const parsed = BabFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const p = parsed.data;
  const bab = {
    judul_id: p.judul_id,
    judul_en: teks(p.judul_en),
    konten_id: p.konten_id,
    konten_en: teks(p.konten_en),
    video_url: teks(p.video_url),
    gambar_url: teks(p.gambar_url),
  };

  const supabaseAdmin = createAdminClient();

  if (babId == null) {
    const { data: existing } = await supabaseAdmin
      .from('material_chapters')
      .select('urutan')
      .eq('material_id', materialId)
      .order('urutan', { ascending: false })
      .limit(1)
      .maybeSingle();
    const urutan = (existing?.urutan ?? 0) + 1;

    const { data, error } = await supabaseAdmin
      .from('material_chapters')
      .insert({ ...bab, material_id: materialId, urutan })
      .select('id')
      .single();
    if (error || !data) {
      console.error('[admin-bab] gagal membuat bab:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan bab. Coba lagi.' };
    }
    return { ok: true as const, id: data.id };
  }

  const { error } = await supabaseAdmin.from('material_chapters').update(bab).eq('id', babId);
  if (error) {
    console.error('[admin-bab] gagal mengubah bab:', error);
    return { ok: false as const, pesan: 'Gagal menyimpan bab. Coba lagi.' };
  }

  return { ok: true as const, id: babId };
}

export async function hapusBabAction(babId: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('material_chapters').delete().eq('id', babId);
  if (error) {
    console.error('[admin-bab] gagal hapus bab:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}

export async function reorderBabAction(materialId: number, babIds: number[]) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.rpc('reorder_material_chapters', {
    p_material_id: materialId,
    p_chapter_ids: babIds,
  });
  if (error) {
    console.error('[admin-bab] gagal reorder bab:', error);
    return { ok: false as const, pesan: 'Gagal mengubah urutan. Coba lagi.' };
  }
  return { ok: true as const };
}
