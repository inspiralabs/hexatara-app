'use server';

import { LupaSandiSchema } from '@/lib/validations/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { kirimEmailResetSandi } from '@/lib/email/send';

export async function lupaSandiAction(input: unknown) {
  const parsed = LupaSandiSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, pesan: 'Email tidak valid.' };
  }

  const supabaseAdmin = createAdminClient();
  const nextPath = '/reset-sandi';

  // generateLink error (email tidak terdaftar) SENGAJA tidak mengubah pesan —
  // supaya tidak bisa menebak email mana yang terdaftar.
  const { data: linkData, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: parsed.data.email,
    options: {
      redirectTo: new URL(nextPath, process.env.NEXT_PUBLIC_SITE_URL).toString(),
    },
  });

  if (!error && linkData.properties?.hashed_token) {
    // ponytail: hashed_token → /auth/confirm (sama pola daftar), bukan action_link
    const tautan = new URL('/auth/confirm', process.env.NEXT_PUBLIC_SITE_URL);
    tautan.searchParams.set('token_hash', linkData.properties.hashed_token);
    tautan.searchParams.set('type', 'recovery');
    tautan.searchParams.set('next', nextPath);

    const hasilKirim = await kirimEmailResetSandi(parsed.data.email, {
      tautan: tautan.toString(),
    });
    if (!hasilKirim.ok) {
      console.error('[lupa-sandi] gagal kirim email reset:', hasilKirim);
    }
  } else if (error) {
    console.error('[lupa-sandi] generateLink:', error.code, error.message);
  }

  return {
    ok: true as const,
    pesan: 'Kalau email itu terdaftar, kami sudah mengirim tautan reset kata sandi.',
  };
}
