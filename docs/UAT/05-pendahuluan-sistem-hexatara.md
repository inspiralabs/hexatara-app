# Pendahuluan — Sistem Hexatara

**Untuk:** Abi & tim Hexatara
**Disusun oleh:** InspiraLabs
**Tanggal:** 24 September 2026

---

## 1. Apa yang Sudah Dibangun

Sistem Hexatara bukan sekadar website company profile. Ini adalah satu platform terpadu yang menggabungkan empat hal sekaligus, yang biasanya di perusahaan lain justru dibangun sebagai empat sistem terpisah:

1. **Website perusahaan yang bisa dikelola sendiri** (Content Management System / CMS) — Admin bisa mengubah hampir seluruh isi situs (jadwal pelatihan, promo, profil perusahaan, testimoni, produk) tanpa menyentuh kode sedikit pun.
2. **Sistem verifikasi sertifikat publik** — siapa pun bisa mengecek keaslian sertifikat pilot Hexatara secara online, lewat nomor atau QR code.
3. **Platform belajar online (LMS) untuk jalur Sertifikat Gratis** — materi keselamatan drone berbab, kuis interaktif, sampai penerbitan sertifikat resmi setelah verifikasi pembayaran.
4. **Katalog produk digital** — etalase drone dengan sistem penangkap minat pembeli (lead capture) yang terhubung ke email notifikasi otomatis.

Keempatnya berjalan di satu platform yang sama, memakai satu basis data yang sama, dengan satu panel Admin yang sama. Ini bukan gabungan beberapa layanan pihak ketiga yang ditempel-tempel — semuanya dibangun sebagai satu kesatuan sejak awal.

---

## 2. Perjalanan dari Rencana Awal ke Hasil Akhir

Penting untuk dipahami bersama: **rencana awal proyek ini jauh lebih sederhana** dari apa yang akhirnya berdiri hari ini.

Cakupan yang awalnya disepakati hanya tiga hal: **landing page**, **LMS freemium** (materi + kuis dasar), dan **katalog produk**. Itu saja.

Yang akhirnya terealisasi jauh melampaui titik awal tersebut:

- **Sistem verifikasi sertifikat publik dengan QR code** — bukan bagian dari rencana awal tiga item di atas, tapi dibangun penuh sebagai modul tersendiri (Modul 2) karena nilainya sangat penting bagi kredibilitas Hexatara.
- **Sistem pendaftaran pelatihan penuh** — dari yang tadinya dibayangkan sebagai formulir "minat" sederhana (nama + nomor WhatsApp), berkembang menjadi formulir pendaftaran lengkap dengan identitas dan dokumen, terhubung ke panel manajemen pendaftaran khusus untuk Admin (Modul 7–8).
- **Sistem transaksi & upgrade sertifikat end-to-end** — dari unggah bukti transfer, verifikasi manual Admin, sampai penerbitan otomatis sertifikat resmi dan pengiriman email — sebuah alur kerja (workflow) lengkap yang tadinya tidak tergambar sedetail ini di rencana awal.
- **Sistem materi belajar berbab (bukan sekadar kuis datar)** — dengan penguncian progresif per bab, lampiran berkas, dan validasi baca sampai akhir — jauh lebih terstruktur dari LMS freemium sederhana yang dibayangkan di awal.
- **Redesign menyeluruh** tampilan dan pengalaman pengguna di tengah jalan (Fase 12.5), karena tim InspiraLabs menilai standar awal perlu dinaikkan agar sepadan dengan citra profesional yang Hexatara inginkan.
- **Sistem impor massal data sertifikat**, pelaporan per baris, ekspor data ke Excel, dan berbagai alat operasional lain yang tidak ada di cakupan awal, tapi ditambahkan karena akan sangat dibutuhkan Admin sehari-hari begitu sistem dipakai nyata.

**Kenapa ini terjadi?** Karena sepanjang proses pembangunan, semakin jelas gambaran kebutuhan operasional Hexatara yang sesungguhnya — bukan hanya "asal ada website", tapi sebuah alat kerja yang benar-benar dipakai setiap hari oleh tim Hexatara untuk mengelola pelatihan, sertifikat, dan penjualan. Setiap kali ditemukan celah antara rencana di atas kertas dan kebutuhan nyata di lapangan, itu didiskusikan dan diputuskan bersama — bukan ditambahkan diam-diam. Hasilnya: cakupan pekerjaan yang jauh melampaui rencana awal, dikerjakan dengan standar yang terus dinaikkan sepanjang jalan.

---

## 3. Keunggulan Sistem — Per Kelompok Fitur

### CMS Dinamis
Hampir seluruh konten publik (pop-up, banner, hero, jadwal, instruktur, profil perusahaan, testimoni, FAQ, produk) diatur dari Admin tanpa kode. Ini bukan sekadar "bisa edit teks" — perubahan Admin langsung memengaruhi struktur tampilan (misalnya bagian yang kosong otomatis disembunyikan, bukan tampil sebagai ruang kosong yang janggal).

### Sistem Verifikasi Sertifikat yang Menjaga Privasi
Banyak sistem verifikasi sertifikat yang dibangun asal jadi hanya menampilkan "valid/tidak valid". Sistem Hexatara membedakan **tiga keadaan berbeda** secara eksplisit: sertifikat berlaku, sertifikat kedaluwarsa, dan nomor tidak ditemukan — dengan warna dan pesan berbeda untuk masing-masing, supaya tidak membingungkan pengguna. Sistem ini juga secara sengaja **membatasi data yang tampil ke publik** hanya lima informasi non-sensitif, sebuah keputusan keamanan yang dirancang di level database, bukan sekadar disembunyikan di tampilan.

### Alur Sertifikat Gratis sebagai Mesin Akuisisi Pelanggan
Materi belajar gratis dengan kuis interaktif bukan cuma "nice to have" — ini dirancang sebagai jalur masuk (funnel) yang mengubah pengunjung anonim menjadi pengguna terdaftar, lalu menjadi pemegang sertifikat resmi berbayar (lewat upgrade), lengkap dengan proses verifikasi pembayaran dan penerbitan otomatis. Alur kuis yang bersifat "boleh coba lagi tanpa status gagal" juga dirancang khusus supaya pengalaman belajar terasa mendukung, bukan menghakimi — mendorong lebih banyak orang menyelesaikan materinya sampai akhir.

### Manajemen Operasional yang Nyata
Fitur-fitur seperti impor massal sertifikat dengan pelaporan kegagalan per baris, ekspor data ke Excel, penyalinan cepat data pelatihan dari jadwal sebelumnya, dan panel pendaftaran yang bisa disaring per batch — semua ini adalah fitur yang baru terasa nilainya setelah sistem benar-benar dipakai sehari-hari. Fitur-fitur ini ditambahkan karena tim InspiraLabs membayangkan bagaimana Admin Hexatara akan benar-benar bekerja dengan sistem ini, bukan hanya membangun demo yang terlihat bagus sekali lihat.

### Dwibahasa Sejak Fondasi
Seluruh halaman publik mendukung Bahasa Indonesia dan Inggris sejak level arsitektur (bukan tempelan terjemahan di akhir), dengan mekanisme URL yang konsisten dan sudah mempertimbangkan kebutuhan QR code sertifikat ke depannya.

---

## 4. Dibandingkan dengan Sistem Sejenis

Sebagai gambaran, di pasar Indonesia dan global terdapat berbagai penyedia pelatihan/sertifikasi drone yang juga memiliki kehadiran online — misalnya platform LMS pelatihan drone seperti Drone Edutech, portal pelatihan online Federasi Drone Indonesia, serta berbagai penyedia ground school internasional untuk sertifikasi drone (seperti persiapan ujian Part 107 di Amerika Serikat). Umumnya, platform semacam ini berfokus pada **satu fungsi utama**: menjadi tempat kursus online (LMS) untuk persiapan ujian sertifikasi resmi dari otoritas penerbangan setempat.

Beberapa pola yang umum ditemukan pada platform pelatihan drone sejenis:
- Sebagian besar berfokus sebagai *LMS* (kursus + ujian) semata — untuk penerbitan sertifikat resmi, mereka biasanya menyerahkan ke/mengarahkan ke lembaga sertifikasi resmi negara masing-masing.
- Verifikasi keaslian sertifikat/lisensi umumnya dilakukan lewat basis data otoritas resmi (misalnya basis data lisensi pemerintah), bukan sistem verifikasi mandiri milik penyedia pelatihan.
- Jarang ditemukan platform pelatihan drone yang **sekaligus** menjadi katalog penjualan produk dengan sistem lead capture terintegrasi.

**Yang membedakan sistem Hexatara:** ini bukan sekadar platform LMS untuk lulus ujian, melainkan ekosistem operasional penuh untuk bisnis Hexatara — mulai dari akuisisi pelanggan (landing page, katalog), edukasi (LMS Sertifikat Gratis), transaksi (pendaftaran pelatihan, upgrade sertifikat), sampai kredibilitas publik (verifikasi sertifikat mandiri) — semuanya di satu platform yang dikelola Hexatara sendiri, bukan bergantung pada sistem pihak ketiga atau basis data otoritas eksternal untuk fungsi verifikasi.

*(Catatan: perbandingan ini bersifat gambaran umum dari pengamatan pasar, bukan audit mendalam terhadap sistem internal kompetitor manapun, karena detail teknis internal platform lain umumnya tidak dipublikasikan.)*

Sumber gambaran pasar:
- [Drone Edutech — LMS pelatihan drone](https://dronedutech.com/)
- [Federasi Drone Indonesia — Training dan Sertifikasi Pilot Drone Online](https://online.federasidrone.com/)
- [Panduan Sertifikasi Pilot Drone Indonesia 2026](https://blog.drone.co.id/posts/panduan-lengkap-sertifikasi-pilot-drone-di-indonesia-2026/)
- [Rotate — Drone Pilot Training & Certification Worldwide](https://rotatepilot.com/drone-pilot)
- [The Drone Girl — Best Part 107 Test Prep Courses 2026](https://www.thedronegirl.com/2025/07/23/best-part-107-test-prep-courses/)

---

## 5. Tentang Nilai Investasi Sistem Ini

Tanpa menyebutkan angka secara eksplisit di sini, penting bagi Abi untuk memahami konteksnya: sistem dengan cakupan seperti ini — empat modul terintegrasi penuh, sistem verifikasi publik yang dirancang dengan pertimbangan keamanan data di level database, alur transaksi end-to-end dengan penerbitan dokumen otomatis, serta redesign menyeluruh di tengah proses — berada jauh di atas nilai wajar untuk proyek yang lingkupnya sebatas "landing page, LMS freemium, dan katalog" sederhana.

Realisasi yang jauh di atas ekspektasi awal ini bukan kebetulan atau pembengkakan biaya yang tidak terkendali — ini hasil dari proses kerja yang terus disesuaikan dengan kebutuhan nyata Hexatara di lapangan, dikerjakan dengan penuh perhatian pada detail, dan diawasi lewat proses yang disiplin (setiap fitur baru diperiksa satu per satu sebelum dianggap selesai, setiap penyimpangan dari rencana dicatat dan dijelaskan alasannya, bukan diam-diam dilewati).

Sistem ini dibangun dengan sangat kompleks dan detail, dan — kami ingin Abi tahu — dikerjakan dengan penuh hati, bukan sekadar memenuhi daftar tugas. Hasilnya adalah sebuah platform operasional yang siap dipakai nyata sehari-hari oleh tim Hexatara, bukan sekadar produk demo yang terlihat bagus sesaat.

---

*Dokumen ini bersifat pengantar/overview dan terpisah dari dokumen skenario uji UAT. Untuk detail teknis tiap fitur, lihat `03-penjelasan-fitur.md`. Untuk skenario pengujian, lihat `02-skenario-uji-uat.md`.*
