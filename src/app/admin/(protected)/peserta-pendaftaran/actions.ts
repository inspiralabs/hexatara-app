'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';

export async function hapusPesertaPendaftaranAction(registrasiId: number) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: row, error: bacaError } = await admin
    .from('batch_registrations')
    .select('id, foto_ktp_url, pas_foto_url')
    .eq('id', registrasiId)
    .single();

  if (bacaError || !row) {
    console.error('[peserta-pendaftaran] gagal baca sebelum hapus:', bacaError);
    return { ok: false as const, pesan: 'Pendaftaran tidak ditemukan.' };
  }

  const paths = [row.foto_ktp_url, row.pas_foto_url].filter(
    (p): p is string => Boolean(p)
  );
  if (paths.length > 0) {
    const { error: storageError } = await admin.storage
      .from('identity-documents')
      .remove(paths);
    if (storageError) {
      console.error('[peserta-pendaftaran] gagal hapus file identitas:', storageError);
    }
  }

  const { error } = await admin.from('batch_registrations').delete().eq('id', registrasiId);
  if (error) {
    console.error('[peserta-pendaftaran] gagal hapus:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }

  return { ok: true as const };
}
