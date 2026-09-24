# Skenario Uji UAT — Sistem Hexatara Fase 1

**Untuk:** UAT Fase 1 — Pengujian dan Penyesuaian Sesuai Requirement
**Disusun oleh:** InspiraLabs
**Tanggal:** 24 September 2026
**Dasar penyusunan:** berdasarkan apa yang **benar-benar sudah dibangun** di sistem (kode + `docs/AS_BUILT/M1–M4` + `feature-registry.md`), bukan berdasarkan rencana awal di PRD.

## Cara memakai dokumen ini

Setiap skenario punya kolom **Hasil yang diharapkan** dan kolom **Centang**. Saat menguji, buka fitur yang dimaksud, ikuti langkahnya, lalu bandingkan hasilnya dengan yang tertulis. Kalau ada yang tidak sesuai, catat di dokumen terpisah **04-catatan-perubahan-inspiralabs.md**, jangan diperbaiki dulu di tempat — biar semua masukan terkumpul rapi dulu.

Setiap skenario diberi nomor (mengikuti nomor fitur di `feature-registry.md`) supaya mudah dirujuk saat diskusi. Untuk penjelasan awam "kenapa fitur ini begini", lihat dokumen **03-penjelasan-fitur.md** — nomornya sama persis dengan dokumen ini.

---

## Bagian 0 — Persiapan Sebelum Mulai Uji

**Jangan mulai uji sebelum bagian ini selesai dicek.** Banyak skenario di bawah bergantung pada data ini; kalau kosong, hasil uji akan salah bukan karena sistem error, tapi karena datanya memang belum diisi.

### 0.1 Data di Admin → Pengaturan

| # | Yang harus sudah terisi | Sudah? |
|---|---|---|
| 1 | Bank, Nomor rekening, Atas nama (untuk pembayaran upgrade sertifikat) | ☐ |
| 2 | Nomor WhatsApp Admin utama | ☐ |
| 3 | Email kontak resmi (footer) | ☐ |
| 4 | Jam operasional (Indonesia & Inggris) | ☐ |
| 5 | Nomor WA Batch Reguler | ☐ |
| 6 | Nomor WA Private & Inhouse | ☐ |
| 7 | Email notifikasi Admin (tujuan email lead baru — beda dari email kontak footer) | ☐ |
| 8 | Harga upgrade: Sertifikat saja / Sertifikat + merchandise / Tambah merchandise | ☐ |

### 0.2 Data minimum yang harus ada di sistem

| # | Syarat | Sudah? |
|---|---|---|
| 1 | Minimal 1 batch pelatihan berstatus **aktif**, tanggal jadwal di masa depan | ☐ |
| 2 | Minimal 1 produk dengan **harga ditampilkan** | ☐ |
| 3 | Minimal 1 produk dengan **harga disembunyikan** ("Hubungi kami untuk harga") | ☐ |
| 4 | Minimal 1 sertifikat contoh yang **masih berlaku** (untuk uji Verifikasi) | ☐ |
| 5 | Minimal 1 sertifikat contoh yang **sudah kedaluwarsa** (untuk uji Verifikasi) | ☐ |
| 6 | Minimal 1 sertifikat **Free Track** (tanpa masa berlaku) | ☐ |
| 7 | Materi belajar (minimal 1 bab) + minimal beberapa soal kuis dengan penjelasan tiap opsi | ☐ |

### 0.3 Akun untuk uji

| # | Akun | Sudah? |
|---|---|---|
| 1 | 1 akun Admin (untuk semua skenario Bagian Admin) | ☐ |
| 2 | 1 akun User/peserta baru (email belum pernah dipakai daftar, untuk uji alur daftar dari nol) | ☐ |
| 3 | 1 akun User yang sudah pernah menyelesaikan kuis (untuk uji dashboard & upgrade) | ☐ |

---

## Bagian A — Skenario Publik (tanpa login)

### A1. Landing Page (Modul 1)

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| A1.1 Pop-up sesi | Buka situs pertama kali di sesi browser baru | Pop-up muncul sekali (kalau ada data aktif); tertutup, tidak muncul lagi sampai sesi baru | ☐ |
| A1.2 Banner promo | Lihat bagian atas landing | Banner tampil kalau ada isi aktif dari Admin; **tidak ada** harga coret, kupon, atau hitung mundur | ☐ |
| A1.3 Hero & jadwal | Scroll landing | Dua kartu penawaran (pelatihan + jual drone), carousel hero (kalau ada), jadwal batch aktif tampil | ☐ |
| A1.4 Batch tertutup | Cek batch berstatus "closed" (kalau ada) | Tidak ada tombol daftar untuk batch tertutup | ☐ |
| A1.5 Tombol WhatsApp melayang | Klik ikon WA melayang | Membuka WhatsApp ke nomor Admin (dari Pengaturan) — tautan langsung, bukan chatbot otomatis | ☐ |
| A1.6 Ganti bahasa | Klik pemilih bahasa | Situs berganti ke Bahasa Inggris/Indonesia; kalau konten Inggris kosong, otomatis tampil Bahasa Indonesia | ☐ |
| A1.7 Menu ke halaman pelatihan | Klik "Lihat Jadwal" | Menuju daftar pelatihan `/pelatihan` | ☐ |

### A2. Halaman Pelatihan & Pendaftaran (Modul 1 + Modul 8)

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| A2.1 Listing pelatihan | Buka `/pelatihan` | Daftar batch aktif tampil, bisa difilter per kategori (kalau kategori diisi) | ☐ |
| A2.2 Detail pelatihan | Klik salah satu batch | Tampil: benefit, syarat pendaftaran, silabus, peralatan, FAQ, galeri (bagian yang kosong otomatis disembunyikan, bukan tampil kosong) | ☐ |
| A2.3 Kontak pelatihan tampil benar | Cek detail batch reguler vs private/inhouse | Nomor WA yang tampil sesuai jenisnya (Reguler → WA Batch Reguler; Private/Inhouse → WA Private & Inhouse Abiyyi) | ☐ |
| A2.4 Isi form pendaftaran | Klik daftar, isi formulir lengkap (identitas, dokumen) | Data tersimpan; **tidak** langsung diarahkan ke WhatsApp otomatis (ini beda dari sistem lama) | ☐ |
| A2.5 URL lama redirect | Buka URL lama `/batch/[slug]` (kalau tahu contohnya) | Otomatis dialihkan ke `/pelatihan/[slug]` | ☐ |

### A3. Verifikasi Sertifikat (Modul 2)

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| A3.1 Cek sertifikat berlaku | Buka `/verify`, masukkan nomor sertifikat yang masih berlaku | Tampil hijau "Berlaku" + nama, nomor, tanggal terbit, masa berlaku | ☐ |
| A3.2 Cek sertifikat kedaluwarsa | Masukkan nomor sertifikat yang sudah lewat tanggal | Tampil merah "Invalid" / kedaluwarsa | ☐ |
| A3.3 Cek sertifikat Free Track | Masukkan nomor sertifikat Free Track | Tampil hijau "Berlaku" dengan keterangan "Tanpa masa berlaku" (bukan tanggal) | ☐ |
| A3.4 Nomor salah/tidak ada | Masukkan nomor sembarangan | Tampil abu-abu "Tidak Ditemukan" — beda tampilan dari "Invalid" | ☐ |
| A3.5 Cek lewat QR | Scan QR sertifikat (atau buka link `/verify/[token]` langsung) | Hasil langsung tampil tanpa perlu isi form nomor | ☐ |
| A3.6 Data yang tampil terbatas | Perhatikan hasil pengecekan mana pun | Hanya 5 info yang tampil: nama, nomor, tanggal terbit, masa berlaku, status. **Tidak ada** email/telepon/alamat pemegang sertifikat | ☐ |
| A3.7 Batas pencarian berulang (kalau diaktifkan) | Coba cari berkali-kali berturut-turut dalam waktu singkat | Kalau rate limit aktif di Pengaturan, muncul batasan setelah sejumlah percobaan | ☐ |

### A4. Katalog Produk (Modul 4)

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| A4.1 Listing katalog | Buka `/katalog` | Daftar produk aktif, bisa difilter kategori & diurutkan | ☐ |
| A4.2 Harga tampil | Buka produk yang harganya diisi | Harga tampil apa adanya | ☐ |
| A4.3 Harga disembunyikan | Buka produk yang harganya dikosongkan (toggle "tampilkan harga" mati) | Tulisan "Hubungi kami untuk harga" — **bukan** Rp 0 atau kosong | ☐ |
| A4.4 Detail produk | Buka detail salah satu produk | Galeri foto (carousel + bisa diperbesar/lightbox), deskripsi, spesifikasi, saran produk kategori sama | ☐ |
| A4.5 Kontak via WhatsApp | Klik "Hubungi via WhatsApp" di detail produk | Membuka WA ke nomor Admin, pesan otomatis sudah berisi nama produk | ☐ |
| A4.6 Minta penawaran | Klik "Minta penawaran", isi nama & email (wajib), field lain opsional | Form tersimpan, **muncul email masuk ke alamat di Pengaturan → Email notifikasi Admin** (bukan email footer) | ☐ |
| A4.7 Konfirmasi submit | Setelah submit form penawaran | Muncul pesan sukses **di dalam dialog form** — tidak diarahkan ke WhatsApp | ☐ |
| A4.8 Centang persetujuan default | Perhatikan checkbox persetujuan di form penawaran | Default dalam keadaan **tidak dicentang** (OFF) | ☐ |

### A5. Materi & Kuis Publik (Modul 3, tanpa login)

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| A5.1 Akses materi tanpa login | Dari landing, klik "Mulai Sekarang" di pelatihan | Masuk ke halaman materi berbab tanpa diminta login dulu | ☐ |
| A5.2 Baca bab berurutan | Coba buka bab 2 sebelum menyelesaikan bab 1 | Bab terkunci sampai bab sebelumnya selesai dibaca | ☐ |
| A5.3 Kuis terkunci | Coba buka tab kuis sebelum semua bab selesai | Tab kuis terkunci sampai seluruh bab tuntas | ☐ |
| A5.4 Jawab kuis salah | Pilih jawaban salah | Muncul penjelasan kenapa jawaban itu salah; boleh ganti jawaban, tidak ada status "gagal" | ☐ |
| A5.5 Selesai kuis, belum punya akun | Klik "Dapatkan Sertifikat" setelah kuis selesai (belum login) | Diarahkan ke halaman daftar akun (data kuis yang sudah dikerjakan tidak hilang) | ☐ |

---

## Bagian B — Skenario Pengguna Terdaftar (User)

### B1. Daftar & Login

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| B1.1 Daftar akun baru | Selesaikan kuis lalu daftar dengan email baru | Akun terbuat, email verifikasi terkirim | ☐ |
| B1.2 Verifikasi email | Klik link di email verifikasi | Akun terverifikasi, otomatis masuk ke dashboard | ☐ |
| B1.3 Sudah login, ulangi kuis | Login lebih dulu, lalu selesaikan kuis materi lain | Langsung tercatat selesai + masuk dashboard — **tidak** diminta isi form daftar ulang | ☐ |

### B2. Dashboard Peserta

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| B2.1 Lihat sertifikat pratinjau | Buka Dashboard → Sertifikat (setelah selesai kuis, sebelum upgrade) | Pratinjau sertifikat tampil dengan QR **blur/buram** — belum resmi | ☐ |
| B2.2 Ajukan upgrade | Buka Dashboard → Transaksi Saya | Form pilih paket (Sertifikat saja / + merchandise), nomor rekening tampil, bisa unggah bukti transfer | ☐ |
| B2.3 Nominal sesuai Pengaturan | Perhatikan nominal yang muncul saat ajukan upgrade | Sama persis dengan harga yang diisi Admin di Pengaturan → Harga upgrade | ☐ |
| B2.4 Redirect halaman lama | Buka `/dashboard/upgrade` langsung | Otomatis dialihkan ke `/dashboard/transaksi` | ☐ |
| B2.5 Lihat kursus/materi | Buka Dashboard → Kursus | Daftar materi yang sudah/sedang dipelajari | ☐ |
| B2.6 Ubah profil | Buka Dashboard → Profil / Pengaturan | Bisa ubah data diri | ☐ |

### B3. Setelah Upgrade Disetujui

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| B3.1 Sertifikat resmi terbit | Setelah Admin menyetujui pembayaran (lihat A3/C-bagian Admin) | Sertifikat resmi (dengan QR aktif, tanpa blur) muncul di dashboard peserta | ☐ |
| B3.2 Email pemberitahuan | Cek email peserta setelah disetujui | Email pemberitahuan sertifikat terbit terkirim | ☐ |
| B3.3 Bisa dicek di Verifikasi publik | Buka `/verify`, masukkan nomor sertifikat yang baru terbit | Muncul "Berlaku" — bisa dicek siapa saja tanpa login | ☐ |
| B3.4 Status merchandise (kalau paket + merchandise) | Cek Dashboard → Merchandise | Status pengiriman merchandise tampil sesuai yang diatur Admin | ☐ |

---

## Bagian C — Skenario Admin

### C1. Konten Landing (Modul 1)

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| C1.1 CRUD pop-up | Admin → Konten → Pop-up: tambah/ubah/hapus | Perubahan langsung terlihat di landing publik | ☐ |
| C1.2 CRUD banner | Admin → Konten → Banner: aktifkan/nonaktifkan | Banner tampil/hilang sesuai toggle | ☐ |
| C1.3 CRUD hero, instruktur, profil perusahaan, testimoni | Admin → Konten: ubah masing-masing | Tersimpan dan tampil di landing | ☐ |
| C1.4 CRUD batch pelatihan | Admin → Batch: tambah batch baru lengkap (benefit, silabus, peralatan, FAQ, galeri) | Batch baru muncul di listing publik `/pelatihan` | ☐ |
| C1.5 Salin dari batch lain | Admin → Batch → buat baru → gunakan opsi "salin dari batch" | Data batch lama tersalin ke form batch baru, tinggal disesuaikan | ☐ |
| C1.6 CRUD kategori batch | Admin → Batch → Kategori | Kategori baru bisa dipakai untuk filter di halaman publik | ☐ |

### C2. Sertifikat (Modul 2 & 3)

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| C2.1 Tambah sertifikat manual | Admin → Sertifikat → Baru, kosongkan nomor | Sistem membuat nomor otomatis sesuai jenis sertifikat | ☐ |
| C2.2 Impor massal | Admin → Sertifikat → Impor, unggah file CSV/Excel berisi beberapa baris (campur baris benar & salah) | Baris yang benar tetap masuk; baris salah dilaporkan dengan nomor barisnya, tidak membatalkan baris lain | ☐ |
| C2.3 Unduh template impor | Admin → Sertifikat → Impor → unduh template | File Excel template terunduh | ☐ |
| C2.4 Hapus sertifikat | Admin → Sertifikat → hapus salah satu (dengan konfirmasi) | Sertifikat terhapus setelah konfirmasi | ☐ |
| C2.5 Setujui pengajuan upgrade | Admin → Upgrade: lihat antrean, setujui satu pengajuan | Sertifikat resmi otomatis terbit, email ke peserta terkirim, PDF dibuat (kalau PDF gagal dibuat, persetujuan tetap tercatat — tidak batal) | ☐ |
| C2.6 Tolak pengajuan upgrade | Admin → Upgrade: tolak salah satu pengajuan | Status pengajuan berubah jadi ditolak, peserta bisa lihat statusnya | ☐ |
| C2.7 Atur status kirim merchandise | Admin → Upgrade: ubah status pengiriman untuk paket + merchandise | Status berubah, tampil ke peserta di dashboard | ☐ |

### C3. Materi & Kuis

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| C3.1 CRUD materi & bab | Admin → Materi: tambah bab baru + lampiran berkas | Bab baru tampil di LMS publik sesuai urutan | ☐ |
| C3.2 CRUD/impor bank soal | Admin → Materi → Soal: tambah soal + opsi jawaban + penjelasan tiap opsi | Soal baru muncul di kuis publik | ☐ |

### C4. Produk & Penawaran (Modul 4)

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| C4.1 CRUD produk | Admin → Produk: tambah produk baru lengkap dengan thumbnail, galeri, harga, urutan tampil | Produk baru tampil di katalog publik | ☐ |
| C4.2 Sembunyikan harga | Admin → Produk: matikan toggle "tampilkan harga" | Produk tampil "Hubungi kami untuk harga" di publik | ☐ |
| C4.3 Nonaktifkan produk | Admin → Produk: matikan status aktif salah satu produk | Produk tidak lagi tampil di katalog publik | ☐ |
| C4.4 CRUD kategori produk | Admin → Produk → Kategori | Kategori baru bisa dipilih di form produk & filter publik | ☐ |
| C4.5 Lihat daftar penawaran | Admin → Leads → Permintaan Penawaran | Semua permintaan dari form katalog tampil di sini | ☐ |
| C4.6 Ubah status penawaran | Admin → Leads → Permintaan Penawaran: ubah status (mis. Baru → Dihubungi → Selesai) | Status tersimpan dan tampil di listing | ☐ |
| C4.7 Ekspor penawaran ke Excel | Admin → Leads → Permintaan Penawaran → unduh | File Excel (.xlsx) berisi daftar penawaran terunduh | ☐ |

### C5. Pendaftaran Pelatihan (Modul 8)

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| C5.1 Lihat peserta pendaftaran | Admin → Peserta Pendaftaran | Semua pendaftar batch (dari form lengkap A2.4) tampil di sini | ☐ |
| C5.2 Filter per batch | Admin → Pendaftaran Batch: filter berdasarkan batch tertentu | Daftar tersaring sesuai batch yang dipilih | ☐ |
| C5.3 Lihat detail pendaftar | Admin → Peserta Pendaftaran: buka detail salah satu pendaftar | Data lengkap identitas & dokumen pendaftar tampil | ☐ |

### C6. Pengaturan

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| C6.1 Ubah kontak & rekening | Admin → Pengaturan: ubah salah satu data (mis. nomor WA) | Perubahan langsung berlaku di halaman publik terkait | ☐ |
| C6.2 Ubah harga upgrade | Admin → Pengaturan → Harga upgrade: ubah nominal | Nominal baru langsung dipakai saat peserta mengajukan upgrade selanjutnya | ☐ |
| C6.3 Ubah email notifikasi Admin | Admin → Pengaturan: ganti alamat email notifikasi | Permintaan penawaran berikutnya terkirim ke alamat baru | ☐ |

### C7. Login & Akun Admin

| Skenario | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| C7.1 Login Admin | Buka halaman login Admin, masuk dengan akun Admin | Berhasil masuk ke dashboard Admin (Overview) | ☐ |
| C7.2 Dashboard Overview | Admin → Overview | Ringkasan data (jumlah pendaftar, sertifikat, penawaran, dsb.) tampil | ☐ |
| C7.3 Profil Admin | Admin → Profil | Bisa lihat/ubah data akun Admin sendiri | ☐ |
| C7.4 Halaman Tentang Kami (Admin) | Admin → Tentang Kami | Bisa mengelola konten halaman tentang perusahaan | ☐ |

---

## Bagian D — Hal yang Sengaja TIDAK Ada di Fase 1

Bagian ini **bukan bug** — dicantumkan supaya saat UAT, hal-hal ini tidak dianggap "kurang" atau dilaporkan sebagai temuan. Kalau salah satu dari daftar ini dibutuhkan, itu masuk kategori **penambahan scope Fase 2** yang perlu disepakati tertulis dulu, bukan sesuatu yang "seharusnya sudah ada".

| Fitur | Status |
|---|---|
| Form "minat" singkat (nama + WhatsApp saja) untuk daftar pelatihan | **Sudah dihapus** dari tampilan publik — diganti form pendaftaran lengkap. Jangan diuji sebagai fitur aktif |
| Email notifikasi Admin otomatis saat ada pendaftaran batch baru | **Ditahan untuk Fase 2** — saat ini notifikasi email otomatis hanya jalan untuk permintaan penawaran produk (katalog), belum untuk pendaftaran pelatihan. Pendaftaran tetap tersimpan dan bisa dilihat Admin, hanya belum ada email otomatis |
| Payment gateway otomatis (bayar online langsung) | Fase 2. Saat ini transfer manual + verifikasi Admin |
| LMS berbayar untuk peserta pelatihan (batch reguler/private) | Fase 2. Materi LMS saat ini khusus untuk jalur Sertifikat Gratis; pelatihan berbayar tetap dilayani manual lewat WhatsApp Group + Zoom |
| WhatsApp Gateway / chatbot otomatis / blast pesan | Tidak direncanakan — risiko pemblokiran dari Kominfo/Komdigi |
| Validasi domain email (menolak email perusahaan mencurigakan) | Fase 2 |
| Keranjang belanja / checkout produk online | Tidak direncanakan — katalog untuk menangkap minat, bukan toko online |
| Generator quotation/invoice otomatis | Fase 3 |
| Aplikasi mobile native | Tidak direncanakan — situs sudah responsif untuk HP |
| Batas waktu kuis, nilai kelulusan minimum, riwayat percobaan kuis | Tidak dibangun — kuis bersifat "correctable", peserta boleh mencoba ulang sampai benar |
| Perpanjangan otomatis / pengingat sertifikat akan kedaluwarsa | Tidak dibangun — perpanjangan berarti baris/nomor sertifikat baru, dibuat manual oleh Admin |
| Menghubungkan sistem pendaftaran pelatihan dengan sistem upgrade sertifikat | Dua sistem terpisah secara sengaja |

---

*Skenario di atas mencerminkan sistem per 24 September 2026 (Sprint 1–10 / Modul 1–4 + Modul 7–8 + F11.x). Modul 6, 9, 10, 11 tercakup sepanjang statusnya DONE di `feature-registry.md` pada tanggal ini — kalau ada modul yang masih WIP saat UAT berlangsung, tandai skenario terkait sebagai "belum bisa diuji" di dokumen 04.*
