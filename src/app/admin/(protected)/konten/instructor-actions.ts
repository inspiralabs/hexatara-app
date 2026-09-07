'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { InstructorFormSchema, type InstructorFormInput } from '@/lib/validations/instructor-admin';
import { teks, angka } from '@/lib/validations/batch-admin';

export async function simpanInstructorAction(instructorId: number | null, input: InstructorFormInput) {
  await requireAdmin();

  const parsed = InstructorFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const p = parsed.data;
  const instructor = {
    nama: p.nama,
    jabatan_id: teks(p.jabatan_id),
    jabatan_en: teks(p.jabatan_en),
    bio_id: teks(p.bio_id),
    bio_en: teks(p.bio_en),
    foto_url: teks(p.foto_url),
    urutan: angka(p.urutan) ?? 0,
    is_active: p.is_active,
  };

  const supabaseAdmin = createAdminClient();

  if (instructorId == null) {
    const { error } = await supabaseAdmin.from('instructors').insert(instructor);
    if (error) {
      console.error('[admin-instructor] gagal membuat instruktur:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan instruktur. Coba lagi.' };
    }
  } else {
    const { error } = await supabaseAdmin.from('instructors').update(instructor).eq('id', instructorId);
    if (error) {
      console.error('[admin-instructor] gagal mengubah instruktur:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan instruktur. Coba lagi.' };
    }
  }

  return { ok: true as const };
}

export async function hapusInstructorAction(instructorId: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('instructors').delete().eq('id', instructorId);
  if (error) {
    console.error('[admin-instructor] gagal hapus instruktur:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}

export async function toggleAktifInstructorAction(instructorId: number, aktif: boolean) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('instructors').update({ is_active: aktif }).eq('id', instructorId);
  if (error) {
    console.error('[admin-instructor] gagal ubah status aktif:', error);
    return { ok: false as const, pesan: 'Gagal mengubah status. Coba lagi.' };
  }
  return { ok: true as const };
}
