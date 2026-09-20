import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { cn } from 'cn';
import { BatchTable } from './batch-table';

export default async function AdminBatchPage() {
  // Layout sudah memanggil requireAdmin(), tapi Server Component ini dipanggil
  // lagi secara eksplisit sesuai ENGINEERING §4.1 — bukan cuma diandalkan dari layout.
  await requireAdmin();

  const supabase = await createClient();
  const { data: batches, error } = await supabase
    .from('batches')
    .select('id, judul_id, status, is_active, tanggal_mulai, tanggal_selesai, batch_categories(nama_id)')
    .order('created_at', { ascending: false });

  if (error) console.error('[admin-batch] gagal memuat daftar:', error);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Batch Pelatihan</h1>
        <Link href="/admin/batch/baru" className={cn(buttonVariants(), 'h-11 px-5')}>
          Tambah Batch
        </Link>
      </div>

      <BatchTable batches={batches ?? []} />
    </div>
  );
}
