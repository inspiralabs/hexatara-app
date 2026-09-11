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
    // Popup sekarang berbasis gambar (ADR-015) — isi_id sisa kolom NOT NULL
    // dari desain teks lama, tidak lagi ditampilkan di mana pun, cukup diisi
    // otomatis dari judul supaya tidak melanggar constraint.
    isi_id: p.judul_id,
    gambar_mobile_url: teks(p.gambar_mobile_url),
    gambar_desktop_url: teks(p.gambar_desktop_url),
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
