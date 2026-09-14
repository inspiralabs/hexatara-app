import { requireAdmin } from '@/lib/auth/guard';
import { SertifikatForm } from '../sertifikat-form';
import type { SertifikatFormInput } from '@/lib/validations/sertifikat-admin';

const DEFAULT_VALUES: SertifikatFormInput = {
  nomor_sertifikat: '',
  jenis: 'existing_manual',
  nama_lengkap: '',
  tanggal_terbit: '',
  tanggal_kedaluwarsa: '',
  qr_aktif: true,
  catatan: '',
};

export default async function AdminSertifikatBaruPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Tambah Sertifikat</h1>
      <SertifikatForm mode="create" defaultValues={DEFAULT_VALUES} />
    </div>
  );
}
