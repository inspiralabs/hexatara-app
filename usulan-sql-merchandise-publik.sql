-- =====================================================================
-- USULAN SQL — Merchandise jadi Produk (Prompt 2b, F13.4 bagian publik)
-- ADR-026, Sprint 12 / Modul 13
-- =====================================================================
-- JANGAN dijalankan oleh Cursor / agent. Ini PROPOSAL untuk direview dan
-- dijalankan manual oleh Alif di Supabase SQL editor (CLAUDE.md larangan #2).
-- =====================================================================

-- Tabel pesanan merchandise dari pengunjung publik (TANPA akun/login),
-- terpisah total dari certificate_orders. Pola RLS: nol akses anon —
-- sama seperti quote_requests/batch_leads (lihat PANDUAN.md §3.3.5) —
-- insert HANYA lewat server action dengan service role, bukan dari browser.
create table if not exists public.merchandise_public_orders (
  id bigint generated always as identity primary key,
  nama_lengkap text not null,
  whatsapp text not null,
  alamat_pengiriman jsonb not null,
  -- items: array snapshot [{ product_id, nama_produk, qty, harga_satuan }, ...]
  -- disimpan sebagai jsonb (bukan tabel anak) supaya scope SQL tetap kecil —
  -- konsisten dengan pola alamat_pengiriman di certificate_orders.
  items jsonb not null,
  catatan text,
  status public.status_lead not null default 'baru',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.merchandise_public_orders is
  'F13.4/ADR-026 bagian publik — pesanan merchandise dari pengunjung /katalog tanpa akun. Menggunakan enum status_lead yang sudah ada (baru/dihubungi/selesai) supaya konsisten dengan pola quote_requests. Bukan proses pembayaran online — admin lanjut via WhatsApp seperti produk lain.';

alter table public.merchandise_public_orders enable row level security;

-- Sengaja TIDAK ADA policy untuk anon — insert wajib lewat service role di
-- server action (createAdminClient()), sama seperti kirimPenawaranAction.
drop policy if exists "pesanan merchandise publik: admin kelola" on public.merchandise_public_orders;
create policy "pesanan merchandise publik: admin kelola"
  on public.merchandise_public_orders
  for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create index if not exists idx_merchandise_public_orders_status
  on public.merchandise_public_orders(status);
