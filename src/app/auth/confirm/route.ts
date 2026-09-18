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

  // Flow PKCE — sisa link lama signup sebelum F10.5.
  // F10.6: setelah tukar code, signOut supaya device yang klik TIDAK tinggal login;
  // device asal yang auto-login lewat polling.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await supabase.auth.signOut();
      redirect('/verifikasi-berhasil');
    }
  }

  // Recovery — device yang klik = device yang sedang reset sandi; sesi tetap.
  if (token_hash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) redirect(next);
    redirect('/lupa-sandi?status=gagal');
  }

  // Signup / email confirm (F10.6):
  // Admin API tidak punya verify-OTP-tanpa-sesi. verifyOtp() tetap dipakai
  // (satu-satunya cara validasi token_hash + isi email_confirmed_at), lalu
  // signOut() segera supaya cookie sesi di device pengklik dibersihkan.
  // Redirect ke layar statis — bukan dashboard.
  if (token_hash && (type === 'signup' || type === 'email')) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      await supabase.auth.signOut();
      redirect('/verifikasi-berhasil');
    }
  }

  redirect('/verifikasi-email?status=gagal');
}
