'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { TestimonialFormSchema, type TestimonialFormInput } from '@/lib/validations/testimonial-admin';
import { teks, angka } from '@/lib/validations/batch-admin';

export async function simpanTestimonialAction(testimonialId: number | null, input: TestimonialFormInput) {
  await requireAdmin();

  const parsed = TestimonialFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const p = parsed.data;
  const testimonial = {
    nama: p.nama,
    peran_id: teks(p.peran_id),
    peran_en: teks(p.peran_en),
    isi_id: p.isi_id,
    isi_en: teks(p.isi_en),
    foto_url: teks(p.foto_url),
    urutan: angka(p.urutan) ?? 0,
    is_active: p.is_active,
  };

  const supabaseAdmin = createAdminClient();

  if (testimonialId == null) {
    const { error } = await supabaseAdmin.from('testimonials').insert(testimonial);
    if (error) {
      console.error('[admin-testimonial] gagal membuat testimoni:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan testimoni. Coba lagi.' };
    }
  } else {
    const { error } = await supabaseAdmin.from('testimonials').update(testimonial).eq('id', testimonialId);
    if (error) {
      console.error('[admin-testimonial] gagal mengubah testimoni:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan testimoni. Coba lagi.' };
    }
  }

  return { ok: true as const };
}

export async function hapusTestimonialAction(testimonialId: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('testimonials').delete().eq('id', testimonialId);
  if (error) {
    console.error('[admin-testimonial] gagal hapus testimoni:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}

export async function toggleAktifTestimonialAction(testimonialId: number, aktif: boolean) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('testimonials').update({ is_active: aktif }).eq('id', testimonialId);
  if (error) {
    console.error('[admin-testimonial] gagal ubah status aktif:', error);
    return { ok: false as const, pesan: 'Gagal mengubah status. Coba lagi.' };
  }
  return { ok: true as const };
}
