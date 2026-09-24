# Persiapan yang Dibutuhkan dari Hexatara

**Untuk:** UAT Fase 1 — Sistem Hexatara (Pelatihan Pilot Drone, Verifikasi Sertifikat, Sertifikat Gratis/LMS, Katalog Produk)
**Disusun oleh:** InspiraLabs
**Tanggal:** 24 September 2026
**Dasar penyusunan:** kondisi sistem yang sudah benar-benar dibangun (bukan rencana), diambil dari `docs/AS_BUILT/M1–M4`, `feature-registry.md`, dan `PRD.md`.

---

## Cara membaca dokumen ini

Setiap butir di bawah ini adalah sesuatu yang sistemnya **sudah punya tempat untuk menyimpannya**, tapi isinya masih kosong, masih data sementara/dummy, atau memang harus datang dari Hexatara karena hanya Hexatara yang tahu jawabannya (harga, desain resmi, data sertifikat lama, dan sejenisnya). Sistem tidak akan "salah" tanpa data ini — tapi tanpa data ini, UAT tidak bisa menguji hal yang sebenarnya, dan yang tampil di layar saat presentasi ke Abi adalah data contoh (dummy), bukan data asli Hexatara.

Setiap butir diberi tingkat urgensi:

- 🔴 **Wajib sebelum UAT** — tanpa ini, salah satu fitur tidak bisa diuji sama sekali atau akan menampilkan data yang jelas terlihat "belum asli" (misalnya nomor WhatsApp dummy, harga Rp 0, atau footer kosong).
- 🟡 **Sebaiknya sebelum go-live** — UAT tetap bisa jalan pakai data sementara, tapi harus diganti data asli sebelum sistem dipakai publik.
- ⚪ **Fase 2 / nanti** — di luar cakupan Fase 1, dicantumkan di sini supaya tidak tertukar dengan yang wajib sekarang.

---

## 1. Pengaturan Operasional (Admin → Pengaturan)

Ini yang paling mendesak, karena hampir semua skenario UAT publik (WhatsApp, email, jam buka) bergantung pada data di halaman ini.

| # | Data yang dibutuhkan | Dipakai di | Urgensi |
|---|---|---|---|
| 1 | Nomor rekening bank resmi Hexatara untuk transfer upgrade sertifikat (Bank, Nomor rekening, Atas nama) | Halaman Transaksi Saya (peserta upload bukti transfer) | 🔴 |
| 2 | Nomor WhatsApp Admin utama (untuk tombol WA melayang & kontak umum) | Landing page, semua halaman publik | 🔴 |
| 3 | Email kontak resmi yang tampil di footer situs | Footer semua halaman | 🔴 |
| 4 | URL Instagram resmi Hexatara (kalau ada, boleh dikosongkan) | Footer | 🟡 |
| 5 | Jam operasional — Bahasa Indonesia dan Bahasa Inggris | Footer / info kontak | 🔴 |
| 6 | Nomor WhatsApp Batch Reguler (untuk pendaftaran pelatihan reguler) | Detail halaman pelatihan | 🔴 |
| 7 | Nomor WhatsApp Private & Inhouse (atas nama Abiyyi) | Detail halaman pelatihan (jalur private/inhouse) | 🔴 |
| 8 | Alamat email tujuan notifikasi lead baru (email **internal** Admin — beda dari email kontak footer no. 3) | Notifikasi otomatis saat ada permintaan penawaran produk | 🔴 |
| 9 | Harga upgrade sertifikat: paket "Sertifikat saja", paket "Sertifikat + merchandise", dan biaya tambah merchandise | Halaman Transaksi Saya (peserta pilih & bayar upgrade) | 🔴 |

**Catatan penting:** semua sembilan data di atas **wajib diisi lewat halaman Admin → Pengaturan sebelum UAT dimulai** — bukan lewat kode. Kalau salah satu kosong, sistem memakai nilai bawaan (default) dari kode yang belum tentu benar/milik Hexatara, dan itu akan terlihat aneh saat didemokan ke Abi (misalnya nomor WA developer, bukan nomor WA Hexatara).

---

## 2. Desain & Data Sertifikat

| # | Yang dibutuhkan | Kenapa dibutuhkan | Urgensi |
|---|---|---|---|
| 1 | Desain resmi PDF sertifikat (Free Track / hasil kuis materi keselamatan) — layout, logo, tanda tangan, elemen QR | Sertifikat resmi yang diterbitkan otomatis setelah Admin menyetujui upgrade tidak bisa final tanpa desain ini; saat ini kemungkinan masih memakai desain sementara | 🔴 |
| 2 | Data sertifikat lama (yang pernah diterbitkan Hexatara secara manual sebelum sistem ini ada) untuk dipindahkan (migrasi) ke database, supaya bisa dicek lewat halaman Verifikasi Sertifikat publik. Minimal per sertifikat: nomor, nama pemegang, tanggal terbit, tanggal kedaluwarsa (atau "tanpa masa berlaku" untuk Free Track) | Tanpa ini, halaman Verifikasi Sertifikat publik hanya bisa membuktikan sertifikat yang terbit lewat sistem baru — sertifikat lama Hexatara tidak akan "ditemukan" saat dicek | 🔴 (kalau Hexatara ingin sertifikat lama juga bisa diverifikasi publik) |
| 3 | Format data sertifikat lama tersebut — Excel/CSV apa adanya sudah cukup, sistem punya fitur Impor Massal yang membaca CSV maupun Excel | Mempercepat proses migrasi, tidak perlu Admin mengetik satu-satu | 🟡 |
| 4 | Kebijakan penomoran sertifikat lama — apakah nomor lama dipakai apa adanya, atau diberi nomor baru sesuai format sistem baru | Supaya tidak ada nomor sertifikat yang bentrok atau format yang tidak konsisten antara sertifikat lama dan baru | 🔴 (kalau ada migrasi data lama) |

---

## 3. Materi Belajar & Soal Kuis (LMS Sertifikat Gratis)

| # | Yang dibutuhkan | Kenapa dibutuhkan | Urgensi |
|---|---|---|---|
| 1 | Materi keselamatan drone dalam bentuk bab-bab (teks + boleh dilengkapi lampiran berkas per bab) | Sistem sudah punya menu Admin untuk memasukkan materi berbab, tapi materinya sendiri (kontennya) harus disiapkan Hexatara | 🔴 |
| 2 | Bank soal kuis beserta pilihan jawaban dan **penjelasan untuk setiap pilihan yang salah** (bukan cuma benar/salah) | Sistem menampilkan penjelasan per opsi saat peserta menjawab — ini butuh naskah soal yang sudah menyertakan penjelasan tiap opsi, bukan sekadar kunci jawaban | 🔴 |
| 3 | Jumlah soal minimum yang diinginkan per kuis (kalau ada preferensi) | Supaya kuis terasa cukup panjang untuk menguji pemahaman, tapi tidak terlalu panjang | 🟡 |

> Catatan yang sudah tercatat di `feature-registry.md`: soal kuis dan penjelasan tiap opsi salah ini sudah lama diminta ke Hexatara dan **menghambat UAT Modul 3 (Sertifikat Gratis)** — sebaiknya ini yang paling awal dikejar.

---

## 4. Konten Website (Landing Page & Halaman Statis)

| # | Yang dibutuhkan | Dipakai di | Urgensi |
|---|---|---|---|
| 1 | Isi pop-up promosi (kalau ada campaign tertentu, boleh dikosongkan) | Landing page, muncul sekali per sesi pengunjung | ⚪ opsional |
| 2 | Teks banner promo (kalau ada), tanpa harga coret/hitung mundur — sistem sengaja tidak punya fitur itu | Landing page | ⚪ opsional |
| 3 | Foto/gambar untuk hero section (banner utama) landing page | Landing page | 🟡 |
| 4 | Profil perusahaan — teks "tentang Hexatara" | Landing page, section Company Profile | 🔴 |
| 5 | Data instruktur — nama, foto, deskripsi singkat tiap instruktur | Landing page, section Instruktur | 🟡 |
| 6 | Testimoni peserta (nama, isi testimoni, boleh + foto) | Landing page, section Testimoni | 🟡 |
| 7 | Pertanyaan & jawaban untuk FAQ | Landing page, section FAQ | 🟡 |
| 8 | Konten Bahasa Inggris untuk semua di atas | Versi Inggris situs | ⚪ (kalau kosong, sistem otomatis fallback ke Bahasa Indonesia — tidak menghambat UAT) |

---

## 5. Data Pelatihan (Batch)

| # | Yang dibutuhkan | Dipakai di | Urgensi |
|---|---|---|---|
| 1 | Minimal 1 batch pelatihan berstatus **aktif** dengan jadwal nyata (bukan tanggal masa lalu) | Landing page jadwal, halaman /pelatihan, syarat wajib supaya skenario pendaftaran bisa diuji | 🔴 |
| 2 | Detail tiap batch: benefit, syarat pendaftaran, silabus, peralatan, FAQ khusus batch, galeri foto | Halaman detail pelatihan (7 elemen konten) | 🟡 |
| 3 | Kategori pelatihan (kalau Hexatara punya beberapa jenis pelatihan yang perlu dibedakan) | Filter halaman pelatihan | 🟡 |

---

## 6. Data Produk (Katalog Drone)

| # | Yang dibutuhkan | Dipakai di | Urgensi |
|---|---|---|---|
| 1 | Minimal 1 produk dengan harga **ditampilkan** dan minimal 1 produk dengan harga **disembunyikan** ("Hubungi kami untuk harga") — supaya kedua skenario tampilan bisa diuji | Katalog produk | 🔴 |
| 2 | Foto produk — thumbnail untuk kartu katalog, dan galeri multi-foto untuk halaman detail | Katalog | 🔴 |
| 3 | Deskripsi & spesifikasi tiap produk | Halaman detail produk | 🔴 |
| 4 | Kategori produk | Filter katalog | 🟡 |
| 5 | Rating produk (kalau ada, opsional) | Kartu katalog | ⚪ opsional |

---

## 7. Akses & Legal

| # | Yang dibutuhkan | Kenapa dibutuhkan | Urgensi |
|---|---|---|---|
| 1 | Akses DNS domain `hexatara.com` — bukan login Hostinger, cukup kesediaan Abi menambahkan beberapa baris record (SPF/DKIM untuk email, dan domain untuk Vercel) yang akan dikirim InspiraLabs | Tanpa ini, domain resmi belum bisa dipakai untuk produksi, dan pengiriman email masih lewat domain sementara (bisa masuk folder spam) | 🔴 (untuk go-live; tidak menghambat UAT dengan URL sementara) |
| 2 | Akun email pengujian di domain Hexatara (untuk memastikan email notifikasi benar-benar masuk inbox, bukan spam, saat sudah pakai domain sendiri) | Uji kirim email produksi | 🟡 |
| 3 | Konfirmasi kebijakan operasional: sertifikat yang salah input dihapus permanen atau tetap disimpan sebagai arsip? | Menentukan SOP Admin sehari-hari | 🟡 |

---

## Ringkasan — yang paling mendesak (🔴) sebelum UAT bisa berjalan penuh

1. Sembilan data di Admin → Pengaturan (rekening, WhatsApp ×3, email ×2, jam operasional, harga upgrade)
2. Desain resmi PDF sertifikat
3. Materi keselamatan drone + bank soal kuis dengan penjelasan tiap opsi
4. Profil perusahaan (teks tentang Hexatara)
5. Minimal 1 batch pelatihan aktif dengan jadwal nyata
6. Minimal 2 produk (1 harga tampil, 1 harga disembunyikan) lengkap dengan foto

Butir-butir dengan tanda 🟡 dan ⚪ tidak menghalangi UAT berjalan, tapi perlu dilengkapi bertahap sebelum sistem benar-benar dipakai publik (go-live).

---

*Dokumen ini disusun berdasarkan kondisi sistem yang sudah dibangun per 24 September 2026. Kalau ada fitur baru yang ditambahkan setelah tanggal ini, daftar ini perlu ditinjau ulang.*
