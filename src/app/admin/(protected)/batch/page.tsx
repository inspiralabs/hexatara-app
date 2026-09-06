import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { STATUS_BATCH_LABEL, formatTanggalBatch } from '@/lib/batch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BatchRowActions } from './batch-row-actions';
import { BatchActiveSwitch } from './batch-active-switch';

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

      <div className="overflow-x-auto rounded-lg border border-warna-latar-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!batches || batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-warna-teks-2">
                  Belum ada batch.
                </TableCell>
              </TableRow>
            ) : (
              batches.map((batch) => {
                const status = STATUS_BATCH_LABEL[batch.status];
                return (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium text-warna-teks">{batch.judul_id}</TableCell>
                    <TableCell>{batch.kategori_id ?? '—'}</TableCell>
                    <TableCell>
                      {formatTanggalBatch(batch.tanggal_mulai, batch.tanggal_selesai) ?? '—'}
                    </TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <BatchActiveSwitch batchId={batch.id} aktif={batch.is_active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <BatchRowActions batchId={batch.id} judul={batch.judul_id} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
