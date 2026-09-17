-- =====================================================================
-- SQL — Modul 9: Gambar Detail Tanpa Crop + Lightbox (ADR-022)
-- ENGINEERING.md Bagian 10 (ADR-022), PRD.md Bagian 5.1e & 9d (Sprint 8)
--
-- HANYA satu kolom baru: `batches.gambar_detail_url`. Tidak ada tabel
-- baru, tidak ada kolom baru di `products`/`product_images`/`hero_slides`
-- — perubahan di sana murni logika form/tampilan (lihat catatan Bagian 2).
--
-- CATATAN WAJIB DIBACA SEBELUM DIJALANKAN:
-- - Review satu per satu, jangan jalankan dengan "run all" tanpa dibaca.
-- - Jalankan manual di Supabase SQL Editor.
-- =====================================================================


-- ---------------------------------------------------------------------
-- BAGIAN 1 — Kolom baru `gambar_detail_url` di `batches`
-- ---------------------------------------------------------------------
-- `hero_gambar_url` (sudah ada) tetap dipakai sebagai THUMBNAIL — dipaksa
-- rasio 16:9, dipakai di kartu daftar pelatihan (PelatihanCard) dan bagian
-- atas hero halaman detail (bukan dihapus, tetap perlu untuk konsistensi
-- kartu). `gambar_detail_url` BARU — tanpa crop paksa, upload apa adanya
-- (hanya dikompres di browser), ditampilkan UTUH di halaman detail
-- (menggantikan render `hero_gambar_url` yang lama di posisi hero
-- halaman detail — lihat prompt Cursor untuk detail penggantian ini).

alter table public.batches
  add column if not exists gambar_detail_url text;

comment on column public.batches.gambar_detail_url is
  'Gambar/poster pelatihan versi utuh (tanpa crop paksa), ditampilkan di '
  'halaman detail publik. Beda dari hero_gambar_url yang tetap dipakai '
  'sebagai thumbnail kartu (rasio 16:9 dikunci).';


-- ---------------------------------------------------------------------
-- BAGIAN 2 — TIDAK ADA perubahan skema untuk products, product_images,
-- hero_slides
-- ---------------------------------------------------------------------
-- `product_images.url` (sudah ada) tetap dipakai apa adanya — tidak ada
-- kolom/tabel baru. Yang berubah murni di kode: dialog crop di form Admin
-- Produk berhenti mengunci rasio 1:1 (jadi rasio bebas, Admin yang atur
-- sendiri area crop-nya), dan tampilan galeri di publik berubah dari
-- "potong penuh" (object-cover) jadi "tampil utuh" (object-contain) di
-- dalam kotak yang tetap konsisten ukurannya.
--
-- `hero_slides.gambar_url` (sudah ada) tetap satu kolom — yang berubah
-- cuma angka rasio crop di dialog upload Admin (dari 16:9 jadi 4:3),
-- supaya sesuai kotak tampilan asli di beranda (yang TIDAK diubah).
--
-- Tidak ada baris untuk dijalankan di bagian ini — murni catatan.


-- =====================================================================
-- SELESAI. Setelah SQL Bagian 1 dijalankan dan dikonfirmasi berhasil,
-- beri tahu saya — prompt Cursor untuk F09.1-F09.4 sudah disiapkan
-- menunggu ini.
-- =====================================================================
