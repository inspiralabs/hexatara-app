import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { SaleBannerList } from '../sale-banner-list';

export default async function AdminKontenBannerPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: saleBanners, error } = await supabase
    .from('sale_banners')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('[admin-konten-banner] gagal memuat sale banner:', error);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Konten &rarr; Sale Banner</h1>
      <SaleBannerList banners={saleBanners ?? []} />
    </div>
  );
}
