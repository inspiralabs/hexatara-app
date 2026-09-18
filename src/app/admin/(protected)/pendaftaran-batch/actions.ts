'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function setujuiPendaftaranBatchAction(registrasiId: number, formData: FormData) {
  const claims = await requireAdmin();
  const supabase = await createClient();

  const file = formData.get('bukti');
  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    return { ok: false as const, pesan: 'Bukti pembayaran wajib diunggah (berkas gambar).' };
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `batch-${registrasiId}.${ext}`;
  const supabaseAdmin = createAdminClient();

  const { error: uploadError } = await supabaseAdmin.storage
    .from('payment-proofs')
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadError) {
    console.error('[pendaftaran-batch] gagal unggah bukti:', uploadError);
    return { ok: false as const, pesan: 'Gagal mengunggah bukti pembayaran. Coba lagi.' };
  }

  const { data, error } = await supabase
    .from('batch_registrations')
    .update({
      status: 'disetujui',
      bukti_url: path,
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
