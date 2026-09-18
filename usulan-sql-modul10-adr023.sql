-- =====================================================================
-- SQL — Modul 10 (Sprint 9): Bukti Pembayaran Pendaftaran Batch (ADR-023)
-- ENGINEERING.md Bagian 10 (ADR-023), PRD.md §5.1f/§9e
--
-- KONTEKS: temuan Alif (F10.4/grup D) — saat Admin menyetujui pendaftaran
-- batch di menu "Pendaftaran Batch", perlu upload bukti pembayaran dulu
-- sebelum bisa klik Setuju, dan bukti itu juga harus tampil di detail
-- "Peserta Pendaftaran". Pola SAMA PERSIS dengan yang sudah berjalan di
-- `certificate_orders.bukti_url` (alur upgrade sertifikat) — hanya
-- dipindahkan ke tabel `batch_registrations`.
--
-- HANYA satu kolom baru.
-- =====================================================================


-- ---------------------------------------------------------------------
-- BAGIAN 1 — Kolom baru `bukti_url` di `batch_registrations`
-- ---------------------------------------------------------------------
-- Diisi Admin saat menyetujui pendaftaran (upload bukti transfer/pembayaran
-- peserta), lewat bucket privat + signed URL yang sudah ada polanya untuk
-- foto KTP/pas foto (ADR-020r) — bukan bucket publik.

alter table public.batch_registrations
  add column if not exists bukti_url text;

comment on column public.batch_registrations.bukti_url is
  'Bukti pembayaran yang diupload Admin sebelum menyetujui pendaftaran batch '
  '(F10.4/ADR-023) — bucket privat + signed URL, pola sama certificate_orders.bukti_url. '
  'Wajib diisi sebelum tombol Setuju bisa diklik (lihat prompt Cursor F10.4).';


-- =====================================================================
-- SELESAI. Setelah dijalankan dan dikonfirmasi berhasil, beri tahu saya
-- — prompt Cursor F10.4 (bukti pembayaran) sudah disiapkan menunggu ini.
-- =====================================================================
