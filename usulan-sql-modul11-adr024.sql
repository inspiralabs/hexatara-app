-- ADR-024 / Sprint 10 / Modul 11 — F11.1: view products_public perlu expose nama kategori
-- ============================================================================
-- KONTEKS: view `products_public` sudah punya kolom `category_id` (relasi ke
-- `product_categories`) tapi TIDAK expose nama kategori (nama_id/nama_en) dari
-- tabel itu. Badge kategori di halaman publik (katalog & detail produk) saat
-- ini membaca kolom teks bebas `kategori` (products.kategori), yang mau kita
-- hapus dari form Admin karena membingungkan (dua field kategori berbeda arti).
-- Supaya badge publik tidak hilang, view products_public perlu tambahan kolom
-- category_nama_id / category_nama_en hasil JOIN ke product_categories.
--
-- Definisi ASLI (dikonfirmasi Alif lewat `select pg_get_viewdef('public.products_public', true);`
-- pada 2026-09-19):
--
--   SELECT id, slug, nama_id, nama_en, deskripsi_id, deskripsi_en,
--     spesifikasi_id, spesifikasi_en, kategori, category_id, rating, urutan,
--     created_at, thumbnail_url,
--     CASE WHEN tampilkan_harga THEN harga ELSE NULL::bigint END AS harga,
--     tampilkan_harga
--   FROM products p
--   WHERE is_active = true;
--
-- (thumbnail_url TERNYATA kolom langsung di `products`, BUKAN hasil join ke
-- product_images seperti dugaan draf sebelumnya — sudah dikoreksi di bawah.)
--
-- PENTING — KEAMANAN HARGA (PRD.md §5.2 / ADR-004): view ini sengaja dibuat
-- `security_invoker = off` (security definer) supaya publik TIDAK PERNAH bisa
-- query tabel `products` langsung — CASE WHEN tampilkan_harga di atas adalah
-- satu-satunya penjaga supaya harga produk yang disembunyikan selalu NULL ke
-- publik. Perubahan di bawah HANYA menambah 2 kolom baru (category_nama_id,
-- category_nama_en) lewat LEFT JOIN — TIDAK mengubah kondisi CASE WHEN, TIDAK
-- mengubah WHERE is_active = true, dan TIDAK menambah klausa security_invoker
-- apa pun (supaya properti lama tetap dipertahankan oleh Postgres).
--
-- PENTING — URUTAN KOLOM: `CREATE OR REPLACE VIEW` di Postgres TIDAK BOLEH
-- mengubah nama kolom yang sudah ada di posisi yang sama (error 42P16 kalau
-- dilanggar — persis error yang muncul saat kolom baru disisipkan di tengah).
-- Karena itu SELURUH kolom lama di bawah ditulis PERSIS urutan aslinya
-- (id, slug, nama_id, nama_en, deskripsi_id, deskripsi_en, spesifikasi_id,
-- spesifikasi_en, kategori, category_id, rating, urutan, created_at,
-- thumbnail_url, harga, tampilkan_harga), dan 2 kolom baru HANYA ditambah di
-- PALING AKHIR daftar — bukan disisipkan di antara kolom lama.

create or replace view public.products_public as
select
  p.id,
  p.slug,
  p.nama_id,
  p.nama_en,
  p.deskripsi_id,
  p.deskripsi_en,
  p.spesifikasi_id,
  p.spesifikasi_en,
  p.kategori,                        -- kolom lama, TETAP dipertahankan di view untuk sementara
                                      -- (aman dihapus lain kali setelah kode publik dipastikan
                                      -- sudah 100% pindah ke category_nama_id/en)
  p.category_id,
  p.rating,
  p.urutan,
  p.created_at,
  p.thumbnail_url,
  case when p.tampilkan_harga then p.harga else null::bigint end as harga,
  p.tampilkan_harga,
  pc.nama_id as category_nama_id,    -- BARU — ditambah di AKHIR, bukan disisipkan di tengah
  pc.nama_en as category_nama_en     -- BARU — ditambah di AKHIR, bukan disisipkan di tengah
from public.products p
left join public.product_categories pc on pc.id = p.category_id
where p.is_active = true;

-- Verifikasi WAJIB setelah dijalankan, sebelum F11.1 dianggap aman dikerjakan:
--
-- 1) Kolom baru terisi untuk produk yang sudah punya category_id:
--      select id, kategori, category_id, category_nama_id, category_nama_en
--      from products_public
--      limit 10;
--
-- 2) Properti keamanan harga TIDAK berubah (harus tetap semua NULL):
--      select harga from products_public where tampilkan_harga = false;
--
-- 3) (Opsional tapi disarankan) cek ulang security_invoker view ini tidak
--    berubah jadi true:
--      select relname, reloptions from pg_class where relname = 'products_public';
--
-- Kalau salah satu dari uji ini gagal, JANGAN lanjut ke F11.1 — laporkan ke
-- Alif dulu.
--
-- Setelah view diubah dan dikonfirmasi jalan, regenerate types (Supabase CLI:
-- `supabase gen types typescript`, atau proses yang biasa dipakai) supaya
-- `src/types/database.ts` ikut update kolom baru ini sebelum Cursor mulai
-- coding F11.1.
