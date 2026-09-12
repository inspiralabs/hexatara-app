-- ============================================================
-- SQL 21 — Reorder otomatis untuk quiz_questions (ADR-014)
-- Dijalankan MANUAL oleh Alif di Supabase SQL Editor.
-- Jangan dieksekusi otomatis oleh AI coding assistant (larangan #2).
--
-- Pola sama persis dengan reorder_material_chapters (docs/sql/18) dan
-- reorder_product_categories/reorder_batch_categories (docs/sql/20): geser
-- semua baris ke urutan negatif dulu (unik, tidak bentrok), baru tulis nilai
-- final 1..N sesuai array id yang dikirim client. Dua UPDATE dalam satu
-- pemanggilan fungsi plpgsql sudah atomic.
--
-- Sama seperti kategori: quiz_questions tidak punya parent scope (bukan anak
-- dari materi/bab tertentu) — validasi jumlah dicek terhadap SELURUH baris
-- tabel, bukan baris dalam satu grup.
--
-- SECURITY INVOKER (default) — pemanggil (admin client, service role) sudah
-- punya akses penuh, jadi fungsi ini tidak butuh hak superuser.
--
-- Aman dijalankan berkali-kali (create or replace).
-- ============================================================

create or replace function public.reorder_quiz_questions(
  p_question_ids bigint[]
)
returns void
language plpgsql
as $$
declare
  v_jumlah_ada integer;
begin
  select count(*) into v_jumlah_ada from public.quiz_questions;

  if v_jumlah_ada <> array_length(p_question_ids, 1) then
    raise exception 'Jumlah soal yang dikirim tidak cocok dengan jumlah soal yang ada';
  end if;

  if exists (
    select 1 from unnest(p_question_ids) as soal_id
     where not exists (
       select 1 from public.quiz_questions qq where qq.id = soal_id
     )
  ) then
    raise exception 'Ada id soal yang tidak ditemukan';
  end if;

  update public.quiz_questions
     set urutan = -urutan_baru.posisi
    from (
      select soal_id, row_number() over () as posisi
        from unnest(p_question_ids) with ordinality as t(soal_id, ordinality)
    ) as urutan_baru(soal_id, posisi)
   where quiz_questions.id = urutan_baru.soal_id;

  update public.quiz_questions
     set urutan = urutan_baru.posisi
    from (
      select soal_id, row_number() over () as posisi
        from unnest(p_question_ids) with ordinality as t(soal_id, ordinality)
    ) as urutan_baru(soal_id, posisi)
   where quiz_questions.id = urutan_baru.soal_id;
end;
$$;
