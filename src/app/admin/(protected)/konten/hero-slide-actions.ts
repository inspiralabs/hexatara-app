'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { HeroSlideFormSchema, type HeroSlideFormInput } from '@/lib/validations/hero-slide-admin';
import { teks, angka } from '@/lib/validations/batch-admin';

export async function simpanHeroSlideAction(slideId: number | null, input: HeroSlideFormInput) {
  await requireAdmin();

  const parsed = HeroSlideFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const p = parsed.data;
  const slide = {
    judul_id: p.judul_id,
    judul_en: teks(p.judul_en),
    subjudul_id: teks(p.subjudul_id),
    subjudul_en: teks(p.subjudul_en),
    gambar_url: teks(p.gambar_url),
    cta_teks_id: teks(p.cta_teks_id),
    cta_teks_en: teks(p.cta_teks_en),
    cta_url: teks(p.cta_url),
    urutan: angka(p.urutan) ?? 0,
    is_active: p.is_active,
  };

  const supabaseAdmin = createAdminClient();

  if (slideId == null) {
    const { error } = await supabaseAdmin.from('hero_slides').insert(slide);
    if (error) {
      console.error('[admin-hero-slide] gagal membuat slide:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan hero slide. Coba lagi.' };
    }
  } else {
    const { error } = await supabaseAdmin.from('hero_slides').update(slide).eq('id', slideId);
    if (error) {
      console.error('[admin-hero-slide] gagal mengubah slide:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan hero slide. Coba lagi.' };
    }
  }

  return { ok: true as const };
}

export async function hapusHeroSlideAction(slideId: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('hero_slides').delete().eq('id', slideId);
  if (error) {
    console.error('[admin-hero-slide] gagal hapus slide:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}

export async function toggleAktifHeroSlideAction(slideId: number, aktif: boolean) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('hero_slides').update({ is_active: aktif }).eq('id', slideId);
  if (error) {
    console.error('[admin-hero-slide] gagal ubah status aktif:', error);
    return { ok: false as const, pesan: 'Gagal mengubah status. Coba lagi.' };
  }
  return { ok: true as const };
}
