import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { SoalForm } from '../soal-form';
import type { SoalFormInput } from '@/lib/validations/soal-admin';

export default async function AdminSoalUbahPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();
  const [{ data: soal }, { data: opsi }] = await Promise.all([
    supabase.from('quiz_questions').select('*').eq('id', Number(id)).maybeSingle(),
    supabase.from('quiz_options').select('*').eq('question_id', Number(id)).order('urutan'),
  ]);
  if (!soal) notFound();

  const urutanKeHuruf = ['a', 'b', 'c', 'd'] as const;
  const opsiByHuruf = Object.fromEntries(
    (opsi ?? []).map((o, index) => [urutanKeHuruf[index] ?? 'a', o])
  );
  const jawabanBenar = (opsi ?? []).findIndex((o) => o.is_correct);

  function nilaiOpsi(huruf: (typeof urutanKeHuruf)[number]) {
    const o = opsiByHuruf[huruf];
    return {
      label_id: o?.label_id ?? '',
      label_en: o?.label_en ?? '',
      penjelasan_id: o?.penjelasan_id ?? '',
      penjelasan_en: o?.penjelasan_en ?? '',
    };
  }

  const defaultValues: SoalFormInput = {
    pertanyaan_id: soal.pertanyaan_id,
    pertanyaan_en: soal.pertanyaan_en ?? '',
    urutan: soal.urutan,
    is_active: soal.is_active,
    jawaban_benar: (urutanKeHuruf[jawabanBenar] ?? 'a') as SoalFormInput['jawaban_benar'],
    opsi_a: nilaiOpsi('a'),
    opsi_b: nilaiOpsi('b'),
    opsi_c: nilaiOpsi('c'),
    opsi_d: nilaiOpsi('d'),
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Ubah Soal</h1>
      <SoalForm mode="edit" soalId={soal.id} defaultValues={defaultValues} />
    </div>
  );
}
