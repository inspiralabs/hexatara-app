import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PopupList } from './popup-list';

function TabBelumDibangun() {
  return <p className="pt-6 text-sm text-warna-teks-2">Belum dibangun — menyusul sesi berikutnya.</p>;
}

export default async function AdminKontenPage() {
  // Layout sudah memanggil requireAdmin(), tapi Server Component ini dipanggil
  // lagi secara eksplisit sesuai ENGINEERING §4.1 — bukan cuma diandalkan dari layout.
  await requireAdmin();

  const supabase = await createClient();
  const { data: popups, error } = await supabase
    .from('popups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('[admin-konten] gagal memuat popup:', error);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Konten Landing</h1>

      <Tabs defaultValue="popup">
        <TabsList>
          <TabsTrigger value="popup">Pop-up</TabsTrigger>
          <TabsTrigger value="banner">Sale Banner</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="instruktur">Instruktur</TabsTrigger>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="testimoni">Testimoni</TabsTrigger>
        </TabsList>

        <TabsContent value="popup">
          <PopupList popups={popups ?? []} />
        </TabsContent>
        <TabsContent value="banner">
          <TabBelumDibangun />
        </TabsContent>
        <TabsContent value="hero">
          <TabBelumDibangun />
        </TabsContent>
        <TabsContent value="instruktur">
          <TabBelumDibangun />
        </TabsContent>
        <TabsContent value="company">
          <TabBelumDibangun />
        </TabsContent>
        <TabsContent value="testimoni">
          <TabBelumDibangun />
        </TabsContent>
      </Tabs>
    </div>
  );
}
