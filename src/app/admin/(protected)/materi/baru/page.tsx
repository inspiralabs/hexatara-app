import { requireAdmin } from '@/lib/auth/guard';
import { MateriForm } from '../materi-form';
import type { MateriFormInput } from '@/lib/validations/materi-admin';

const DEFAULT_VALUES: MateriFormInput = {
  judul_id: '',
  judul_en: '',
  deskripsi_id: '',
  deskripsi_en: '',
  file_url: '',
  urutan: 0,
  is_active: true,
};

export default async function AdminMateriBaruPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Tambah Materi</h1>
      <MateriForm mode="create" defaultValues={DEFAULT_VALUES} />
    </div>
  );
}
