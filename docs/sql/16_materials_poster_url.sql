-- 16 — F06.2: kolom poster untuk halaman ringkasan materi (LMS freemium)
-- USULAN — jalankan manual di Supabase SQL Editor. Agent tidak pernah eksekusi DDL.
--
-- Konteks: halaman ringkasan /materi (Modul 3, restrukturisasi §12.5.3) menampilkan
-- poster course sebelum "Mulai Sekarang". Tabel materials belum punya kolom gambar
-- apa pun. Nullable, non-breaking — kalau kosong, halaman ringkasan menyembunyikan
-- blok poster sama seperti pola StarRating (skip, bukan placeholder kosong).

alter table materials
  add column poster_url text;

comment on column materials.poster_url is 'URL poster course di halaman ringkasan /materi, bucket publik content. NULL = blok poster disembunyikan.';
