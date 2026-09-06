'use server';

import { DaftarSchema } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/server';

export async function daftarAction(input: unknown) {
  const parsed = DaftarSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const { nama_lengkap, email, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nama_lengkap, consent_at: new Date().toISOString() },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verifikasi-email`,
    },
  });

  if (error) {
    if (error.code === 'user_already_exists') {
      return { ok: false as const, pesan: 'Email ini sudah terdaftar. Coba masuk.' };
    }
    return { ok: false as const, pesan: 'Gagal mendaftar. Coba lagi.' };
  }

  return { ok: true as const };
}
