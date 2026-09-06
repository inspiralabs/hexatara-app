'use server';

import { LupaSandiSchema } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/server';

export async function lupaSandiAction(input: unknown) {
  const parsed = LupaSandiSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, pesan: 'Email tidak valid.' };
  }

  const supabase = await createClient();

  // Hasil panggilan ini SENGAJA tidak menentukan pesan ke pengguna — supaya
  // tidak ada yang bisa menebak email mana yang terdaftar dari respons form.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-sandi`,
  });

  return {
    ok: true as const,
    pesan: 'Kalau email itu terdaftar, kami sudah mengirim tautan reset kata sandi.',
  };
}
