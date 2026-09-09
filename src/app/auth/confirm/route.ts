import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const typeParam = searchParams.get('type');
  const type = typeParam === 'email' || typeParam === 'recovery' ? typeParam : null;
  const next = searchParams.get('next') ?? '/login';
  const supabase = await createClient();

  // Flow PKCE — dipakai signUp() (default @supabase/ssr createServerClient).
  // Link email membawa ?code=, bukan token_hash/type.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  }

  // Flow OTP klasik — dipakai reset kata sandi. Link email membawa token_hash + type.
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) redirect(next);
  }

  redirect(type === 'recovery' ? '/lupa-sandi?status=gagal' : '/verifikasi-email?status=gagal');
}
