-- SUDAH DIJALANKAN Alif di Supabase SQL Editor, 2026-09-25.
-- Hasil uji browser: /materi/1 dan /materi/2 = 404; /materi/3 tetap jalan.
-- File ini arsip usulan, bukan untuk dijalankan ulang.
--
-- Nonaktifkan sisa materi uji coba pra-LMS supaya /materi/1 dan /materi/2
-- tidak lagi bisa dibuka. Ditemukan UAT internal 25 September 2026: Alif
-- membuka /materi/1 ("uji_materi_ppt") dan /materi/2 ("uji_materi_pdf").
--
-- ROOT CAUSE: tidak ada listing Admin untuk materials. getMateriId() /
-- getMateriAktifId() memilih course sungguhan (yang punya bab, urutan
-- terkecil). Baris uji F03.12 (id lebih kecil) tetap is_active = true,
-- jadi URL angka tetap merender halaman rusak.
--
-- VERIFIKASI SUMBER: dump backup-hexatara-2026-09-23.sql (bukan query live
-- sesi ini):
--   1  uji_materi_ppt                         is_active = t
--   2  uji_materi_pdf                         is_active = t
--   3  Dasar Keselamatan Penerbangan Drone   is_active = t  (JANGAN disentuh)
--
-- Jalankan SELECT di bawah DULU. Kalau hasilnya bukan 1 dan 2 dengan judul
-- uji, JANGAN lanjut UPDATE.

select id, judul_id, is_active
from public.materials
order by id;

-- Hanya baris yang judulnya masih persis data uji. Id 3 tidak kena.
-- SET is_active = false, BUKAN DELETE (relasi bab/progress tetap utuh).

update public.materials
set is_active = false
where judul_id in ('uji_materi_ppt', 'uji_materi_pdf')
  and is_active = true;

-- CARA UJI SETELAH DIJALANKAN (Alif, di browser):
-- 1. /materi/get-free-certificate-rpc → redirect ke course resmi (/materi/3
--    selama id itu yang aktif berbab). Halaman isinya tetap course sungguhan.
-- 2. Tombol Mulai Sekarang di /pelatihan mengarah ke pintu bernama itu.
-- 3. Link belajar di /dashboard/kursus sama.
-- 4. /materi/1 dan /materi/2: sebelum SQL pun sudah diarahkan ulang oleh
--    kode (bukan halaman uji). Sesudah SQL, is_active false → 404 di query
--    halaman, lalu pintu bernama tetap membuka course resmi.
-- 5. /materi/3 langsung tetap tampil normal.
