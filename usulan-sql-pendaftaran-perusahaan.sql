-- =====================================================================
-- USULAN SQL — Pendaftaran Perusahaan/Komunitas (F13.5, ADR-026)
-- =====================================================================
-- JANGAN dijalankan oleh Cursor/agent. Proposal untuk direview dan dijalankan
-- manual oleh Alif di Supabase SQL editor (CLAUDE.md larangan #2).
--
-- Catatan: pembuatan storage bucket "company-registrations" (privat) TIDAK
-- bisa lewat SQL biasa di sebagian setup Supabase — kalau `storage.buckets`
-- insert di bawah ini gagal karena permission, buat bucket itu manual lewat
-- Dashboard Supabase > Storage > New bucket (nama: company-registrations,
-- Public: OFF), baru lanjutkan sisa SQL ini (policy storage-nya tetap valid).
-- =====================================================================

-- 1. Tabel pendaftaran perusahaan/komunitas (induk).
--    PIC TANPA LOGIN — insert wajib lewat server action service role, sama
--    seperti quote_requests/merchandise_public_orders (nol akses anon).
create table if not exists public.company_registrations (
  id bigint generated always as identity primary key,
  batch_id bigint not null references public.batches(id),
  nama_pic text not null,
  whatsapp_pic text not null,
  email_pic text not null,
  nama_perusahaan text not null,
  jumlah_peserta integer not null check (jumlah_peserta > 0),
  file_excel_url text not null,
  catatan text,
  nominal integer check (nominal is null or nominal >= 0),
  status public.status_registrasi_batch not null default 'menunggu_verifikasi',
  alasan_tolak text,
  catatan_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.company_registrations is
  'F13.5/ADR-026 — pendaftaran grup (perusahaan/komunitas/instansi) untuk satu batch pelatihan, PIC tanpa akun. jumlah_peserta diisi otomatis dari hasil parse Excel saat submit (bukan input manual terpisah). nominal diisi Admin manual setelah nego WA — satu angka TOTAL untuk seluruh grup, bukan per peserta. Reuse enum status_registrasi_batch (sudah dipakai batch_registrations) supaya konsisten, bukan enum baru.';

create index if not exists idx_company_registrations_batch_id
  on public.company_registrations(batch_id);
create index if not exists idx_company_registrations_status
  on public.company_registrations(status);

-- 2. Tabel peserta per pendaftaran grup (anak), dari hasil parse Excel.
create table if not exists public.company_registration_participants (
  id bigint generated always as identity primary key,
  registration_id bigint not null references public.company_registrations(id) on delete cascade,
  nama text not null,
  whatsapp text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_company_registration_participants_registration_id
  on public.company_registration_participants(registration_id);

-- 3. RLS — nol akses anon untuk kedua tabel. Insert HANYA lewat service role
--    di server action (createAdminClient()), bukan dari browser langsung.
alter table public.company_registrations enable row level security;
alter table public.company_registration_participants enable row level security;

drop policy if exists "pendaftaran perusahaan: admin kelola" on public.company_registrations;
create policy "pendaftaran perusahaan: admin kelola"
  on public.company_registrations
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "peserta pendaftaran perusahaan: admin kelola" on public.company_registration_participants;
create policy "peserta pendaftaran perusahaan: admin kelola"
  on public.company_registration_participants
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 4. Storage bucket privat untuk file Excel yang diunggah PIC (lihat catatan
--    di atas kalau insert ini gagal karena permission — buat manual lewat UI).
insert into storage.buckets (id, name, public)
values ('company-registrations', 'company-registrations', false)
on conflict (id) do nothing;

-- Policy storage: HANYA admin yang boleh baca (upload dilakukan server action
-- dengan service role, yang otomatis bypass RLS storage — jadi policy di
-- bawah ini murni untuk pembatasan READ lewat signed URL/klien biasa).
drop policy if exists "company-registrations: admin baca" on storage.objects;
create policy "company-registrations: admin baca"
  on storage.objects
  for select
  using (
    bucket_id = 'company-registrations'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
