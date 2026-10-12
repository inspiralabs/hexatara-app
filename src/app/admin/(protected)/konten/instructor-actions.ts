'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { nextUrutan } from '@/lib/reorder';
import { InstructorFormSchema, type InstructorFormInput } from '@/lib/validations/instructor-admin';
import { teks } from '@/lib/validations/batch-admin';

export async function simpanInstructorAction(instructorId: number | null, input: InstructorFormInput) {
  await requireAdmin();

  const parsed = InstructorFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const p = parsed.data;
  // Tanpa bio_en — update tidak boleh menimpa kolom tersembunyi dengan null.
  const instructor = {
    nama: p.nama,
    jabatan_id: teks(p.jabatan_id),
    jabatan_en: teks(p.jabatan_en),
    bio_id: teks(p.bio_id),
    foto_url: teks(p.foto_url),
    is_active: p.is_active,
  };

  const supabaseAdmin = createAdminClient();

  if (instructorId == null) {
    // Item baru selalu muncul paling bawah (F15.7) — bukan dari input manual.
    const { data: existing } = await supabaseAdmin.from('instructors').select('urutan');
    const { error } = await supabaseAdmin
      .from('instructors')
      .insert({ ...instructor, urutan: nextUrutan(existing ?? []) });
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

// instructors.urutan TIDAK unique — aman di-update langsung per baris.
export async function reorderInstructorAction(instructorIds: number[]) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  for (const [index, id] of instructorIds.entries()) {
    const { error } = await supabaseAdmin.from('instructors').update({ urutan: index }).eq('id', id);
    if (error) {
      console.error('[admin-instructor] gagal reorder instruktur:', error);
      return { ok: false as const, pesan: 'Gagal mengubah urutan. Coba lagi.' };
    }
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
