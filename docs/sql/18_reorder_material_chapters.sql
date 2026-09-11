-- 18 — Admin CRUD bab materi (§12.5.4): reorder otomatis untuk material_chapters
-- dan material_chapter_files (ADR-014, ADR-018).
-- USULAN — jalankan manual di Supabase SQL Editor. Agent tidak pernah eksekusi DDL.
--
-- Konteks: material_chapters punya unique(material_id, urutan) dan
-- material_chapter_files punya unique(chapter_id, urutan) (SQL 15/16). Reorder yang
-- naif (UPDATE satu-satu sesuai urutan baru) bisa sempat bentrok nomor di tengah
-- proses (mis. tukar posisi 1 dan 2 lewat dua UPDATE terpisah). Fungsi di bawah
-- menggeser semua baris ke nilai negatif dulu (unik, tidak bentrok dengan apa pun),
-- baru menuliskan nilai final 1..N — dua UPDATE dalam satu transaksi (badan fungsi
-- plpgsql sudah atomic per pemanggilan).
--
-- SECURITY INVOKER (bukan DEFINER) — sama seperti aktivasi_sertifikat_free_track:
-- pemanggil (admin client, service role) sudah punya akses penuh lewat policy
-- "admin kelola bab materi" / policy admin material_chapter_files, jadi fungsi ini
-- tidak butuh hak superuser.
--
-- Aman dijalankan berkali-kali (create or replace).

create or replace function public.reorder_material_chapters(
  p_material_id bigint,
  p_chapter_ids bigint[]
)
returns void
language plpgsql
as $$
declare
  v_jumlah_ada integer;
begin
  select count(*) into v_jumlah_ada
    from public.material_chapters
   where material_id = p_material_id;

  if v_jumlah_ada <> array_length(p_chapter_ids, 1) then
    raise exception 'Jumlah bab yang dikirim tidak cocok dengan jumlah bab di materi ini';
  end if;

  if exists (
    select 1 from unnest(p_chapter_ids) as bab_id
     where not exists (
       select 1 from public.material_chapters mc
        where mc.id = bab_id and mc.material_id = p_material_id
     )
  ) then
    raise exception 'Ada id bab yang tidak ditemukan di materi ini';
  end if;

  -- Fase 1: geser ke negatif dulu, supaya nilai final tidak pernah bentrok
  -- dengan urutan lama saat fase 2 berjalan.
  update public.material_chapters
     set urutan = -urutan_baru.posisi
    from (
      select bab_id, row_number() over () as posisi
        from unnest(p_chapter_ids) with ordinality as t(bab_id, ordinality)
    ) as urutan_baru(bab_id, posisi)
   where material_chapters.id = urutan_baru.bab_id;

  -- Fase 2: set nilai final 1..N sesuai urutan array yang dikirim client.
  update public.material_chapters
     set urutan = urutan_baru.posisi
    from (
      select bab_id, row_number() over () as posisi
        from unnest(p_chapter_ids) with ordinality as t(bab_id, ordinality)
    ) as urutan_baru(bab_id, posisi)
   where material_chapters.id = urutan_baru.bab_id;
end;
$$;

create or replace function public.reorder_material_chapter_files(
  p_chapter_id bigint,
  p_file_ids bigint[]
)
returns void
language plpgsql
as $$
declare
  v_jumlah_ada integer;
begin
  select count(*) into v_jumlah_ada
    from public.material_chapter_files
   where chapter_id = p_chapter_id;

  if v_jumlah_ada <> array_length(p_file_ids, 1) then
    raise exception 'Jumlah file yang dikirim tidak cocok dengan jumlah file di bab ini';
  end if;

  if exists (
    select 1 from unnest(p_file_ids) as file_id
     where not exists (
       select 1 from public.material_chapter_files f
        where f.id = file_id and f.chapter_id = p_chapter_id
     )
  ) then
    raise exception 'Ada id file yang tidak ditemukan di bab ini';
  end if;

  update public.material_chapter_files
     set urutan = -urutan_baru.posisi
    from (
      select file_id, row_number() over () as posisi
        from unnest(p_file_ids) with ordinality as t(file_id, ordinality)
    ) as urutan_baru(file_id, posisi)
   where material_chapter_files.id = urutan_baru.file_id;

  update public.material_chapter_files
     set urutan = urutan_baru.posisi
    from (
      select file_id, row_number() over () as posisi
        from unnest(p_file_ids) with ordinality as t(file_id, ordinality)
    ) as urutan_baru(file_id, posisi)
   where material_chapter_files.id = urutan_baru.file_id;
end;
$$;
