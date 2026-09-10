---

# FASE 12.5 — REDESIGN & UPGRADE SISTEM

> Dikerjakan SEBELUM Sprint 5 (hardening & rilis). Bukan bagian dari scope asli BRD-HXT-002 — ini permintaan perluasan yang disetujui Alif tanggal 2026-09-09, dicatat sebagai ADR-011 s/d ADR-017 di `ENGINEERING.md`.
>
> **Jalankan SQL di `docs/sql/012-redesign-upgrade.sql` dulu, manual, sebelum blok prompt pertama di bawah.** Generate ulang tipe TypeScript setelahnya.

---

## 12.5.0 SQL manual dulu

Sebelum blok prompt apa pun di bawah, jalankan SQL ini sendiri di Supabase SQL Editor (bukan lewat Claude Code — larangan #2). SQL lengkap ada di lampiran akhir bagian ini.

Setelah SQL berhasil dijalankan:

```powershell
pnpm supabase gen types typescript --project-id REF > src/types/database.ts
```

---

## 12.5.1 Design system v2

```
Baca ENGINEERING.md Bagian 7 (design token) dan ADR-011 s/d ADR-017 dulu.

Tugas: implementasikan Design System v2 sesuai spesifikasi yang saya lampirkan
terpisah (design-system-v2.md). Ini BUKAN mengubah warna dasar — --warna-utama,
--warna-aksen, dst tetap sama. Yang berubah adalah ATURAN PEMAKAIAN:

1. Tambah CSS variable shadow di globals.css:
   --shadow-float dan --shadow-float-hover (nilai ada di lampiran)

2. Tambah CSS variable transition:
   --transition-hover: 200ms cubic-bezier(0.4, 0, 0.2, 1)

3. Buat komponen reusable baru di src/components/ (bukan di components/ui/ —
   itu khusus shadcn, jangan diedit):
   - ContentCard — card generik untuk batch/produk/materi (gambar, judul, meta,
     badge status, CTA). Terima props untuk membedakan konteks pemakaian.
   - StatusBadge — badge status dengan varian warna (dibuka=hijau, akan
     datang=kuning/aksen, tutup=abu-abu, DONE=hijau, TODO=abu-abu, dst)
   - StarRating — tampilan bintang 5 read-only, terima props rating (number|null).
     Kalau rating null, komponen return null (tidak render apa pun)
   - ImageUploadField — akan dipakai luas di bagian Admin (12.5.5), tapi
     komponennya dibuat di sini agar tersedia untuk seluruh sesi berikutnya

4. JANGAN migrasi seluruh halaman existing ke komponen baru ini di blok ini —
   itu dikerjakan bertahap di blok-blok berikutnya seiring redesign per
   halaman. Blok ini HANYA menyiapkan fondasinya.

Paparkan dulu rencana strukturnya sebelum menulis kode.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Buka `globals.css`, pastikan variable shadow dan transition baru ada
- `pnpm tsc --noEmit` bersih, keempat komponen baru bisa diimpor tanpa error tipe

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint
git add -A
git commit -m "feat(design): tambah design token v2 dan komponen reusable dasar"
```

---

## 12.5.2 Perbaikan bug alur freemium (user login mengulang dari awal)

```
Baca PRD.md Bagian 8.3 dan ENGINEERING.md Bagian 9 (filosofi lazy senior dev —
bug fix = akar masalah, bukan gejala) dulu.

BUG: user yang SUDAH PUNYA AKUN dan login, saat mengklik "mulai kuis" dari
dashboard, diarahkan ke alur kuis anonim di halaman utama /kuis. Setelah
selesai kuis dan klik "dapatkan sertifikat", muncul form daftar akun lagi
(bukan langsung diproses sebagai user yang sudah login). Setelah user klik
"sudah punya akun" dan login ulang, dia kembali ke kondisi seolah belum
pernah mengerjakan apa pun.

Akar masalah yang dikonfirmasi: ini murni soal ALUR/REDIRECT, bukan soal
progress yang hilang di database. Sistem tidak membedakan "pengunjung
anonim mengerjakan kuis" vs "user yang sudah login mengerjakan kuis" —
keduanya diperlakukan sebagai jalur anonim yang sama.

Perbaikan yang diminta:
1. Saat user yang SUDAH LOGIN mengklik mulai kuis (dari dashboard atau
   dari mana pun), alurnya TIDAK LAGI melalui halaman publik /kuis yang
   sama dengan anonim. Sistem mengenali sesi login yang ada.
2. Di akhir kuis (materi/kuis freemium, akan direstrukturisasi penuh di
   12.5.3 — untuk blok INI cukup perbaiki bagian redirect-nya saja),
   user yang sudah login TIDAK diminta mengisi form daftar akun lagi.
   Tombol "dapatkan sertifikat" langsung memproses sertifikat memakai
   identitas user yang sudah login.
3. Untuk PENGUNJUNG ANONIM (belum login), alur TETAP seperti sebelumnya —
   kerjakan kuis dulu, baru diminta daftar akun di akhir. Tidak ada
   perubahan di jalur ini.

Ini perbaikan akar masalah untuk SEMUA pemanggil alur ini, bukan tambalan
di satu tempat — grep semua yang mereferensikan alur mulai-kuis-dari-dashboard
sebelum menulis perbaikan.

Paparkan dulu rencana perbaikannya sebelum menulis kode.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Login sebagai user yang sudah punya akun, klik mulai kuis dari dashboard → selesaikan kuis → klik dapatkan sertifikat → **tidak** diminta form daftar, langsung dapat sertifikat/masuk alur upgrade
- Buka halaman kuis SEBAGAI ANONIM (belum login, browser private/logout dulu) → selesaikan kuis → klik dapatkan sertifikat → **tetap** diminta form daftar akun seperti sebelumnya
- Setelah login ulang di device/browser lain, progress/status yang sudah dikerjakan tidak balik ke awal

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji perbaikan bug alur freemium sendiri di browser dan hasilnya
sesuai. Tambahkan baris baru di Log verifikasi mendeskripsikan bug dan
perbaikannya, tanggal [tanggal]. Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "fix(freemium): user yang sudah login tidak lagi diminta daftar ulang di akhir kuis"
```
## 12.5.3 LMS Freemium — materi berbab, validasi baca, course completion

```
Baca PRD.md Bagian 8 (seluruh Modul 3), ENGINEERING.md ADR-013, dan SQL yang
baru dijalankan (material_chapters, material_progress) dulu.

Tugas: F03.1 dan F03.4 direstrukturisasi total dari tampilan materi flat
(kemungkinan PDF/PPT) menjadi pengalaman LMS penuh.

ALUR BARU:

1. Halaman pertama menu Materi & Kuis (diakses dari Beranda atau dari
   Pelatihan) adalah halaman ringkasan — bagian dari tampilan publik biasa:
   poster, judul pelatihan, bintang 5 (StarRating, dari materials kalau
   relevan atau skip kalau tidak ada rating untuk materi), badge "Pelatihan
   Gratis", deskripsi, tentang pelatihan, tombol "Mulai Sekarang".

2. Klik "Mulai Sekarang" membuka TAMPILAN PENUH terpisah dari layout publik
   biasa (tanpa navbar/footer situs, atau navbar minimal) — mirip mode
   fokus LMS. Layout: sidebar kiri berisi daftar course content (bab-bab
   dari material_chapters, urut sesuai kolom urutan), area utama menampilkan
   judul bab + konten HTML dari bab yang aktif.

3. KUNCI PROGRESIF: bab ke-N di sidebar HANYA bisa diklik kalau bab 1..N-1
   sudah tercatat selesai (material_progress.is_selesai = true untuk user
   ini). Bab yang belum terbuka tampil non-klik di sidebar (redup/disabled),
   BUKAN disembunyikan — user perlu tahu berapa total bab yang harus
   diselesaikan.

4. VALIDASI BACA per bab: tombol "Lanjut ke Bab Berikutnya" nonaktif sampai
   user SCROLL SAMPAI AKHIR konten bab yang sedang dibuka (deteksi scroll
   posisi kontainer konten mencapai bottom). Setelah itu, tombol aktif —
   klik tombol memanggil Server Action yang menulis/update baris
   material_progress (is_selesai=true, selesai_at=now()) untuk (user,
   chapter) tersebut, DAN memvalidasi di server bahwa bab sebelumnya
   memang sudah selesai (jangan percaya urutan dari client saja — cegah
   akal-akalan lewat DevTools yang langsung memanggil action bab ke-5
   tanpa melewati 1-4).

5. COURSE COMPLETION: progress bar di sidebar menghitung
   (jumlah bab selesai / total bab) x 100%. Bab yang selesai ditandai
   centang di sidebar.

6. Setelah SEMUA bab selesai (100% course completion), menu/tombol "Kuis"
   di sidebar terbuka dan bisa diklik — mengarah ke mesin kuis F03.2 YANG
   SUDAH ADA DAN TIDAK BERUBAH SAMA SEKALI (tetap stateless di React,
   tanpa skor, tanpa kondisi gagal, sesuai PRD §8.5 — larangan §13.3 tetap
   berlaku penuh untuk kuis). Blok ini HANYA mengatur kapan kuis terbuka,
   bukan mengubah cara kuis bekerja.

7. Tombol "Dapatkan Sertifikat" (F03.4, sudah ada) HANYA muncul setelah
   kuis selesai 100% (logic yang sudah ada, tidak berubah). Kalau belum
   100%, user hanya melihat tombol "Kembali ke Course" yang membawa balik
   ke tampilan sidebar+materi (BUKAN ke awal — posisi terakhir/status
   completion tetap tersimpan).

UNTUK PENGUNJUNG ANONIM (belum login): progress bab disimpan di client
(React state/sessionStorage) selama sesi berjalan, PERSIS pola kuis F03.2
yang sudah ada (stateless, tidak menyentuh material_progress sampai user
daftar akun). Baris material_progress baru mulai ditulis SETELAH user
mendaftar akun di akhir alur — proses migrasi dari state client ke database
terjadi sekali saat itu.

UNTUK USER YANG SUDAH LOGIN (perbaikan bug dari 12.5.2): progress langsung
ditulis ke material_progress sejak bab pertama, tidak ada state client
sementara.

Batasan yang HARUS dipatuhi (larangan §13.3 untuk KUIS, TIDAK berubah):
- Tidak ada ambang nilai, kondisi gagal, atau timer DI KUIS
- Tidak ada tabel riwayat pengerjaan KUIS
- material_progress adalah progress MATERI, bukan skor/riwayat kuis —
  jangan disalahartikan sebagai pelanggaran larangan ini

Paparkan dulu rencana detail (struktur folder, komponen, Server Action)
sebelum menulis kode. Ini restrukturisasi besar — jangan buru-buru.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Buka menu Materi & Kuis sebagai anonim → klik Mulai Sekarang → tampilan LMS penuh muncul, bab pertama terbuka, bab 2+ terkunci (redup, tidak bisa diklik)
- Scroll konten bab 1 sampai akhir → tombol "Lanjut" aktif → klik → bab 1 tercentang selesai di sidebar, progress bar bertambah, bab 2 terbuka
- Coba klik bab 3 langsung sebelum menyelesaikan bab 2 (kalau sidebar entah bagaimana bisa diklik) → ditolak, atau tidak bisa diklik sama sekali
- Coba akal-akalan lewat DevTools memanggil Server Action bab terakhir langsung tanpa melalui bab sebelumnya → ditolak di server
- Selesaikan semua bab → menu Kuis terbuka → kerjakan kuis (perilaku F03.2 sama sekali tidak berubah, tetap correctable tanpa gagal)
- Selesai kuis 100% → tombol Dapatkan Sertifikat muncul
- Selesai kuis TAPI keluar dulu sebelum 100% → kembali ke course, tombol yang ada hanya "Kembali ke Course", bukan Dapatkan Sertifikat
- Login sebagai user (bukan anonim), ulangi alur → progress langsung tersimpan ke akun, cek dari device/browser lain progress tetap ada

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji restrukturisasi LMS materi (F03.1, F03.4 versi baru)
sendiri di browser dan hasilnya sesuai — termasuk kunci progresif per bab,
validasi scroll, course completion, dan kuis tetap tidak berubah perilakunya.
Isi baris terkait: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [ringkas hasil uji di atas]. Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(lms): restrukturisasi materi freemium jadi LMS berbab dengan validasi baca dan course completion"
```

---

## 12.5.4 Admin: CRUD bab materi (Tiptap, reorder otomatis)

```
Baca ENGINEERING.md Bagian 5.8 (Tiptap) dan ADR-013, ADR-014 dulu.

Tugas: F03.12 (Admin CRUD materi) diperluas untuk mengelola bab
(material_chapters) di dalam satu materi, bukan cuma satu materi tunggal.

1. Halaman /admin/materi menampilkan daftar materi (sudah ada), dan saat
   Admin membuka satu materi, tampil daftar bab-babnya.
2. Tambah/edit bab: form dengan judul dan editor Tiptap untuk konten
   (heading, bold, italic, bullet list, ordered list, link — batasan
   ekstensi sama dengan field lain, ENGINEERING §5.8). Field _id wajib,
   _en opsional (fallback ke Indonesia kalau kosong, pola pick() yang
   sudah ada).
3. Reorder bab: drag-and-drop (pakai dnd-kit atau library drag-drop yang
   SUDAH kompatibel dengan shadcn — cek dulu apakah ada yang terpasang
   sebelum menambah dependency baru, larangan #7). Saat urutan diubah,
   Server Action menghitung ulang urutan SEMUA bab dalam satu materi
   sekaligus (ADR-014) — bukan hanya bab yang digeser.
4. Hapus bab: dialog konfirmasi (AlertDialog yang sudah ada, jangan buat
   modal baru).

Paparkan dulu rencana sebelum menulis kode.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Tambah beberapa bab baru di satu materi, isi dengan heading+paragraf+list di Tiptap
- Drag bab urutan ke-3 jadi urutan ke-1 → cek urutan lain otomatis bergeser (bukan bentrok nomor)
- Edit bab, ubah judul dan isi konten
- Hapus satu bab dengan dialog konfirmasi (Batal dan Hapus keduanya diuji)
- Buka halaman LMS publik, pastikan urutan bab yang ditampilkan sesuai urutan terbaru dari Admin

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji Admin CRUD bab materi sendiri di browser dan hasilnya
sesuai. Isi baris terkait: Status DONE, Berkas [daftar berkas], Diuji
[tanggal], Bukti [ringkas hasil uji]. Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(admin): CRUD bab materi dengan Tiptap dan reorder drag-and-drop"
```
## 12.5.5 Loading indicator, navbar, dan popup gambar

```
Baca ENGINEERING.md ADR-015 dan design-system-v2.md dulu.

Tugas tiga bagian:

1. GANTI ICON LOADING BROWSER: ganti favicon/loading indicator bawaan
   browser saat halaman diakses menjadi logo Hexatara. Ini murni favicon
   (favicon.ico / app icon Next.js metadata) — bukan komponen loading
   custom, karena "connecting to the site" adalah indikator bawaan browser
   yang memakai favicon situs.

2. NAVBAR PUBLIK: sederhanakan jadi persis: logo Hexatara + teks "Hexatara"
   di kiri, lalu Beranda, Pelatihan, Produk di tengah/kanan. Ganti teks
   "Indonesia/English" jadi TOMBOL dengan ikon bendera negara (bendera
   Indonesia untuk ID, bendera Inggris/UK untuk EN) — klik membuka
   dropdown pilihan bahasa, bukan langsung toggle. Tambah tombol
   "Masuk"/"Login" di navbar (label ikut sistem terjemahan) yang
   mengarahkan user ke /login jika belum login, atau ke /dashboard jika
   sudah login (deteksi sesi).

3. POPUP GAMBAR (ADR-015): rombak komponen popup dari berbasis teks jadi
   berbasis gambar. Popup TIDAK memenuhi layar penuh — beri padding/margin
   dari tepi viewport dengan tombol tutup (X) yang jelas terlihat. Pilih
   gambar_mobile_url untuk viewport di bawah breakpoint md, gambar_desktop_url
   untuk md ke atas. Sesuaikan Admin Panel (/admin/konten, form popup):
   dua slot upload gambar terpisah (mobile portrait, desktop landscape)
   memakai ImageUploadField dari 12.5.1, masing-masing dengan label jelas
   dan saran ukuran (contoh: mobile 1080x1920px, desktop 1920x1080px —
   sarankan rasio yang wajar untuk poster iklan).

Paparkan dulu rencana sebelum menulis kode.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Buka situs di tab baru, cek favicon tab browser menampilkan logo Hexatara
- Navbar publik hanya berisi logo+teks Hexatara, Beranda, Pelatihan, Produk, tombol bahasa (ikon bendera), tombol Masuk
- Klik tombol bahasa → dropdown ID/EN muncul, bendera berubah sesuai pilihan
- Klik Masuk saat belum login → ke /login; saat sudah login → ke /dashboard
- Admin upload popup dengan 2 gambar berbeda → buka situs di mobile, popup pakai gambar mobile; di desktop, popup pakai gambar desktop
- Popup tidak menutupi seluruh layar, ada padding dari tepi, tombol tutup jelas dan berfungsi
- 375px: navbar dan popup tidak menyebabkan scroll horizontal

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji favicon, navbar baru, dan popup gambar sendiri di browser
dan hasilnya sesuai. Isi baris terkait: Status DONE, Berkas [daftar berkas],
Diuji [tanggal], Bukti [ringkas hasil uji]. Tambahkan satu baris ke Log
verifikasi. Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(publik): favicon Hexatara, navbar disederhanakan, popup berbasis gambar"
```

---

## 12.5.6 Redesign Beranda

```
Baca PRD.md Bagian 6 (Modul 1) dan design-system-v2.md dulu.

Tugas: susun ulang urutan section Beranda dan perbarui styling sesuai
Design System v2, TANPA mengubah data/logic yang sudah berjalan (popup,
sale banner, batch, produk, testimoni, instruktur, FAQ, company profile
semua SUDAH ADA — ini murni tata letak dan visual, bukan fitur baru,
kecuali yang disebut eksplisit di bawah).

URUTAN BARU section Beranda (dari atas ke bawah):

1. HERO BANNER — dua kolom (kiri teks, kanan carousel gambar):

   KIRI: judul dan deskripsi ganda (dua blok pesan, satu untuk pelatihan
   satu untuk produk), sesuai draft berikut (TULISKAN PERSIS INI, bukan
   variasi — sudah ditinjau bebas AI-slop):

   Blok 1: "Pelatihan Pilot Drone Bersertifikat" — "Sertifikasi RPC
   resmi, kelas bulanan bersama instruktur berpengalaman."
   Blok 2: "Jual Drone Profesional Autel" — "Drone untuk kebutuhan
   survei, pemetaan, dan operasional profesional lainnya."

   TIGA TOMBOL di bawah kedua blok teks:
   - "Lihat Jadwal" → mengarah ke halaman Pelatihan (bukan anchor
     #jadwal di halaman yang sama — Pelatihan sekarang halaman
     tersendiri dari 12.5.7)
   - "Lihat Produk" → mengarah ke halaman Produk
   - "Hubungi Kami" atau serupa → tombol WhatsApp (wa.me, pola sama
     dengan floating WA F01.9), untuk pengunjung yang ingin tanya
     langsung tanpa menjelajah

   KANAN: carousel gambar poster (satu gambar besar bergantian,
   navigasi manual panah kiri-kanan DAN otomatis dengan jeda wajar
   misal 5 detik — beri jeda cukup lama supaya tidak terasa seperti
   "hitung mundur" yang dilarang §13.4, ini murni transisi visual
   bukan timer fungsional). Sumber data: `hero_slides` YANG SUDAH ADA
   (ADR-011b — TIDAK ada tabel baru), pakai kolom `gambar_url` dan
   `cta_url` yang sudah ada. Klik gambar mengarahkan ke `cta_url`
   masing-masing slide (link bebas diisi Admin: ke halaman
   produk/pelatihan tertentu). Hover pada gambar carousel: sedikit
   scale-up halus + overlay gelap tipis, sesuai --transition-hover
   dari design system.

   Perluas Admin Panel pengelola `hero_slides` (sudah ada dari Sprint 1)
   supaya tampil sebagai preview carousel di form Admin (bukan cuma
   list flat), dan pastikan `urutan` menentukan urutan tampil carousel
   (tunduk pola reorder otomatis ADR-014).

2. Sale banner (di bawah hero, TIDAK berubah logic-nya sama sekali —
   tetap teks urgensi manual, tanpa hitung mundur, larangan §13.4 berlaku
   penuh)
3. Section Jadwal Pelatihan — tiap card BATCH diberi border (border,
   bukan cuma shadow) menandai card, tombol "Lihat Selengkapnya" mengarah
   ke halaman Pelatihan (bukan halaman detail langsung — CEK ULANG
   maksudnya ke /pelatihan atau ke card spesifik, ikuti PRD kalau ada
   ambiguitas, default ke /pelatihan sebagai listing)
4. Section Produk — card PRODUK juga diberi border sama, tombol "Lihat
   Selengkapnya" mengarah ke halaman Produk
5. Section Cek Sertifikat — CTA yang mengarah ke /verify
6. Section Tentang Hexatara (company profile, sudah ada)
7. Section Instruktur ("Instruktur Kami") dan Testimoni ("Kata Mereka") —
   perbaiki margin/alignment supaya SEJAJAR dengan lebar section Jadwal
   Pelatihan (kemungkinan container/max-width yang tidak konsisten saat
   ini — cek dan samakan)
8. Section FAQ
9. Footer (lihat spesifikasi terpisah di bawah)

FOOTER — struktur baru:
- Kiri: logo Hexatara + deskripsi singkat (satu-dua kalimat tentang
  Hexatara, TANPA em dash, tanpa bahasa AI-slop)
- Tengah: daftar tautan — Pelatihan, Produk, Tentang Kami, FAQ, Ketentuan
  Layanan, Kebijakan Privasi, Syarat & Ketentuan. Tautan yang belum ada
  halamannya (Tentang Kami, FAQ sebagai halaman standalone, Ketentuan
  Layanan, Kebijakan Privasi, Syarat & Ketentuan) BUTUH HALAMAN BARU —
  buat sebagai halaman statis sederhana di src/app/[locale]/(public)/,
  isi kontennya draft wajar untuk bisnis pelatihan drone (Admin bisa
  minta revisi konten nanti, ini draft awal fungsional bukan final legal)
- Kanan: "Kontak Kami" — email, Instagram, WhatsApp (ambil dari
  site_settings yang sudah ada kalau kolomnya sudah ada, atau tambahkan
  kalau belum — cek dulu skema site_settings sebelum menambah kolom),
  dan jam layanan "Senin-Jumat, 09.00-16.00 WIB" (teks statis, bukan dari
  database, kecuali Anda menemukan sudah ada kolom terkait)
- Bawah tengah: "© Hexatara Indonesia 2026. All rights reserved. Powered
  By InspiraLabs."

ANIMASI HOVER: terapkan --transition-hover dari design system ke semua
card (batch, produk, testimoni) dan tombol di halaman ini.

Paparkan dulu rencana sebelum menulis kode — terutama konfirmasi skema
site_settings untuk kontak (email/Instagram/WhatsApp/jam layanan) sebelum
menambah kolom apa pun.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Hero: judul+deskripsi dua blok tampil sesuai draft, tiga tombol (Lihat Jadwal, Lihat Produk, WhatsApp) mengarah ke tempat yang benar
- Hero carousel: isi minimal 2 slide di Admin (hero_slides), cek bergantian otomatis dengan jeda wajar, panah manual berfungsi, klik gambar mengarah ke cta_url masing-masing, hover halus (scale-up + overlay)
- Urutan section dari atas ke bawah sesuai daftar di atas
- Card batch dan produk punya border terlihat, tombol Lihat Selengkapnya berfungsi
- Instruktur dan Testimoni sejajar dengan lebar section Jadwal Pelatihan
- Footer tiga kolom sesuai spesifikasi, semua tautan berfungsi membuka halaman masing-masing
- Halaman Tentang Kami, FAQ, Ketentuan Layanan, Kebijakan Privasi, Syarat & Ketentuan bisa dibuka, tidak 404
- Hover di card/tombol terasa premium (halus, tidak bouncy), konsisten di semua card
- 375px: tidak ada scroll horizontal, urutan section tetap masuk akal di mobile

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji redesign Beranda sendiri di browser dan hasilnya sesuai.
Isi baris terkait: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [ringkas hasil uji]. Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(beranda): urutan section baru, footer lengkap, halaman statis baru"
```

---

## 12.5.7 Redesign halaman Pelatihan

```
Baca PRD.md Bagian 6.4 (F01.4/F01.5), ADR-012 (kategori dinamis), dan
design-system-v2.md dulu.

Tugas: halaman /pelatihan (listing, sebelumnya bagian dari landing/batch)
disusun sebagai halaman tersendiri dengan struktur:

1. Hero banner freemium: hook CTA (judul + deskripsi menarik, TANPA em
   dash/AI-slop) dan tombol yang mengarah ke halaman materi/kuis freemium
   (alur LMS dari 12.5.3)
2. Filter kategori (dari batch_categories, ADR-012) — akan datang, dibuka,
   ditutup — dan SORT. Sarankan opsi sort yang wajar untuk listing
   pelatihan: Terbaru, Tanggal Terdekat, Harga Terendah-Tertinggi,
   Harga Tertinggi-Terendah. Implementasikan sebagai dropdown sort di
   samping filter kategori.
3. Card pelatihan (pakai ContentCard dari 12.5.1): gambar poster,
   kategori, status (badge dari StatusBadge), judul, deskripsi singkat,
   StarRating (kalau batches.rating tidak null), harga, tombol Lihat
   Detail
4. Di bawah listing: CTA untuk user yang bingung/ingin custom pelatihan,
   dengan tombol WhatsApp (wa.me, pola sama dengan floating WA yang sudah
   ada F01.9 — pesan terisi otomatis relevan konteks custom training)
5. Halaman detail pelatihan (/pelatihan/[slug], sebelumnya /batch/[slug]
   — KONFIRMASI dulu apakah ini rename route atau alias, karena
   ADR-003 mengunci struktur URL /verify tapi TIDAK mengunci /batch;
   kalau di-rename pastikan redirect dari URL lama tetap berfungsi kalau
   sudah ada yang terindeks): judul, poster, kategori, deskripsi, info
   pelatihan (apa yang didapat), silabus, jadwal, info sertifikat, top
   instruktur, dukungan peserta, peralatan belajar, tombol Daftar Sekarang
   (daftar minat batch F01.6, TIDAK berubah logic-nya). Di bawahnya:
   suggest pelatihan lain yang relevan (kategori sama, exclude batch
   ini sendiri), lalu CTA tanya lebih lanjut dengan tombol WhatsApp.

Elemen "tujuh elemen wajib" dari PRD §6.4 (benefit pills, tab Deskripsi &
Silabus, dst) TETAP semuanya ada — ini restrukturisasi visual dan
penambahan kategori/sort/suggest, BUKAN pengurangan elemen yang sudah
disyaratkan PRD.

Animasi hover diterapkan ke semua card dan tombol.

Paparkan dulu rencana sebelum menulis kode — terutama soal keputusan
rename /batch ke /pelatihan.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Filter kategori berfungsi, sort mengurutkan sesuai pilihan
- Card pelatihan menampilkan semua elemen sesuai spesifikasi
- CTA WhatsApp di bawah listing berfungsi
- Halaman detail memuat ketujuh elemen PRD §6.4 plus suggest dan CTA baru
- Kalau route di-rename, URL lama (/batch/...) tetap berfungsi (redirect) atau dikonfirmasi tidak ada yang bergantung padanya
- Hover premium konsisten
- 375px: filter/sort tidak merusak layout, tidak ada scroll horizontal

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji redesign halaman Pelatihan sendiri di browser dan
hasilnya sesuai. Isi baris terkait: Status DONE, Berkas [daftar berkas],
Diuji [tanggal], Bukti [ringkas hasil uji]. Tambahkan satu baris ke Log
verifikasi. Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(pelatihan): halaman listing dengan filter/sort/kategori, redesign detail"
```

---

## 12.5.8 Redesign halaman Produk

```
Baca PRD.md Bagian 9 (Modul 4), ADR-012 (kategori dinamis), dan
design-system-v2.md dulu.

Tugas: halaman /katalog disusun ulang:

1. Hero banner produk Autel: judul + deskripsi, tombol mengarah ke
   WhatsApp (CTA konsultasi B2B — pola wa.me sama dengan yang sudah ada)
2. Filter kategori (dari product_categories, ADR-012) dan sort (Terbaru,
   Harga Terendah-Tertinggi, Harga Tertinggi-Terendah — untuk produk
   dengan harga tersembunyi, tetap ikut urutan tapi tanpa nilai harga
   terlihat di sort control)
3. Card produk (ContentCard): gambar, kategori, judul, StarRating (kalau
   ada), harga (atau "Hubungi kami untuk harga" — TIDAK BERUBAH dari
   F04.3 yang sudah ada), tombol Lihat Detail
4. Di bawah listing: CTA untuk pembelian partai besar/masih bingung
   memilih, tombol WhatsApp
5. Halaman detail produk (/katalog/[slug]): GALERI multi-gambar (4
   gambar disarankan) — 1 gambar besar dengan navigasi klik kiri/kanan
   (Previous/Next), 3 gambar kecil di bawahnya yang kalau diklik jadi
   gambar utama. INI PERLU MENGECEK product_images (tabel sudah ada di
   PRD §5) — pastikan skemanya sudah mendukung multi-gambar per produk,
   kalau sudah ADA tidak perlu SQL baru. Di kanan galeri: judul, series/
   kategori, deskripsi, spesifikasi, StarRating, harga, tombol Hubungi
   via WhatsApp DAN Minta Penawaran (F04.4/F04.5, SUDAH ADA, TIDAK
   diubah logic-nya — hanya tata letak yang menyesuaikan layout baru).
   Di bawah: suggest produk relevan (kategori sama), lalu CTA tanya
   lebih lanjut/pesan eksklusif dengan tombol WhatsApp.

Animasi hover diterapkan ke semua card, tombol, dan galeri gambar.

Paparkan dulu rencana sebelum menulis kode — konfirmasi dulu skema
product_images mendukung urutan/multi-gambar sebelum asumsi apa pun.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Filter kategori dan sort berfungsi
- Galeri produk: klik kiri/kanan di gambar besar berpindah gambar, klik thumbnail kecil mengganti gambar utama
- Tombol Hubungi via WhatsApp dan Minta Penawaran tetap berfungsi seperti sebelumnya (F04.4/F04.5 tidak regresi)
- Harga tersembunyi tetap tersembunyi di card maupun detail (uji ulang Network tab — WAJIB, ini acceptance criteria PRD §9.6 yang tidak boleh regresi)
- Suggest produk relevan tampil, CTA di bawahnya berfungsi
- Hover premium konsisten
- 375px: galeri dan layout tidak rusak, tidak ada scroll horizontal

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji redesign halaman Produk sendiri di browser dan hasilnya
sesuai — termasuk uji ulang Network tab untuk harga tersembunyi, tidak ada
regresi. Isi baris terkait: Status DONE, Berkas [daftar berkas], Diuji
[tanggal], Bukti [ringkas hasil uji]. Tambahkan satu baris ke Log
verifikasi. Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(produk): galeri multi-gambar, filter/sort/kategori, redesign detail"
```

---

## 12.5.9 Admin: kategori produk & pelatihan, rating

```
Baca ADR-011 dan ADR-012 dulu.

Tugas:
1. Halaman Admin baru untuk CRUD product_categories dan batch_categories
   (nama_id, nama_en, urutan dengan reorder drag-and-drop ADR-014, aktif/
   nonaktif). Sub-menu di bawah menu Produk dan menu Batch masing-masing
   (struktur navbar detail ada di 12.5.10).
2. Form CRUD produk (F04.6) dan batch (F01.12): tambah field kategori
   sebagai DROPDOWN SEARCHABLE (Combobox shadcn, cek dulu apakah sudah
   terpasang sebelum menambah dependency) yang memanggil data dari tabel
   kategori baru, bukan input teks bebas.
3. Form CRUD produk dan batch: tambah field rating (input angka 0.0-5.0,
   opsional, dengan keterangan "Kosongkan jika belum ada rating" di
   dekat field).

Paparkan dulu rencana sebelum menulis kode.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Tambah/edit/hapus kategori produk dan kategori pelatihan
- Reorder kategori dengan drag-and-drop
- Form produk dan batch: pilih kategori lewat dropdown searchable, cari kategori dengan mengetik
- Isi rating di form produk/batch, simpan, cek StarRating muncul di card publik
- Kosongkan rating, simpan, cek StarRating TIDAK muncul (bukan 0.0 atau kosong aneh)

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji Admin CRUD kategori dan field rating sendiri di browser
dan hasilnya sesuai. Isi baris terkait: Status DONE, Berkas [daftar berkas],
Diuji [tanggal], Bukti [ringkas hasil uji]. Tambahkan satu baris ke Log
verifikasi. Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(admin): CRUD kategori dinamis untuk produk dan pelatihan, field rating"
```
## 12.5.10 Admin: navbar collapsible dengan sub-menu

```
Baca ENGINEERING.md ADR-017 dan PRD.md Bagian 4 (peta route Admin) dulu.

Tugas: rombak navbar Admin Panel.

STRUKTUR MENU (dua level):
- Dashboard
- Batch (sub: Daftar Batch, Kategori Pelatihan [baru, dari 12.5.9])
- Konten (sub: Popup, Banner, Hero, Instruktur, Company Profile, Testimoni
  — sesuaikan dengan sub-halaman yang sudah ada di /admin/konten)
- Leads (sub: Pendaftaran Minat, Permintaan Penawaran — INI MENGGANTIKAN
  pola Tabs yang baru selesai dibangun di F01.14/perluasan quote_requests.
  Rute berubah jadi /admin/leads/minat dan /admin/leads/penawaran, atau
  struktur serupa. Komponen tabel dan ekspor yang SUDAH ADA dipakai ulang
  penuh — hanya kontainer navigasinya yang berubah dari <Tabs> ke dua
  halaman terpisah dengan sub-menu navbar)
- Sertifikat (sub: Daftar, Tambah Satuan, Import Massal)
- Upgrade (antrean verifikasi)
- Materi (sub: Materi & Bab [dari 12.5.4], Bank Soal)
- Produk (sub: Daftar Produk, Kategori Produk [baru, dari 12.5.9])
- Pengaturan

NAVBAR COLLAPSIBLE: tombol untuk hide/show navbar penuh. Saat di-hide,
navbar menyusut jadi strip ikon saja (tiap menu utama diwakili satu ikon,
tanpa teks, dengan tooltip nama menu saat hover). State collapse disimpan
di localStorage (murni preferensi tampilan per device, tidak perlu
disimpan ke database).

Sub-menu (level dua) muncul sebagai expand/collapse di bawah menu utama
yang sedang aktif (accordion style), bukan sebagai tab terpisah di dalam
halaman.

Paparkan dulu rencana struktur navigasi sebelum menulis kode — terutama
konfirmasi ulang pemetaan menu ke sub-menu di atas sudah sesuai struktur
admin yang ada saat ini.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Navbar menampilkan seluruh menu utama dan sub-menu sesuai peta di atas
- Klik tombol collapse → navbar menyusut ke ikon, tooltip muncul saat hover ikon
- Refresh halaman → state collapse/expand tetap tersimpan (localStorage)
- /admin/leads sekarang dua halaman terpisah (bukan tab), data dan ekspor XLSX tiap halaman tetap berfungsi seperti sebelumnya
- Navigasi ke setiap sub-menu membuka halaman yang benar

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji navbar Admin baru sendiri di browser dan hasilnya sesuai,
termasuk perubahan struktur leads dari tab ke sub-menu. Isi baris terkait:
Status DONE, Berkas [daftar berkas], Diuji [tanggal], Bukti [ringkas hasil
uji]. Tambahkan satu baris ke Log verifikasi. Jangan mengubah status baris
fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(admin): navbar collapsible dua level, leads dipindah dari tab ke sub-menu"
```

---

## 12.5.11 Admin: DataTable generik (filter, sort, pagination)

```
Baca design-system-v2.md (bagian Reusability) dulu.

Tugas: buat komponen <DataTable> generik di src/components/ dan terapkan
ke SEMUA tabel Admin yang sudah ada (batch, konten, leads, sertifikat,
upgrade, materi, bank soal, produk, kategori).

FITUR WAJIB DataTable:
1. Filter pencarian (search box di atas tabel, filter berdasarkan kolom
   teks utama — misal nama untuk leads, judul untuk batch/produk)
2. Sort per kolom — klik header kolom untuk urutkan asc/desc, indikator
   panah arah sort
3. Pagination di kanan bawah tabel — nomor halaman
4. Dropdown jumlah baris per halaman di kanan bawah (pilihan: 10, 20, 30,
   50, 100)
5. Tombol edit dan hapus per baris — redesign sesuai design system
   (ikon jelas, tombol hapus warna --warna-bahaya, dengan AlertDialog
   konfirmasi yang SUDAH ADA — jangan buat modal baru)

Implementasi: gunakan TanStack Table (@tanstack/react-table) kalau belum
terpasang — INI DEPENDENCY BARU, minta izin eksplisit dulu sebelum
memasang (larangan #7). Kalau Anda (Alif) tidak menyetujui dependency
baru, Claude Code perlu menyusun sorting/filtering/pagination manual
dengan React state — sebutkan trade-off-nya sebelum menulis kode.

Migrasi SEMUA tabel admin existing ke komponen ini satu per satu, uji
tiap tabel setelah dimigrasi sebelum lanjut ke tabel berikutnya.

Paparkan dulu rencana sebelum menulis kode — termasuk keputusan dependency
di atas.
```

### SETELAH BLOK INI

**Uji sendiri (ulangi untuk SETIAP tabel admin):**
- Search box memfilter data sesuai kata kunci
- Klik header kolom → data terurut asc, klik lagi → desc
- Pagination berfungsi, nomor halaman benar
- Ganti jumlah baris per halaman (10/20/30/50/100) → tabel menyesuaikan
- Tombol edit membuka form edit yang benar
- Tombol hapus memunculkan AlertDialog, Batal dan Hapus keduanya berfungsi

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji DataTable generik di seluruh tabel Admin sendiri di
browser dan hasilnya sesuai. Isi baris terkait: Status DONE, Berkas
[daftar berkas], Diuji [tanggal], Bukti [ringkas hasil uji, sebutkan
tabel mana saja yang sudah dimigrasi]. Tambahkan satu baris ke Log
verifikasi. Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(admin): DataTable generik dengan filter, sort, pagination di semua tabel"
```

---

## 12.5.12 Admin: upload gambar dengan validasi dan crop

```
Baca ENGINEERING.md Bagian 5.3 (berkas & bucket, kompresi browser-image-
compression yang SUDAH terpasang) dulu.

Tugas: implementasikan komponen <ImageUploadField> (sudah disiapkan
kerangkanya di 12.5.1) secara lengkap, dipakai di SEMUA form yang upload
gambar (batch, produk, konten/popup, sertifikat kalau ada, materi kalau
ada gambar).

FITUR WAJIB:
1. Tombol upload yang jelas dengan ikon, teks "Pilih Gambar" atau serupa
2. Keterangan di dekat tombol: format yang diterima (JPG, PNG, WebP),
   ukuran maksimal (misal 5 MB sebelum kompresi), dan SARAN UKURAN PIXEL
   yang sesuai konteks (contoh: produk 1200x1200px, hero 1920x1080px,
   popup sesuai ADR-015)
3. Validasi format: file yang bukan format gambar yang didukung DITOLAK
   dengan pesan error jelas (sonner toast, lihat 12.5.13)
4. Validasi ukuran: file di atas batas maksimal DITOLAK sebelum upload
   jalan, dengan pesan jelas berapa ukuran file vs batas maksimal
5. Setelah file dipilih: popup/dialog muncul untuk CROP gambar (pakai
   library crop yang ringan — cek dulu apakah ada yang cocok dan sudah
   dipakai proyek serupa, atau react-image-crop yang ringan; INI
   DEPENDENCY BARU kalau belum ada, minta izin eksplisit dulu) sehingga
   Admin bisa melihat dan menyesuaikan area yang akan tampil sebelum
   final upload — mengatasi masalah "Admin tidak tahu bagian gambar mana
   yang akan terpotong di tampilan depan"
6. Setelah crop dikonfirmasi, gambar dikompresi (browser-image-compression,
   SUDAH terpasang, tidak perlu dependency baru) baru diupload ke bucket

Paparkan dulu rencana sebelum menulis kode — termasuk keputusan dependency
crop di atas, dan konfirmasi saran ukuran pixel per konteks pemakaian
(produk/hero/popup/dll) masuk akal untuk tampilan yang sudah ada.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Coba upload file bukan gambar (misal .pdf) → ditolak dengan pesan jelas
- Coba upload gambar di atas batas ukuran → ditolak dengan pesan jelas
- Upload gambar valid → dialog crop muncul, bisa disesuaikan area crop
- Konfirmasi crop → gambar terupload, preview muncul di form
- Cek ukuran file akhir di Supabase Storage jauh lebih kecil dari file asli (kompresi berfungsi)
- Ulangi untuk setiap form yang pakai ImageUploadField (batch, produk, konten/popup, dst)

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji ImageUploadField dengan validasi dan crop sendiri di
browser di semua form terkait dan hasilnya sesuai. Isi baris terkait:
Status DONE, Berkas [daftar berkas], Diuji [tanggal], Bukti [ringkas hasil
uji]. Tambahkan satu baris ke Log verifikasi. Jangan mengubah status baris
fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(admin): komponen upload gambar dengan validasi, saran ukuran, dan crop"
```

---

## 12.5.13 Admin: sonner toast, XLSX, reorder soal, kemudahan form

```
Baca ENGINEERING.md ADR-016 (CSV ke XLSX) dulu.

Tugas empat bagian:

1. SONNER TOAST: pasang <Toaster/> di root layout Admin, panggil toast()
   di SETIAP Server Action Admin setelah selesai (sukses maupun gagal) —
   simpan/edit/hapus di seluruh modul Admin. Pesan singkat jelas Bahasa
   Indonesia ("Produk berhasil disimpan", "Gagal menghapus, coba lagi").

2. XLSX (ADR-016): ganti SEMUA ekspor CSV jadi XLSX memakai `xlsx` yang
   SUDAH terpasang dari CDN SheetJS (ADR-010) — tidak perlu dependency
   baru:
   - Ekspor lead (/admin/leads, kedua halaman dari 12.5.10)
   - Template & hasil import sertifikat massal (F02.8)
   - Template & hasil import bank soal (F03.13)
   Perbarui PRD.md §6.4/§6.5 (acceptance criteria menyebut CSV eksplisit)
   jadi XLSX — ini perubahan dokumen produk, catat di ENGINEERING.md
   Bagian 11 (Riwayat Perubahan Struktur). Setelah migrasi selesai,
   jalankan pnpm knip dan hapus papaparse dari dependencies kalau memang
   sudah tidak terpakai di mana pun.

3. REORDER SOAL KUIS: terapkan pola reorder otomatis (ADR-014, sama
   dengan bab materi di 12.5.4) ke quiz_questions — drag-and-drop,
   Server Action menghitung ulang urutan semua soal dalam satu request.

4. KEMUDAHAN FORM UNTUK ADMIN AWAM: untuk field yang berupa pemilihan
   dari data lain (misal pilih produk terkait, pilih batch terkait di
   form yang membutuhkannya), ganti input manual/dropdown panjang jadi
   Combobox searchable (sama pola dengan kategori di 12.5.9) — user bisa
   ketik untuk mencari alih-alih scroll dropdown panjang.

Paparkan dulu rencana sebelum menulis kode.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Setiap aksi Admin (simpan/edit/hapus di berbagai modul) memunculkan toast sukses/gagal
- Ekspor lead, sertifikat, bank soal semuanya jadi file .xlsx, dibuka rapi di Excel per kolom (bukan satu kolom dipisah koma)
- Reorder soal kuis dengan drag-and-drop, urutan lain otomatis bergeser
- Form dengan field pilihan dari data lain memakai Combobox searchable
- `pnpm knip` dijalankan ulang, papaparse dihapus kalau memang sudah tidak dipakai

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji sonner toast, ekspor XLSX, reorder soal kuis, dan
Combobox searchable sendiri di browser dan hasilnya sesuai. Isi baris
terkait: Status DONE, Berkas [daftar berkas], Diuji [tanggal], Bukti
[ringkas hasil uji]. Tambahkan satu baris ke Log verifikasi. Jangan
mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(admin): sonner toast, ekspor XLSX, reorder soal, combobox searchable"
```

---

## 12.5.14 Dashboard User

```
Baca PRD.md Bagian 3, 8.9 (F03.9) dan hasil redesign Admin (12.5.10-12.5.13,
sebagai template pola navigasi dan komponen) dulu.

Tugas: rombak /dashboard jadi template yang diadaptasi dari struktur
navbar Admin (collapsible, sub-menu kalau perlu), TAPI dengan menu sesuai
kebutuhan User:

1. Dashboard (ringkasan — sertifikat, status Ready to Fly, status
   pembayaran, status pengiriman, ringkas seperti F03.9 yang sudah ada,
   tapi visualnya informatif dan menarik sesuai design system: angka
   sebagai hero, bukan tabel teks polos)
2. Kursus Saya — menampilkan setiap batch yang diikuti (dari batch_leads
   milik user ini) TERMASUK status pelatihan gratis (freemium, dari
   material_progress milik user)
3. Sertifikat Saya — card-card sertifikat yang dimiliki, tiap card bisa
   diklik untuk PREVIEW LANGSUNG di jendela yang sama (modal/dialog
   menampilkan PDF atau render sertifikat, bukan download langsung)
4. Transaksi Saya — riwayat certificate_orders milik user (status,
   tanggal, paket) — PERBAIKAN BUG: saat ini di status "sedang ditinjau"
   atau "sudah disetujui" tidak ada tombol kembali ke dashboard. Tambahkan
   tombol/navigasi jelas untuk kembali ke dashboard dari halaman status
   transaksi mana pun.
5. Pelatihan — menampilkan SEMUA pelatihan yang ada (sama seperti listing
   publik /pelatihan tapi dalam konteks dashboard), termasuk pelatihan
   gratis. Klik pelatihan gratis dari sini membuka LANGSUNG tampilan LMS
   (12.5.3) sebagai user yang sudah login (bukan alur anonim) — dan di
   akhir (dapatkan sertifikat) tombolnya bisa diklik TANPA registrasi
   ulang, mengarahkan balik ke tempat dia bisa lihat sertifikatnya
   langsung (poin 3 di atas).
6. Setting — ubah profil (termasuk ganti password) dan tombol Logout.

Animasi hover diterapkan ke semua card.

Paparkan dulu rencana sebelum menulis kode — konfirmasi dulu skema
certificate_orders punya cukup data untuk menampilkan riwayat transaksi
lengkap sebelum asumsi apa pun.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Dashboard ringkasan tampil informatif (angka besar jelas, bukan tabel padat)
- Kursus Saya menampilkan batch yang diikuti dan status freemium
- Sertifikat Saya: klik card sertifikat → preview muncul di jendela yang sama, tidak langsung download
- Transaksi Saya: dari status "sedang ditinjau"/"sudah disetujui", ada tombol jelas kembali ke dashboard
- Pelatihan: klik pelatihan gratis dari dashboard → langsung LMS sebagai user login, di akhir dapat sertifikat tanpa form daftar ulang, mengarah ke Sertifikat Saya
- Setting: ubah profil dan password berfungsi, logout berfungsi
- 375px: seluruh dashboard tidak rusak, tidak ada scroll horizontal

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji redesign Dashboard User sendiri di browser dan hasilnya
sesuai, termasuk perbaikan bug tombol kembali ke dashboard di halaman
transaksi. Isi baris terkait: Status DONE, Berkas [daftar berkas], Diuji
[tanggal], Bukti [ringkas hasil uji]. Tambahkan satu baris ke Log
verifikasi. Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(dashboard-user): redesign penuh, perbaikan bug navigasi transaksi"
```

---

## 12.5.15 Redesign login, daftar, dan alur auth

```
Baca PRD.md Bagian 3.2 (registrasi) dan design-system-v2.md dulu.

Tugas: tingkatkan UI/UX halaman /login, /daftar, /lupa-sandi, /reset-sandi.

1. LOGO KLIKABEL: logo Hexatara di halaman-halaman ini (biasanya di atas
   form) adalah tautan ke Beranda ("/").

2. TOGGLE EYE PASSWORD: SETIAP field password (login, daftar, konfirmasi
   password saat daftar, reset sandi) punya ikon mata di ujung field
   untuk toggle tampilkan/sembunyikan teks password. Pola umum: ikon
   Eye/EyeOff dari lucide-react (biasanya sudah tersedia lewat shadcn),
   klik untuk switch antara type="password" dan type="text".

3. KONFIRMASI PASSWORD DI DAFTAR: tambah field "Konfirmasi Kata Sandi"
   di form /daftar (SAAT INI KEMUNGKINAN BELUM ADA — cek dulu form yang
   ada). Validasi: password dan konfirmasi HARUS sama persis, pesan
   error jelas kalau tidak cocok ("Konfirmasi kata sandi tidak sama").

4. VALIDASI JELAS SAAT REGISTRASI:
   - Email: format valid (Zod z.email(), SUDAH ADA polanya dari
     validasi lain di proyek — TANPA validasi domain/MX, itu tetap
     dilarang untuk form B2B tapi field email login/daftar TIDAK
     termasuk larangan itu, jadi format standar cukup)
   - Password: tampilkan syarat kekuatan password secara jelas di
     dekat field (misal minimum 8 karakter, kombinasi huruf+angka —
     SESUAIKAN dengan aturan Supabase Auth yang sudah dikonfigurasi,
     JANGAN menambah aturan kekuatan password baru di kode kalau
     Supabase Auth sudah punya validasinya sendiri secara native)
   - Pesan error validasi tampil INLINE di bawah field terkait
     (react-hook-form + Zod, pola yang sudah dipakai di proyek), bukan
     alert generic di atas form

5. SONNER TOAST: setiap aksi auth (login berhasil/gagal, daftar
   berhasil/gagal, request reset sandi terkirim/gagal, reset sandi
   berhasil/gagal) memunculkan toast dengan pesan jelas Bahasa
   Indonesia.

6. Terapkan Design System v2 (shadow hanya pada card form yang
   mengambang, animasi hover pada tombol submit, konsistensi warna
   dengan halaman lain).

JANGAN mengubah logic autentikasi (signUp/signInWithPassword/
resetPasswordForEmail — sudah dikonfirmasi berjalan lewat Supabase
Auth native, ADR terkait email verifikasi/reset sandi) — ini murni
UI/UX dan validasi tambahan di atas alur yang sudah berfungsi.

Paparkan dulu rencana sebelum menulis kode.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Klik logo di halaman login/daftar → kembali ke Beranda
- Toggle eye password berfungsi di semua field password (login, daftar, konfirmasi, reset sandi)
- Daftar dengan password dan konfirmasi tidak sama → error jelas, tidak submit
- Daftar dengan email format salah → error jelas inline
- Daftar dengan password terlalu lemah (sesuai aturan Supabase Auth yang berlaku) → error jelas
- Login berhasil → toast sukses; login salah password → toast gagal dengan pesan jelas
- Reset sandi: request terkirim → toast konfirmasi; submit sandi baru berhasil → toast sukses
- 375px: form tidak rusak, toggle eye tetap mudah diklik (area sentuh ≥44×44px)

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji redesign login/daftar/reset-sandi sendiri di browser
dan hasilnya sesuai. Isi baris terkait: Status DONE, Berkas [daftar
berkas], Diuji [tanggal], Bukti [ringkas hasil uji]. Tambahkan satu baris
ke Log verifikasi. Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(auth): toggle password, konfirmasi password, validasi jelas, sonner toast"
```

---

## 12.5.16 Audit visual menyeluruh — warna tombol dan form publik

```
Baca design-system-v2.md dulu.

Tugas dua bagian, ini AUDIT — telusuri dulu, laporkan temuan, baru
perbaiki setelah saya setujui (jangan langsung ubah semua tanpa daftar
temuan, supaya saya bisa cek mana yang perlu dan mana yang sudah benar):

1. AUDIT WARNA TOMBOL: telusuri SELURUH halaman publik dan admin, cari
   tombol yang masih memakai warna gelap/default (misal hitam, abu-abu
   tua, atau warna shadcn bawaan yang belum diganti token) alih-alih
   token design system (--warna-aksen untuk CTA utama, --warna-utama
   untuk aksi sekunder, sesuai pola one-primary-three-secondary).
   Laporkan daftar lokasi (berkas + screenshot/deskripsi) sebelum
   mengubah apa pun.

2. AUDIT FORM PUBLIK: telusuri SEMUA form di halaman publik — form
   pendaftaran minat batch (F01.6), form permintaan penawaran (F04.5),
   form materi/kuis kalau ada input nama, dan form lain yang saya
   mungkin lewatkan. Untuk tiap form, laporkan kondisi saat ini:
   - Apakah label field jelas dan konsisten?
   - Apakah validasi error tampil inline dengan jelas?
   - Apakah styling field (border, focus state, padding) konsisten
     dengan Design System v2?
   - Apakah ada field yang secara UX membingungkan (placeholder tidak
     jelas, urutan field tidak logis, dst)?

Laporkan kedua audit ini sebagai daftar temuan, paling penting di atas.
Jangan perbaiki apa pun sebelum saya menyetujui daftarnya.
```

### SETELAH BLOK INI

**Uji sendiri:**
- Baca daftar temuan dari Claude Code
- Putuskan mana yang perlu diperbaiki sekarang vs nanti
- Setelah disetujui, minta Claude Code memperbaiki sesuai daftar yang sudah disepakati (blok prompt lanjutan, tidak perlu ditulis di sini karena bergantung hasil audit)

**Commit (setelah perbaikan dari audit selesai, bukan setelah audit saja):**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "fix(ui): warna tombol konsisten dengan design token, perbaikan UX form publik"
```

---

## 12.5.17 Sebelum lanjut ke Sprint 5

- [ ] Seluruh blok 12.5.1 s/d 12.5.16 sudah DONE di feature-registry.md
- [ ] `pnpm knip` bersih (termasuk papaparse dan dependency lain yang jadi unused setelah migrasi XLSX)
- [ ] `pnpm build` lolos tanpa error
- [ ] Diuji ulang di 375px untuk SEMUA halaman yang disentuh redesign ini — bukan cuma halaman baru, tapi juga F01-F04 yang sudah DONE sebelumnya untuk pastikan tidak ada regresi visual dari komponen bersama yang berubah (ContentCard, DataTable, ImageUploadField)
- [ ] Uji ulang Network tab untuk harga tersembunyi (F04.3) — WAJIB, karena redesign katalog menyentuh langsung halaman ini
- [ ] Uji ulang bug freemium (12.5.2) dan bug dashboard transaksi (12.5.14) benar-benar tuntas, bukan cuma gejala yang hilang sementara
