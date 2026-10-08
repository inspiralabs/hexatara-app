import { Suspense } from 'react';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminBatchFilter } from '@/components/admin/admin-batch-filter';
import { PendaftaranBatchTable, type PendaftaranBatchRow } from './pendaftaran-batch-table';

const LABEL_STATUS_BATCH: Record<string, string> = {
  upcoming: 'Akan datang',
  open: 'Dibuka',
  closed: 'Ditutup',
};

export default async function AdminPendaftaranBatchPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string }>;
}) {
  await requireAdmin();

  const { batch } = await searchParams;
  const batchId =
    batch && /^\d+$/.test(batch) ? Number.parseInt(batch, 10) : undefined;

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: batchList } = await supabase
    .from('batches')
    .select('id, judul_id, status')
    .order('created_at', { ascending: false });

  let query = supabase
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
      ukuran_baju,
      foto_ktp_url,
      pas_foto_url,
      user_id,
      created_at,
      batches ( judul_id ),
      practice_locations ( nama_kota )
    `
    )
    .eq('status', 'menunggu_verifikasi')
    .order('created_at', { ascending: true });

  if (batchId !== undefined) {
    query = query.eq('batch_id', batchId);
  }

  const { data, error } = await query;
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

      const batchRel = row.batches as { judul_id: string } | null;
      const lokasiRel = row.practice_locations as { nama_kota: string } | null;

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
        batchJudul: batchRel?.judul_id ?? '—',
        lokasiPraktek: lokasiRel?.nama_kota ?? null,
        ukuranBaju: row.ukuran_baju,
        fotoKtpUrl,
        pasFotoUrl,
      };
    })
  );

  const filterOptions = (batchList ?? []).map((b) => ({
    value: String(b.id),
    label: `${b.judul_id} (${LABEL_STATUS_BATCH[b.status] ?? b.status})`,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Verifikasi Pendaftaran Batch</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Antrean status menunggu verifikasi. Foto KTP dan pas foto lewat signed URL 5 menit.
        </p>
      </div>

      <Suspense fallback={null}>
        <AdminBatchFilter
          options={filterOptions}
          value={batchId !== undefined ? String(batchId) : undefined}
        />
      </Suspense>

      <PendaftaranBatchTable rows={rows} />
    </div>
  );
}
