-- ============================================================
-- SQL 20 — Reorder otomatis untuk product_categories dan batch_categories (ADR-014)
-- Dijalankan MANUAL oleh Alif di Supabase SQL Editor.
-- Jangan dieksekusi otomatis oleh AI coding assistant (larangan #2).
--
-- Pola sama persis dengan reorder_material_chapters (docs/sql/18): geser semua
-- baris ke urutan negatif dulu (unik, tidak bentrok), baru tulis nilai final
-- 1..N sesuai array id yang dikirim client. Dua UPDATE dalam satu pemanggilan
-- fungsi plpgsql sudah atomic.
--
-- Beda dari reorder_material_chapters: kategori tidak punya parent scope
-- (bukan anak dari materi/bab tertentu) — jadi validasi jumlah dicek terhadap
-- SELURUH baris tabel, bukan baris dalam satu grup.
--
-- SECURITY INVOKER (default) — pemanggil (admin client, service role) sudah
-- punya akses penuh lewat policy "admin kelola kategori produk"/"admin kelola
-- kategori batch", jadi fungsi ini tidak butuh hak superuser.
--
-- Aman dijalankan berkali-kali (create or replace).
-- ============================================================

create or replace function public.reorder_product_categories(
  p_category_ids uuid[]
)
returns void
language plpgsql
as $$
declare
  v_jumlah_ada integer;
begin
  select count(*) into v_jumlah_ada from public.product_categories;

  if v_jumlah_ada <> array_length(p_category_ids, 1) then
    raise exception 'Jumlah kategori yang dikirim tidak cocok dengan jumlah kategori yang ada';
  end if;

  if exists (
    select 1 from unnest(p_category_ids) as kategori_id
     where not exists (
       select 1 from public.product_categories pc where pc.id = kategori_id
     )
  ) then
    raise exception 'Ada id kategori yang tidak ditemukan';
  end if;

  update public.product_categories
     set urutan = -urutan_baru.posisi
    from (
      select kategori_id, row_number() over () as posisi
        from unnest(p_category_ids) with ordinality as t(kategori_id, ordinality)
    ) as urutan_baru(kategori_id, posisi)
   where product_categories.id = urutan_baru.kategori_id;

  update public.product_categories
     set urutan = urutan_baru.posisi
    from (
      select kategori_id, row_number() over () as posisi
        from unnest(p_category_ids) with ordinality as t(kategori_id, ordinality)
    ) as urutan_baru(kategori_id, posisi)
   where product_categories.id = urutan_baru.kategori_id;
end;
$$;

create or replace function public.reorder_batch_categories(
  p_category_ids uuid[]
)
returns void
language plpgsql
as $$
declare
  v_jumlah_ada integer;
begin
  select count(*) into v_jumlah_ada from public.batch_categories;

  if v_jumlah_ada <> array_length(p_category_ids, 1) then
    raise exception 'Jumlah kategori yang dikirim tidak cocok dengan jumlah kategori yang ada';
  end if;

  if exists (
    select 1 from unnest(p_category_ids) as kategori_id
     where not exists (
       select 1 from public.batch_categories bc where bc.id = kategori_id
     )
  ) then
    raise exception 'Ada id kategori yang tidak ditemukan';
  end if;

  update public.batch_categories
     set urutan = -urutan_baru.posisi
    from (
      select kategori_id, row_number() over () as posisi
        from unnest(p_category_ids) with ordinality as t(kategori_id, ordinality)
    ) as urutan_baru(kategori_id, posisi)
   where batch_categories.id = urutan_baru.kategori_id;

  update public.batch_categories
     set urutan = urutan_baru.posisi
    from (
      select kategori_id, row_number() over () as posisi
        from unnest(p_category_ids) with ordinality as t(kategori_id, ordinality)
    ) as urutan_baru(kategori_id, posisi)
   where batch_categories.id = urutan_baru.kategori_id;
end;
$$;
