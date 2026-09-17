-- =====================================================================
-- SQL — Modul 9 (revisi F09.2): Thumbnail Produk (ADR-022b)
-- ENGINEERING.md Bagian 10 (ADR-022b, revisi ADR-022), PRD.md §5.1e/§9d
--
-- KONTEKS: setelah F09.2 diuji Alif, ternyata satu galeri saja (tanpa
-- thumbnail terpisah, rasio bebas) membuat Admin bingung foto mana yang
-- jadi cover kartu katalog dan ukuran berapa yang pas — beda dari dugaan
-- awal ADR-022. Direvisi: produk SEKARANG mengikuti pola sama persis
-- dengan pelatihan (ADR-022 F09.1) — field Thumbnail terpisah, rasio
-- terkunci, dipakai KHUSUS untuk kartu katalog.
--
-- HANYA satu kolom baru: `products.thumbnail_url`. Galeri (`product_images`)
-- TIDAK berubah — tetap dipakai apa adanya untuk carousel detail (F09.2
-- yang sudah berjalan tetap dipertahankan untuk itu).
-- =====================================================================


-- ---------------------------------------------------------------------
-- BAGIAN 1 — Kolom baru `thumbnail_url` di `products`
-- ---------------------------------------------------------------------
-- Dipakai KHUSUS untuk kartu katalog (ProdukCard) — rasio dikunci saat
-- upload (mengikuti kotak kartu yang sudah ada, aspect-video/16:9, pola
-- sama `batches.hero_gambar_url`). `product_images` (galeri, sudah ada)
-- TETAP dipakai apa adanya untuk carousel halaman detail — TIDAK berubah.

alter table public.products
  add column if not exists thumbnail_url text;

comment on column public.products.thumbnail_url is
  'Thumbnail produk khusus kartu katalog (rasio 16:9 dikunci saat upload) '
  '— terpisah dari product_images (galeri detail, rasio bebas, ADR-022 '
  'F09.2). Kalau kosong, kartu fallback ke foto pertama galeri seperti '
  'perilaku sebelumnya.';


-- =====================================================================
-- SELESAI. Setelah dijalankan dan dikonfirmasi berhasil, beri tahu saya
-- — prompt Cursor revisi F09.2 sudah disiapkan menunggu ini.
-- =====================================================================
