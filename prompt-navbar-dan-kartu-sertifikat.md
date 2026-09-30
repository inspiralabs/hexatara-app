# Prompt untuk Cursor — Navbar Lebih Besar + Kartu Ajakan Upgrade Sertifikat

```
Baca dulu feature-registry.md (Definition of Done), ENGINEERING.md
(terutama pola ADR-023/ADR-024 sebagai contoh format ADR), dan CLAUDE.md
sebelum mulai. Ini DUA PERMINTAAN BARU dari Abi (klien Hexatara),
disampaikan langsung saat UAT 30 September 2026 — TERPISAH dari
temuan-temuan UAT internal InspiraLabs sebelumnya (dashboard/WA
pelatihan, bug merch_addon, routing materi — itu semua sudah tercatat
sebagai ADR-025/Sprint 11/Modul 12, SUDAH DONE, jangan disentuh lagi).
Buat DUA bagian terpisah di plan.md untuk masing-masing (jangan digabung
jadi satu laporan, biar mudah dilacak).

KONTEKS PENOMORAN ADR/SPRINT: kerja ini adalah AWAL dari Sprint 12/Modul
13 (ADR-026) — kumpulan 5 permintaan Abi langsung saat UAT klien (beda
konteks dari ADR-025 yang UAT internal InspiraLabs). Baru DUA dari lima
permintaan itu yang dikerjakan di prompt ini (navbar + kartu sertifikat).
Tiga permintaan lain (session timeout Admin, merchandise jadi produk,
pendaftaran perusahaan/komunitas) akan MENYUSUL lewat prompt terpisah dan
akan MEMPERLUAS ADR-026 ini nanti (pola sama seperti ADR-024 yang beberapa
kali ditulis "Diperluas [tanggal]" untuk temuan susulan) — jadi ADR-026
yang kamu buat sekarang harus ditulis supaya MUDAH DIPERLUAS, bukan
ditutup seolah selesai total.

=== BAGIAN A — Perbesar teks "Hexatara" di navbar publik ===

KONTEKS: Abi minta tulisan "Hexatara" di navbar diperbesar. Root cause
sudah ditemukan lewat baca kode langsung (jangan investigasi ulang dari
nol): src/app/[locale]/(public)/layout.tsx baris ~61-63, teks "Hexatara"
di sebelah logo pakai kelas `font-heading text-lg font-semibold`.

YANG DIMINTA:
1. Naikkan ukuran teks itu (coba `text-xl`, atau `text-2xl` kalau `text-xl`
   masih terlihat kurang besar dibanding logo di sebelahnya ukuran 32px) —
   sesuaikan supaya proporsional dengan logo, JANGAN sampai teks jadi lebih
   besar dari logo secara tidak wajar. Cek juga tampilan di breakpoint
   mobile (md:flex nav di baris yang sama menunjukkan ada perbedaan
   layout mobile/desktop) — pastikan navbar tidak pecah/terlalu padat di
   layar kecil setelah ukuran teks dinaikkan.
2. ADA VERSI KEDUA teks "Hexatara" di FOOTER pada file yang sama (baris
   ~98-100, kelas `text-base font-bold`) — INI JANGAN DIUBAH kecuali
   nanti diminta terpisah. Permintaan Abi soal navbar (bagian atas
   halaman), bukan footer. Kalau ternyata ambigu, laporkan di plan.md
   bagian ini bahwa footer sengaja tidak diubah, supaya jelas kalau nanti
   perlu revisi.

SETELAH SELESAI BAGIAN A:
- Cara uji Alif: buka landing page (dan 1-2 halaman publik lain yang
  pakai layout yang sama), lihat navbar — teks "Hexatara" lebih besar,
  tetap rapi sejajar dengan logo, dicoba juga di lebar layar HP (< 768px).

=== BAGIAN B — Kartu Sertifikat: ajakan upgrade untuk user yang BELUM
PERNAH mengajukan order sama sekali ===

KONTEKS (root cause sudah dikonfirmasi baca kode, jangan investigasi ulang
dari nol): src/app/[locale]/(user)/dashboard/sertifikat/page.tsx SUDAH
punya kartu ajakan "Tambah merchandise" (variabel `tampilkanAjakanMerch`,
dari perbaikan Temuan UAT sebelumnya), TAPI kartu itu HANYA muncul kalau
user sudah punya certificate_orders dengan paket='cert_only' DAN
status='disetujui'. Abi mengeluh dari kondisi SEBELUM itu: user baru saja
selesai LMS (kuis), sertifikatnya masih PREVIEW/TERKUNCI (qr_aktif=false),
dan belum PERNAH mengajukan order apa pun ke certificate_orders sama
sekali. Di kondisi ini halaman /dashboard/sertifikat HANYA menampilkan
kartu preview terkunci (komponen SertifikatCard status="preview") TANPA
ada penjelasan atau tombol yang mengarahkan ke Transaksi — user bingung
harus ke mana untuk dapat sertifikat asli+QR.

CATATAN PENTING: /dashboard/transaksi (file terpisah, page.tsx di folder
itu) SUDAH punya penanganan lengkap untuk status menunggu_verifikasi,
menunggu_bukti, dan ditolak (lewat komponen PesananStatusSection) —
JANGAN duplikasi logika itu di halaman sertifikat. Fokus PERBAIKAN INI
HANYA untuk kondisi: user BELUM PERNAH membuat certificate_orders sama
sekali (query .maybeSingle() balik null untuk SEMUA paket, bukan cuma
cert_only) DAN sertifikatnya masih preview (qr_aktif=false semua / belum
ada baris certificates).

YANG DIMINTA:
1. Di src/app/[locale]/(user)/dashboard/sertifikat/page.tsx, tambahkan
   query untuk cek apakah user PERNAH mengajukan certificate_orders SAMA
   SEKALI (paket apapun, status apapun) — bisa query terpisah atau
   turunkan dari data yang sudah di-fetch di halaman ini (certOnlyDisetujui,
   pesananMerch) ditambah satu query lagi untuk paket cert_only/cert_merch
   yang BELUM disetujui (mirip pola pesananUtama di
   dashboard/transaksi/page.tsx — cek dulu pola query itu supaya konsisten,
   JANGAN reinvent).
2. Tambahkan kartu/card BARU (pola styling SAMA seperti card
   "tampilkanAjakanMerch" yang sudah ada di file yang sama — border
   warna-aksen, icon, judul, deskripsi, tombol) yang tampil KHUSUS untuk
   kondisi: preview aktif (tampilkanPreview true, dari kode yang sudah ada)
   DAN user belum pernah mengajukan order APAPUN ke certificate_orders.
   Isi card: judul singkat semacam "Dapatkan Sertifikat & QR Resmi",
   deskripsi singkat menjelaskan bahwa sertifikat masih pratinjau dan
   perlu upgrade untuk dapat QR aktif, tombol mengarah ke
   `/dashboard/transaksi` (BUKAN /dashboard/merchandise, itu untuk kartu
   yang sudah ada).
3. Kalau user SUDAH pernah mengajukan order (status apapun selain
   disetujui) JANGAN tampilkan card baru ini — supaya tidak dobel pesan
   dengan yang sudah ditangani di /dashboard/transaksi. Card existing
   "tampilkanAjakanMerch" (cert_only disetujui, merch belum) TETAP SEPERTI
   SEKARANG, tidak diubah logikanya.
4. Pastikan teks/label konsisten dengan gaya Bahasa Indonesia informal
   yang sudah dipakai di file itu (lihat teks card existing sebagai
   acuan gaya penulisan).

JANGAN ubah /dashboard/transaksi/page.tsx atau PesananStatusSection sama
sekali — di luar scope perbaikan ini, sudah menangani kasusnya sendiri
dengan baik.

SETELAH SELESAI BAGIAN B:
- Cara uji Alif: pakai akun user BARU yang baru selesai kuis LMS (belum
  pernah buka /dashboard/transaksi atau ajukan order apa pun) → buka
  /dashboard/sertifikat → harus muncul card ajakan baru dengan tombol ke
  Transaksi, BUKAN cuma kartu preview terkunci polos seperti sebelumnya.
  Lalu regresi: akun yang SUDAH pernah ajukan order (status apapun) →
  pastikan card baru ini TIDAK muncul dobel dengan yang sudah ada di
  Transaksi.

=== SETELAH KEDUA BAGIAN SELESAI ===
- Jalankan pnpm tsc --noEmit dan pnpm lint.
- WAJIB tulis ke plan.md — TAMBAHKAN bagian baru "Permintaan Abi (30
  September 2026) — Navbar & Kartu Ajakan Upgrade" dengan DUA SUB-BAGIAN
  terpisah (Bagian A: Navbar, Bagian B: Kartu Sertifikat) — JANGAN timpa
  bagian-bagian lain yang sudah ada di plan.md. Masing-masing sub-bagian
  isinya: ringkasan, file yang diubah, hasil tsc/lint, cara uji (salin
  dari instruksi di atas).

- TAMBAHKAN ENTRI BARU di ENGINEERING.md: `### ADR-026 — Modul 13:
  Permintaan Abi Langsung saat UAT Klien (Navbar, Kartu Ajakan Upgrade,
  Session Timeout Admin, Merchandise jadi Produk, Pendaftaran
  Perusahaan)`, format PERSIS seperti ADR-023/ADR-024 (tanggal · status,
  **Konteks.**, **Keputusan.**, **Konsekuensi.**). Status ADR ini tulis
  **"Berlaku — sebagian, 3 poin lain menyusul"** (BUKAN "Berlaku" penuh,
  karena baru 2 dari 5 permintaan yang dikerjakan). Bagian **Konteks**
  jelaskan SEMUA 5 permintaan Abi (supaya riwayat lengkap kenapa Sprint 12
  ini dibuka — navbar, kartu ajakan upgrade, session timeout Admin,
  merchandise jadi produk, pendaftaran perusahaan/komunitas), tapi bagian
  **Keputusan** HANYA isi untuk 2 yang sudah dikerjakan di prompt ini
  (navbar + kartu ajakan). Bagian **Konsekuensi** boleh catat bahwa 3 poin
  lain akan menyusul dan berpotensi mengubah skema database (khusus
  merchandise & pendaftaran perusahaan).
- TAMBAHKAN section baru di feature-registry.md: `## Sprint 12 — Modul 13:
  Permintaan Abi Langsung saat UAT Klien` (letakkan setelah section Sprint
  11/Modul 12 yang sudah ada dari ADR-025). Baris tabel:
  - F13.1 — Perbesar teks navbar "Hexatara"
  - F13.2 — Kartu ajakan upgrade untuk user yang belum pernah mengajukan
    order sama sekali
  - F13.3 — Session timeout Admin (idle 30 menit) — status **TODO**,
    catatan "menyusul, prompt terpisah belum dikirim"
  - F13.4 — Merchandise jadi produk sungguhan di tabel products — status
    **TODO**, catatan "menyusul, prompt terpisah belum dikirim"
  - F13.5 — Pendaftaran perusahaan/komunitas (upload Excel) — status
    **TODO**, catatan "menyusul, prompt terpisah belum dikirim"
  F13.1 dan F13.2 status TETAP TODO di baris tabel ini juga (JANGAN
  DONE) — status DONE baru ditulis SETELAH Alif konfirmasi eksplisit
  sudah uji sendiri di browser, sesuai Definition of Done. Kolom "Berkas"
  isi nama file prompt ini.
- Entri baru di tabel "RIWAYAT PERUBAHAN STRUKTUR" (bagian 11
  ENGINEERING.md), tanggal hari ini: "ADR-026 dibuka (Sprint 12/Modul 13,
  permintaan Abi 30 Sept 2026) — F13.1/F13.2 dikerjakan, F13.3-F13.5
  menyusul".

- SARANKAN SATU PESAN COMMIT git yang ringkas (cek dulu `git log --oneline
  -10` untuk gaya yang konsisten), taruh di akhir laporan plan.md dan
  tampilkan juga di ringkasan akhir ke Alif.
- JANGAN tandai apa pun DONE di feature-registry.md — tunggu Alif
  konfirmasi eksplisit sudah uji sendiri di browser (untuk KEDUA bagian,
  boleh dikonfirmasi terpisah kalau salah satu selesai duluan). Tambahkan
  pengingat yang sama di plan.md.
```

---

## Ringkasan untuk Alif

Dua perbaikan kecil, tanpa SQL, siap ditempel ke Cursor sekaligus:

**Navbar** — teks "Hexatara" tinggal dinaikkan ukurannya di satu titik kode. Saya sudah tandai juga ada teks yang sama di footer supaya Cursor TIDAK ikut mengubahnya (beda konteks, kecuali nanti memang diminta terpisah).

**Kartu sertifikat** — saya konfirmasi ulang: kartu ajakan yang sudah ada dari perbaikan sebelumnya ("Tambah merchandise") memang HANYA muncul kalau user sudah pernah upgrade sekali. Keluhan Abi persis di kondisi sebelum itu — user baru selesai LMS, belum pernah ke halaman Transaksi sama sekali. Sudah saya minta Cursor tambah kartu baru khusus kondisi itu, tanpa mengubah apa pun di `/dashboard/transaksi` yang sudah menangani status menunggu/ditolak dengan baik — supaya tidak dobel pesan.

**Urutan kerja:**
1. Tempel prompt di atas ke Cursor.
2. Uji navbar dulu (paling cepat dicek).
3. Uji kartu sertifikat pakai akun baru yang belum pernah ke Transaksi sama sekali.
4. Konfirmasi ke saya kalau sudah oke, supaya feature-registry.md bisa diupdate.

Selanjutnya saya siapkan prompt untuk permintaan session timeout Admin (30 menit idle, sesuai yang Kakak putuskan).
