'use server';

import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const COOKIE_PENDING = 'pending_verify_email';

/** Dipanggil dari daftarAction — sumber kebenaran email untuk polling (bukan argumen klien). */
export async function setPendingVerifyEmailCookie(email: string) {
  const jar = await cookies();
  jar.set(COOKIE_PENDING, email, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
}

export async function cekStatusVerifikasiAction() {
  const jar = await cookies();
  const email = jar.get(COOKIE_PENDING)?.value;
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
    }
  );
  if (!res.ok) {
    console.error('[verifikasi] list users by email gagal:', res.status);
    return { terverifikasi: false as const };
  }
  const body = (await res.json()) as { users?: { email?: string; email_confirmed_at?: string | null }[] };
  const user = body.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!user?.email_confirmed_at) {
    return { terverifikasi: false as const };
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

  jar.delete(COOKIE_PENDING);
  return { terverifikasi: true as const, gagalLogin: false as const };
}
