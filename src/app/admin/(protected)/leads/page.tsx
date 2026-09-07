import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { LeadsTable } from './leads-table';

export default async function AdminLeadsPage() {
  // Layout sudah memanggil requireAdmin(), tapi Server Component ini dipanggil
  // lagi secara eksplisit sesuai ENGINEERING §4.1 — bukan cuma diandalkan dari layout.
  await requireAdmin();

  const supabase = await createClient();
  const { data: leads, error } = await supabase
    .from('batch_leads')
    .select('*, batches(judul_id)')
    .order('created_at', { ascending: false });

  if (error) console.error('[admin-leads] gagal memuat lead:', error);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Leads</h1>
      <LeadsTable leads={leads ?? []} />
    </div>
  );
}
