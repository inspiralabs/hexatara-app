import 'server-only';

import { createClient } from '@/lib/supabase/server';

/** Memanggil RPC `profil_identitas_lengkap` — jangan cek 6 field manual di TS. */
export async function isProfilIdentitasLengkap(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('profil_identitas_lengkap', {
    p_user_id: userId,
  });

  if (error) {
    console.error('[identitas] profil_identitas_lengkap gagal:', error.message);
    return false;
  }

  return data === true;
}
