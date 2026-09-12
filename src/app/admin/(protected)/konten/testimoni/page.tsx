import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { TestimonialList } from '../testimonial-list';

export default async function AdminKontenTestimoniPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: testimonials, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('urutan', { ascending: true });

  if (error) console.error('[admin-konten-testimoni] gagal memuat testimoni:', error);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Konten &rarr; Testimoni</h1>
      <TestimonialList testimonials={testimonials ?? []} />
    </div>
  );
}
