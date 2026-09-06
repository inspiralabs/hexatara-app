'use server';

import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function logoutAdminAction() {
  // Dipanggil di sini, bukan cuma diandalkan dari layout — Server Action
  // punya endpoint sendiri dan bisa dipanggil langsung tanpa melewati layout.
  await requireAdmin();

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// Dipakai di seluruh form Admin yang punya unggah gambar (batch, popup, dst) —
// satu tempat, bukan disalin per tabel.
export async function uploadGambarAdminAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false as const, pesan: 'Berkas tidak ditemukan.' };
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `admin/${crypto.randomUUID()}.${ext}`;
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.storage.from('content').upload(path, file, {
    contentType: file.type,
  });
  if (error) {
    console.error('[admin] gagal unggah gambar:', error);
    return { ok: false as const, pesan: 'Gagal mengunggah gambar. Coba lagi.' };
  }

  const { data } = supabaseAdmin.storage.from('content').getPublicUrl(path);
  return { ok: true as const, url: data.publicUrl };
}
