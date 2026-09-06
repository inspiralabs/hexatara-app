import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const typeParam = searchParams.get('type');
  const type = typeParam === 'email' || typeParam === 'recovery' ? typeParam : null;
  const next = searchParams.get('next') ?? '/login';

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      redirect(next);
    }
  }

  redirect(type === 'recovery' ? '/lupa-sandi?status=gagal' : '/verifikasi-email?status=gagal');
}
