-- 14 — F03.7/F03.8: aktivasi sertifikat free_track dari pesanan upgrade
-- USULAN — jalankan manual di Supabase SQL Editor. Agent tidak pernah eksekusi DDL.
--
-- Konteks: PRD.md §8.8 dan ENGINEERING.md §5.2. Langkah 2-3-4-6 dari alur aktivasi
-- (cek belum punya free_track, ambil nomor, insert certificates, ubah status pesanan)
-- WAJIB satu transaksi Postgres — kalau salah satu gagal, semuanya batal otomatis.
-- Langkah 1 (PDF), 5 (email), 6 (activity_logs, versi lama disebut 7/8 di PRD) sengaja
-- TIDAK ikut di sini — dijalankan di TypeScript setelah fungsi ini sukses, karena
-- kegagalannya bisa diulang tanpa merusak apa pun (sertifikat sudah sah diterbitkan).
--
-- SECURITY INVOKER (bukan DEFINER) — Admin yang memanggil sudah punya RLS penuh ke
-- certificate_orders & certificates lewat policy "admin: kelola", jadi fungsi ini
-- berjalan dengan hak akses Admin yang sedang login, bukan hak superuser.
--
-- Aman dijalankan berkali-kali (create or replace).

create or replace function public.aktivasi_sertifikat_free_track(p_order_id bigint)
returns table (
  certificate_id uuid,
  nomor_sertifikat text,
  user_id uuid
)
language plpgsql
as $$
declare
  v_user_id uuid;
  v_paket   paket_upgrade;
  v_status  status_order;
  v_nama    text;
  v_nomor   text;
  v_cert_id uuid;
begin
  -- Kunci baris pesanan — mencegah dua klik "Setujui" bersamaan diproses dua kali.
  select co.user_id, co.paket, co.status
    into v_user_id, v_paket, v_status
    from public.certificate_orders co
   where co.id = p_order_id
   for update;

  if not found then
    raise exception 'Pesanan tidak ditemukan';
  end if;

  if v_status <> 'menunggu_verifikasi' then
    raise exception 'Pesanan bukan berstatus menunggu_verifikasi';
  end if;

  if exists (
    select 1 from public.certificates c
     where c.user_id = v_user_id and c.jenis = 'free_track'
  ) then
    raise exception 'Pengguna sudah punya sertifikat free_track';
  end if;

  select p.nama_lengkap into v_nama from public.profiles p where p.id = v_user_id;

  v_nomor := public.next_certificate_number('free_track');

  insert into public.certificates
    (nomor_sertifikat, jenis, nama_lengkap, tanggal_terbit, tanggal_kedaluwarsa, qr_aktif, user_id)
  values
    (v_nomor, 'free_track', coalesce(v_nama, ''), current_date, null, true, v_user_id)
  returning id into v_cert_id;

  -- Paket bermerchandise mulai butuh pengiriman begitu disetujui; cert_only tidak
  -- pernah punya apa pun untuk dikirim, tetap tidak_ada selamanya.
  update public.certificate_orders
     set status = 'disetujui',
         verified_by = auth.uid(),
         verified_at = now(),
         status_pengiriman = case
           when v_paket <> 'cert_only' then 'belum_diproses'::status_kirim
           else status_pengiriman
         end
   where id = p_order_id;

  return query select v_cert_id, v_nomor, v_user_id;
end;
$$;
