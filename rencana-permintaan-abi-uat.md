# Rencana Implementasi — 4 Permintaan Abi (Pasca UAT Langsung, 30 Sep 2026)

Disusun berdasarkan investigasi langsung ke kode (bukan asumsi), diurutkan dari
paling mudah ke paling sulit sesuai kesepakatan. Prompt Cursor dikirim satu per
satu, bukan digabung, karena poin #1 dan #2 mengubah skema database dan alur
bisnis — risikonya beda jauh dari poin #3/#4.

---

## #4 — Perbesar teks "Hexatara" di navbar (TRIVIAL, tanpa SQL)

**Temuan:** teks "Hexatara" di navbar publik ada di
`src/app/[locale]/(public)/layout.tsx` baris ~61-63, kelasnya
`font-heading text-lg font-semibold`. Tinggal naikkan ukuran (`text-xl` atau
`text-2xl`, sesuaikan biar seimbang dengan logo di sebelahnya). Ada juga versi
kedua di footer (baris ~98-100, `text-base font-bold`) — ini KEMUNGKINAN tidak
dimaksud Abi (footer beda konteks dari navbar), akan saya minta Cursor
konfirmasi dulu bagian mana saja yang dimaksud sebelum ubah footer juga.

**SQL diperlukan:** TIDAK.
**Cara uji:** buka landing page, lihat navbar — teks "Hexatara" di sebelah
logo terlihat lebih besar, tetap rapi di mobile (cek breakpoint kecil juga).

---

## #3 — Kartu sertifikat: ajakan upgrade untuk yang BELUM PERNAH upgrade sama sekali (KECIL-MENENGAH, tanpa SQL)

**Temuan:** kartu ajakan "Tambah merchandise" SUDAH ADA di
`/dashboard/sertifikat/page.tsx` (dari perbaikan Temuan UAT #1 sebelumnya),
tapi kondisi tampilnya (`tampilkanAjakanMerch`) HANYA aktif kalau user sudah
punya `cert_only` yang **disetujui**. Abi mengeluh dari kondisi SEBELUM itu —
baru selesai LMS, **belum pernah mengajukan upgrade sama sekali** — di kondisi
ini tidak ada kartu ajakan apa pun, cuma kartu sertifikat preview terkunci
tanpa penjelasan/tombol ke Transaksi. Ini benar temuan yang sah, bukan
duplikat dari yang sudah dikerjakan.

**Rencana:** perluas logika di halaman yang sama supaya ada card ajakan untuk
SEMUA kombinasi status yang relevan, bukan cuma satu kondisi:
1. Belum pernah mengajukan order apa pun (selesai LMS, sertifikat masih
   preview/terkunci) → card "Dapatkan Sertifikat & QR" mengarah ke Transaksi
2. Order diajukan tapi masih `menunggu_verifikasi`/`menunggu_bukti` → card
   info status (jangan duplikasi ajakan submit baru)
3. `cert_only` disetujui, merch belum → card existing "Tambah merchandise"
   (SUDAH ADA, tidak diubah)
4. Ditolak (`ditolak`) → card ajakan ajukan ulang dengan alasan penolakan
Poin 2 dan 4 kemungkinan sudah ditangani di halaman lain (`/dashboard/transaksi`)
— saya minta Cursor cek dulu supaya tidak duplikat pesan, fokus utama ke poin 1
yang jadi keluhan konkret Abi.

**SQL diperlukan:** TIDAK — murni logika tampilan dari data yang sudah ada.
**Cara uji:** pakai akun user baru yang baru selesai kuis (belum pernah ke
Transaksi sama sekali) → buka `/dashboard/sertifikat` → harus ada card
jelas dengan tombol ke Transaksi, bukan cuma kartu preview terkunci polos.

---

## #2 — Merchandise jadi produk sungguhan (BESAR, perlu SQL usulan)

**Keputusan Kakak:** merchandise (kaos, topi, dst — bukan cuma satu paket
flat) jadi baris di tabel `products` yang sudah ada (sama seperti drone/alat),
supaya Admin bisa kelola banyak jenis merchandise dan tetap bisa dibundling ke
sertifikat.

**Kondisi saat ini (dikonfirmasi baca kode):**
- Merchandise BUKAN produk — cuma satu harga flat dari `getHargaUpgrade()`
  (site_settings key `harga_upgrade`), ditempel sebagai paket `cert_merch`
  (upgrade+merch sekaligus) atau `merch_addon` (susulan) di `certificate_orders`
- Tabel `products` sudah ada, dipakai katalog drone/alat, kolom: id, nama_id/en,
  harga, kategori (teks lama), category_id (relasi), thumbnail_url, is_active,
  slug, tampilkan_harga, dst — SUDAH cocok dipakai untuk merchandise juga,
  TIDAK perlu tabel baru

**Rencana skema (usulan SQL, belum ditulis lengkap — akan saya siapkan detail
setelah poin #4 dan #3 dikonfirmasi beres, supaya tidak menumpuk terlalu
banyak perubahan sekaligus):**
1. Tambah kategori/flag di `products` untuk menandai baris sebagai
   merchandise sertifikat (opsi: kolom baru `tipe_produk` enum
   `'katalog' | 'merchandise_sertifikat'`, ATAU pakai `category_id` yang
   sudah ada dengan kategori khusus "Merchandise Sertifikat" — perlu
   didiskusikan mana yang lebih konsisten dengan pola filter Admin yang ada)
2. Tambah kolom di `certificate_orders`: `product_id` (nullable, foreign key
   ke `products`, diisi kalau paket `cert_merch`/`merch_addon` memilih
   merchandise tertentu)
3. Harga merchandise diambil dari `products.harga` (bukan lagi
   `getHargaUpgrade()` flat) — field `harga_upgrade` di site_settings tetap
   dipertahankan untuk harga UPGRADE SERTIFIKAT saja (bukan merchandise)
4. Halaman `/dashboard/merchandise` dan `/dashboard/upgrade` perlu tambah
   pemilihan produk (dropdown/card pilih merchandise), bukan lagi info flat
5. **Keputusan Kakak (30 Sep):** Admin dapat DUA MENU terpisah di sidebar —
   "Produk" (Daftar Produk + Kategori Produk, drone/alat, seperti sekarang)
   dan "Merchandise" (menu BARU: Daftar Merchandise + Kategori Merchandise).
   Keduanya baca/tulis ke tabel `products` yang SAMA (dibedakan kolom
   `tipe_produk`), TIDAK ada tabel/skema ganda — form CRUD juga dipakai
   ulang (komponen sama, filter query beda). URL admin baru:
   `/admin/merchandise` dan `/admin/merchandise/kategori`.
6. **Klarifikasi Kakak (30 Sep) — katalog PUBLIK TETAP SATU, tidak dipecah:**
   walau di Admin menunya terpisah (poin 5), halaman `/katalog` publik TETAP
   menampilkan semua produk bersama (drone, aksesoris, merchandise, dst) —
   pemisahan menu di atas HANYA untuk kemudahan kerja Admin, bukan
   memecah pengalaman publik. Sudah dikonfirmasi lewat baca kode: katalog
   publik SUDAH PUNYA filter kategori dinamis (`FilterBar`, baca dari tabel
   kategori produk via `category_id`) — begitu Admin bikin kategori baru
   "Merchandise" (dari menu Admin Merchandise ATAU Produk, sama saja karena
   satu tabel kategori), otomatis muncul sebagai pilihan filter di katalog
   publik TANPA perlu kode tambahan. Jadi user publik bisa filter "Drone",
   "Aksesoris Drone", "Merchandise", dst dari satu halaman yang sama.

**Ini menyentuh dashboard USER juga** (bukan cuma Admin) — form pemilihan
merchandise saat upgrade/tambah-merch di sisi user perlu diubah dari info
statis jadi pemilihan produk.

**SQL diperlukan:** YA — akan saya siapkan sebagai file usulan terpisah
(migrasi kolom + data awal), Kakak jalankan manual seperti biasa.
**Cara uji (garis besar):** Admin tambah 2-3 produk merchandise contoh (kaos,
topi) → user ajukan upgrade cert_merch, pilih salah satu → Admin setujui →
cek certificate_orders.product_id terisi benar, harga sesuai produk yang
dipilih (bukan harga flat lama).

---

## #1 — Jalur pendaftaran perusahaan/komunitas (PALING BESAR, perlu SQL usulan + fitur baru penuh)

**Keputusan Kakak:** upload Excel/CSV untuk daftar peserta (bukan form isi
nama satu-satu), karena biasanya puluhan orang per perusahaan.

**Kondisi saat ini:** pendaftaran batch pelatihan (`batch_registrations`)
HANYA untuk individu — satu baris = satu peserta, diisi sendiri oleh
pendaftar lewat form publik di halaman detail pelatihan. Tidak ada konsep
"grup"/"perusahaan" sama sekali di skema.

**Rencana skema (usulan SQL, garis besar dulu — detail kolom disiapkan
belakangan setelah poin #2 dan #3 selesai duluan):**
1. Tabel baru `company_registrations` (atau nama serupa): PIC perusahaan
   (nama, email, WA, nama perusahaan/komunitas/instansi), batch_id yang
   dituju, jumlah peserta, harga khusus (nominal per-kasus, BUKAN dari
   `getHargaUpgrade`/harga batch normal karena harga grup dinegosiasikan),
   status (menunggu_verifikasi/disetujui/ditolak — pola sama seperti order
   lain), file Excel yang diunggah (URL storage), catatan Admin
2. Tabel baru `company_registration_participants` (satu baris = satu nama
   peserta yang diparse dari Excel) — relasi ke `company_registrations`,
   supaya Admin bisa lihat/edit daftar nama per pendaftaran grup
3. Form publik baru: field PIC + WA + jumlah peserta + upload Excel (pola
   sama seperti `imporSoalAction` yang SUDAH ADA — pakai library `xlsx` yang
   sudah terpasang di project, laporan baris berhasil/gagal setelah parse)
4. Setelah submit: (a) trigger email notifikasi ke Admin (pola sama seperti
   notifikasi quote request/`penawaran` yang sudah ada), (b) tampilkan tombol
   "Konfirmasi via WhatsApp" ke `getWhatsappAdmin()` dengan pesan pre-filled
   berisi ringkasan (nama perusahaan, jumlah peserta, batch yang dituju) —
   POLA WA klik-to-chat, BUKAN kirim API otomatis (konsisten dengan seluruh
   sistem WA di project ini yang semuanya klik-to-chat, tidak ada WA Business
   API terhubung)
5. **Keputusan Kakak (30 Sep): harga grup SELALU negosiasi manual per kasus**
   (tergantung pelatihan + jumlah orang), TIDAK ada rumus otomatis. Jadi kolom
   nominal di `company_registrations` diisi Admin SETELAH follow-up WA, tidak
   ada input harga sama sekali di form publik user — form publik hanya kirim
   data pendaftaran (PIC, jumlah, daftar nama), harga ditentukan Admin secara
   manual sebagai langkah terpisah setelah negosiasi selesai
6. Admin: menu baru "Pendaftaran Perusahaan/Komunitas" (terpisah dari
   Pendaftaran Batch individu yang sudah ada), bisa lihat daftar peserta per
   pendaftaran, ubah status, isi/ubah nominal harga, tandai lunas
7. **Keputusan Kakak (30 Sep) — format Excel & UX form:** disediakan TEMPLATE
   Excel resmi yang bisa diunduh user (kolom baku: nama lengkap, dst — sesuai
   field yang dibutuhkan peserta batch), supaya parsing tidak menebak-nebak
   format bebas. Untuk menghindari user "tertahan" (harus buka aplikasi
   spreadsheet dulu sebelum submit form): tombol "Unduh Template Excel" ada
   DI DALAM halaman form yang sama (bukan link ke halaman/tab lain) — file
   kecil, unduhan langsung ke folder Download browser, form yang sedang diisi
   TIDAK tertutup/pindah. Alur: user isi field teks dulu (Nama PIC, WA, dst)
   → klik unduh template (tetap di tab yang sama) → isi Excel di aplikasi
   lain → balik ke tab form yang sama (belum tertutup) → upload Excel yang
   sudah diisi → kirim. Risiko "browser tertutup tidak sengaja" tetap ada
   secara inheren (sama seperti risiko form web pada umumnya), tapi alur ini
   meminimalkan sebisa mungkin karena user tidak pernah dipaksa pindah
   halaman untuk mengambil template.

**Ini fitur BARU sepenuhnya** (bukan modifikasi alur individu yang sudah
ada) — alur individu yang sudah ada di `batch_registrations` TIDAK disentuh
sama sekali, supaya tidak ada risiko regresi ke fitur yang sudah stabil.

**SQL diperlukan:** YA, signifikan (2 tabel baru + storage bucket untuk file
Excel yang diunggah + storage untuk template Excel yang diunduh — bisa taruh
di folder `public/` project kalau templatenya statis, TIDAK perlu tabel/
storage khusus untuk file template itu sendiri karena isinya cuma header
kolom kosong, tidak berubah-ubah per pendaftaran).
**Masih perlu dipastikan ke Abi (bukan pertanyaan besar lagi, tinggal
detail):** apakah PIC perusahaan perlu akun login juga atau cukup form
publik tanpa login (kemungkinan besar cukup tanpa login, sama seperti
pendaftaran batch individu sekarang) — akan saya konfirmasi lewat widget
sesaat sebelum menulis SQL final, bukan blocker untuk mulai menyiapkan
struktur tabel.

---

## #5 — Session timeout Admin (BARU, catatan tambahan Abi, perlu keputusan durasi)

**Temuan:** project ini TIDAK PUNYA `middleware.ts` sama sekali — sesi Admin
murni mengikuti masa berlaku token Supabase Auth (JWT access token pendek,
tapi refresh token otomatis diperpanjang oleh Supabase client selama tab
browser terbuka, TANPA memandang ada aktivitas atau tidak). Jadi kalau Admin
login lalu meninggalkan komputer menyala berjam-jam, sesi tetap aktif — TIDAK
ada mekanisme "auto-logout karena idle" bawaan dari Supabase, ini SELALU
harus diimplementasikan manual di sisi aplikasi (client-side timer).

**Rencana:** tambahkan idle-timeout KHUSUS untuk area Admin saja (bukan area
publik/user — Abi cuma minta soal keamanan Admin):
1. Client-side timer yang reset setiap ada aktivitas (klik, keyboard, scroll)
   di halaman manapun di bawah `/admin` (kecuali `/admin/login`)
2. Setelah idle melebihi durasi tertentu, otomatis `supabase.auth.signOut()`
   lalu redirect ke `/admin/login` dengan pesan "Sesi berakhir karena tidak
   ada aktivitas, silakan login kembali"
3. Sebaiknya ada peringatan 1-2 menit sebelum logout otomatis (modal "Sesi
   akan berakhir dalam X menit, klik untuk tetap login") supaya Admin yang
   sedang membaca (tapi tidak mengetik/klik) tidak logout tiba-tiba di tengah
   kerjaan
4. **Keputusan Kakak (30 Sep): durasi idle 30 menit**, dengan modal peringatan
   di menit ke-28 ("Sesi akan berakhir dalam 2 menit, klik untuk tetap
   login") sebelum auto-logout di menit ke-30.

**SQL diperlukan:** TIDAK — murni logika client-side di aplikasi.
**Cara uji:** login Admin, biarkan tab terbuka tanpa aktivitas apa pun
selewati durasi yang ditentukan → otomatis logout, tidak bisa akses halaman
Admin lain tanpa login ulang. Pastikan aktivitas normal (klik-klik kerja)
TIDAK ikut ter-logout di tengah jalan (regresi paling penting untuk diuji).

---

## Ringkasan urutan eksekusi

| # | Poin | Ukuran | SQL? | Sentuh dashboard user? |
|---|---|---|---|---|
| 1 | #4 Navbar | Trivial | Tidak | Tidak (publik saja) |
| 2 | #3 Kartu ajakan upgrade | Kecil-menengah | Tidak | Ya |
| 3 | #5 Session timeout Admin | Kecil-menengah | Tidak | Tidak (Admin saja) |
| 4 | #2 Merchandise jadi produk | Besar | Ya | Ya |
| 5 | #1 Pendaftaran perusahaan | Paling besar | Ya | Tidak langsung (fitur publik+Admin baru) |

Poin #5 (session timeout) disisipkan setelah #3 karena sama-sama tidak butuh
SQL dan risikonya kecil — lebih baik dituntaskan dulu sebelum masuk ke dua
poin besar (#2 dan #1) yang butuh perubahan skema.

Saya mulai dari #4 dan #3 sekarang (prompt Cursor siap dikirim segera, tanpa
perlu keputusan tambahan). Untuk #5, tinggal satu keputusan kecil (durasi
idle timeout) sebelum saya tulis prompt-nya. Untuk #2 dan #1, saya akan
siapkan rencana teknis lebih rinci (termasuk draf SQL final) dan satu
pertanyaan tersisa (apakah PIC perusahaan perlu akun login) sebelum menulis
prompt Cursor-nya — supaya skema yang diusulkan tidak perlu diubah-ubah lagi
setelah Cursor mulai kerja.
