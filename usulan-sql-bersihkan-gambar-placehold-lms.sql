-- USULAN SQL — serah-terima 2026-09-24
-- Masalah: seed LMS (docs/sql/16) mengisi material_chapters.gambar_url
-- dengan https://placehold.co/... Sementara next.config.ts hanya
-- mengizinkan host Supabase Storage → next/image throw di /materi/[id]
-- dan Admin bab-form (ImageUploadField).
--
-- Keputusan: kosongkan (NULL). Belum ada aset Storage Hexatara untuk
-- gambar bab seed. Admin bisa unggah ulang lewat form bab kapan saja.
--
-- Jalankan MANUAL di Supabase SQL Editor (agent tidak mengeksekusi).
-- Aman diulang (idempotent).

-- Pratinjau (opsional):
-- select id, urutan, judul_id, gambar_url
-- from material_chapters
-- where gambar_url ilike '%placehold.co%';

update material_chapters
set gambar_url = null,
    updated_at = now()
where gambar_url ilike '%placehold.co%';

-- Verifikasi: harus 0 baris
-- select count(*) from material_chapters where gambar_url ilike '%placehold.co%';
