# hexatara_ADMIN_DESIGN.md — referensi struktural Fase 12.6

Hasil eksplorasi langsung (browser, termasuk pembacaan CSS custom properties lewat
JavaScript) terhadap referensi Alif: **https://studio-admin.arhamkhnz.com**
(Studio Admin — Next.js dashboard starter berbasis shadcn/ui).

> **Status warna: SEMENTARA, menunggu persetujuan Abi.** Dokumen ini mencatat
> token warna APA ADANYA dari referensi (lihat Bagian 1) karena itu keputusan
> Alif per 2026-09-10 (ADR-019) — BUKAN karena warna Hexatara (`--warna-utama`
> `#1E40AF`, `--warna-aksen` `#F59E0B`) sudah dibuang permanen. Begitu Abi
> menyetujui penyesuaian warna, dokumen ini dan seluruh token turunannya akan
> direvisi — lihat PANDUAN.md §12.6.14 (blok PALING AKHIR Fase 12.6, belum
> dieksekusi, murni catatan menunggu keputusan).

---

## 1. Token dasar (diverifikasi lewat computed CSS var, bukan tebakan visual)

Referensi memakai preset **"Neutral"** bawaan shadcn/ui — bukan palet custom.
Ini kabar baik secara teknis: memasangnya tidak perlu menebak-nebak kode warna,
cukup inisialisasi shadcn/ui dengan base color **Neutral** dan radius default,
hasilnya otomatis cocok.

- **Base color:** Neutral (achromatic — hampir seluruh token `primary`,
  `secondary`, `muted`, `accent`, `border`, `ring` adalah abu-abu murni tanpa
  hue, diverifikasi lewat `getComputedStyle` — nilai Lab-nya `a≈0, b≈0` di
  semua token itu).
- **Satu-satunya warna ber-hue:** `--destructive` (merah, dipakai HANYA untuk
  aksi berbahaya — tombol hapus, badge error/overdue). Ini konsisten dengan
  prinsip Hexatara "satu warna aksen flat" — bedanya di referensi bahkan aksen
  utama pun netral, warna cuma muncul di destructive dan di badge status
  (hijau/merah/kuning kecil, bukan dari token tema, biasanya inline).
- **Radius:** `0.625rem` (10px) — dipakai konsisten di card, button, input,
  dialog. Lebih besar dari radius Hexatara `design-system-v2.md` saat ini,
  perlu diselaraskan saat migrasi (§12.6.0 memutuskan radius final).
- **Font:** Geist (variable font, via `next/font/google` atau paket `geist`)
  — sans-serif modern, ukuran dasar 16px di body.
- **Dark mode:** didukung penuh, token terbalik proporsional (background
  gelap, foreground terang, border pakai alpha transparency di dark). Toggle
  tema di topbar men-siklus light → dark (kemungkinan → system).
- **Chart colors:** 5-step grayscale ramp (terang ke gelap), bukan warna-warni
  — konsisten dengan filosofi netral di atas.

## 2. Shell aplikasi (admin DAN dashboard user — dua instance terpisah)

- **Sidebar kiri**, collapsible (toggle jadi icon-only, bukan hilang total di
  desktop). Dikelompokkan per label section (di referensi: "Dashboards",
  "Pages", "Legacy", "Misc" — untuk Hexatara diganti label sesuai domain,
  misal "Utama", "Konten", "LMS", "Pengguna", "Pengaturan").
- Item sidebar bisa berupa link langsung ATAU tombol yang expand submenu
  (dilihat di item "Authentication" pada referensi).
- Kartu profil user di paling BAWAH sidebar (avatar + nama + email), klik
  membuka menu (logout, dst).
- **Topbar/header atas:** tombol toggle sidebar, search box (opsional
  Command Palette ⌘J — lihat catatan dependency di ADR-019, ini yang paling
  boleh di-skip kalau mau menghemat kompleksitas), ikon settings, theme
  toggle, avatar.
- **Mobile (WAJIB, prinsip mobile-first tidak boleh kendor):** sidebar
  otomatis jadi drawer TERSEMBUNYI, dipicu tombol hamburger di topbar. Kartu
  dashboard stack satu kolom. Sudah diverifikasi langsung di breakpoint 375px
  pada referensi — perilaku ini WAJIB direplikasi persis, bukan sekadar
  "responsive" ala kadarnya.

## 3. Pola komponen kunci

**Kartu statistik** (dashboard/default DAN dashboard/academy — academy paling
relevan karena personanya dekat dengan admin pelatihan Hexatara): ikon kecil
di pojok, label, angka besar, badge delta (panah naik/turun + persen,
hijau/merah), caption penjelas kecil di bawah. Biasanya 4 kartu sejajar
(grid, stack di mobile).

**Kartu chart:** judul + subjudul, dropdown filter (periode/segmen), tombol
"View report", grafik garis/area dengan legend dan label sumbu tanggal,
tooltip saat hover.

**Tabel data** (pola PALING PENTING untuk Hexatara — dipakai di halaman
Users dan Roles referensi, jadi acuan DataTable generik §12.6.3): search box
di atas tabel, filter dropdown per kolom (contoh: Status, Joined date,
Billing), tombol Sort, checkbox pilih-baris (termasuk "select all"), kolom
identitas (avatar + nama + email/id), badge status berwarna, kolom
tanggal+jam, lalu footer pagination LENGKAP: dropdown rows-per-page, teks
"Page X of Y", tombol first/prev/next/last (bukan cuma prev/next).

**Roles & Permissions:** tabel dikelompokkan per section dengan header grup,
kolom scope/akses sebagai badge "+N". Untuk Hexatara saat ini KEMUNGKINAN
BESAR overkill (sistem role Hexatara masih `is_admin` boolean sederhana, PRD
tidak minta RBAC granular) — dicatat sebagai referensi masa depan, TIDAK
wajib direplikasi di Fase 12.6 kecuali diminta eksplisit.

**File Manager:** grid card dengan ikon tipe file, nama, pemilik, tanggal,
ukuran, toggle grid/list. Pola ini yang dipakai untuk redesign tab "File" di
LMS materi (§12.5.3/ADR-018) dan panel lampiran file di admin CRUD bab
materi — menggantikan daftar teks polos.

**Halaman Auth:** dua varian ditemukan di referensi —
- v1: panel gelap (logo+tagline) di KIRI, form di KANAN
- v2: form di KIRI, panel gelap di KANAN berisi logo+tagline di atas dan 2
  kartu highlight fitur di bawah

**Hexatara memakai v2** (keputusan Alif, ADR-019) — form kiri, panel kanan
dengan highlight fitur (isi kartu highlight disesuaikan konteks Hexatara,
misal "Sertifikasi Resmi" dan "Butuh bantuan?"). Field standar: email,
password (+confirm password di daftar), checkbox "remember me" (login),
tombol submit, opsi OAuth (Hexatara: cek apakah OAuth relevan — kalau tidak
ada requirement OAuth di PRD, skip tombol ini), link switch ke
halaman lain.

## 4. Yang TIDAK diambil dari referensi

- Command Palette (⌘K/⌘J) — nice-to-have, bukan inti. Boleh di-skip kalau mau
  menghemat dependency (`cmdk`) dan waktu, sesuai keputusan Alif saat
  implementasi §12.6.0.
- "Quick Create" dan "Inbox" di atas sidebar — fitur generik starter template,
  tidak relevan untuk Hexatara, JANGAN diikutkan.
- Roles & Permissions granular — lihat catatan di atas.
- Widget-widget dashboard yang terlalu spesifik ke domain SaaS/e-commerce
  (Growth Rate, Revenue) — dashboard admin Hexatara harus pakai metrik
  Hexatara sendiri (jumlah pendaftar, materi aktif, sertifikat terbit, dst),
  BUKAN metrik dummy dari referensi.

## 5. Ringkasan pemakaian per blok Fase 12.6

| Pola dari referensi | Dipakai di blok |
| --- | --- |
| Token dasar (Neutral, radius, Geist, dark mode) | §12.6.0 |
| Shell sidebar+topbar (admin & dashboard user) | §12.6.0 |
| Halaman Auth v2 | §12.6.1 |
| Kartu statistik + chart | §12.6.2, §12.6.8 |
| DataTable generik | §12.6.3 |
| Form components, upload+crop | §12.6.4 |
| — (migrasi CRUD existing pakai pola tabel+form di atas) | §12.6.5, §12.6.6 |
| File Manager card (lampiran bab) | §12.6.6, §12.6.7 |
| — (restyle LMS materi user-facing) | §12.6.7 |
| Kartu statistik dashboard user | §12.6.8 |
| — (halaman publik, TIDAK pakai shell sidebar) | §12.6.9 |
