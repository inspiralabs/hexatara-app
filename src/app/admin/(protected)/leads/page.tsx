import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { LeadsTable } from './leads-table';
import { PenawaranTable } from './penawaran-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function AdminLeadsPage() {
  // Layout sudah memanggil requireAdmin(), tapi Server Component ini dipanggil
  // lagi secara eksplisit sesuai ENGINEERING §4.1 — bukan cuma diandalkan dari layout.
  await requireAdmin();

  const supabase = await createClient();
  const [{ data: leads, error: errLeads }, { data: penawaran, error: errPenawaran }] = await Promise.all([
    supabase
      .from('batch_leads')
      .select('*, batches(judul_id)')
      .order('created_at', { ascending: false }),
    supabase
      .from('quote_requests')
      .select('*, products(nama_id, nama_en)')
      .order('created_at', { ascending: false }),
  ]);

  if (errLeads) console.error('[admin-leads] gagal memuat lead:', errLeads);
  if (errPenawaran) console.error('[admin-leads] gagal memuat penawaran:', errPenawaran);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Leads</h1>
      <Tabs defaultValue="batch">
        <TabsList>
          <TabsTrigger value="batch">Pendaftaran Minat ({leads?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="penawaran">Permintaan Penawaran ({penawaran?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="batch">
          <LeadsTable leads={leads ?? []} />
        </TabsContent>
        <TabsContent value="penawaran">
          <PenawaranTable penawaran={penawaran ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
