-- ============================================================
-- SQL 15 — Fase 12.5 (Redesign & Upgrade Sistem)
-- Dijalankan MANUAL oleh Alif di Supabase SQL Editor.
-- Jangan dieksekusi otomatis oleh AI coding assistant (larangan #2).
-- Referensi: ENGINEERING.md ADR-011 s/d ADR-017, PRD.md Bagian 9a/5.1b
-- Setelah dijalankan: pnpm supabase gen types typescript --project-id REF > src/types/database.ts
--
-- KOREKSI 2026-09-10: draf pertama berkas ini keliru mengasumsikan primary key
-- semua tabel proyek Hexatara bertipe uuid. Dikonfirmasi lewat query
-- information_schema.columns terhadap database live: hampir semua tabel inti
-- (termasuk materials, products, batches, popups, quiz_questions) memakai
-- bigint identity, BUKAN uuid — kecuali certificates dan profiles yang memang
-- sengaja uuid. Berkas ini sudah diperbaiki mengikuti fakta itu. ADR-011 dan
-- ADR-012 di bawah SUDAH BERHASIL dijalankan dari draf pertama sebelum
-- koreksi ini (kolom rating, product_categories, batch_categories — keduanya
-- memang sengaja uuid karena tabel baru, bukan bigint identity seperti tabel
-- lama) — bagian itu JANGAN dijalankan ulang, akan gagal "already exists".
-- Kalau menjalankan berkas ini dari database yang benar-benar baru/fresh
-- (belum pernah menjalankan draf pertama), seluruh isi berkas ini aman
-- dijalankan berurutan dari atas.
-- ============================================================

-- ----------------------------------------------------------
-- ADR-011 — Rating bintang manual (batches, products)
-- >>> SUDAH DIJALANKAN 2026-09-09/10 — JANGAN JALANKAN ULANG BLOK INI <<<
-- ----------------------------------------------------------

alter table batches
  add column rating numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5));

alter table products
  add column rating numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5));

comment on column batches.rating is 'Rating bintang 5, diisi manual Admin. NULL = tidak tampilkan bintang di card.';
comment on column products.rating is 'Rating bintang 5, diisi manual Admin. NULL = tidak tampilkan bintang di card.';

-- CATATAN ADR-011b: hero gallery TIDAK butuh SQL baru — memakai hero_slides yang
-- sudah ada sejak Sprint 0/1 (gambar_url, cta_url, urutan, is_active sudah cukup).


-- ----------------------------------------------------------
-- ADR-012 — Kategori dinamis (produk & pelatihan)
-- >>> SUDAH DIJALANKAN 2026-09-09/10 — JANGAN JALANKAN ULANG BLOK INI <<<
-- ----------------------------------------------------------

create table product_categories (
  id uuid primary key default gen_random_uuid(),
  nama_id text not null,
  nama_en text,
  urutan integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table batch_categories (
  id uuid primary key default gen_random_uuid(),
  nama_id text not null,
  nama_en text,
  urutan integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table products
  add column category_id uuid references product_categories(id) on delete set null;

alter table batches
  add column category_id uuid references batch_categories(id) on delete set null;

-- Trigger updated_at (pola sama dengan tabel lain — pakai fungsi set_updated_at() yang sudah ada)
create trigger set_updated_at before update on product_categories
  for each row execute function set_updated_at();

create trigger set_updated_at before update on batch_categories
  for each row execute function set_updated_at();

-- RLS: publik boleh baca kategori aktif, hanya admin yang bisa tulis
alter table product_categories enable row level security;
alter table batch_categories enable row level security;

create policy "publik baca kategori produk aktif" on product_categories
  for select using (is_active = true);

create policy "admin kelola kategori produk" on product_categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "publik baca kategori batch aktif" on batch_categories
  for select using (is_active = true);

create policy "admin kelola kategori batch" on batch_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- CATATAN MIGRASI DATA: kalau products/batches sudah punya kolom kategori berupa teks bebas,
-- Admin perlu meninjau nilai unik yang ada, membuat baris di tabel kategori baru yang sesuai,
-- baru menjalankan UPDATE manual untuk mengisi category_id berdasarkan pencocokan teks lama.
-- Tidak diotomasi di sini karena pemetaan teks bebas -> kategori terstruktur butuh keputusan manusia.


-- ----------------------------------------------------------
-- ADR-013 — LMS materi berbab + progress tersimpan
-- >>> BELUM DIJALANKAN — MULAI DARI SINI (lihat 15b untuk versi siap-tempel) <<<
-- material_chapters.material_id: bigint, mengikuti materials.id yang bigint.
-- material_progress.chapter_id: bigint, mengikuti material_chapters.id yang
-- juga bigint identity (konsisten dengan pola tabel lain di proyek ini).
-- material_progress.user_id: TETAP uuid — mengacu ke auth.users(id), yang
-- selalu uuid di Supabase Auth. Ini satu-satunya FK uuid di blok ADR-013.
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

-- CATATAN ADR-014 (reorder otomatis): tidak butuh SQL tambahan di sini. Kolom urutan
-- pada material_chapters, product_categories, batch_categories (di atas) dan
-- quiz_questions/products (sudah ada sejak SQL sebelumnya) sudah cukup untuk pola
-- reorder drag-and-drop di sisi aplikasi.


-- ----------------------------------------------------------
-- ADR-015 — Popup 2 gambar (mobile portrait, desktop landscape)
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
