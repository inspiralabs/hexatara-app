import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SoalList } from './soal-list';

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Kuis</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/materi/soal/impor" className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-5')}>
            Impor Excel
          </Link>
          <Link href="/admin/materi/soal/baru" className={cn(buttonVariants(), 'h-11 px-5')}>
            Tambah Soal
          </Link>
        </div>
      </div>

      <SoalList soal={soal ?? []} />
    </div>
  );
}
