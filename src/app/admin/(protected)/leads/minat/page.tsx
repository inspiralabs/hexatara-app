import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { LeadsTable } from '../leads-table';

export default async function AdminLeadsMinatPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: leads, error } = await supabase
    .from('batch_leads')
    .select('*, batches(judul_id)')
    .order('created_at', { ascending: false });

  if (error) console.error('[admin-leads-minat] gagal memuat lead:', error);

  return <LeadsTable judul="Leads → Pendaftaran Minat" leads={leads ?? []} />;
}
