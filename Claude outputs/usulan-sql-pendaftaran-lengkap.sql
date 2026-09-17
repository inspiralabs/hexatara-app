-- =====================================================================
-- SQL — Pendaftaran Pelatihan Lengkap (KTP, pas foto, identitas)
-- ADR-020 (ENGINEERING.md Bagian 10), PRD.md Bagian 9b (Modul 7) & 5.1c
-- Menggantikan alur "daftar minat" ringan F01.6 (batch_leads) di
-- /pelatihan/[slug] — dicatat sebagai Sprint 6 / F07.1-F07.5 di
-- feature-registry.md, status TODO sampai dijalankan dan diuji.
--
-- CATATAN WAJIB DIBACA SEBELUM DIJALANKAN:
-- - Review satu per satu, jangan jalankan dengan "run all" tanpa dibaca.
-- - Jalankan manual di Supabase SQL Editor sesuai PRD.md §13.1 larangan #2 —
--   Cursor/agent tidak pernah eksekusi DDL sendiri.
-- - Konvensi tipe kolom proyek ini (ADR-013, dikoreksi 2026-09-10):
--   HANYA `profiles` dan `certificates` yang uuid. Semua tabel lain —
--   termasuk batches, batch_leads — pakai bigserial/bigint identity.
--   batch_registrations di bawah ini KONSISTEN dengan pola itu (bigserial).
-- - Backup / snapshot database dulu sebelum menjalankan bagian manapun.
-- - Setelah dijalankan dan dikonfirmasi berhasil, update status F07.1 di
--   feature-registry.md (tetap TODO sampai Alif uji sendiri di browser,
--   SQL berhasil berjalan BUKAN otomatis berarti fitur selesai).
-- =====================================================================


-- ---------------------------------------------------------------------
-- BAGIAN 1 — Perluas `profiles` dengan field identitas RPC
-- ---------------------------------------------------------------------
-- Field ini disimpan permanen di akun (bukan per-pendaftaran) karena
-- dipakai ulang untuk pendaftaran/renewal berikutnya (kategori
-- "Perpanjangan/Renewal RPC" berarti orang yang sama daftar lagi tiap
-- 2 tahun) — keputusan yang sudah dikonfirmasi.

alter table public.profiles
  add column if not exists nomor_ktp      text,
  add column if not exists tempat_lahir   text,
  add column if not exists tanggal_lahir  date,
  add column if not exists alamat_lengkap text,
  add column if not exists foto_ktp_url   text,  -- bucket privat identity-documents
  add column if not exists pas_foto_url   text;  -- bucket privat identity-documents

comment on column public.profiles.nomor_ktp is
  'NIK KTP peserta, wajib diisi sebelum bisa daftar batch pelatihan (F0x baru).';
comment on column public.profiles.foto_ktp_url is
  'Path di bucket privat identity-documents, bukan URL publik. Akses lewat createSignedUrl().';
comment on column public.profiles.pas_foto_url is
  'Path di bucket privat identity-documents, bukan URL publik. Akses lewat createSignedUrl().';

-- Helper murni cek "profil identitas lengkap" — dipakai di server action
-- pendaftaran untuk validasi cepat tanpa mengulang enam pengecekan null
-- di banyak tempat.
create or replace function public.profil_identitas_lengkap(p_user_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user_id
      and nomor_ktp is not null and nomor_ktp <> ''
      and tempat_lahir is not null and tempat_lahir <> ''
      and tanggal_lahir is not null
      and alamat_lengkap is not null and alamat_lengkap <> ''
      and foto_ktp_url is not null
      and pas_foto_url is not null
  );
$$;


-- ---------------------------------------------------------------------
-- BAGIAN 2 — Enum kategori peserta & sumber info
-- ---------------------------------------------------------------------

do $$ begin
  create type public.kategori_peserta_rpc as enum ('penerbitan_baru', 'perpanjangan_renewal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.status_registrasi_batch as enum ('menunggu_verifikasi', 'disetujui', 'ditolak');
exception when duplicate_object then null; end $$;


-- ---------------------------------------------------------------------
-- BAGIAN 3 — Tabel `batch_registrations` (pengganti batch_leads untuk
-- pendaftaran resmi; batch_leads TIDAK dihapus, lihat catatan di bawah)
-- ---------------------------------------------------------------------
-- Pola bigserial + FK ke batches(id) konsisten dengan batch_leads yang
-- sudah ada. user_id ke auth.users langsung (uuid), sama seperti pola
-- certificate_orders.user_id — TIDAK di-embed lewat relasi Supabase
-- otomatis (auth.users bukan public schema), digabung manual di kode
-- seperti pola yang sudah dipakai di admin/upgrade/page.tsx.

create table if not exists public.batch_registrations (
  id                 bigserial primary key,
  batch_id           bigint not null references public.batches(id) on delete cascade,
  user_id            uuid not null references auth.users(id) on delete cascade,
  kategori_peserta   public.kategori_peserta_rpc not null,
  sumber_info        text,                  -- "Darimana mengetahui pelatihan ini" (form asli)
  kode_referral      text,
  status             public.status_registrasi_batch not null default 'menunggu_verifikasi',
  alasan_tolak       text,
  verified_by        uuid references auth.users(id) on delete set null,
  verified_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- Satu user tidak bisa daftar batch yang sama dua kali selagi masih
  -- menunggu verifikasi atau sudah disetujui (boleh daftar ulang kalau
  -- pendaftaran sebelumnya ditolak).
  constraint uq_batch_user_aktif unique (batch_id, user_id)
);

create index if not exists idx_registration_batch  on public.batch_registrations(batch_id, created_at);
create index if not exists idx_registration_user   on public.batch_registrations(user_id, created_at desc);
create index if not exists idx_registration_antrean on public.batch_registrations(status, created_at);

drop trigger if exists trg_registration_updated on public.batch_registrations;
create trigger trg_registration_updated before update on public.batch_registrations
  for each row execute function public.set_updated_at();

comment on table public.batch_registrations is
  'Pendaftaran resmi batch pelatihan RPC dengan data identitas lengkap. '
  'Menggantikan alur "daftar minat" (batch_leads) di halaman publik pelatihan. '
  'Data identitas (KTP, foto, dst) disimpan di profiles, bukan di sini — '
  'tabel ini hanya mencatat kategori peserta + status verifikasi per batch.';

-- CATATAN: batch_leads TIDAK dihapus dalam usulan ini — dipertahankan
-- sebagai riwayat data lama, dan Admin panel "Leads" yang sudah ada
-- tidak perlu langsung dibongkar. Kalau Alif ingin batch_leads
-- dinonaktifkan/diarsipkan total, itu keputusan terpisah, ajukan lagi
-- nanti setelah alur baru berjalan stabil.


-- ---------------------------------------------------------------------
-- BAGIAN 4 — Row Level Security untuk batch_registrations
-- ---------------------------------------------------------------------

alter table public.batch_registrations enable row level security;

-- User boleh melihat & membuat pendaftarannya sendiri.
create policy "user baca pendaftaran sendiri" on public.batch_registrations
  for select using (user_id = auth.uid());

create policy "user buat pendaftaran sendiri" on public.batch_registrations
  for insert with check (user_id = auth.uid());

-- Admin baca & update semua (verifikasi/tolak).
create policy "admin baca semua registrasi" on public.batch_registrations
  for select using (public.is_admin());

create policy "admin ubah semua registrasi" on public.batch_registrations
  for update using (public.is_admin());


-- ---------------------------------------------------------------------
-- BAGIAN 5 — Bucket storage privat untuk KTP & pas foto
-- ---------------------------------------------------------------------
-- Pola identik dengan payment-proofs & certificates (ENGINEERING §5.3):
-- privat, akses HANYA lewat createSignedUrl() dipanggil dari server
-- dengan admin client, tidak pernah URL publik langsung.

insert into storage.buckets (id, name, public)
values ('identity-documents', 'identity-documents', false)
on conflict (id) do nothing;

-- Policy storage: user boleh upload & baca file miliknya sendiri saja
-- (path harus diawali user_id-nya, konvensi yang perlu diikuti di kode
-- upload — misal path: `${userId}/ktp.jpg`).
create policy "user upload dokumen sendiri" on storage.objects
  for insert with check (
    bucket_id = 'identity-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "user baca dokumen sendiri" on storage.objects
  for select using (
    bucket_id = 'identity-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin butuh baca semua dokumen identitas untuk proses verifikasi.
create policy "admin baca semua dokumen identitas" on storage.objects
  for select using (
    bucket_id = 'identity-documents'
    and public.is_admin()
  );


-- =====================================================================
-- SELESAI. Setelah SQL ini dijalankan dan dikonfirmasi berhasil, beri
-- tahu saya — saya akan siapkan prompt Cursor yang mengasumsikan skema
-- ini sudah ada (form pendaftaran, Pengaturan User, Admin panel baru).
-- =====================================================================
