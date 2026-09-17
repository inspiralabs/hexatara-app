import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PendaftaranBatchTable, type PendaftaranBatchRow } from './pendaftaran-batch-table';

export default async function AdminPendaftaranBatchPage() {
  await requireAdmin();

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data, error } = await supabase
    .from('batch_registrations')
    .select(
      `
      id,
      nama_lengkap,
      email,
      whatsapp,
      nomor_ktp,
      tempat_lahir,
      tanggal_lahir,
      alamat_lengkap,
      kategori_peserta,
      sumber_info,
      kode_referral,
      foto_ktp_url,
      pas_foto_url,
      user_id,
      created_at,
      batches ( judul_id )
    `
    )
    .eq('status', 'menunggu_verifikasi')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[pendaftaran-batch] gagal memuat antrean:', error);
  }

  const rows: PendaftaranBatchRow[] = await Promise.all(
    (data ?? []).map(async (row) => {
      let fotoKtpUrl: string | null = null;
      let pasFotoUrl: string | null = null;

      if (row.foto_ktp_url) {
        const { data: signed } = await admin.storage
          .from('identity-documents')
          .createSignedUrl(row.foto_ktp_url, 300);
        fotoKtpUrl = signed?.signedUrl ?? null;
      }
      if (row.pas_foto_url) {
        const { data: signed } = await admin.storage
          .from('identity-documents')
          .createSignedUrl(row.pas_foto_url, 300);
        pasFotoUrl = signed?.signedUrl ?? null;
      }

      const batch = row.batches as { judul_id: string } | null;

      return {
        id: row.id,
        nama_lengkap: row.nama_lengkap,
        email: row.email,
        whatsapp: row.whatsapp,
        nomor_ktp: row.nomor_ktp,
        tempat_lahir: row.tempat_lahir,
        tanggal_lahir: row.tanggal_lahir,
        alamat_lengkap: row.alamat_lengkap,
        kategori_peserta: row.kategori_peserta,
        sumber_info: row.sumber_info,
        kode_referral: row.kode_referral,
        user_id: row.user_id,
        created_at: row.created_at,
        batchJudul: batch?.judul_id ?? '—',
        fotoKtpUrl,
        pasFotoUrl,
      };
    })
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Verifikasi Pendaftaran Batch</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Antrean status menunggu verifikasi. Foto KTP dan pas foto lewat signed URL 5 menit.
        </p>
      </div>
      <PendaftaranBatchTable rows={rows} />
    </div>
  );
}
