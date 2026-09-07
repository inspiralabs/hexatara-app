'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { SaleBannerFormSchema, type SaleBannerFormInput } from '@/lib/validations/sale-banner-admin';
import { teks } from '@/lib/validations/batch-admin';

export async function simpanSaleBannerAction(bannerId: number | null, input: SaleBannerFormInput) {
  await requireAdmin();

  const parsed = SaleBannerFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const p = parsed.data;
  const banner = {
    judul_id: p.judul_id,
    judul_en: teks(p.judul_en),
    teks_id: teks(p.teks_id),
    teks_en: teks(p.teks_en),
    urgensi_id: teks(p.urgensi_id),
    urgensi_en: teks(p.urgensi_en),
    tombol_teks_id: teks(p.tombol_teks_id),
    tombol_teks_en: teks(p.tombol_teks_en),
    tombol_url: teks(p.tombol_url),
    tayang_mulai: teks(p.tayang_mulai),
    tayang_selesai: teks(p.tayang_selesai),
    is_active: p.is_active,
  };

  const supabaseAdmin = createAdminClient();

  if (bannerId == null) {
    const { error } = await supabaseAdmin.from('sale_banners').insert(banner);
    if (error) {
      console.error('[admin-sale-banner] gagal membuat banner:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan sale banner. Coba lagi.' };
    }
  } else {
    const { error } = await supabaseAdmin.from('sale_banners').update(banner).eq('id', bannerId);
    if (error) {
      console.error('[admin-sale-banner] gagal mengubah banner:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan sale banner. Coba lagi.' };
    }
  }

  return { ok: true as const };
}

export async function hapusSaleBannerAction(bannerId: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('sale_banners').delete().eq('id', bannerId);
  if (error) {
    console.error('[admin-sale-banner] gagal hapus banner:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}

export async function toggleAktifSaleBannerAction(bannerId: number, aktif: boolean) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('sale_banners').update({ is_active: aktif }).eq('id', bannerId);
  if (error) {
    console.error('[admin-sale-banner] gagal ubah status aktif:', error);
    return { ok: false as const, pesan: 'Gagal mengubah status. Coba lagi.' };
  }
  return { ok: true as const };
}
