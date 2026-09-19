'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database';

export async function hapusPenawaranAction(id: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('quote_requests').delete().eq('id', id);
  if (error) {
    console.error('[admin-leads] gagal hapus penawaran:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}

export async function updatePenawaranStatusAction(
  id: number,
  status: Database['public']['Enums']['status_lead']
) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('quote_requests').update({ status }).eq('id', id);
  if (error) {
    console.error('[admin-leads] gagal ubah status penawaran:', error);
    return { ok: false as const, pesan: 'Gagal mengubah status. Coba lagi.' };
  }
  return { ok: true as const };
}
