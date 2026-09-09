import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { MateriForm } from '../materi-form';
import type { MateriFormInput } from '@/lib/validations/materi-admin';

export default async function AdminMateriUbahPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();
  const { data: materi } = await supabase.from('materials').select('*').eq('id', Number(id)).maybeSingle();
  if (!materi) notFound();

  const defaultValues: MateriFormInput = {
    judul_id: materi.judul_id,
    judul_en: materi.judul_en ?? '',
    deskripsi_id: materi.deskripsi_id ?? '',
    deskripsi_en: materi.deskripsi_en ?? '',
    file_url: materi.file_url,
    urutan: materi.urutan,
    is_active: materi.is_active,
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Ubah Materi</h1>
      <MateriForm mode="edit" materiId={materi.id} defaultValues={defaultValues} />
    </div>
  );
}
