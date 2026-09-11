import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guard';
import { getMateriId } from '@/lib/materi/singleton';
import { BabForm } from '../bab-form';
import type { BabFormInput } from '@/lib/validations/materi-bab-admin';

const DEFAULT_VALUES: BabFormInput = {
  judul_id: '',
  judul_en: '',
  konten_id: '',
  konten_en: '',
  video_url: '',
  gambar_url: '',
};

export default async function AdminMateriBaruPage() {
  await requireAdmin();
  const materialId = await getMateriId();
  if (materialId == null) redirect('/admin/materi');

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Tambah Materi</h1>
      <BabForm mode="create" materialId={materialId} defaultValues={DEFAULT_VALUES} />
    </div>
  );
}
