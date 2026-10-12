'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { nextUrutan } from '@/lib/reorder';
import {
  PracticeLocationFormSchema,
  type PracticeLocationFormInput,
} from '@/lib/validations/practice-location-admin';

export async function simpanLokasiPraktekAction(id: number | null, input: PracticeLocationFormInput) {
  await requireAdmin();

  const parsed = PracticeLocationFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const row = {
    nama_kota: parsed.data.nama_kota.trim(),
    is_active: parsed.data.is_active,
  };
  const supabaseAdmin = createAdminClient();

  if (id == null) {
    // Item baru selalu muncul paling bawah (F15.7) — bukan dari input manual.
    const { data: existing } = await supabaseAdmin.from('practice_locations').select('urutan');
    const { error } = await supabaseAdmin
      .from('practice_locations')
      .insert({ ...row, urutan: nextUrutan(existing ?? []) });
    if (error) {
      if (error.code === '23505') {
        return { ok: false as const, pesan: 'Kota sudah ada' };
      }
      console.error('[admin-lokasi-praktek] gagal membuat:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan. Coba lagi.' };
    }
  } else {
    const { error } = await supabaseAdmin.from('practice_locations').update(row).eq('id', id);
    if (error) {
      if (error.code === '23505') {
        return { ok: false as const, pesan: 'Kota sudah ada' };
      }
      console.error('[admin-lokasi-praktek] gagal mengubah:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan. Coba lagi.' };
    }
  }

  return { ok: true as const };
}

export async function hapusLokasiPraktekAction(id: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const [{ count: countBatch }, { count: countCompany }] = await Promise.all([
    supabaseAdmin
      .from('batch_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('practice_location_id', id),
    supabaseAdmin
      .from('company_registration_participants')
      .select('id', { count: 'exact', head: true })
      .eq('practice_location_id', id),
  ]);

  if ((countBatch ?? 0) > 0 || (countCompany ?? 0) > 0) {
    return { ok: false as const, pesan: 'Sudah dipakai pendaftar, nonaktifkan saja.' };
  }

  const { error } = await supabaseAdmin.from('practice_locations').delete().eq('id', id);
  if (error) {
    if (error.code === '23503') {
      return { ok: false as const, pesan: 'Sudah dipakai pendaftar, nonaktifkan saja.' };
    }
    console.error('[admin-lokasi-praktek] gagal hapus:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}

// practice_locations.urutan TIDAK unique — aman di-update langsung per baris
// (pola sama products/hero_slides).
export async function reorderLokasiPraktekAction(ids: number[]) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  for (const [index, id] of ids.entries()) {
    const { error } = await supabaseAdmin.from('practice_locations').update({ urutan: index }).eq('id', id);
    if (error) {
      console.error('[admin-lokasi-praktek] gagal reorder:', error);
      return { ok: false as const, pesan: 'Gagal mengubah urutan. Coba lagi.' };
    }
  }
  return { ok: true as const };
}

export async function toggleAktifLokasiPraktekAction(id: number, next: boolean) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('practice_locations').update({ is_active: next }).eq('id', id);
  if (error) {
    console.error('[admin-lokasi-praktek] gagal ubah status:', error);
    return { ok: false as const, pesan: 'Gagal mengubah status. Coba lagi.' };
  }
  return { ok: true as const };
}
