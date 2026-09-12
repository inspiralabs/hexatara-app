'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseSpreadsheet, validateRow } from '@/lib/quiz/import';

export type BarisGagal = { baris: number; alasan: string };

export async function imporSoalAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get('berkas');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, pesan: 'Pilih berkas CSV atau Excel terlebih dahulu.' };
  }

  const parsed = await parseSpreadsheet(file);
  if (!parsed.ok) {
    return { ok: false as const, pesan: parsed.pesan };
  }

  const supabaseAdmin = createAdminClient();
  let berhasil = 0;
  const gagal: BarisGagal[] = [];
  // Lanjutkan dari urutan tertinggi yang sudah ada (ADR-014) — mulai dari 0
  // di sini akan bentrok dengan soal yang sudah ada di bank soal.
  const { data: existing } = await supabaseAdmin
    .from('quiz_questions')
    .select('urutan')
    .order('urutan', { ascending: false })
    .limit(1)
    .maybeSingle();
  let urutan = (existing?.urutan ?? -1) + 1;

  // Satu soal per baris, SENGAJA tanpa transaksi tunggal — satu baris rusak
  // tidak boleh menggagalkan baris lain (ENGINEERING §5.5).
  for (const { baris, sel } of parsed.rows) {
    const hasil = validateRow(sel);
    if (!hasil.ok) {
      gagal.push({ baris, alasan: hasil.alasan });
      continue;
    }

    const { data: soal, error: errSoal } = await supabaseAdmin
      .from('quiz_questions')
      .insert({ pertanyaan_id: hasil.data.pertanyaan_id, pertanyaan_en: hasil.data.pertanyaan_en, urutan: urutan++ })
      .select('id')
      .single();
    if (errSoal || !soal) {
      console.error('[admin-soal-impor] gagal simpan pertanyaan:', baris, errSoal);
      gagal.push({ baris, alasan: 'gagal menyimpan baris ini' });
      continue;
    }

    const { error: errOpsi } = await supabaseAdmin.from('quiz_options').insert(
      hasil.data.opsi.map((o, index) => ({ ...o, question_id: soal.id, urutan: index }))
    );
    if (errOpsi) {
      // Kompensasi: soal tanpa opsi lebih buruk daripada tidak ada soal sama sekali.
      await supabaseAdmin.from('quiz_questions').delete().eq('id', soal.id);
      const duplikat = errOpsi.code === '23505';
      if (!duplikat) console.error('[admin-soal-impor] gagal simpan opsi:', baris, errOpsi);
      gagal.push({ baris, alasan: duplikat ? 'jawaban benar tidak valid untuk baris ini' : 'gagal menyimpan baris ini' });
      continue;
    }

    berhasil++;
  }

  return { ok: true as const, berhasil, gagal };
}
