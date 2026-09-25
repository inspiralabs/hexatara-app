# Prompt untuk Cursor — Perbaikan Bug: Approval merch_addon Gagal

```
Baca dulu feature-registry.md (Definition of Done Bagian 14) dan CLAUDE.md
sebelum mulai. Ini BUG BARU ditemukan Alif saat UAT internal 25 September 2026,
TERPISAH dari tiga temuan sebelumnya (dashboard/WA pelatihan/WA dinamis) — sudah
selesai dan menunggu konfirmasi terpisah, jangan digabung laporannya.

KONTEKS BUG (sudah dikonfirmasi root cause-nya, jangan investigasi ulang dari
nol): Alif menguji alur — user ajukan paket cert_only, Admin setujui (sukses,
sertifikat free_track terbit). User lalu ajukan tambahan merch_addon dari
/dashboard/merchandise. Saat Admin coba setujui pesanan merch_addon itu di
/admin/upgrade, GAGAL dengan error dari database: "Pengguna sudah punya
sertifikat free_track" (kode P0001).

Root cause: fungsi database aktivasi_sertifikat_free_track() (docs/sql/
14_aktivasi_sertifikat.sql) menjalankan langkah "insert into certificates"
untuk SEMUA jenis paket, termasuk merch_addon — padahal merch_addon adalah
pesanan TAMBAHAN ke sertifikat yang SUDAH ADA, bukan pesanan yang menerbitkan
sertifikat baru. Guard "user sudah punya free_track" (dimaksudkan mencegah
duplikat sertifikat pada cert_only/cert_merch) ikut ter-trigger untuk
merch_addon, padahal untuk merch_addon kondisi itu justru normal.

LANGKAH 1 — SQL (JANGAN EKSEKUSI SENDIRI, hanya beri tahu Alif):
Saya (Cowork/InspiraLabs) sudah menulis SQL usulan lengkap di file terpisah:
usulan-sql-fix-aktivasi-merch-addon.sql (ada di root project). Cursor TIDAK
perlu menulis ulang SQL ini — SQL itu HARUS dijalankan manual oleh Alif sendiri
di Supabase SQL Editor (governance proyek: agent tidak pernah eksekusi DDL).
Cursor cukup MEMBACA file itu untuk memahami apa yang berubah di level
database, supaya perubahan TypeScript di langkah 2 konsisten dengannya:
- Untuk v_paket = 'merch_addon': fungsi TIDAK insert baris certificates baru.
  Fungsi tetap return certificate_id + nomor_sertifikat, tapi diambil dari
  baris certificates YANG SUDAH ADA milik user itu (bukan baris baru).
- Untuk v_paket IN ('cert_only', 'cert_merch'): perilaku SAMA PERSIS seperti
  sebelumnya, tidak ada perubahan.
- status_pengiriman untuk merch_addon yang disetujui selalu jadi
  'belum_diproses' (merch_addon selalu berarti ada barang untuk dikirim).

LANGKAH 2 — TypeScript, src/app/admin/(protected)/upgrade/actions.ts,
setujuiPesananAction:
Setelah SQL di atas dijalankan Alif, fungsi RPC akan tetap sukses untuk
merch_addon (tidak lagi error), TAPI perhatikan: kode TypeScript setelah
pemanggilan RPC saat ini SELALU melakukan dua hal untuk SEMUA jenis paket yang
baru disetujui:
1. generateSertifikatFinalPdf() + upload ulang PDF ke storage
   `final/${certificate_id}.pdf` (menimpa PDF yang sudah ada, dengan isi yang
   PERSIS SAMA karena data sertifikatnya tidak berubah untuk merch_addon).
2. kirimEmailPembayaranDisetujui() — mengirim email "pembayaran disetujui" ke
   user, dengan teks yang mengesankan SERTIFIKAT BARU terbit — padahal untuk
   merch_addon, sertifikatnya sudah ada sejak sebelumnya, yang baru cuma
   status pengiriman merchandise-nya.

Ini MENYESATKAN untuk kasus merch_addon: user akan menerima email "sertifikat
Anda telah terbit" untuk kedua kalinya, padahal sertifikatnya tidak berubah.
PERBAIKAN YANG DIMINTA:

1. Setelah RPC berhasil, cek jenis paket pesanan ini (bisa didapat dari
   data yang sudah di-fetch sebelum/sesudah RPC — cek dulu apakah orderId
   atau data hasil RPC sudah cukup untuk tahu paketnya, atau perlu query
   tambahan `select paket from certificate_orders where id = orderId` —
   pilih cara yang paling konsisten dengan kode yang sudah ada di file ini).
2. KALAU paket = 'merch_addon':
   - LEWATI langkah generate/upload ulang PDF (tidak perlu, PDF sertifikat
     tidak berubah).
   - KIRIM EMAIL YANG BERBEDA — bukan kirimEmailPembayaranDisetujui() yang
     mengesankan sertifikat baru, tapi email konfirmasi bahwa PESANAN
     MERCHANDISE sudah disetujui dan akan diproses pengirimannya. Cek dulu
     src/lib/email/send.ts dan src/lib/email/templates.ts — kalau sudah ada
     template yang cocok (misalnya untuk notifikasi status_pengiriman),
     pakai itu; kalau belum ada, buat fungsi baru kirimEmailMerchDisetujui()
     dengan template baru yang sederhana (nama, info bahwa merchandise akan
     diproses, tautan ke /dashboard/merchandise), mengikuti pola
     kirimEmailPembayaranDisetujui() yang sudah ada (ambil kontak dari
     getKontak(), pola template serupa).
   - activity_logs tetap dicatat seperti biasa (aksi bisa tetap
     'sertifikat_aktif' atau boleh diusulkan aksi baru seperti
     'merch_disetujui' kalau menurut Cursor lebih jelas dibedakan di riwayat
     aktivitas dashboard user — laporkan pilihan ini di plan.md, jangan ubah
     LABEL_AKSI di dashboard/page.tsx tanpa menyebutkannya di laporan karena
     itu di luar scope prompt ini kalau berdampak ke tampilan yang sudah ada).
3. KALAU paket = 'cert_only' atau 'cert_merch': PERILAKU SAMA SEPERTI
   SEBELUMNYA — generate PDF + kirimEmailPembayaranDisetujui() seperti biasa,
   TIDAK ADA PERUBAHAN untuk dua paket ini.

JANGAN ubah apa pun di luar file ini kecuali src/lib/email/send.ts dan
src/lib/email/templates.ts (hanya kalau memang perlu menambah template baru
untuk merch_addon sesuai poin 2 di atas).

SETELAH SELESAI:
- Jalankan pnpm tsc --noEmit dan pnpm lint.
- Update plan.md — TAMBAHKAN bagian baru "Bug Tambahan — Approval merch_addon"
  (JANGAN timpa/hapus bagian Temuan 1/2/3 yang sudah ada, ini laporan
  terpisah di plan.md yang sama), isinya:
  - Ringkasan bug & perbaikan
  - File yang diubah
  - Konfirmasi SQL usulan (usulan-sql-fix-aktivasi-merch-addon.sql) BELUM
    dijalankan Alif — status "menunggu Alif jalankan manual di Supabase SQL
    Editor, SETELAH itu baru kode TypeScript ini bisa diuji end-to-end"
  - Hasil tsc/lint
  - Cara uji Alif (boleh salin dari komentar "CARA UJI" di akhir file SQL,
    tambahkan langkah cek email yang diterima sesuai jenis paket)
- JANGAN tandai apa pun DONE di feature-registry.md — sama seperti tiga
  temuan sebelumnya, ini juga menunggu Alif buka di browser dan konfirmasi
  SETELAH SQL dijalankan manual olehnya. Tambahkan pengingat yang sama di
  plan.md: update feature-registry.md hanya setelah konfirmasi eksplisit.
```

---

## Catatan untuk Alif

Bug ini **bukan** bagian dari tiga temuan kemarin — ini bug lama di fungsi database `aktivasi_sertifikat_free_track()` (sudah ada sejak 7 September, saat F03.7/F03.8 dibangun), baru ketahuan sekarang karena baru kali ini ada yang benar-benar menguji alur "cert_only disetujui dulu, baru ajukan merch_addon menyusul".

Saya sudah tulis SQL usulannya lengkap (`usulan-sql-fix-aktivasi-merch-addon.sql`), sesuai dua keputusan yang Kakak pilih: merch_addon yang disetujui **tidak** menerbitkan sertifikat baru (cuma update status pesanan), dan guard "sudah punya free_track" **hanya** berlaku untuk `cert_only`/`cert_merch` — jalur lama itu tidak saya ubah sama sekali.

Selain SQL-nya, saya juga tambahkan perbaikan di sisi kode: saat ini kalau merch_addon disetujui, sistem akan tetap generate ulang PDF sertifikat dan kirim email "pembayaran disetujui" yang isinya mengesankan sertifikat BARU terbit — padahal untuk merch_addon sertifikatnya sudah ada sejak sebelumnya, yang berubah cuma status pengiriman merchandise-nya. Saya minta Cursor membuat email terpisah yang lebih sesuai untuk kasus ini, supaya user tidak bingung dapat dua email "sertifikat terbit" untuk satu sertifikat yang sama.

**Urutan kerja yang perlu Kakak lakukan:**
1. Jalankan SQL usulan (`usulan-sql-fix-aktivasi-merch-addon.sql`) manual di Supabase SQL Editor.
2. Tempel prompt di atas ke Cursor untuk perbaikan sisi TypeScript.
3. Setelah keduanya selesai, uji ulang persis skenario yang gagal kemarin (cert_only disetujui → ajukan merch_addon → Admin setujui) — pastikan sukses dan email yang diterima user sesuai jenis paketnya.
