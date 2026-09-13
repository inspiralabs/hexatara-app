import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { PopupList } from '../popup-list';

export default async function AdminKontenPopupPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: popups, error } = await supabase
    .from('popups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('[admin-konten-popup] gagal memuat popup:', error);

  return <PopupList judul="Konten → Pop-up" popups={popups ?? []} />;
}
