'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type StatusLead = Database['public']['Enums']['status_lead'];

export async function updatePesananPublikStatusAction(id: number, status: StatusLead) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from('merchandise_public_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.error('[merchandise-publik] status:', error);
    return { ok: false as const, pesan: 'Gagal mengubah status.' };
  }
  revalidatePath('/admin/merchandise/pesanan-publik');
  return { ok: true as const };
}
