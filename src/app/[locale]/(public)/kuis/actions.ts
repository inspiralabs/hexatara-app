'use server';

import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';

// Untuk user yang SUDAH LOGIN menyelesaikan kuis dari dashboard (§12.5.2) —
// langsung tandai selesai memakai identitas sesi yang ada, tanpa form daftar
// ulang. Idempotent (hanya isi kalau masih NULL) supaya mengulang kuis tidak
// menggeser tanggal selesai yang sudah tercatat.
export async function selesaikanKuisLoginAction() {
  const claims = await requireUser();

  const supabase = await createClient();
  await supabase
    .from('profiles')
    .update({ free_track_selesai_at: new Date().toISOString() })
    .eq('id', claims.sub)
    .is('free_track_selesai_at', null);

  redirect('/dashboard');
}
