import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SoalRowActions } from './soal-row-actions';

export default async function AdminSoalPage() {
  // Layout sudah memanggil requireAdmin(), tapi Server Component ini memanggil
  // lagi secara eksplisit sesuai ENGINEERING §4.1 — bukan cuma diandalkan dari layout.
  await requireAdmin();

  const supabase = await createClient();
  const { data: soal, error } = await supabase
    .from('quiz_questions')
    .select('id, pertanyaan_id, urutan, is_active')
    .order('urutan');

  if (error) console.error('[admin-soal] gagal memuat daftar:', error);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-warna-teks">Kuis</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/materi/soal/impor"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-warna-utama px-5 text-base font-semibold text-warna-utama"
          >
            Impor Excel
          </Link>
          <Link
            href="/admin/materi/soal/baru"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
          >
            Tambah Soal
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-warna-latar-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Urutan</TableHead>
              <TableHead>Pertanyaan</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!soal || soal.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-warna-teks-2">
                  Belum ada soal.
                </TableCell>
              </TableRow>
            ) : (
              soal.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.urutan}</TableCell>
                  <TableCell className="font-medium text-warna-teks">{s.pertanyaan_id}</TableCell>
                  <TableCell>{s.is_active ? 'Ya' : 'Tidak'}</TableCell>
                  <TableCell className="text-right">
                    <SoalRowActions id={s.id} pertanyaan={s.pertanyaan_id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
