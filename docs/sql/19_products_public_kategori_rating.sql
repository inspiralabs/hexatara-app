-- ============================================================
-- SQL 19 — Ekspos category_id, rating, created_at di products_public
-- Dijalankan MANUAL oleh Alif di Supabase SQL Editor.
-- Jangan dieksekusi otomatis oleh AI coding assistant (larangan #2).
--
-- KONTEKS: redesign /katalog (F06.12) butuh filter kategori (ADR-012),
-- StarRating (ADR-011), dan sort "Terbaru". Kolom category_id dan rating
-- sudah ada di tabel products sejak ADR-011/ADR-012 dijalankan, tapi view
-- products_public (PANDUAN.md §3.3.11) belum pernah diperbarui untuk
-- mengekspos keduanya — hanya kolom kategori (teks bebas lama) yang ada.
--
-- AMAN: security_invoker tetap OFF (ADR-004 tidak berubah). Menambah kolom
-- ini TIDAK membuka akses baru ke tabel products — category_id dan rating
-- bukan data sensitif (beda dengan harga yang sengaja di-NULL-kan).
--
-- Setelah dijalankan: pnpm supabase gen types typescript --project-id REF > src/types/database.ts
-- ============================================================

drop view if exists public.products_public;
create view public.products_public
with (security_invoker = off) as
select
  p.id, p.slug,
  p.nama_id, p.nama_en,
  p.deskripsi_id, p.deskripsi_en,
  p.spesifikasi_id, p.spesifikasi_en,
  p.kategori, p.category_id, p.rating, p.urutan, p.created_at,
  case when p.tampilkan_harga then p.harga else null end as harga,
  p.tampilkan_harga
from public.products p
where p.is_active = true;

grant select on public.products_public to anon, authenticated;

-- Cara mengujinya (sama seperti sebelumnya, tidak berubah):
--   select harga from products_public where tampilkan_harga = false;
-- Semua baris harus NULL.
