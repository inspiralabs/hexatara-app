'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { PopupFormSchema, type PopupFormInput } from '@/lib/validations/popup-admin';
import { teks } from '@/lib/validations/batch-admin';

export async function simpanPopupAction(popupId: number | null, input: PopupFormInput) {
  await requireAdmin();

  const parsed = PopupFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const p = parsed.data;
  const popup = {
    judul_id: p.judul_id,
    judul_en: teks(p.judul_en),
    isi_id: p.isi_id,
    isi_en: teks(p.isi_en),
    gambar_url: teks(p.gambar_url),
    cta_teks_id: teks(p.cta_teks_id),
    cta_teks_en: teks(p.cta_teks_en),
    cta_url: teks(p.cta_url),
    tayang_mulai: teks(p.tayang_mulai),
    tayang_selesai: teks(p.tayang_selesai),
    is_active: p.is_active,
  };

  const supabaseAdmin = createAdminClient();

  if (popupId == null) {
    const { error } = await supabaseAdmin.from('popups').insert(popup);
    if (error) {
      console.error('[admin-popup] gagal membuat popup:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan pop-up. Coba lagi.' };
    }
  } else {
    const { error } = await supabaseAdmin.from('popups').update(popup).eq('id', popupId);
    if (error) {
      console.error('[admin-popup] gagal mengubah popup:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan pop-up. Coba lagi.' };
    }
  }

  return { ok: true as const };
}

export async function hapusPopupAction(popupId: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('popups').delete().eq('id', popupId);
  if (error) {
    console.error('[admin-popup] gagal hapus popup:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}

export async function toggleAktifPopupAction(popupId: number, aktif: boolean) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('popups').update({ is_active: aktif }).eq('id', popupId);
  if (error) {
    console.error('[admin-popup] gagal ubah status aktif:', error);
    return { ok: false as const, pesan: 'Gagal mengubah status. Coba lagi.' };
  }
  return { ok: true as const };
}
