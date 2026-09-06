'use server';

import { redirect } from 'next/navigation';
import { LoginSchema } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/server';

export async function loginAdminAction(input: unknown) {
  const parsed = LoginSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { ok: false as const, pesan: 'Email atau kata sandi salah.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profile?.role !== 'admin') {
    // Jangan biarkan sesi non-admin menggantung walau sebentar.
    await supabase.auth.signOut();
    return { ok: false as const, pesan: 'Akun ini bukan Admin.' };
  }

  redirect('/admin');
}
