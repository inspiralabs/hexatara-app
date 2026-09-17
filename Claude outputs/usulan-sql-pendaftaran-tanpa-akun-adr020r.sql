-- =====================================================================
-- SQL — Revisi Pendaftaran Tanpa Akun (ADR-020r)
-- ENGINEERING.md Bagian 10 (ADR-020r), PRD.md Bagian 5.1c & 9b (direvisi)
-- Migrasi TAMBAHAN di atas usulan-sql-pendaftaran-lengkap.sql yang SUDAH
-- berhasil dijalankan (Bagian 1-5). Ini semua ALTER, bukan CREATE ulang —
-- tabel batch_registrations dan bucket identity-documents sudah ada.
--
-- CATATAN WAJIB DIBACA SEBELUM DIJALANKAN:
-- - Review satu per satu, jangan jalankan dengan "run all" tanpa dibaca.
-- - Jalankan manual di Supabase SQL Editor, urut Bagian 1 → 2 → 3 → 4,
--   masing-masing sampai sukses baru lanjut (sama seperti migrasi sebelumnya).
-- - Backup / snapshot database dulu sebelum menjalankan bagian manapun —
--   migrasi ini mengubah constraint NOT NULL jadi nullable dan menambah
--   kolom ke tabel yang sudah mungkin berisi data uji.
-- - Kalau F07.3 sudah sempat diimplementasi Cursor dengan asumsi lama
--   (wajib login), kode itu perlu direvisi mengikuti prompt Cursor baru
--   SETELAH SQL ini berhasil — jangan jalankan SQL ini di tengah kode lama
--   yang masih aktif dipakai tanpa koordinasi.
-- =====================================================================


-- ---------------------------------------------------------------------
-- BAGIAN 1 — `batch_registrations`: user_id jadi nullable, tambah kolom
-- identitas mandiri + email
-- ---------------------------------------------------------------------
-- Sebelumnya user_id NOT NULL (wajib akun). Sekarang nullable — diisi
-- kalau pendaftar login saat submit, null kalau tidak.

alter table public.batch_registrations
  alter column user_id drop not null;

alter table public.batch_registrations
  add column if not exists nama_lengkap   text,
  add column if not exists email          text,
  add column if not exists whatsapp       text,
  add column if not exists nomor_ktp      text,
  add column if not exists tempat_lahir   text,
  add column if not exists tanggal_lahir  date,
  add column if not exists alamat_lengkap text,
  add column if not exists foto_ktp_url   text,  -- bucket privat identity-documents
  add column if not exists pas_foto_url   text;  -- bucket privat identity-documents

comment on column public.batch_registrations.user_id is
  'Nullable — terisi kalau pendaftar login saat submit, null kalau tanpa akun (ADR-020r).';
comment on column public.batch_registrations.email is
  'Wajib diisi untuk baris tanpa akun (user_id null). Sengaja disimpan di sini, '
  'bukan diambil dari auth.users.email, sesuai ADR-020r — tidak bergantung tabel akun.';
comment on column public.batch_registrations.nama_lengkap is
  'Snapshot identitas saat pendaftaran dibuat — TIDAK ikut berubah kalau profiles diedit belakangan.';

-- Guard: baris tanpa akun (user_id null) WAJIB punya email; baris dengan
-- akun boleh email null (bisa diambil dari auth.users kalau perlu, tapi
-- disarankan tetap diisi juga dari form untuk konsistensi tampilan admin).
alter table public.batch_registrations drop constraint if exists chk_email_wajib_jika_anon;
alter table public.batch_registrations
  add constraint chk_email_wajib_jika_anon
  check (user_id is not null or (email is not null and email <> ''));


-- ---------------------------------------------------------------------
-- BAGIAN 2 — RLS: izinkan INSERT untuk peran anon (tanpa akun)
-- ---------------------------------------------------------------------
-- Policy lama "user buat pendaftaran sendiri" (with check user_id =
-- auth.uid()) TETAP ada, tidak disentuh — berlaku untuk pendaftar login.
-- Policy baru di bawah khusus untuk anon, dengan syarat user_id memang
-- null dan email terisi (konsisten dengan constraint Bagian 1).

drop policy if exists "anon buat pendaftaran tanpa akun" on public.batch_registrations;
create policy "anon buat pendaftaran tanpa akun" on public.batch_registrations
  for insert
  to anon
  with check (
    user_id is null
    and email is not null and email <> ''
  );

-- SENGAJA TIDAK ADA policy SELECT untuk anon — pendaftar tanpa akun tidak
-- bisa query balik datanya sendiri lewat RLS. Konfirmasi sukses ditampilkan
-- langsung dari hasil insert().select() di request yang sama (server
-- action), bukan query terpisah setelahnya.


-- ---------------------------------------------------------------------
-- BAGIAN 3 — Storage: izinkan upload anon dengan path `registrasi/<id>/...`
-- ---------------------------------------------------------------------
-- Policy lama (user upload/baca dokumen sendiri via ${userId}/...) TETAP
-- ada, tidak disentuh. Policy baru khusus prefix `registrasi/` untuk
-- pendaftar tanpa akun — path dibuat SETELAH baris batch_registrations
-- ada (pakai id-nya), bukan sebelum, jadi tidak butuh auth.uid() sama
-- sekali di sini.

drop policy if exists "anon upload dokumen pendaftaran" on storage.objects;
create policy "anon upload dokumen pendaftaran" on storage.objects
  for insert
  to anon
  with check (
    bucket_id = 'identity-documents'
    and (storage.foldername(name))[1] = 'registrasi'
  );

-- Anon SENGAJA tidak diberi policy SELECT di sini juga — preview foto yang
-- baru diupload (kalau dibutuhkan di halaman konfirmasi) memakai signed URL
-- yang di-generate oleh server action pakai service role, bukan baca
-- langsung oleh anon lewat RLS storage.


-- ---------------------------------------------------------------------
-- BAGIAN 4 — Verifikasi cepat setelah Bagian 1-3 dijalankan
-- ---------------------------------------------------------------------
-- Jalankan query ini setelah semua bagian di atas sukses, untuk konfirmasi
-- manual sebelum lanjut ke Cursor:
--
--   select column_name, is_nullable from information_schema.columns
--   where table_schema = 'public' and table_name = 'batch_registrations'
--   order by ordinal_position;
--
-- Pastikan user_id muncul dengan is_nullable = 'YES', dan 9 kolom baru
-- (nama_lengkap, email, whatsapp, nomor_ktp, tempat_lahir, tanggal_lahir,
-- alamat_lengkap, foto_ktp_url, pas_foto_url) sudah muncul di hasilnya.


-- =====================================================================
-- SELESAI. Setelah SQL ini dijalankan dan dikonfirmasi berhasil (termasuk
-- query verifikasi Bagian 4), beri tahu saya — prompt Cursor untuk
-- F07.1-F07.5 versi baru (tanpa wajib login) sudah disiapkan menunggu ini.
-- =====================================================================
