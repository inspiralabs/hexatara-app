# Checklist Uji Internal InspiraLabs (Gladi Resik)

**Untuk:** sesi uji internal malam ini bersama Haikal, di atas hasil akhir yang sudah di-push ke Vercel (production), **sebelum** dibawa presentasi ke Abi.
**Tujuan:** meminimalisir kejutan tidak diinginkan saat presentasi — semua yang dicek di sini adalah simulasi kering (dry run) dari apa yang akan Abi lihat.
**Disusun oleh:** InspiraLabs
**Tanggal:** 24 September 2026

**Cara pakai:** checklist ini **daftar ujinya sama** dengan `02-skenario-uji-uat.md` (supaya tidak ada dua standar berbeda), tapi disusun ulang sebagai **alur demo yang bisa langsung dijalankan berurutan**, dengan kolom catatan cepat. Kalau ada yang gagal atau meragukan, catat di kolom "Catatan" — jangan langsung diperbaiki di tengah sesi kalau tidak darurat, kumpulkan dulu semua temuan di akhir sesi.

Kolom status: **OK** (berjalan sesuai harapan) / **PERLU DIJELASKAN** (bukan bug, tapi berpotensi menimbulkan pertanyaan dari Abi — siapkan kalimat penjelasannya) / **MASALAH** (temuan nyata, perlu diperbaiki sebelum presentasi).

---

## Sebelum Mulai — Cek Produksi (khusus versi live Vercel)

Ini tambahan khusus untuk sesi malam ini karena mengetes di **production**, bukan di local/staging:

| # | Cek | Status | Catatan |
|---|---|---|---|
| 1 | `.env` production berisi nilai **asli**, bukan dummy/placeholder (cek terutama: nomor WhatsApp, email pengirim, kredensial Resend, URL situs) | ☐ | |
| 2 | Email yang dikirim sistem (verifikasi akun, notifikasi upgrade, notifikasi lead) benar-benar **masuk ke inbox**, bukan folder spam — cek dari sisi penerima sungguhan, bukan cuma "terkirim tanpa error" | ☐ | |
| 3 | URL yang dipakai untuk QR code sertifikat mengarah ke domain production yang benar (bukan localhost/domain staging) | ☐ | |
| 4 | Tidak ada banner/watermark "development" atau semacamnya yang tampil di situs live | ☐ | |
| 5 | Data yang tampil di situs adalah data yang memang ingin ditunjukkan ke Abi (bukan data uji coba asal-asalan yang kelihatan aneh, misalnya nama produk "test123") | ☐ | |

## Sebelum Mulai — Data & Pengaturan (sama dengan Bagian 0 dokumen UAT)

| # | Cek | Status | Catatan |
|---|---|---|---|
| 1 | Admin → Pengaturan: rekening bank, WA Admin, email kontak, jam operasional, WA Batch Reguler, WA Private/Inhouse, email notifikasi Admin, harga upgrade — **semua terisi data asli** | ☐ | |
| 2 | Minimal 1 batch pelatihan aktif dengan jadwal masa depan | ☐ | |
| 3 | Minimal 1 produk harga tampil + 1 produk harga disembunyikan | ☐ | |
| 4 | Minimal 1 sertifikat contoh: berlaku, kedaluwarsa, dan Free Track (untuk demo Verifikasi) | ☐ | |
| 5 | Materi + soal kuis minimal cukup untuk demo end-to-end (kalau materi asli Hexatara belum lengkap, siapkan materi contoh yang masuk akal untuk demo — jangan kosong) | ☐ | |
| 6 | Akun demo siap: 1 Admin, 1 User baru (belum pernah daftar), 1 User yang sudah pernah upgrade | ☐ | |

---

## Alur Demo Berurutan (End-to-End)

### 1. Publik — Landing & Konten

| # | Langkah demo | Status | Catatan |
|---|---|---|---|
| 1.1 | Buka landing page, tunjukkan pop-up (kalau aktif) | ☐ | |
| 1.2 | Tunjukkan hero, jadwal batch, section produk, instruktur, testimoni, FAQ | ☐ | |
| 1.3 | Klik tombol WhatsApp melayang → pastikan membuka ke nomor yang benar | ☐ | |
| 1.4 | Ganti bahasa ID ⇄ EN, pastikan tidak ada teks yang "bocor" masih Bahasa Indonesia padahal sudah pilih Inggris (atau sebaliknya) | ☐ | |

### 2. Publik — Pelatihan & Pendaftaran

| # | Langkah demo | Status | Catatan |
|---|---|---|---|
| 2.1 | Buka `/pelatihan`, buka detail salah satu batch | ☐ | |
| 2.2 | Tunjukkan 7 elemen konten batch (benefit, syarat, silabus, peralatan, FAQ, galeri) — pastikan tidak ada bagian kosong yang tampil janggal | ☐ | |
| 2.3 | Isi form pendaftaran lengkap sampai submit | ☐ | |
| 2.4 | **Siapkan penjelasan:** tidak ada email otomatis ke Admin untuk pendaftaran ini (ditahan Fase 2) — pastikan Haikal tahu ini bukan bug supaya tidak "kaget" saat demo ke Abi nanti | ☐ | |

### 3. Publik — Verifikasi Sertifikat

| # | Langkah demo | Status | Catatan |
|---|---|---|---|
| 3.1 | Cek sertifikat yang **masih berlaku** → tampil hijau | ☐ | |
| 3.2 | Cek sertifikat **kedaluwarsa** → tampil merah/invalid | ☐ | |
| 3.3 | Cek sertifikat **Free Track** → tampil "tanpa masa berlaku" | ☐ | |
| 3.4 | Cek nomor **acak/salah** → tampil "tidak ditemukan", beda dari kedaluwarsa | ☐ | |
| 3.5 | Kalau ada sertifikat fisik/PDF contoh dengan QR, scan langsung dari HP untuk demo yang lebih meyakinkan | ☐ | |

### 4. Publik — Katalog Produk

| # | Langkah demo | Status | Catatan |
|---|---|---|---|
| 4.1 | Buka katalog, tunjukkan produk harga tampil dan produk "Hubungi kami untuk harga" | ☐ | |
| 4.2 | Buka detail produk, tunjukkan galeri foto | ☐ | |
| 4.3 | Klik "Hubungi via WhatsApp" → pastikan pesan otomatis berisi nama produk | ☐ | |
| 4.4 | Isi form "Minta Penawaran" sampai submit | ☐ | |
| 4.5 | **Cek langsung saat itu juga:** email notifikasi benar-benar masuk ke alamat Pengaturan (buka inbox-nya di layar kalau memungkinkan, ini bagian paling meyakinkan untuk ditunjukkan ke Abi) | ☐ | |

### 5. Publik — Materi & Kuis (Jalur Sertifikat Gratis)

| # | Langkah demo | Status | Catatan |
|---|---|---|---|
| 5.1 | Buka materi dari tombol "Mulai Sekarang" di pelatihan | ☐ | |
| 5.2 | Tunjukkan penguncian bab berurutan | ☐ | |
| 5.3 | Selesaikan semua bab, buka kuis | ☐ | |
| 5.4 | Jawab salah satu soal salah dulu → tunjukkan penjelasan opsi salah muncul | ☐ | |
| 5.5 | Selesaikan kuis, klik "Dapatkan Sertifikat" | ☐ | |

### 6. User — Daftar Akun & Dashboard

| # | Langkah demo | Status | Catatan |
|---|---|---|---|
| 6.1 | Daftar akun baru, cek email verifikasi masuk | ☐ | |
| 6.2 | Klik verifikasi, masuk ke dashboard | ☐ | |
| 6.3 | Tunjukkan pratinjau sertifikat dengan QR blur | ☐ | |
| 6.4 | Buka Transaksi Saya, tunjukkan nominal harga sesuai Pengaturan + info rekening | ☐ | |
| 6.5 | Unggah bukti transfer contoh (dummy/contoh gambar) | ☐ | |

### 7. Admin — Verifikasi Upgrade & Penerbitan Sertifikat

| # | Langkah demo | Status | Catatan |
|---|---|---|---|
| 7.1 | Login Admin, buka menu Upgrade | ☐ | |
| 7.2 | Setujui pengajuan dari langkah 6.5 | ☐ | |
| 7.3 | Cek sertifikat resmi langsung terbit (QR tidak blur lagi di dashboard user) | ☐ | |
| 7.4 | Cek email pemberitahuan terkirim ke user | ☐ | |
| 7.5 | **Buktikan ke Abi:** buka `/verify`, masukkan nomor sertifikat yang baru saja terbit → tampil "Berlaku" — ini demo paling kuat untuk menunjukkan alur end-to-end bekerja penuh | ☐ | |

### 8. Admin — Menu Lain (jalankan cepat, tidak perlu detail penuh)

| # | Langkah demo | Status | Catatan |
|---|---|---|---|
| 8.1 | Overview — tunjukkan ringkasan angka | ☐ | |
| 8.2 | Konten — tunjukkan salah satu CRUD (mis. ubah testimoni, langsung cek berubah di publik) | ☐ | |
| 8.3 | Sertifikat — tunjukkan tambah manual + fitur impor massal (bisa pakai file contoh kecil) | ☐ | |
| 8.4 | Materi & Soal — tunjukkan cara tambah bab/soal | ☐ | |
| 8.5 | Produk & Kategori — tunjukkan CRUD singkat | ☐ | |
| 8.6 | Leads → Penawaran — tunjukkan daftar masuk + ubah status + ekspor Excel | ☐ | |
| 8.7 | Peserta Pendaftaran — tunjukkan data dari langkah 2.3 muncul di sini | ☐ | |
| 8.8 | Pengaturan — tunjukkan semua field yang sudah diisi | ☐ | |

---

## Hal yang "Normal" — Siapkan Penjelasan Verbal ke Abi Kalau Ditanya

Ini bukan bug — kalau Abi bertanya soal ini saat presentasi, ini kalimat penjelasan singkatnya:

| Yang mungkin ditanya Abi | Penjelasan singkat |
|---|---|
| "Kenapa tidak ada email masuk waktu saya isi form pendaftaran pelatihan?" | Notifikasi email untuk pendaftaran pelatihan sengaja ditahan untuk Fase 2 (sudah disepakati 24 September 2026) — Admin tetap bisa lihat pendaftar lewat menu Peserta Pendaftaran |
| "Kenapa tidak bisa bayar langsung di website?" | Transfer manual + verifikasi Admin adalah desain yang disepakati untuk Fase 1; payment gateway otomatis masuk rencana Fase 2 |
| "Kenapa nomor sertifikat lama saya tidak ketemu di halaman Verifikasi?" | Data sertifikat lama belum dipindahkan ke sistem baru — perlu proses migrasi data terpisah (lihat dokumen Persiapan) |
| "Kenapa ada dua tempat belajar berbeda?" | Materi Sertifikat Gratis (online, mandiri) beda dengan pelatihan berbayar (tatap muka/WA Group + Zoom) — memang dua alur yang berbeda tujuan |
| "Kenapa banner promo tidak ada hitung mundur/diskon otomatis?" | Keputusan desain sengaja — banner hanya teks informasi, bukan mesin promo otomatis, sesuai kesepakatan awal proyek |

---

## Ringkasan Akhir Sesi (isi setelah selesai gladi resik)

**Total status OK:** ___ / ___
**Total PERLU DIJELASKAN:** ___
**Total MASALAH (wajib diperbaiki sebelum ke Abi):** ___

### Yang wajib diperbaiki sebelum presentasi ke Abi
-

### Yang sudah siap didemokan
-

---

*Checklist ini memakai daftar uji yang sama dengan `02-skenario-uji-uat.md`, hanya disusun ulang sebagai alur demo langsung. Temuan dari sesi ini, kalau relevan untuk UAT resmi bersama Hexatara, pindahkan ke `04-catatan-perubahan-inspiralabs.md`.*
