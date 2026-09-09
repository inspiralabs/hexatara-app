'use server';

import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSertifikatPreviewPdf } from '@/lib/certificate/pdf';

export async function unduhSertifikatPreviewAction() {
  const claims = await requireUser();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('nama_lengkap, free_track_selesai_at')
    .eq('id', claims.sub)
    .single();

  if (!profile?.free_track_selesai_at) {
    return { ok: false as const, pesan: 'Selesaikan kuis dan daftar akun terlebih dahulu.' };
  }

  const pdfBytes = await generateSertifikatPreviewPdf({
    namaLengkap: profile.nama_lengkap,
    tanggalSelesai: profile.free_track_selesai_at,
  });

  // Bucket 'certificates' privat, ditulis lewat admin client (ENGINEERING §3.1) —
  // path dari claims.sub (ID pengguna yang sedang login lewat requireUser()),
  // tidak pernah dari input yang bisa dipalsukan pengguna lain.
  const supabaseAdmin = createAdminClient();
  const path = `preview/${claims.sub}.pdf`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from('certificates')
    .upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });
  if (uploadError) {
    console.error('[dashboard] gagal unggah PDF preview:', uploadError);
    return { ok: false as const, pesan: 'Gagal membuat berkas PDF. Coba lagi.' };
  }

  // JANGAN menyusun URL bucket privat secara manual — selalu lewat createSignedUrl().
  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from('certificates')
    .createSignedUrl(path, 60);
  if (signError || !signed) {
    console.error('[dashboard] gagal membuat signed URL:', signError);
    return { ok: false as const, pesan: 'Gagal menyiapkan tautan unduhan. Coba lagi.' };
  }

  return { ok: true as const, url: signed.signedUrl };
}
