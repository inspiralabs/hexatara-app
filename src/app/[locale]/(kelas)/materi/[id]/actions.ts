'use server';

import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';

// Dipanggil user yang SUDAH LOGIN saat klik "Lanjut ke Bab Berikutnya" (§12.5.3).
// Validasi urutan dilakukan di server, bukan dipercaya dari client — mencegah
// akal-akalan DevTools memanggil action ini langsung untuk bab ke-N tanpa
// melewati bab 1..N-1.
export async function selesaikanBabAction(materialId: number, chapterId: number) {
  const claims = await requireUser();
  const supabase = await createClient();

  const { data: chapters, error } = await supabase
    .from('material_chapters')
    .select('id, urutan')
    .eq('material_id', materialId)
    .order('urutan');

  if (error || !chapters) {
    return { ok: false as const, pesan: 'Gagal memuat bab. Coba lagi.' };
  }

  const target = chapters.find((c) => c.id === chapterId);
  if (!target) {
    return { ok: false as const, pesan: 'Bab tidak ditemukan.' };
  }

  const babSebelumnya = chapters.filter((c) => c.urutan < target.urutan);
  if (babSebelumnya.length > 0) {
    const { data: progress } = await supabase
      .from('material_progress')
      .select('chapter_id')
      .eq('user_id', claims.sub)
      .eq('is_selesai', true)
      .in(
        'chapter_id',
        babSebelumnya.map((c) => c.id)
      );

    const selesaiIds = new Set((progress ?? []).map((p) => p.chapter_id));
    const semuaSelesai = babSebelumnya.every((c) => selesaiIds.has(c.id));
    if (!semuaSelesai) {
      return { ok: false as const, pesan: 'Selesaikan bab sebelumnya terlebih dahulu.' };
    }
  }

  const { error: upsertError } = await supabase.from('material_progress').upsert(
    {
      user_id: claims.sub,
      chapter_id: chapterId,
      is_selesai: true,
      selesai_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,chapter_id' }
  );

  if (upsertError) {
    return { ok: false as const, pesan: 'Gagal menyimpan progress. Coba lagi.' };
  }

  return { ok: true as const };
}
