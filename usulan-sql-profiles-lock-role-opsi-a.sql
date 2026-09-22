-- =============================================================================
-- USULAN SQL — kunci kolom profiles.role (anti self-escalation) — REVISI
-- Opsi A + fix root cause uji gagal:
--
-- ROOT CAUSE: function lama `SECURITY DEFINER` → di dalam body, `current_user`
-- selalu pemilik function (postgres), sehingga cabang
--   db_user in ('postgres', 'supabase_admin')
-- selalu TRUE dan SEMUA pemanggil diizinkan mengubah role.
--
-- FIX:
-- 1) Hapus SECURITY DEFINER → pakai default SECURITY INVOKER (tidak perlu privilege
--    lebih tinggi: function hanya baca NEW/OLD + auth.jwt(), tidak akses tabel lain).
-- 2) Pakai session_user (bukan current_user) untuk cabang SQL Editor — session_user
--    melaporkan siapa yang login ke sesi, tidak diganti oleh SECURITY DEFINER
--    kalau nanti definer ditambah lagi tanpa sengaja.
--
-- Izinkan ubah role HANYA jika:
--   - JWT role = service_role, ATAU
--   - session_user ∈ (postgres, supabase_admin)  -- SQL Editor
--
-- Governance: Alif jalankan manual di Supabase → SQL Editor. Jangan otomatis.
-- RLS "profil: ubah milik sendiri" TIDAK diubah.
-- =============================================================================

-- 0) Lepas trigger lama dulu (bergantung function)
drop trigger if exists trg_prevent_role_self_escalation on public.profiles;

-- 1) Drop function lama (tanda tangan / security attribute berubah)
drop function if exists public.prevent_role_self_escalation();

-- 2) Function baru — SECURITY INVOKER (default; eksplisit ditulis biar jelas)
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  jwt_role text := coalesce(auth.jwt() ->> 'role', '');
  -- session_user = siapa yang login ke sesi DB (aman vs SECURITY DEFINER).
  -- Jangan pakai current_user di sini kalau function pernah jadi DEFINER lagi.
  sess text := session_user;
begin
  -- Tidak ada perubahan role → lanjut (nama, WA, KTP, dll.).
  if new.role is not distinct from old.role then
    return new;
  end if;

  -- Diizinkan: service_role (createAdminClient / PostgREST dengan service key).
  if jwt_role = 'service_role' then
    return new;
  end if;

  -- Diizinkan: SQL Editor / owner (bootstrap PANDUAN §3.6).
  if sess in ('postgres', 'supabase_admin') then
    return new;
  end if;

  raise exception 'profiles.role hanya boleh diubah oleh service_role atau SQL Editor (postgres/supabase_admin)'
    using errcode = '42501'; -- insufficient_privilege
end;
$$;

comment on function public.prevent_role_self_escalation() is
  'Tolak UPDATE yang mengubah profiles.role kecuali service_role atau SQL Editor. Opsi A; SECURITY INVOKER; cek session_user. Revisi 2026-09-23.';

-- 3) Pasang ulang trigger
create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_role_self_escalation();

-- =============================================================================
-- CEK SETELAH JALANKAN (SQL Editor):
--
--   -- Trigger terpasang?
--   select tgname, tgenabled
--   from pg_trigger
--   where tgrelid = 'public.profiles'::regclass
--     and not tgisinternal
--     and tgname = 'trg_prevent_role_self_escalation';
--
--   -- Function INVOKER (bukan DEFINER)?
--   select p.proname, p.prosecdef as is_security_definer
--   from pg_proc p
--   join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public'
--     and p.proname = 'prevent_role_self_escalation';
--   -- Harapan: is_security_definer = false
--
-- Bootstrap admin (tetap OK dari SQL Editor sebagai postgres):
--   update public.profiles set role = 'admin' where id = 'TEMPEL-UUID';
--
-- Lalu ulang uji:
--   node --env-file=.env.local scripts/test-role-escalation.mjs --email=... --password=...
-- =============================================================================

-- --- Kenapa TIDAK perlu SECURITY DEFINER? ---
-- Trigger ini tidak membaca/menulis tabel lain di balik RLS, tidak memanggil
-- is_admin() yang butuh privilege khusus, hanya membandingkan NEW/OLD.role dan
-- auth.jwt()/session_user. DEFINER justru berbahaya: current_user jadi pemilik
-- function dan bisa membuat allow-list "postgres" selalu lolos (bug uji gagal).
