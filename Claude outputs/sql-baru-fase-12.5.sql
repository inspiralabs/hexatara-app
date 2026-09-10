-- ============================================================
-- SQL BARU — Sprint 4.5 (Redesign & Upgrade Sistem)
-- Dijalankan MANUAL oleh Alif di Supabase SQL Editor.
-- Jangan dieksekusi otomatis oleh AI coding assistant.
-- Referensi: ENGINEERING.md ADR-011 s/d ADR-017
-- ============================================================

-- ----------------------------------------------------------
-- ADR-011 — Rating bintang manual (batches, products)
-- ----------------------------------------------------------

alter table batches
  add column rating numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5));

alter table products
  add column rating numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5));

comment on column batches.rating is 'Rating bintang 5, diisi manual Admin. NULL = tidak tampilkan bintang di card.';
comment on column products.rating is 'Rating bintang 5, diisi manual Admin. NULL = tidak tampilkan bintang di card.';


-- ----------------------------------------------------------
-- ADR-012 — Kategori dinamis (produk & pelatihan)
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
-- ----------------------------------------------------------

create table material_chapters (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references materials(id) on delete cascade,
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
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references material_chapters(id) on delete cascade,
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


-- ============================================================
-- SELESAI. Setelah dijalankan, generate ulang tipe TypeScript:
--   pnpm supabase gen types typescript --project-id REF > src/types/database.ts
-- ============================================================
