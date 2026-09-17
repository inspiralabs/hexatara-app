'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';

export async function setujuiPendaftaranBatchAction(registrasiId: number) {
  const claims = await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('batch_registrations')
    .update({
      status: 'disetujui',
      alasan_tolak: null,
      verified_by: claims.sub,
      verified_at: new Date().toISOString(),
    })
    .eq('id', registrasiId)
    .eq('status', 'menunggu_verifikasi')
    .select('id')
    .single();

  if (error || !data) {
    console.error('[pendaftaran-batch] gagal setujui:', error);
    return { ok: false as const, pesan: 'Gagal menyetujui pendaftaran. Coba lagi.' };
  }

  return { ok: true as const };
}

export async function tolakPendaftaranBatchAction(registrasiId: number, alasan: string) {
  const claims = await requireAdmin();
  const supabase = await createClient();

  const alasanBersih = alasan.trim();
  if (!alasanBersih) {
    return { ok: false as const, pesan: 'Alasan penolakan wajib diisi.' };
  }

  const { data, error } = await supabase
    .from('batch_registrations')
    .update({
      status: 'ditolak',
      alasan_tolak: alasanBersih,
      verified_by: claims.sub,
      verified_at: new Date().toISOString(),
    })
    .eq('id', registrasiId)
    .eq('status', 'menunggu_verifikasi')
    .select('id')
    .single();

  if (error || !data) {
    console.error('[pendaftaran-batch] gagal tolak:', error);
    return { ok: false as const, pesan: 'Gagal menolak pendaftaran. Coba lagi.' };
  }

  return { ok: true as const };
}
