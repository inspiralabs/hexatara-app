import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { getMateriId } from '@/lib/materi/singleton';
import { LampiranList } from './lampiran-list';

export default async function AdminFilePage() {
  await requireAdmin();

  const materialId = await getMateriId();

  if (materialId == null) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-foreground">File</h1>
        <p className="text-sm text-muted-foreground">
          Belum ada Materi. Buat Materi dulu di menu{' '}
          <Link href="/admin/materi" className="text-primary underline">
            Materi
          </Link>{' '}
          sebelum menambah File.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: bab, error: errBab } = await supabase
    .from('material_chapters')
    .select('id, judul_id')
    .eq('material_id', materialId)
    .order('urutan');
  if (errBab) console.error('[admin-file] gagal memuat daftar materi:', errBab);

  const chapterIds = (bab ?? []).map((b) => b.id);
  const { data: lampiran, error: errLampiran } =
    chapterIds.length > 0
      ? await supabase.from('material_chapter_files').select('*').in('chapter_id', chapterIds).order('urutan')
      : { data: [], error: null };
  if (errLampiran) console.error('[admin-file] gagal memuat daftar file:', errLampiran);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">File</h1>
      <p className="text-sm text-muted-foreground">
        File dikelompokkan per Materi — tombol Tambah pada tiap kelompok otomatis mengaitkan file ke Materi itu.
      </p>

      {!bab || bab.length === 0 ? (
        <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
          Belum ada Materi.{' '}
          <Link href="/admin/materi/baru" className="text-primary underline">
            Tambah Materi
          </Link>{' '}
          dulu sebelum menambah File.
        </p>
      ) : (
        bab.map((b) => (
          <div key={b.id} className="flex flex-col gap-2 rounded-lg border border-border p-4">
            <h2 className="text-base font-semibold text-foreground">{b.judul_id}</h2>
            <LampiranList chapterId={b.id} lampiran={(lampiran ?? []).filter((l) => l.chapter_id === b.id)} />
          </div>
        ))
      )}
    </div>
  );
}
