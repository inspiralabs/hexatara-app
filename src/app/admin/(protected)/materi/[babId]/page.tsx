import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { getMateriId } from '@/lib/materi/singleton';
import { BabForm } from '../bab-form';
import type { BabFormInput } from '@/lib/validations/materi-bab-admin';

export default async function AdminMateriUbahPage({ params }: { params: Promise<{ babId: string }> }) {
  await requireAdmin();
  const { babId } = await params;

  const materialId = await getMateriId();
  if (materialId == null) notFound();

  const supabase = await createClient();
  const { data: bab } = await supabase.from('material_chapters').select('*').eq('id', Number(babId)).maybeSingle();
  if (!bab) notFound();

  const defaultValues: BabFormInput = {
    judul_id: bab.judul_id,
    judul_en: bab.judul_en ?? '',
    konten_id: bab.konten_id,
    konten_en: bab.konten_en ?? '',
    video_url: bab.video_url ?? '',
    gambar_url: bab.gambar_url ?? '',
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Ubah Materi</h1>
      <BabForm mode="edit" materialId={materialId} babId={bab.id} defaultValues={defaultValues} />
    </div>
  );
}
