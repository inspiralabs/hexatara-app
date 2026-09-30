-- =====================================================================
-- USULAN SQL — Merchandise jadi Produk (Prompt 2a, F13.4 bagian dashboard)
-- ADR-026, Sprint 12 / Modul 13
-- =====================================================================
-- JANGAN dijalankan oleh Cursor / agent. Ini PROPOSAL untuk direview
-- dan dijalankan manual oleh Alif di Supabase SQL editor, sesuai aturan
-- CLAUDE.md larangan #2 (agent tidak pernah eksekusi DDL).
--
-- Cakupan: HANYA tabel item untuk pesanan dashboard (cert_merch / merch_addon).
-- Tabel untuk pesanan publik (merchandise_public_orders) MENYUSUL di Prompt 2b
-- — sengaja tidak dibuat sekarang supaya scope tetap kecil dan bisa diuji
-- bertahap (keputusan Alif: pecah 2 prompt).
-- =====================================================================

-- 1. Tabel item produk merchandise per pesanan sertifikat (keranjang multi-produk).
--    Satu certificate_orders (paket cert_merch / merch_addon) bisa punya
--    beberapa baris di sini — user boleh pilih lebih dari satu produk.
create table if not exists public.certificate_order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.certificate_orders(id) on delete cascade,
  product_id bigint not null references public.products(id),
  qty integer not null check (qty > 0),
  harga_satuan integer not null check (harga_satuan >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_certificate_order_items_order_id
  on public.certificate_order_items(order_id);

comment on table public.certificate_order_items is
  'F13.4/ADR-026 — daftar produk merchandise yang dipilih user dalam satu certificate_orders (paket cert_merch/merch_addon). harga_satuan adalah snapshot harga produk saat pesan (bukan live-read ke products.harga), supaya riwayat pesanan tidak berubah kalau harga produk diubah admin belakangan.';

-- 2. RLS: user hanya boleh lihat/insert item miliknya sendiri (lewat order_id
--    yang user_id-nya cocok), admin bebas kelola semua.
alter table public.certificate_order_items enable row level security;

drop policy if exists "item pesanan: milik sendiri (select)" on public.certificate_order_items;
create policy "item pesanan: milik sendiri (select)"
  on public.certificate_order_items
  for select
  using (
    exists (
      select 1 from public.certificate_orders co
      where co.id = certificate_order_items.order_id
        and co.user_id = auth.uid()
    )
  );

drop policy if exists "item pesanan: buat sendiri (insert)" on public.certificate_order_items;
create policy "item pesanan: buat sendiri (insert)"
  on public.certificate_order_items
  for insert
  with check (
    exists (
      select 1 from public.certificate_orders co
      where co.id = certificate_order_items.order_id
        and co.user_id = auth.uid()
    )
  );

drop policy if exists "item pesanan: admin kelola" on public.certificate_order_items;
create policy "item pesanan: admin kelola"
  on public.certificate_order_items
  for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Catatan: pola RLS di atas mengikuti pola "pesanan: milik sendiri" /
-- "pesanan: admin kelola" yang sudah ada di certificate_orders — cek dan
-- sesuaikan nama role/kolom admin di profiles kalau berbeda dari asumsi ini.

-- TIDAK ADA perubahan kolom/tabel lain. Kategori "Merchandise" dibuat lewat
-- UI Admin > Produk > Kategori Produk yang sudah ada (product_categories),
-- bukan lewat SQL.
