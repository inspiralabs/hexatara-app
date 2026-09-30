# Prompt Cursor — Perbaikan Grup 2: Admin Pesanan jadi Tabel + Export Excel + Rapikan Sertifikat Ditolak

## Konteks

Temuan uji Alif setelah F13.4. Tidak ada perubahan skema/SQL.

**#4 — Pesanan Merchandise & Pesanan Publik masih card (`<ul><li>`), bukan tabel, dan
belum bisa export Excel.**
Kedua halaman (`/admin/merchandise/pesanan/page.tsx` dan
`/admin/merchandise/pesanan-publik/page.tsx`) masih render `<ul>` manual. Project
sudah punya pola tabel reusable (`DataTable` + `createDataTableColumnHelper`, lihat
`src/app/admin/(protected)/upgrade/upgrade-tables.tsx` sebagai referensi) dan pola
export Excel yang established (`src/app/admin/(protected)/leads/penawaran-export.ts`
— pakai `xlsx`, dynamic import, `XLSX.utils.json_to_sheet` + `writeFile`). Pakai
KEDUA pola itu, jangan bikin pola baru.

**#5 — Section "Pengiriman Merchandise" di Admin > Sertifikat > Upgrade
(`src/app/admin/(protected)/upgrade/page.tsx` + `PengirimanTable` di
`upgrade-tables.tsx`) itu DUPLIKAT PERSIS dari `/admin/merchandise/pesanan`** (sama-sama
query `certificate_orders` where paket in (cert_merch, merch_addon) dan
status=disetujui, dengan `StatusPengirimanSelect`). Hapus section itu dari halaman
Upgrade, ganti dengan tabel baru "Sertifikat Ditolak": daftar `certificate_orders`
dengan `status = 'ditolak'` (SEMUA paket, bukan cuma merch), kolom: nama, paket,
alasan_tolak, tanggal, + tombol buka WhatsApp ke user (ambil nomor WA dari
`profiles` kalau ada kolomnya — cek dulu skema `profiles`, kalau tidak ada kolom WA
di situ, cek apakah nomor WA user tersimpan di tempat lain seperti
`alamat_pengiriman.telepon` order terkait atau data pendaftaran; kalau memang tidak
ada sumber nomor WA yang reliable, laporkan ke saya dulu sebelum menambah kolom baru
di `profiles` — JANGAN menambah kolom sendiri, itu perlu proposal SQL terpisah).

## Langkah

1. Baca ulang `upgrade-tables.tsx`, `upgrade/page.tsx`, `merchandise/pesanan/page.tsx`,
   `merchandise/pesanan-publik/page.tsx`, `leads/penawaran-export.ts`,
   `leads/penawaran-table.tsx` untuk pastikan pola yang saya gambarkan masih sesuai.
2. Paparkan rencana singkat (terutama soal sumber nomor WA untuk tabel Sertifikat
   Ditolak) sebelum menulis kode kalau ternyata skema `profiles` tidak punya kolom WA.

## 1. Ubah `merchandise/pesanan/page.tsx` (Pesanan Merchandise dari Sertifikat)

- Ganti render `<ul>` jadi komponen tabel baru (`pesanan-merchandise-table.tsx`,
  pola sama `AntreanTable`/`PengirimanTable`): kolom Nama, Paket, Produk (ringkas,
  mis. "2 produk" dengan tooltip/expand daftar), Alamat, Status Pengiriman (tetap
  pakai `StatusPengirimanSelect` yang sudah ada), Tanggal.
- Tambah tombol "Export Excel" di atas tabel (pola sama `eksporPenawaranXlsx`), buat
  file baru `pesanan-merchandise-export.ts`. Kolom Excel: Nama, Paket, Daftar Produk
  (gabung "Produk A x2, Produk B x1"), Alamat Lengkap, Kota, Kode Pos, Status
  Pengiriman, Tanggal.

## 2. Ubah `merchandise/pesanan-publik/page.tsx`

- Ganti render `<ul>` jadi tabel (`pesanan-publik-table.tsx`, pola sama): kolom Nama,
  WhatsApp (dengan link wa.me), Produk (dari kolom `items` jsonb), Alamat, Status
  (`PesananPublikStatusSelect` yang sudah ada), Tanggal.
- Tambah tombol "Export Excel" (`pesanan-publik-export.ts`, pola sama
  `eksporPenawaranXlsx`). Kolom Excel: Nama, WhatsApp, Daftar Produk, Alamat Lengkap,
  Kota, Kode Pos, Catatan, Status, Tanggal.

## 3. Halaman Admin > Sertifikat > Upgrade (`upgrade/page.tsx` + `upgrade-tables.tsx`)

- Hapus render `<PengirimanTable>` dan query `pengiriman` terkait dari `page.tsx`
  (boleh hapus fungsi `PengirimanTable` dari `upgrade-tables.tsx` juga kalau sudah
  tidak dipakai di tempat lain — cek dulu dengan grep sebelum hapus).
- Tambah section baru "Sertifikat Ditolak": query `certificate_orders` where
  `status = 'ditolak'`, semua paket, join nama + `whatsapp` user dari `profiles`
  (kolom `profiles.whatsapp` sudah ada, tidak perlu SQL baru). Tabel baru
  (`SertifikatDitolakTable`, pola `DataTable` sama seperti yang lain) kolom: Nama,
  Paket, Alasan Ditolak, Tanggal, tombol "Hubungi WA" (buka `wa.me/<nomor bersih dari
  profiles.whatsapp>` di tab baru — kalau `whatsapp` kosong untuk user tertentu,
  sembunyikan tombolnya untuk baris itu, jangan error).

## Testing sequence

1. Admin > Merchandise > Pesanan: cek tampil sebagai tabel (bukan card), bisa
   sort/filter/cari seperti tabel admin lain, klik Export Excel → file terunduh
   dengan data benar.
2. Admin > Merchandise > Pesanan Publik: sama, cek tabel + export Excel.
3. Admin > Sertifikat > Upgrade: cek section "Pengiriman Merchandise" sudah hilang,
   muncul section baru "Sertifikat Ditolak" berisi order yang ditolak, tombol WA
   berfungsi membuka WhatsApp ke nomor yang benar.
4. Pastikan tidak ada regresi di `AntreanTable` (verifikasi pembayaran) — section itu
   TIDAK diubah.

## Dokumentasi

1. **`plan.md`**: ringkas perubahan + file, status "menunggu uji Alif".
2. **`ENGINEERING.md`** — perluas `### ADR-026` (bukan ADR baru), sub-bagian
   "Diperluas [tanggal]": tabel admin jadi format tabel+export, section Pengiriman
   Merchandise (Sertifikat) diganti Sertifikat Ditolak. Update Bagian 11.
3. **`feature-registry.md`** — baris F13.4: tambahkan catatan bug-fix ini di kolom
   Bukti, status TETAP seperti sebelumnya.
4. **Jangan pernah menandai DONE atas inisiatif sendiri.**

## Saran pesan commit

```
fix(admin-merchandise): pesanan jadi tabel + export Excel, rapikan menu Sertifikat

- Pesanan Merchandise & Pesanan Publik: dari card list jadi DataTable + export xlsx
  (pola sama leads/penawaran)
- Hapus section "Pengiriman Merchandise" duplikat di Sertifikat > Upgrade, ganti
  "Sertifikat Ditolak" (semua paket, + tombol WA follow-up)

Ref: ADR-026, F13.4 (temuan UAT)
```
