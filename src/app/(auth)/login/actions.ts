'use server';

import { LoginSchema } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/server';

export async function loginAction(input: unknown) {
  const parsed = LoginSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === 'email_not_confirmed') {
      return { ok: false as const, pesan: 'Email belum diverifikasi. Cek kotak masuk kamu.' };
    }
    return { ok: false as const, pesan: 'Email atau kata sandi salah.' };
  }

  return { ok: true as const };
}
