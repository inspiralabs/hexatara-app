# Prompt untuk Cursor — Catat Ulang Riwayat ADR/PRD/Feature Registry yang Terlewat

```
Baca dulu feature-registry.md, ENGINEERING.md (terutama pola ADR-020 s/d
ADR-024 sebagai contoh format), dan CLAUDE.md sebelum mulai. Ini BUKAN
perubahan kode — ini TUGAS DOKUMENTASI untuk mencatat ulang pekerjaan yang
SUDAH DIKERJAKAN (sebagian sudah diuji Alif, sebagian belum) tapi TERLEWAT
tidak dicatat sebagai ADR di ENGINEERING.md dan baris di feature-registry.md
saat itu — hanya sempat tercatat di plan.md (catatan kerja sementara),
bukan riwayat permanen proyek. Ini murni menulis dokumentasi mengikuti pola
yang SUDAH ADA di ENGINEERING.md (lihat ADR-023/ADR-024 sebagai contoh
struktur Konteks/Keputusan/Konsekuensi), TIDAK ada perubahan kode sama
sekali di tugas ini.

=== BAGIAN 1 — ADR-025 (Sprint 11 / Modul 12): 3 Temuan UAT Internal
InspiraLabs, sebelum UAT bersama Abi ===

KONTEKS PEKERJAAN YANG PERLU DICATAT (baca ulang plan.md dan git log untuk
detail persis, ini ringkasan untuk kamu susun jadi ADR resmi):

1. **Temuan UAT internal #1 (3 bagian, satu putaran kerja):**
   a. Dashboard user — card ajakan upgrade untuk user yang selesai LMS tapi
      belum upgrade, plus card merchandise di halaman sertifikat
      (`tampilkanAjakanMerch` di dashboard/sertifikat/page.tsx)
   b. Tombol WhatsApp di detail pelatihan direstruktur — "Tanya Batch
      Reguler" pindah ke card Dukungan Peserta, "Private In House Training"
      pindah ke CTA akhir, tombol WA di card Syarat&Fasilitas dihapus
   c. Nomor WA default (floating/katalog/pelatihan) yang sebelumnya baca
      env langsung (`NEXT_PUBLIC_WA_ADMIN`), diperbaiki pakai
      `getWhatsappAdmin()` (pola DB-first yang sudah ada di
      site-settings.ts) di 4 titik yang sebelumnya bypass
   File referensi: `prompt-temuan-uat-internal-1.md` (root project)

2. **Bug approval merch_addon:** fungsi database
   `aktivasi_sertifikat_free_track()` (docs/sql/14_aktivasi_sertifikat.sql)
   menjalankan guard+insert certificates untuk SEMUA jenis paket termasuk
   merch_addon, padahal merch_addon adalah pesanan tambahan ke sertifikat
   yang sudah ada (bukan penerbitan baru) — guard "user sudah punya
   free_track" salah trigger untuk kasus ini. Diperbaiki: merch_addon skip
   guard+insert, langsung update status pesanan pakai cert_id yang sudah
   ada. Sisi TypeScript: merch_addon skip regenerate PDF, kirim email
   berbeda. SQL SUDAH dijalankan & diuji Alif, hasil normal.
   File referensi: `usulan-sql-fix-aktivasi-merch-addon.sql`,
   `prompt-fix-approval-merch-addon.md` (root project)

3. **Bug routing /materi/[id]:** id 1 & 2 adalah sisa data uji coba
   pra-LMS lama (masih is_active=true, Admin tidak punya UI untuk
   menonaktifkan), id 3 adalah course resmi (dipilih otomatis lewat
   getMateriHeroHref()). Diperbaiki: URL bernama baru
   `/materi/get-free-certificate-rpc` (redirect statis ke course aktif,
   dipilih ketimbang kolom slug baru di DB karena lebih cepat), dipakai di
   semua link dalam aplikasi; id yang bukan course resmi di-redirect ke
   pintu bernama; SQL nonaktifkan is_active untuk id lama (bukan delete)
   SUDAH dijalankan & diuji Alif, normal. CATATAN: solusi ini disepakati
   SEMENTARA oleh Alif — kemungkinan diubah lagi nanti (nama path lain
   dan/atau pendekatan slug database), JANGAN dianggap final permanen.
   File referensi: `prompt-fix-routing-materi.md` (root project)

YANG DIMINTA:
1. Tambahkan entri BARU di ENGINEERING.md: `### ADR-025 — Modul 12:
   Temuan UAT Internal InspiraLabs (Dashboard/WA, Bug Merch Addon, Bug
   Routing Materi)`, ikuti PERSIS format ADR-023/ADR-024 (tanggal ·
   status Berlaku, lalu **Konteks.**, **Keputusan.**, **Konsekuensi.**).
   Tulis dengan kata-katamu sendiri berdasarkan ringkasan di atas DAN baca
   ulang isi ketiga file prompt yang direferensikan + plan.md untuk detail
   akurat — JANGAN mengarang detail yang tidak ada sumbernya.
2. Tambahkan section baru di feature-registry.md: `## Sprint 11 — Modul
   12: Temuan UAT Internal InspiraLabs` (letakkan setelah Sprint 10 yang
   sudah ada, sebelum Sprint 5/Hardening), dengan baris tabel F12.1/F12.2/
   F12.3 untuk ketiga item di atas — Status **DONE** untuk yang SUDAH
   dikonfirmasi Alif teruji di browser (cek plan.md untuk konfirmasi
   eksplisit, JANGAN tandai DONE kalau tidak ada bukti konfirmasi Alif di
   sana — kalau ragu satu item sudah dikonfirmasi atau belum, tandai TODO
   dan catat di plan.md bahwa ini perlu konfirmasi ulang ke Alif, JANGAN
   menebak).
3. Tambahkan satu baris baru di tabel "RIWAYAT PERUBAHAN STRUKTUR" (bagian
   11 ENGINEERING.md) dengan tanggal hari ini, ringkasan singkat "ADR-025
   ditambahkan (dokumentasi susulan untuk pekerjaan yang sudah selesai)".

=== BAGIAN 2 — Kerangka ADR-026 (Sprint 12 / Modul 13): 5 Permintaan Abi
langsung saat UAT bersama klien ===

KONTEKS: Abi (klien) menyampaikan 5 permintaan langsung saat sesi UAT
bersama InspiraLabs (30 September 2026) — beda konteks dari Bagian 1 di
atas (itu temuan UAT internal InspiraLabs sendiri, ini permintaan
langsung dari klien). Kelima permintaan:
1. Navbar — perbesar teks "Hexatara"
2. Kartu Sertifikat — ajakan upgrade untuk user yang belum pernah
   mengajukan order sama sekali
3. Session timeout Admin — idle 30 menit otomatis logout (keamanan)
4. Merchandise jadi produk sungguhan di tabel `products` (bisa dibundling
   ke sertifikat) — BELUM DIKERJAKAN, masih tahap rencana
5. Jalur pendaftaran perusahaan/komunitas (upload Excel, harga negosiasi
   manual) — BELUM DIKERJAKAN, masih tahap rencana

STATUS SAAT INI (cek plan.md untuk detail + konfirmasi Alif):
- Poin 1 & 2: SUDAH dikerjakan lewat satu prompt gabungan (file referensi:
  `prompt-navbar-dan-kartu-sertifikat.md`) — cek plan.md apakah sudah ada
  laporan hasil & konfirmasi Alif
- Poin 3: SUDAH/SEDANG dikerjakan (file referensi:
  `prompt-session-timeout-admin.md`) — cek plan.md apakah sudah ada
  laporan hasil & konfirmasi Alif
- Poin 4 & 5: BELUM ada prompt sama sekali, akan menyusul terpisah nanti

YANG DIMINTA (HANYA untuk poin yang statusnya SUDAH ada laporan di
plan.md — kalau poin 3 belum dikerjakan sama sekali saat kamu membaca
ini, SKIP dulu bagian itu, jangan menulis ADR untuk pekerjaan yang belum
ada):
1. Tambahkan entri BARU di ENGINEERING.md: `### ADR-026 — Modul 13:
   Permintaan Abi Langsung saat UAT (Navbar, Kartu Ajakan, Session
   Timeout Admin, Merchandise jadi Produk, Pendaftaran Perusahaan)`,
   format sama seperti ADR-025 di atas. KARENA poin 4 dan 5 belum
   dikerjakan, tulis ADR ini dengan status **"Berlaku — sebagian, poin 4
   dan 5 menyusul"** (bukan "Berlaku" penuh), dan di bagian Konteks
   jelaskan seluruh 5 poin (termasuk yang belum dikerjakan, supaya riwayat
   lengkap kenapa Sprint 12 ini dibuka), tapi bagian Keputusan HANYA isi
   untuk poin yang sudah ada hasil kerjanya.
2. Tambahkan section baru di feature-registry.md: `## Sprint 12 — Modul
   13: Permintaan Abi Langsung saat UAT`, baris F13.1 (navbar) dan F13.2
   (kartu ajakan) status sesuai konfirmasi Alif di plan.md (DONE kalau
   sudah eksplisit dikonfirmasi, TODO kalau belum), F13.3 (session
   timeout) sama, F13.4 (merchandise jadi produk) dan F13.5 (pendaftaran
   perusahaan) status **TODO** dengan catatan "menyusul, prompt terpisah
   belum dikirim".
3. Entri baru di tabel "RIWAYAT PERUBAHAN STRUKTUR" ENGINEERING.md,
   tanggal hari ini, "ADR-026 dibuka (Sprint 12/Modul 13, permintaan Abi
   30 Sept 2026), sebagian poin masih berjalan".

PENTING — JANGAN tandai F13.4/F13.5 DONE atau isi detail Keputusan untuk
keduanya sama sekali, karena belum ada satu baris kode pun yang ditulis
untuk itu — ADR-026 akan DIPERLUAS lagi nanti (mengikuti pola ADR-024 yang
"Diperluas 2026-09-20" dst) begitu poin 4 dan 5 selesai dikerjakan lewat
prompt terpisah.

=== SETELAH SELESAI KEDUA BAGIAN ===
- Ini tugas dokumentasi murni, TIDAK perlu pnpm tsc/lint (tidak ada kode
  yang diubah).
- Tulis ringkasan di plan.md: bagian baru "Dokumentasi Susulan — ADR-025 &
  ADR-026" berisi konfirmasi ADR mana yang ditambahkan, baris
  feature-registry.md mana yang ditambahkan, dan status DONE/TODO yang
  dipilih untuk tiap item beserta alasannya (terutama kalau ada yang
  ditandai TODO karena belum yakin sudah dikonfirmasi Alif — supaya Alif
  tahu persis mana yang perlu dia konfirmasi ulang).
- SARANKAN SATU PESAN COMMIT git (cek `git log --oneline -10` untuk gaya
  konsisten) — karena ini perubahan dokumentasi murni, gunakan prefix yang
  sesuai (misal `docs:` kalau proyek ini pernah pakai conventional commit
  prefix, cek dulu riwayat commit).
```

---

## Ringkasan untuk Alif

Kakak benar — ini murni kelalaian saya. Proyek ini sejak awal (ADR-020 sampai ADR-024) selalu mencatat pekerjaan berarti sebagai entri ADR permanen di `ENGINEERING.md` plus baris `feature-registry.md`, bukan cuma `plan.md`. Saya sudah cek langsung: ADR terakhir yang tercatat masih ADR-024 (19-22 September), padahal sudah ada 5 putaran kerja setelahnya yang cuma masuk `plan.md`.

Sesuai yang Kakak putuskan, saya pisah jadi dua ADR:
- **ADR-025 (Sprint 11/Modul 12)** — 3 temuan UAT internal InspiraLabs (dashboard/WA, bug merch_addon, bug routing materi) yang sudah selesai
- **ADR-026 (Sprint 12/Modul 13)** — 5 permintaan Abi langsung, ditulis SEBAGIAN dulu (cuma untuk navbar/kartu/session timeout yang sudah/sedang dikerjakan), nanti diperluas lagi begitu merchandise-jadi-produk dan pendaftaran-perusahaan selesai — mengikuti pola "Diperluas" yang sudah ada di ADR-024 sebelumnya.

Saya juga secara eksplisit minta Cursor **jangan menebak** status DONE — kalau ragu apakah suatu item sudah benar-benar dikonfirmasi Kakak teruji di browser, harus ditandai TODO dan dicatat perlu konfirmasi ulang, bukan asal ditandai DONE supaya rapi.

**Ke depan:** saya akan pastikan setiap prompt Cursor berikutnya (termasuk poin merchandise-jadi-produk dan pendaftaran-perusahaan yang belum dikirim) langsung menyertakan instruksi update ADR-026 + feature-registry.md sejak awal, tidak menunggu prompt susulan seperti ini lagi.

**Urutan kerja:**
1. Tempel prompt di atas ke Cursor (ini TIDAK ada perubahan kode, aman dijalankan kapan saja).
2. Cek `ENGINEERING.md` dan `feature-registry.md` — pastikan ADR-025 dan ADR-026 muncul dengan status yang masuk akal.
3. Kalau ada item yang Cursor tandai TODO karena ragu soal konfirmasi Kakak, itu sinyal untuk Kakak konfirmasi ulang ke saya supaya bisa diperbaiki.
