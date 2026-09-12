import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { HeroSlideList } from '../hero-slide-list';

export default async function AdminKontenHeroPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: heroSlides, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('urutan', { ascending: true });

  if (error) console.error('[admin-konten-hero] gagal memuat hero slide:', error);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Konten &rarr; Hero</h1>
      <HeroSlideList slides={heroSlides ?? []} />
    </div>
  );
}
