-- 17 — F06.2: migrasi progress bab materi anonim -> material_progress saat daftar
-- USULAN — jalankan manual di Supabase SQL Editor. Agent tidak pernah eksekusi DDL.
--
-- Konteks: sama seperti pola kuis_selesai (docs/sql/13_...), pengunjung anonim
-- mengerjakan bab materi tanpa login (state di sessionStorage, PRD §8/ADR-013).
-- Saat mereka akhirnya mendaftar akun di /daftar, daftar chapter_id yang sudah
-- selesai dititipkan lewat signUp() options.data sebagai
-- raw_user_meta_data.chapters_selesai (JSON array angka chapter_id), dibaca
-- trigger ini saat baris auth.users baru dibuat -- migrasi terjadi PERSIS SEKALI
-- di titik itu, bukan lewat UPDATE terpisah yang butuh sesi login (belum tentu
-- ada sebelum verifikasi email, dan link verifikasi bisa dibuka di device lain
-- yang sessionStorage-nya beda).
--
-- DEFENSIF: payload chapters_selesai berasal dari klien (tidak diverifikasi,
-- sama seperti kuis_selesai -- materi gratis, tidak ada yang dirugikan kalau
-- dipalsukan). Tapi payload rusak/sengaja dipalsukan TIDAK BOLEH menggagalkan
-- signUp() itu sendiri:
--   1. Parse JSON dibungkus blok exception -- gagal parse -> anggap array kosong.
--   2. Hanya chapter_id yang BENAR-BENAR ADA di material_chapters yang diinsert
--      (join, bukan insert buta) -- id palsu/di luar range diam-diam diabaikan.
--
-- Aman dijalankan berkali-kali (create or replace). Tidak menyentuh baris yang
-- sudah ada -- hanya memengaruhi INSERT baru ke auth.users.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  chapters_json jsonb;
begin
  insert into public.profiles (id, nama_lengkap, free_track_selesai_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nama_lengkap', ''),
    case when new.raw_user_meta_data->>'kuis_selesai' = 'true' then now() else null end
  )
  on conflict (id) do nothing;

  begin
    chapters_json := coalesce(nullif(new.raw_user_meta_data->>'chapters_selesai', ''), '[]')::jsonb;
  exception when others then
    chapters_json := '[]'::jsonb;
  end;

  insert into public.material_progress (user_id, chapter_id, is_selesai, selesai_at)
  select new.id, mc.id, true, now()
  from public.material_chapters mc
  where mc.id in (
    select trim(both '"' from elem::text)::bigint
    from jsonb_array_elements(chapters_json) as elem
    where trim(both '"' from elem::text) ~ '^[0-9]+$'
  )
  on conflict (user_id, chapter_id) do nothing;

  return new;
end $$;

-- Trigger on_auth_user_created sudah menunjuk ke fungsi ini (§3.3.2) -- tidak
-- perlu drop/create ulang triggernya, cukup ganti isi fungsinya.
