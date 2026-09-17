-- =====================================================================
-- SQL — Modul 8: Operasional Pendaftaran (ADR-021)
-- ENGINEERING.md Bagian 10 (ADR-021), PRD.md Bagian 5.1d & 9c (Sprint 7)
--
-- HANYA satu tabel baru (`batch_requirements`) — fasilitas REUSE
-- `batch_benefits` yang sudah ada, `site_settings` sudah key-value (key
-- baru, bukan kolom baru), halaman Peserta Pendaftaran (F08.1), filter
-- batch (F08.2), dan fitur Salin dari Batch Lain (F08.4) semuanya murni
-- kode (query/UI/server action), TIDAK butuh DDL apa pun.
--
-- CATATAN WAJIB DIBACA SEBELUM DIJALANKAN:
-- - Review satu per satu, jangan jalankan dengan "run all" tanpa dibaca.
-- - Jalankan manual di Supabase SQL Editor, urut Bagian 1 → 2 → 3.
-- - `batch_requirements` sengaja dibuat PERSIS mengikuti pola
--   `batch_benefits` (bigserial, teks dwibahasa, ikon opsional, urutan) —
--   dicek langsung ke DDL aslinya di PANDUAN.md sebelum SQL ini ditulis.
-- =====================================================================


-- ---------------------------------------------------------------------
-- BAGIAN 1 — Tabel baru `batch_requirements` (syarat peserta per batch)
-- ---------------------------------------------------------------------
-- Pola identik batch_benefits — beda makna ("boleh ikut" vs "kenapa
-- ikut"), sengaja dipisah tabelnya supaya masing-masing bisa direorder
-- independen.

create table if not exists public.batch_requirements (
  id       bigserial primary key,
  batch_id bigint not null references public.batches(id) on delete cascade,
  teks_id  text not null,
  teks_en  text,
  ikon     text,
  urutan   int not null default 0
);

create index if not exists idx_requirement_batch
  on public.batch_requirements(batch_id, urutan);

comment on table public.batch_requirements is
  'Syarat peserta per batch pelatihan (mis. "Minimal berumur 17 tahun") — '
  'pola identik batch_benefits, ditampilkan di card F08.3 halaman detail '
  'batch publik. Terpisah dari batch_benefits karena maknanya berbeda.';


-- ---------------------------------------------------------------------
-- BAGIAN 2 — RLS untuk batch_requirements
-- ---------------------------------------------------------------------
-- Pola PERSIS sama dengan batch_benefits/batch_equipment/batch_gallery/
-- batch_faqs (tabel anak konten publik) — baca bebas (anon+authenticated),
-- tulis khusus admin lewat is_admin().

alter table public.batch_requirements enable row level security;

drop policy if exists "publik: baca" on public.batch_requirements;
create policy "publik: baca" on public.batch_requirements
  for select to anon, authenticated using (true);

drop policy if exists "admin: kelola" on public.batch_requirements;
create policy "admin: kelola" on public.batch_requirements
  for all to authenticated using (public.is_admin()) with check (public.is_admin());


-- ---------------------------------------------------------------------
-- BAGIAN 3 — Verifikasi cepat setelah Bagian 1-2 dijalankan
-- ---------------------------------------------------------------------
-- Jalankan query ini setelah semua bagian di atas sukses:
--
--   select table_name from information_schema.tables
--   where table_schema = 'public' and table_name = 'batch_requirements';
--
--   select policyname, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'batch_requirements';
--
-- Pastikan tabel muncul dan ada 2 policy ("publik: baca" untuk SELECT,
-- "admin: kelola" untuk ALL).
--
-- CATATAN untuk `site_settings` (key baru `kontak_pelatihan`) — TIDAK
-- perlu SQL apa pun, key baru dibuat otomatis lewat
-- upsertSiteSetting('kontak_pelatihan', {...}) dari kode Cursor saat form
-- Pengaturan Admin pertama kali disimpan. Tidak ada baris untuk diisi
-- manual di sini.


-- =====================================================================
-- SELESAI. Setelah SQL ini dijalankan dan dikonfirmasi berhasil (termasuk
-- query verifikasi Bagian 3), beri tahu saya — prompt Cursor untuk
-- F08.1-F08.4 sudah disiapkan menunggu ini.
-- =====================================================================
