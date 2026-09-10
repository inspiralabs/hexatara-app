-- ============================================================
-- SQL 15b — Fase 12.5 (Redesign & Upgrade Sistem), LANJUTAN
-- Dijalankan MANUAL oleh Alif di Supabase SQL Editor.
-- Jangan dieksekusi otomatis oleh AI coding assistant (larangan #2).
--
-- KONTEKS: SQL 15 asli (docs/sql/15_redesign_upgrade_fase12.5.sql) gagal di
-- bagian ADR-013 karena salah asumsi tipe primary key. Hampir semua tabel
-- inti Hexatara pakai bigint (identity/serial), BUKAN uuid — kecuali
-- certificates dan profiles yang memang sengaja uuid. Berkas ini adalah
-- KOREKSI, dikonfirmasi lewat query information_schema.columns terhadap
-- database live tanggal 2026-09-10.
--
-- ADR-011 (kolom rating di batches/products) dan ADR-012 (product_categories,
-- batch_categories, kolom category_id) SUDAH BERHASIL dijalankan dari SQL 15
-- asli — JANGAN dijalankan ulang, akan gagal "already exists". Berkas ini
-- HANYA berisi ADR-013 (materi berbab) dan ADR-015 (popup dua gambar) yang
-- belum sempat jalan.
--
-- Setelah dijalankan: pnpm supabase gen types typescript --project-id REF > src/types/database.ts
-- ============================================================

-- ----------------------------------------------------------
-- ADR-013 — LMS materi berbab + progress tersimpan
-- KOREKSI: material_chapters.material_id sekarang bigint (mengikuti
-- materials.id yang bigint), bukan uuid seperti draft SQL 15 asli.
-- material_progress.chapter_id ikut bigint karena mengacu ke material_chapters.id
-- yang juga bigint (identity, konsisten dengan pola tabel lain di proyek ini).
-- material_progress.user_id TETAP uuid karena mengacu ke auth.users(id),
-- yang selalu uuid di Supabase Auth — ini satu-satunya FK uuid di blok ini.
-- ----------------------------------------------------------

create table material_chapters (
  id bigint generated always as identity primary key,
  material_id bigint not null references materials(id) on delete cascade,
  urutan integer not null default 0,
  judul_id text not null,
  judul_en text,
  konten_id text not null,   -- HTML dari Tiptap
  konten_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (material_id, urutan)
);

create table material_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id bigint not null references material_chapters(id) on delete cascade,
  is_selesai boolean not null default false,
  selesai_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

create trigger set_updated_at before update on material_chapters
  for each row execute function set_updated_at();

alter table material_chapters enable row level security;
alter table material_progress enable row level security;

-- Publik (termasuk anonim) boleh baca bab materi — materi freemium diakses tanpa login (PRD §8.1)
create policy "publik baca bab materi" on material_chapters
  for select using (true);

create policy "admin kelola bab materi" on material_chapters
  for all using (public.is_admin()) with check (public.is_admin());

-- Progress hanya bisa dibaca/ditulis oleh user pemiliknya sendiri, atau admin
create policy "user baca progress sendiri" on material_progress
  for select using (auth.uid() = user_id or public.is_admin());

create policy "user tulis progress sendiri" on material_progress
  for insert with check (auth.uid() = user_id);

create policy "user update progress sendiri" on material_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CATATAN: material_progress mengasumsikan user SUDAH LOGIN saat mengerjakan materi.
-- Untuk pengunjung anonim yang belum daftar akun, progress bab disimpan sementara di
-- client (React state / sessionStorage) selama sesi kuis-belum-daftar berjalan, PERSIS
-- pola kuis F03.2 yang sudah ada (state di client, bukan database) — baris material_progress
-- baru ditulis ke database SETELAH user mendaftar akun (dari actions.ts alur daftar),
-- atau langsung tersedia kalau user sudah login sejak awal (dashboard -> mulai materi).

-- CATATAN ADR-014 (reorder otomatis): tidak butuh SQL tambahan. Kolom urutan pada
-- material_chapters (di atas), product_categories/batch_categories (sudah dibuat,
-- SQL 15 asli), dan quiz_questions/products (sudah ada sejak SQL sebelumnya) sudah
-- cukup untuk pola reorder drag-and-drop di sisi aplikasi.


-- ----------------------------------------------------------
-- ADR-015 — Popup 2 gambar (mobile portrait, desktop landscape)
-- Tidak ada isu tipe di sini — murni ALTER TABLE ADD COLUMN, tidak menyentuh FK.
-- ----------------------------------------------------------

alter table popups
  add column gambar_mobile_url text,
  add column gambar_desktop_url text;

comment on column popups.gambar_mobile_url is 'URL poster portrait untuk viewport mobile (bucket publik content)';
comment on column popups.gambar_desktop_url is 'URL poster landscape untuk viewport desktop/tablet (bucket publik content)';

-- CATATAN: kolom konten teks popup yang lama (kalau ada, misal judul_id/pesan_id) TIDAK dihapus
-- di migrasi ini — dibiarkan ada untuk kompatibilitas mundur, tapi tidak lagi dipakai di
-- komponen popup baru. Admin cukup mengisi kedua kolom gambar baru untuk popup yang aktif.

-- CATATAN ADR-016 (CSV -> XLSX) dan ADR-017 (navbar Admin): tidak ada perubahan skema,
-- murni perubahan kode aplikasi dan dokumen (lihat PRD.md/ENGINEERING.md).


-- ============================================================
-- SELESAI. Setelah dijalankan, generate ulang tipe TypeScript:
--   pnpm supabase gen types typescript --project-id REF > src/types/database.ts
-- ============================================================
