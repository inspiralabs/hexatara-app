'use server';

import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { getFreemiumLmsAccess } from '@/lib/site-settings';

// Untuk user yang SUDAH LOGIN menyelesaikan kuis dari dashboard (§12.5.2) —
// langsung tandai selesai memakai identitas sesi yang ada, tanpa form daftar
// ulang. Idempotent (hanya isi kalau masih NULL) supaya mengulang kuis tidak
// menggeser tanggal selesai yang sudah tercatat.
//
// Dipakai sebagai form action — harus Promise<void>. Saat LMS tertutup:
// jangan isi free_track; redirect (halaman /kuis sudah digerbang).
export async function selesaikanKuisLoginAction() {
  const { allowed } = await getFreemiumLmsAccess();
  if (!allowed) {
    redirect('/pelatihan');
  }

  const claims = await requireUser();

  const supabase = await createClient();
  await supabase
    .from('profiles')
    .update({ free_track_selesai_at: new Date().toISOString() })
    .eq('id', claims.sub)
    .is('free_track_selesai_at', null);

  redirect('/dashboard');
}
