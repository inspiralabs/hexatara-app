'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';

export async function hapusLeadAction(leadId: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('batch_leads').delete().eq('id', leadId);
  if (error) {
    console.error('[admin-leads] gagal hapus lead:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}
