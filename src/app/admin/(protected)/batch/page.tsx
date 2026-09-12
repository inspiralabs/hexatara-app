import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { BatchTable } from './batch-table';

export default async function AdminBatchPage() {
  // Layout sudah memanggil requireAdmin(), tapi Server Component ini dipanggil
  // lagi secara eksplisit sesuai ENGINEERING §4.1 — bukan cuma diandalkan dari layout.
  await requireAdmin();

  const supabase = await createClient();
  const { data: batches, error } = await supabase
    .from('batches')
    .select('id, judul_id, kategori_id, status, is_active, tanggal_mulai, tanggal_selesai')
    .order('created_at', { ascending: false });

  if (error) console.error('[admin-batch] gagal memuat daftar:', error);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-warna-teks">Batch Pelatihan</h1>
        <Link
          href="/admin/batch/baru"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          Tambah Batch
        </Link>
      </div>

      <BatchTable batches={batches ?? []} />
    </div>
  );
}
