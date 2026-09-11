import 'server-only';
import { createClient } from '@/lib/supabase/server';

// Fase 1 cuma satu course/halaman Materi gratis (bukan multi-course) — Admin
// memperlakukan `materials` sebagai singleton, bukan daftar yang dikelola.
// "Yang mana" ditentukan dari isinya (baris yang punya bab), BUKAN dari id
// terkecil — sisa baris uji coba era pra-LMS (`uji_materi_ppt`/`uji_materi_pdf`,
// F03.12 lama) masih ada di database dan id-nya lebih kecil dari course
// sungguhan, jadi order-by-id-terkecil salah pilih baris.
// ponytail: kalau Fase 3 butuh multi-course sungguhan, pola ini perlu dibongkar.
export async function getMateriId(): Promise<number | null> {
  const supabase = await createClient();

  const { data: chapters } = await supabase.from('material_chapters').select('material_id');
  if (chapters && chapters.length > 0) {
    const jumlah = new Map<number, number>();
    for (const c of chapters) jumlah.set(c.material_id, (jumlah.get(c.material_id) ?? 0) + 1);
    const [materialIdTerbanyak] = [...jumlah.entries()].sort((a, b) => b[1] - a[1])[0]!;
    return materialIdTerbanyak;
  }

  // Belum ada bab sama sekali di database manapun — database baru/kosong,
  // fallback ke baris materials pertama (kalau ada) supaya alur "lengkapi
  // pengaturan dulu" di halaman Materi tetap punya sesuatu untuk diedit.
  const { data } = await supabase.from('materials').select('id').order('id').limit(1).maybeSingle();
  return data?.id ?? null;
}
