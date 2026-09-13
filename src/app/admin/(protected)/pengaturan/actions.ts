'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { upsertSiteSetting } from '@/lib/site-settings';
import {
  AdminNotifyEmailSchema,
  AdminProfilSchema,
  HargaUpgradeSchema,
  KontakPublikSchema,
  RekeningSchema,
} from '@/lib/validations/pengaturan-admin';
import { ResetSandiSchema } from '@/lib/validations/auth';

export async function simpanRekeningAction(input: unknown) {
  await requireAdmin();
  const parsed = RekeningSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, pesan: 'Data rekening belum valid.' };
  const error = await upsertSiteSetting('rekening', parsed.data);
  if (error) {
    console.error('[pengaturan] rekening:', error);
    return { ok: false as const, pesan: 'Gagal menyimpan rekening.' };
  }
  revalidatePath('/admin/pengaturan');
  return { ok: true as const };
}

export async function simpanKontakAction(input: unknown) {
  await requireAdmin();
  const parsed = KontakPublikSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, pesan: 'Data kontak belum valid.' };
  const error = await upsertSiteSetting('kontak', {
    wa: parsed.data.wa,
    email: parsed.data.email || undefined,
    instagram: parsed.data.instagram || undefined,
    jam_operasional: parsed.data.jam_operasional?.trim() || undefined,
  });
  if (error) {
    console.error('[pengaturan] kontak:', error);
    return { ok: false as const, pesan: 'Gagal menyimpan kontak.' };
  }
  revalidatePath('/admin/pengaturan');
  revalidatePath('/');
  return { ok: true as const };
}

export async function simpanAdminNotifyEmailAction(input: unknown) {
  await requireAdmin();
  const parsed = AdminNotifyEmailSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, pesan: 'Email notifikasi belum valid.' };
  const error = await upsertSiteSetting('admin_notify_email', parsed.data.email);
  if (error) {
    console.error('[pengaturan] admin_notify_email:', error);
    return { ok: false as const, pesan: 'Gagal menyimpan email notifikasi.' };
  }
  revalidatePath('/admin/pengaturan');
  return { ok: true as const };
}

export async function simpanHargaUpgradeAction(input: unknown) {
  await requireAdmin();
  const parsed = HargaUpgradeSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, pesan: 'Harga belum valid (bilangan bulat positif).' };
  const error = await upsertSiteSetting('harga_upgrade', parsed.data);
  if (error) {
    console.error('[pengaturan] harga_upgrade:', error);
    return { ok: false as const, pesan: 'Gagal menyimpan harga upgrade.' };
  }
  revalidatePath('/admin/pengaturan');
  revalidatePath('/dashboard');
  return { ok: true as const };
}

export async function simpanProfilAdminAction(input: unknown) {
  const claims = await requireAdmin();
  const parsed = AdminProfilSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, pesan: 'Nama lengkap wajib diisi.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ nama_lengkap: parsed.data.nama_lengkap })
    .eq('id', claims.sub);

  if (error) {
    console.error('[profil-admin]', error);
    return { ok: false as const, pesan: 'Gagal menyimpan profil.' };
  }
  revalidatePath('/admin/profil');
  return { ok: true as const };
}

export async function ubahPasswordAdminAction(input: unknown) {
  await requireAdmin();
  const parsed = ResetSandiSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, pesan: 'Kata sandi belum valid.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false as const, pesan: 'Gagal mengubah kata sandi.' };
  return { ok: true as const };
}
