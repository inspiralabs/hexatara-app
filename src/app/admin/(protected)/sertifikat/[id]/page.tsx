import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { SertifikatForm } from '../sertifikat-form';
import type { SertifikatFormInput } from '@/lib/validations/sertifikat-admin';

export default async function AdminSertifikatUbahPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();
  const { data: sertifikat } = await supabase.from('certificates').select('*').eq('id', id).maybeSingle();
  if (!sertifikat) notFound();

  const defaultValues: SertifikatFormInput = {
    nomor_sertifikat: sertifikat.nomor_sertifikat,
    jenis: sertifikat.jenis,
    nama_lengkap: sertifikat.nama_lengkap,
    tanggal_terbit: sertifikat.tanggal_terbit,
    tanggal_kedaluwarsa: sertifikat.tanggal_kedaluwarsa,
    qr_aktif: sertifikat.qr_aktif,
    catatan: sertifikat.catatan ?? '',
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Ubah Sertifikat</h1>
      <SertifikatForm mode="edit" sertifikatId={sertifikat.id} defaultValues={defaultValues} />
    </div>
  );
}
