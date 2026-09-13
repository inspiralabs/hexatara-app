import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { PenawaranTable } from '../penawaran-table';

export default async function AdminLeadsPenawaranPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: penawaran, error } = await supabase
    .from('quote_requests')
    .select('*, products(nama_id, nama_en)')
    .order('created_at', { ascending: false });

  if (error) console.error('[admin-leads-penawaran] gagal memuat penawaran:', error);

  return <PenawaranTable judul="Leads → Permintaan Penawaran" penawaran={penawaran ?? []} />;
}
