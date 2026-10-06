import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { PartnerList } from '../partner-list';

export default async function AdminKontenPartnerPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: partners, error } = await supabase
    .from('partners')
    .select('*')
    .order('urutan', { ascending: true })
    .order('id', { ascending: true });

  if (error) console.error('[admin-konten-partner] gagal memuat partner:', error);

  return <PartnerList judul="Konten → Partner Kami" partners={partners ?? []} />;
}
