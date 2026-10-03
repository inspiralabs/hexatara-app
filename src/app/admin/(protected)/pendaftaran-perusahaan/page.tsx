import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  PendaftaranPerusahaanTable,
  type PendaftaranPerusahaanRow,
} from './pendaftaran-perusahaan-table';

export default async function AdminPendaftaranPerusahaanPage() {
  await requireAdmin();

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data, error } = await supabase
    .from('company_registrations')
    .select(
      `
      id,
      nama_pic,
      whatsapp_pic,
      email_pic,
      nama_perusahaan,
      jumlah_peserta,
      file_excel_url,
      catatan,
      nominal,
      status,
      alasan_tolak,
      catatan_admin,
      created_at,
      batches ( judul_id ),
      company_registration_participants ( id, nama, whatsapp, email )
    `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[pendaftaran-perusahaan] gagal memuat:', error);
  }

  const rows: PendaftaranPerusahaanRow[] = await Promise.all(
    (data ?? []).map(async (row) => {
      let excelSignedUrl: string | null = null;
      if (row.file_excel_url) {
        const { data: signed } = await admin.storage
          .from('company-registrations')
          .createSignedUrl(row.file_excel_url, 300);
        excelSignedUrl = signed?.signedUrl ?? null;
      }

      const batchRel = row.batches as { judul_id: string } | null;
      const peserta = (row.company_registration_participants ?? []) as {
        id: number;
        nama: string;
        whatsapp: string;
        email: string;
      }[];

      return {
        id: row.id,
        nama_pic: row.nama_pic,
        whatsapp_pic: row.whatsapp_pic,
        email_pic: row.email_pic,
        nama_perusahaan: row.nama_perusahaan,
        jumlah_peserta: row.jumlah_peserta,
        catatan: row.catatan,
        nominal: row.nominal,
        status: row.status,
        alasan_tolak: row.alasan_tolak,
        catatan_admin: row.catatan_admin,
        created_at: row.created_at,
        batchJudul: batchRel?.judul_id ?? '—',
        excelSignedUrl,
        peserta,
      };
    }),
  );

  return <PendaftaranPerusahaanTable rows={rows} />;
}
