'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { ProfilSchema } from '@/lib/validations/profil';
import { ResetSandiSchema } from '@/lib/validations/auth';

export async function simpanProfilAction(input: unknown) {
  const claims = await requireUser();

  const parsed = ProfilSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ nama_lengkap: parsed.data.nama_lengkap, whatsapp: parsed.data.whatsapp ?? null })
    .eq('id', claims.sub);

  if (error) {
    console.error('[setting] gagal simpan profil:', error);
    return { ok: false as const, pesan: 'Gagal menyimpan profil. Coba lagi.' };
  }

  revalidatePath('/dashboard');
  return { ok: true as const };
}

// Sama persis dengan reset-sandi/actions.ts (tautan email) — bedanya di sini
// gerbangnya sesi login yang sudah aktif (requireUser()), bukan sesi recovery
// dari tautan sekali pakai. updateUser() sama-sama tidak minta sandi lama,
// konsisten dengan pola yang sudah ada, bukan longgar sengaja.
export async function ubahPasswordAction(input: unknown) {
  await requireUser();

  const parsed = ResetSandiSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { ok: false as const, pesan: 'Gagal mengubah kata sandi. Coba lagi.' };
  }

  return { ok: true as const };
}
