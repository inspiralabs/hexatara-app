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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Konten &rarr; Pop-up</h1>
      <PopupList popups={popups ?? []} />
    </div>
  );
}
