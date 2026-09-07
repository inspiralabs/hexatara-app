'use server';

import { ResetSandiSchema } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/server';

export async function resetSandiAction(input: unknown) {
  const parsed = ResetSandiSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid.' };
  }

  const supabase = await createClient();

  // Kalau tidak ada sesi pemulihan yang aktif (tautan sudah dipakai/kadaluwarsa),
  // updateUser akan gagal — itu yang menegakkan aturan "sekali pakai".
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return { ok: false as const, pesan: 'Sesi reset sudah tidak berlaku. Minta tautan baru.' };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { ok: false as const, pesan: 'Gagal mengubah kata sandi. Coba lagi.' };
  }

  return { ok: true as const };
}
