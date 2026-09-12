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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Leads &rarr; Permintaan Penawaran</h1>
      <PenawaranTable penawaran={penawaran ?? []} />
    </div>
  );
}
