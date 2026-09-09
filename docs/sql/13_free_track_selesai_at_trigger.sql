-- 13 — F03.4: tandai profiles.free_track_selesai_at saat mendaftar dari kuis
-- USULAN — jalankan manual di Supabase SQL Editor. Agent tidak pernah eksekusi DDL.
--
-- Konteks: setelah pengguna menyelesaikan kuis (state React, tanpa login, tanpa
-- verifikasi server — lihat PRD.md §8.5), tombol "Dapatkan Sertifikat" membawa
-- ke /daftar?kuisSelesai=1. Sinyal ini diteruskan lewat signUp() options.data
-- sebagai raw_user_meta_data.kuis_selesai, dibaca trigger ini saat baris auth.users
-- baru dibuat, supaya free_track_selesai_at terisi tepat saat akun jadi ada —
-- tanpa UPDATE terpisah yang butuh sesi login (yang belum tentu ada sebelum
-- verifikasi email selesai).
--
-- Aman dijalankan berkali-kali (create or replace). Tidak menyentuh baris yang
-- sudah ada — hanya memengaruhi INSERT baru ke auth.users.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nama_lengkap, free_track_selesai_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nama_lengkap', ''),
    case when new.raw_user_meta_data->>'kuis_selesai' = 'true' then now() else null end
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- Trigger on_auth_user_created sudah menunjuk ke fungsi ini (§3.3.2) — tidak
-- perlu drop/create ulang triggernya, cukup ganti isi fungsinya.
