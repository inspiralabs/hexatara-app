import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { InstructorList } from '../instructor-list';

export default async function AdminKontenInstrukturPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: instructors, error } = await supabase
    .from('instructors')
    .select('*')
    .order('urutan', { ascending: true });

  if (error) console.error('[admin-konten-instruktur] gagal memuat instruktur:', error);

  return <InstructorList judul="Konten → Instruktur" instructors={instructors ?? []} />;
}
