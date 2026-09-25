-- USULAN — jalankan manual di Supabase SQL Editor. Agent tidak pernah eksekusi DDL.
--
-- Perbaikan bug: pesanan merch_addon gagal disetujui Admin dengan pesan
-- "Pengguna sudah punya sertifikat free_track". Ditemukan saat UAT internal
-- 25 September 2026 (Alif menguji alur cert_only -> disetujui -> lanjut
-- ajukan merch_addon -> gagal disetujui).
--
-- ROOT CAUSE: aktivasi_sertifikat_free_track() (docs/sql/14_aktivasi_sertifikat.sql)
-- menjalankan langkah "insert into certificates" untuk SEMUA jenis paket,
-- termasuk merch_addon -- padahal merch_addon adalah pesanan TAMBAHAN ke
-- sertifikat yang SUDAH ADA (dari pesanan cert_only/cert_merch sebelumnya),
-- bukan pesanan yang menerbitkan sertifikat baru. Guard "user sudah punya
-- free_track" (yang seharusnya mencegah DUPLIKAT sertifikat pada cert_only/
-- cert_merch) ikut ter-trigger untuk merch_addon, padahal untuk merch_addon
-- kondisi "user sudah punya free_track" itu justru NORMAL dan DIHARAPKAN
-- (dia baru bisa ajukan merch_addon kalau memang sudah pernah cert_only).
--
-- PERBAIKAN (disetujui Alif, 25 Sep 2026):
-- 1. Untuk v_paket = 'merch_addon': LEWATI pengecekan guard + LEWATI insert
--    certificates sepenuhnya. Langsung ke update status pesanan saja
--    (status='disetujui', status_pengiriman='belum_diproses' -- merch_addon
--    selalu berarti ada barang, jadi tidak perlu CASE seperti sebelumnya).
-- 2. Untuk v_paket IN ('cert_only', 'cert_merch'): perilaku SAMA PERSIS
--    seperti sebelumnya -- guard tetap penuh, insert certificates tetap
--    jalan seperti biasa. TIDAK ADA PERUBAHAN untuk dua paket ini.
-- 3. Return value: untuk merch_addon, certificate_id/nomor_sertifikat perlu
--    tetap dikembalikan supaya TypeScript caller (setujuiPesananAction) tidak
--    error -- diambil dari baris certificates existing milik user itu
--    (bukan bikin baru), supaya PDF/email di TypeScript tetap bisa jalan
--    kalau nanti dibutuhkan (saat ini alur merch_addon tidak generate ulang
--    PDF -- lihat catatan di bagian TypeScript terpisah).
--
-- Aman dijalankan berkali-kali (create or replace). Tidak mengubah skema
-- tabel, tidak menghapus data apa pun -- hanya mengganti logika fungsi.

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

  -- === Jalur merch_addon: TIDAK menerbitkan sertifikat baru ===
  -- merch_addon = tambahan merchandise ke sertifikat yang sudah ada dari
  -- pesanan cert_only/cert_merch sebelumnya. "User sudah punya free_track"
  -- di sini adalah kondisi NORMAL, bukan error.
  if v_paket = 'merch_addon' then

    if not exists (
      select 1 from public.certificates c
       where c.user_id = v_user_id and c.jenis = 'free_track'
    ) then
      -- Kondisi ini seharusnya tidak mungkin terjadi lewat alur UI normal
      -- (merch_addon hanya bisa diajukan user yang sudah py cert_only/
      -- cert_merch disetujui), tapi dijaga di database supaya tidak ada
      -- baris certificate_orders merch_addon yatim tanpa sertifikat induk.
      raise exception 'Pengguna belum punya sertifikat free_track — merch_addon tidak bisa disetujui sebelum sertifikat utama ada';
    end if;

    select c.id, c.nomor_sertifikat
      into v_cert_id, v_nomor
      from public.certificates c
     where c.user_id = v_user_id and c.jenis = 'free_track'
     order by c.tanggal_terbit desc
     limit 1;

    update public.certificate_orders
       set status = 'disetujui',
           verified_by = auth.uid(),
           verified_at = now(),
           status_pengiriman = 'belum_diproses'::status_kirim
     where id = p_order_id;

    return query select v_cert_id, v_nomor, v_user_id;
    return;
  end if;

  -- === Jalur cert_only / cert_merch: PERILAKU SAMA SEPERTI SEBELUMNYA ===
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

-- CARA UJI SETELAH DIJALANKAN (Alif, di browser — bukan lewat SQL Editor):
-- 1. Pakai akun yang SUDAH punya cert_only disetujui (kasus yang gagal kemarin).
-- 2. Kalau belum ada pesanan merch_addon yang menunggu verifikasi, ajukan dulu
--    dari /dashboard/merchandise (upload bukti seperti biasa).
-- 3. Admin -> Upgrade -> Setujui pesanan merch_addon itu.
-- 4. HASIL YANG DIHARAPKAN: berhasil disetujui (tidak ada error "Pengguna
--    sudah punya sertifikat free_track" lagi), status_pengiriman berubah ke
--    "Belum Diproses", TIDAK ada baris certificates baru yang muncul (cek di
--    Admin -> Sertifikat, jumlah sertifikat user itu tetap 1, bukan 2).
-- 5. Regresi — pastikan alur LAMA (cert_only/cert_merch) tetap jalan seperti
--    biasa: ajukan cert_only baru dari akun lain yang belum pernah upgrade,
--    Admin setujui, sertifikat baru harus tetap terbit seperti sebelumnya.
