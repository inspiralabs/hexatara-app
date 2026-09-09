# Panduan Setup SMTP Custom (Resend) untuk Hexatara

## Kenapa ini perlu

SMTP bawaan Supabase (built-in, tanpa konfigurasi) dibatasi sangat ketat — sekitar 2-4 email per jam, khusus untuk keperluan testing awal. Begitu testing dilakukan berulang (seperti alur daftar→verifikasi yang diuji berkali-kali), batas ini cepat tercapai dan muncul error `over_email_send_rate_limit` (429) — persis yang baru dialami.

Ini bukan bug kode. Solusinya adalah mengganti SMTP bawaan dengan penyedia SMTP sendiri (Resend direkomendasikan: gratis untuk volume kecil, setup sederhana, deliverability bagus). Setelah ini aktif, batas kirim jadi jauh lebih longgar (ribuan email/bulan di paket gratis Resend) dan Anda bisa testing tanpa terganjal limit lagi.

## Yang dibutuhkan dari Abi (klien)

Domain `hexatara.com` dikelola lewat akun Hostinger milik Hexatara (sesuai BRD-HXT-002 §8 — kepemilikan domain ada di pihak Hexatara, DNS diarahkan ke InspiraLabs tanpa perlu berbagi login akun). Untuk setup ini Anda perlu salah satu dari:

- Akses langsung ke panel DNS Hostinger (Abi login lalu Anda dipandu menambah record), **atau**
- Abi menambahkan sendiri 3 DNS record yang akan diberikan Resend (Anda kirim detailnya ke dia, dia yang input di Hostinger)

Opsi kedua lebih aman dan lebih sesuai dengan kesepakatan BRD (DNS diarahkan tanpa berbagi akses login akun) — disarankan pakai cara ini.

## Langkah-langkah

### 1. Buat akun Resend

Daftar di resend.com pakai email kerja InspiraLabs (bukan email pribadi), verifikasi email pendaftaran.

### 2. Tambahkan domain di Resend

Di dashboard Resend → **Domains** → **Add Domain** → masukkan `hexatara.com`.

Resend akan menampilkan 3 DNS record yang perlu ditambahkan (biasanya):
- 1 record **TXT** untuk SPF
- 1-3 record **CNAME/TXT** untuk DKIM
- (opsional tapi disarankan) 1 record **TXT** untuk DMARC

Catat persis semua record ini (Name/Host, Type, Value) — akan dikirim ke Abi.

### 3. Kirim record DNS ke Abi untuk ditambahkan di Hostinger

Kirim pesan berisi tabel record persis dari Resend. Di Hostinger, Abi perlu masuk ke **hPanel → Domains → DNS Zone Editor** untuk domain hexatara.com, lalu tambahkan tiap record sesuai yang tertera (jangan mengubah Type atau Value-nya).

Sampaikan ke Abi: proses ini tidak mengganggu website hexatara.com yang sedang berjalan — hanya menambah record baru untuk keperluan pengiriman email, tidak mengubah pengaturan yang sudah ada.

### 4. Verifikasi domain di Resend

Setelah Abi menambahkan record (propagasi DNS biasanya 5 menit - 24 jam, umumnya cepat), kembali ke dashboard Resend → klik **Verify DNS Records**. Status akan berubah jadi "Verified" kalau sudah benar.

### 5. Buat API Key di Resend

Dashboard Resend → **API Keys** → **Create API Key** → beri nama (misal `hexatara-supabase-smtp`) → simpan key yang muncul (hanya tampil sekali).

### 6. Pasang SMTP custom di Supabase

Di Supabase Dashboard proyek Hexatara:

**Project Settings → Authentication → SMTP Settings** (atau **Emails → SMTP Settings**, tergantung versi dashboard):

- Aktifkan **Enable Custom SMTP**
- **Sender email**: alamat pengirim di domain hexatara.com yang sudah diverifikasi, misal `noreply@hexatara.com` atau `no-reply@hexatara.com`
- **Sender name**: `Hexatara` (atau `Hexatara Indonesia`)
- **Host**: `smtp.resend.com`
- **Port**: `465` (SSL) atau `587` (TLS) — ikuti dokumentasi resmi Resend untuk SMTP saat setup, karena port bisa berubah
- **Username**: `resend`
- **Password**: API Key dari langkah 5

Simpan.

### 7. Uji ulang

Setelah SMTP custom aktif, coba lagi alur daftar dari kuis (`/daftar?kuisSelesai=1`) dengan email baru. Kalau berhasil, email verifikasi akan datang dari domain hexatara.com, bukan dari alamat default Supabase — dan rate limit jauh lebih longgar untuk testing berulang.

## Catatan tambahan

- Sender email (`noreply@hexatara.com`) tidak perlu mailbox sungguhan — cukup domain-nya terverifikasi di Resend, email bisa dikirim atas nama alamat itu tanpa perlu ada inbox aktif untuk menerima balasan.
- Simpan API Key Resend di tempat aman (password manager tim) — kalau bocor, siapa pun bisa kirim email atas nama domain hexatara.com lewat akun Resend Anda.
- Ini murni perubahan konfigurasi di luar kode aplikasi — tidak perlu sentuh kode proyek Hexatara sama sekali, jadi tidak perlu melibatkan Claude Code untuk langkah-langkah di atas.
