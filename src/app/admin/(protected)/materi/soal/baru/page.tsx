import { requireAdmin } from '@/lib/auth/guard';
import { SoalForm } from '../soal-form';
import type { SoalFormInput } from '@/lib/validations/soal-admin';

const OPSI_KOSONG = { label_id: '', label_en: '', penjelasan_id: '', penjelasan_en: '' };

const DEFAULT_VALUES: SoalFormInput = {
  pertanyaan_id: '',
  pertanyaan_en: '',
  is_active: true,
  jawaban_benar: 'a',
  opsi_a: { ...OPSI_KOSONG },
  opsi_b: { ...OPSI_KOSONG },
  opsi_c: { ...OPSI_KOSONG },
  opsi_d: { ...OPSI_KOSONG },
};

export default async function AdminSoalBaruPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Tambah Soal</h1>
      <SoalForm mode="create" defaultValues={DEFAULT_VALUES} />
    </div>
  );
}
