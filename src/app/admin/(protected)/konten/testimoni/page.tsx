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

  return <TestimonialList judul="Konten → Testimoni" testimonials={testimonials ?? []} />;
}
