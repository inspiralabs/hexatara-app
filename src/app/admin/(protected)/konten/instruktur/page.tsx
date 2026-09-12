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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Konten &rarr; Instruktur</h1>
      <InstructorList instructors={instructors ?? []} />
    </div>
  );
}
