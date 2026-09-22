'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  clearPendingVerifyEmailCookie,
  getPendingVerifyEmail,
  konfirmasiMasihDalamJendela,
} from '@/lib/auth/pending-verify-email';
import { cekRateLimitVerifikasiPoll } from '@/lib/rate-limit/verifikasi-poll';

/**
 * Poll dari device yang baru daftar (cookie HttpOnly di-set HANYA oleh daftarAction).
 * Email TIDAK diterima dari argumen klien — hanya dari cookie.
 */
export async function cekStatusVerifikasiAction() {
  const boleh = await cekRateLimitVerifikasiPoll();
  if (!boleh) {
    return { terverifikasi: false as const, rateLimited: true as const };
  }

  const email = await getPendingVerifyEmail();
  if (!email) {
    return { terverifikasi: false as const };
  }

  const supabaseAdmin = createAdminClient();

  // GoTrue admin: GET /admin/users?email=… (filter native; listUsers JS hanya page/perPage)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
      cache: 'no-store',
    },
  );
  if (!res.ok) {
    console.error('[verifikasi] list users by email gagal:', res.status);
    return { terverifikasi: false as const };
  }
  const body = (await res.json()) as {
    users?: { email?: string; email_confirmed_at?: string | null }[];
  };
  const user = body.users?.find((u) => u.email?.toLowerCase() === email);

  if (!user?.email_confirmed_at) {
    return { terverifikasi: false as const };
  }

  // Akun yang sudah lama terverifikasi jangan di-magic-link (defense in depth).
  if (!konfirmasiMasihDalamJendela(user.email_confirmed_at)) {
    await clearPendingVerifyEmailCookie();
    return { terverifikasi: true as const, gagalLogin: true as const };
  }

  // generateLink magiclink TIDAK mengirim email — hanya token untuk verifyOtp di device asal.
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (linkError || !linkData.properties?.hashed_token) {
    console.error('[verifikasi] gagal generate magic link untuk auto-login:', linkError);
    return { terverifikasi: true as const, gagalLogin: true as const };
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: linkData.properties.hashed_token,
  });

  if (verifyError) {
    console.error('[verifikasi] gagal verifyOtp untuk auto-login:', verifyError);
    return { terverifikasi: true as const, gagalLogin: true as const };
  }

  await clearPendingVerifyEmailCookie();
  return { terverifikasi: true as const, gagalLogin: false as const };
}
