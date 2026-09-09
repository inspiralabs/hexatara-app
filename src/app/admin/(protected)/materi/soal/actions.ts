'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { teks, angka } from '@/lib/validations/batch-admin';
import { SoalFormSchema, type SoalFormInput } from '@/lib/validations/soal-admin';

const HURUF_OPSI = ['a', 'b', 'c', 'd'] as const;

function pesanGagalSimpanOpsi(error: { code?: string }) {
  if (error.code === '23505') {
    return 'Soal ini punya lebih dari satu jawaban benar. Periksa kembali pilihan jawaban benar.';
  }
  return 'Gagal menyimpan opsi. Coba lagi.';
}

export async function simpanSoalAction(id: number | null, input: SoalFormInput) {
  await requireAdmin();

  const parsed = SoalFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const { jawaban_benar, opsi_a, opsi_b, opsi_c, opsi_d, ...rest } = parsed.data;
  const opsiMap = { a: opsi_a, b: opsi_b, c: opsi_c, d: opsi_d };

  const supabaseAdmin = createAdminClient();
  const soal = {
    pertanyaan_id: rest.pertanyaan_id,
    pertanyaan_en: teks(rest.pertanyaan_en),
    urutan: angka(rest.urutan) ?? 0,
    is_active: rest.is_active,
  };

  let soalId = id;
  if (soalId == null) {
    const { data, error } = await supabaseAdmin.from('quiz_questions').insert(soal).select('id').single();
    if (error || !data) {
      console.error('[admin-soal] gagal membuat soal:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan soal. Coba lagi.' };
    }
    soalId = data.id;
  } else {
    const { error } = await supabaseAdmin.from('quiz_questions').update(soal).eq('id', soalId);
    if (error) {
      console.error('[admin-soal] gagal mengubah soal:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan soal. Coba lagi.' };
    }
  }

  // Replace-all opsi per soal — pola sama dengan batch_benefits (F01.12): lebih
  // sederhana daripada diff per baris, wajar untuk daftar sekecil ini (4 opsi tetap).
  const { error: hapusError } = await supabaseAdmin.from('quiz_options').delete().eq('question_id', soalId);
  if (hapusError) {
    console.error('[admin-soal] gagal hapus opsi lama:', hapusError);
    return { ok: false as const, pesan: 'Gagal menyimpan opsi. Coba lagi.' };
  }

  const { error: opsiError } = await supabaseAdmin.from('quiz_options').insert(
    HURUF_OPSI.map((huruf, index) => {
      const o = opsiMap[huruf];
      const benar = huruf === jawaban_benar;
      return {
        question_id: soalId,
        urutan: index,
        label_id: o.label_id,
        label_en: teks(o.label_en),
        is_correct: benar,
        // Penjelasan cuma milik opsi salah — dikosongkan untuk opsi yang benar
        // walau Admin mengisinya, sama seperti aturan import (PRD §8.10).
        penjelasan_id: benar ? null : teks(o.penjelasan_id),
        penjelasan_en: benar ? null : teks(o.penjelasan_en),
      };
    })
  );
  if (opsiError) {
    console.error('[admin-soal] gagal simpan opsi:', opsiError);
    return { ok: false as const, pesan: pesanGagalSimpanOpsi(opsiError) };
  }

  return { ok: true as const, id: soalId };
}

export async function hapusSoalAction(id: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('quiz_questions').delete().eq('id', id);
  if (error) {
    console.error('[admin-soal] gagal hapus soal:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}
