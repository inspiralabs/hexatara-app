import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

const OTP_TYPES = new Set<EmailOtpType>(['email', 'signup', 'recovery']);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const typeParam = searchParams.get('type');
  const type =
    typeParam && OTP_TYPES.has(typeParam as EmailOtpType)
      ? (typeParam as EmailOtpType)
      : null;
  const next = searchParams.get('next') ?? '/login';
  const supabase = await createClient();

  // Flow PKCE — sisa link lama dari signUp() sebelum F10.5.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  }

  // Flow OTP klasik — generateLink() + Resend (F10.5): token_hash + type.
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) redirect(next);
  }

  redirect(type === 'recovery' ? '/lupa-sandi?status=gagal' : '/verifikasi-email?status=gagal');
}
