# Prompt Redesign Total Halaman Publik Hexatara — §12.6.9 (2026-09-16)

Tempel ke Cursor (bukan 21st.dev — 21st.dev cuma sumber referensi tema warna, eksekusi tetap di Cursor terhadap kode nyata, sesuai pola kerja proyek ini). Header konteks di bawah WAJIB ditempel duluan sebelum bagian "Rujukan file" — ini bukan formalitas, ini yang membuat Cursor (yang mulai sesi tanpa histori percakapan kita) tahu dia melanjutkan Fase 12.6, bukan mulai dari nol.

---

## Header konteks (tempel dulu, sebelum rujukan file)

```
@PANDUAN.md @ENGINEERING.md @PRD.md @hexatara_ADMIN_DESIGN.md @feature-registry.md

Ini LANJUTAN, bukan sesi baru dari nol — Fase 12.6 sudah berjalan sampai
§12.6.8 (Dashboard User, DONE, tercatat di F06.17). Blok ini adalah §12.6.9
— redesign visual halaman publik (Beranda, Pelatihan, Katalog + detail
masing-masing), TODO, belum pernah dikerjakan.

Aturan tetap yang berlaku di seluruh Fase 12.6 (sudah final, jangan
ditanyakan ulang):
- ADR-019 di @ENGINEERING.md adalah dasar keputusan redesign total ini.
- WARNA untuk blok ini BUKAN lagi preset Neutral achromatic bawaan ADR-019
  — Alif sudah menyetujui palet baru (biru kobalt + hijau, lihat bagian
  "Palet warna baru" di bawah), MENGGANTIKAN sementara "menunggu
  persetujuan" yang disebut di §12.6.14. Palet ini KHUSUS untuk halaman
  publik `(public)` — Admin dan Dashboard User TETAP token Neutral yang
  sudah ada, JANGAN ikut diubah.
- Konvensi kolom `_id`/`_en` wajib untuk semua field baru (pola next-intl)
  — blok ini TIDAK menambah field database baru, murni styling, jadi
  seharusnya tidak relevan, tapi tetap berlaku kalau ternyata dibutuhkan.
- Larangan #2 @PRD.md: SQL tidak pernah dieksekusi otomatis, selalu
  diajukan untuk dijalankan manual. (Blok ini tidak butuh SQL sama sekali.)
- Larangan #7 @PRD.md: dependency baru wajib izin eksplisit — dependency
  yang SUDAH disetujui ada lengkap di ADR-019 (shadcn/ui, Radix,
  class-variance-authority, @tanstack/react-table, next-themes, Recharts,
  lucide-react). Font serif baru (Fraunces/Playfair Display/Lora via
  `next/font/google`) TIDAK butuh izin tambahan — itu built-in Next.js,
  bukan dependency npm baru.
- F04.3 (harga tersembunyi) WAJIB tetap terjaga — blok ini menyentuh
  langsung halaman Katalog yang query `products_public` (bukan
  `products`), verifikasi ulang lewat Network tab.
- Mobile-first prioritas utama, cek breakpoint 375px untuk setiap
  komponen.
- JANGAN menjalankan atau membangun ulang blok arsip §12.5.4-§12.5.17 di
  @PANDUAN.md — semua itu sudah diganti versi barunya di Fase 12.6 (yang
  relevan untuk redesign publik: §12.5.5/§12.5.6/§12.5.7/§12.5.8 arsip,
  digantikan §12.6.9 ini).
- Kalau ada keputusan yang tidak jelas, PAPARKAN DULU rencana dan tanyakan
  ke saya — jangan asumsi sendiri lalu langsung tulis kode.
- Setelah kode ditulis, jalankan tsc, lint, dan build sampai bersih.
  Verifikasi juga secara visual (breakpoint mobile & desktop) sebelum
  bilang selesai.

Referensi tambahan kalau dibutuhkan: @hexatara_ADMIN_DESIGN.md (pola
struktural — token, shell, komponen; TAPI untuk blok ini token warnanya
override ke palet baru di bawah, bukan Neutral achromatic yang didokumenkan
di situ), @feature-registry.md (status fitur, tapi ingat ini lagging
indicator, tanyakan ke saya kalau ada yang tidak sesuai kondisi nyata).
```

---

## Rujukan file tambahan (`@`, spesifik untuk blok ini)

```
@src/app/globals.css
@src/app/[locale]/(public)/layout.tsx
@src/app/[locale]/(public)/page.tsx
@src/app/[locale]/(public)/pelatihan/page.tsx
@src/app/[locale]/(public)/pelatihan/[slug]/page.tsx
@src/app/[locale]/(public)/pelatihan/[slug]/daftar-minat-dialog.tsx
@src/app/[locale]/(public)/katalog/page.tsx
@src/app/[locale]/(public)/katalog/[slug]/page.tsx
@src/app/[locale]/(public)/katalog/[slug]/product-gallery.tsx
@src/app/[locale]/(public)/katalog/[slug]/quote-dialog.tsx
@src/app/[locale]/(public)/pelatihan/pelatihan-card.tsx
@src/app/[locale]/(public)/pelatihan/filter-bar.tsx
@src/app/[locale]/(public)/katalog/produk-card.tsx
@src/app/[locale]/(public)/katalog/filter-bar.tsx
@src/components/hero-section.tsx
@src/components/hero-carousel.tsx
@src/components/sale-banner.tsx
@src/components/jadwal-batch-section.tsx
@src/components/produk-section.tsx
@src/components/verify-cta-section.tsx
@src/components/company-profile-section.tsx
@src/components/instruktur-section.tsx
@src/components/testimoni-section.tsx
@src/components/faq-section.tsx
@src/components/faq-accordion.tsx
@src/components/content-card.tsx
@src/components/star-rating.tsx
@src/components/status-badge.tsx
@src/components/public-nav-mobile.tsx
@src/components/language-switcher.tsx
@src/components/floating-whatsapp.tsx
@src/components/popup-pembuka.tsx
@src/components/popup-dialog-client.tsx
@src/components/static-page-body.tsx
@src/app/[locale]/(public)/faq/page.tsx
@src/app/[locale]/(public)/tentang-kami/page.tsx
@src/app/[locale]/(public)/verify/page.tsx
@src/app/[locale]/(public)/verify/[token]/page.tsx
@src/app/[locale]/(public)/verify/[token]/certificate-result.tsx
@messages/id.json
@messages/en.json
```

## Konteks — sudah diverifikasi langsung ke kode, bukan asumsi

Ini redesign visual TOTAL untuk seluruh halaman publik Hexatara — Beranda, Pelatihan (listing + detail), Katalog (listing + detail), dan halaman statis (Tentang Kami, FAQ, Verify, Kebijakan Privasi, dst). **Copy/teks konten TIDAK berubah** (semua string sudah ada di `messages/id.json`/`en.json` atau database) — murni redesign styling, layout, dan token warna/tipografi.

**Struktur halaman publik saat ini (dikonfirmasi dari kode, urutan section persis seperti ini):**

- **Beranda** (`(public)/page.tsx`): PopupPembuka → HeroSection (carousel dua kolom) → SaleBanner (strip promo, kondisional kalau ada banner aktif) → JadwalBatchSection (grid batch pelatihan) → ProdukSection (grid produk) → VerifyCtaSection → CompanyProfileSection → InstrukturSection → TestimoniSection → FaqSection. Footer dari `(public)/layout.tsx`.
- **Pelatihan listing**: hero freemium (ajakan coba materi gratis) → judul+subtitle halaman → FilterBar (kategori/status/sort) → grid `PelatihanCard` → CTA custom training (panel WA korporat).
- **Detail Pelatihan** (`/pelatihan/[slug]`): hero (badge kategori+status, judul, gambar) → benefit pills → Tabs (Deskripsi/Silabus, dari Tiptap Admin) → grid 3 kolom (Jadwal&Investasi dengan harga+CTA daftar, Dukungan Peserta dengan CTA WA, Peralatan Belajar) → FAQ accordion (kalau ada) → galeri carousel (kalau ada) → info sertifikat → InstrukturSection (limit 3) → suggest pelatihan lain (grid 3) → CTA tanya lanjut.
- **Katalog listing**: hero produk Autel → judul+subtitle → FilterBar (kategori/sort) → grid `ProdukCard` → CTA partai besar/konsultasi.
- **Detail Produk** (`/katalog/[slug]`): breadcrumb → grid 2 kolom (galeri kiri, info kanan: badge kategori, nama, rating bintang, deskripsi, spesifikasi, harga besar, CTA WA + Quote Dialog) → suggest produk lain (grid 3) → CTA tanya lanjut.
- **Footer** (semua halaman, dari layout): logo+tagline, Tautan (Pelatihan/Produk/Tentang Kami/FAQ/Ketentuan Layanan/Kebijakan Privasi/Syarat&Ketentuan), Kontak (WA/Instagram/email/jam operasional dari `site_settings.kontak`), copyright.
- Tombol WhatsApp floating (`floating-whatsapp.tsx`) muncul di semua halaman publik.

**Sistem token warna saat ini (`globals.css`) — PENTING, base teknisnya SUDAH shadcn, bukan token lama:**

`:root` sudah pakai token shadcn lengkap (`--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--border`, dst, format oklch) DAN masih menyisakan token lama `--warna-utama`/`--warna-aksen`/`--warna-teks`/`--warna-latar`/dst (dipetakan sebagai alias Tailwind lewat `@theme inline`, values-nya independen dari token shadcn). `--background` saat ini sudah off-white/snow (`oklch(0.985 0.002 247)`, komentar kode menyebut ini sengaja bukan putih murni) — **base off-white ini SUDAH benar, tidak perlu diubah**, cuma perlu diverifikasi tetap konsisten dipakai semua komponen. `--primary` saat ini near-black/grayscale (`oklch(0.205 0 0)`) — ini yang perlu diganti ke warna aksen baru sesuai poin di bawah.

**Temuan inkonsistensi kode yang harus diperbaiki sekalian dalam redesign ini:** `hero-section.tsx` MASIH memakai token lama (`bg-warna-latar`, `text-warna-teks`, `bg-warna-aksen`, dst), sementara `hero-carousel.tsx`, `jadwal-batch-section.tsx`, `produk-section.tsx`, `sale-banner.tsx`, dan `(public)/layout.tsx` SUDAH migrasi penuh ke token shadcn (`bg-background`, `text-foreground`, `bg-primary`, dst). Ini migrasi token yang belum tuntas dari pekerjaan sebelumnya — **redesign ini WAJIB menuntaskan migrasi itu**: `hero-section.tsx` harus ikut pindah ke token shadcn seperti komponen lain, supaya tidak ada dua sistem warna berjalan bersamaan di halaman yang sama.

**Dark mode publik:** sudah ditangani terpisah (`ForceLightDocument` di layout, provider tema terpisah untuk `(user)` dashboard) — **redesign ini TIDAK perlu menyentuh logic dark mode**, cukup pastikan tidak merusak yang sudah ada. Halaman publik memang wajib selalu light, tidak ada toggle tema di sini.

---

## Arah desain

### 1. Referensi & kombinasi

Alif memberi dua sumber referensi yang perlu DIKOMBINASIKAN, bukan dipakai salah satu saja:
- **Struktur/komposisi/pola komponen**: dari `aquafix-flow.lovable.app` — pola asimetris split hero (teks di satu sisi, visual di sisi lain), tombol pill (`rounded-full`) untuk CTA utama+sekunder, badge/kategori sebagai pill kecil, card TANPA shadow default (shadow hanya saat hover/elevated — lihat aturan anti-AI-slop di bawah), navbar minimalis.
- **Warna & tone**: BUKAN dari palet navy-gelap+lime `aquafix-flow` (itu bertentangan dengan arah premium/light yang diinginkan) — pakai palet baru di bawah, terinspirasi preset "Cobalt Mist" (biru kobalt sebagai Primary, hijau sebagai Secondary/Accent), dipadukan dengan base off-white/snow yang sudah ada di `globals.css`.

### 2. Palet warna baru (usulan, sesuaikan sedikit kalau kontras kurang — laporkan kalau ada penyesuaian)

Ganti nilai-nilai berikut di `:root` pada `globals.css` (biarkan `--background`/off-white yang sudah ada, `.dark` block TIDAK perlu diubah karena publik selalu force-light):

```css
--primary: oklch(0.47 0.16 255);        /* biru kobalt — CTA utama, link aktif, elemen hero */
--primary-foreground: oklch(0.985 0 0); /* putih di atas primary */
--secondary: oklch(0.75 0.14 155);      /* hijau — aksen sekunder, badge "Pendaftaran Dibuka" */
--secondary-foreground: oklch(0.145 0 0);
--accent: oklch(0.93 0.03 255);         /* biru sangat muda — hover state, background badge kategori */
--accent-foreground: oklch(0.47 0.16 255);
```

Sesuaikan juga token lama yang masih dipakai `hero-section.tsx` SEBELUM komponen itu dimigrasikan ke token shadcn (kalau proses migrasi bertahap, token lama tetap harus konsisten dengan warna baru ini selama transisi) — atau langsung migrasikan `hero-section.tsx` sekalian di redesign ini supaya tidak perlu menyentuh token lama sama sekali.

### 3. Tipografi

Kombinasi SERIF untuk heading (kesan editorial premium) + SANS-SERIF untuk body/UI (tetap Geist yang sudah dipakai, atau ganti ke Inter kalau Cursor menilai lebih cocok — laporkan pilihan akhir). Font serif: pilih salah satu yang tersedia via `next/font/google` (Fraunces, Playfair Display, atau Lora) — terapkan HANYA ke elemen `h1`/`h2` section (judul besar), bukan ke body text, badge, atau UI kecil (button, label form). Tambahkan sebagai CSS variable font baru (`--font-heading`) terpisah dari `--font-sans` yang sudah ada — jangan timpa `--font-sans`.

### 4. Prinsip anti "AI slop" — WAJIB diikuti sebagai aturan desain

a) **Gradient tanpa fungsi dilarang.** Satu warna aksen flat (Primary biru) untuk CTA/highlight/badge status. Gradient HANYA boleh untuk kebutuhan fungsional (contoh yang SUDAH benar: overlay gelap-ke-transparan di `hero-carousel.tsx` untuk keterbacaan teks di atas foto — itu dipertahankan, itu bukan gradient dekoratif).

b) **Satu angka hero per card/section, sisanya sekunder.** Untuk harga produk/batch, tanggal batch, rating: pilih SATU sebagai fokus visual utama (font besar+tebal), yang lain jelas lebih kecil/ringan. Contoh: di `ContentCard` (dipakai `BatchCard`/`ProdukCard`), harga jadi elemen paling menonjol pada card, bukan sama besar dengan judul.

c) **Shadow hanya untuk elemen yang benar-benar "melayang".** Card produk/batch/pelatihan: TANPA shadow default, HANYA border tipis (`border-border`) — shadow muncul saat hover. Sticky navbar: shadow HANYA saat sudah di-scroll (state `scrolled`), bukan default selalu ada. `shadow-float`/`shadow-float-hover` yang sudah ada di `globals.css` sudah mengikuti pola hover-only di beberapa tombol CTA — pertahankan pola itu, jangan tambah shadow flat ke card.

d) **Data asli membentuk visual, bukan copy generik.** Tidak ada teks filler/sapaan personalisasi kosong ala template SaaS. Tanggal batch, harga, status pendaftaran — biarkan data nyata dari database yang jadi elemen visual (sudah sebagian diterapkan, pertahankan dan perkuat, terutama di poin 4b).

### 5. Hero tiap halaman punya tema visual berbeda, tetap satu keluarga desain

- **Beranda** (`hero-section.tsx`+`hero-carousel.tsx`): tema trust/kredibilitas. Pertahankan struktur yang sudah ada (dua kartu penawaran kiri "Pelatihan"+"Jual Drone", carousel gambar kanan) — cuma redesign visual/warna/tipografi, jangan ubah struktur data (masih baca dari `hero_slides` table).
- **Pelatihan** (hero freemium di `pelatihan/page.tsx`): tema komunitas belajar — tetap sederhana (hero teks-saja, bukan carousel gambar), tapi tipografi serif untuk judul + warna baru.
- **Katalog** (hero di `katalog/page.tsx`): tema teknologi/presisi — tetap teks-saja seperti sekarang, tipografi serif + warna baru.

Ketiga hero pakai font, warna aksen, dan gaya badge/CTA yang SAMA (satu design system), meski komposisi berbeda.

### 6. Komponen & interaksi — perubahan spesifik per file

- `content-card.tsx` (dipakai `BatchCard` di beranda+listing, `ProdukCard` di beranda+listing): border tipis `border-border`, TANPA shadow default, shadow muncul saat hover, radius konsisten dengan `--radius` yang sudah ada di `globals.css`. Harga sebagai elemen hero (font besar/tebal, warna primary).
- Badge status batch (`status-badge.tsx`/`STATUS_BATCH_LABEL` di `lib/batch.ts`): tiga warna semantik jelas beda — Ditutup (netral/abu), Pendaftaran Dibuka (Secondary hijau), Akan Datang (Primary biru atau Accent biru muda) — bukan warna acak, harus pakai token yang baru ditambahkan.
- Tombol: satu style primary (solid, `bg-primary`, pill `rounded-full` mengikuti referensi aquafix untuk CTA utama) dan satu style secondary (outline/ghost, border tipis) — konsisten di semua halaman. Existing sudah pakai `rounded-lg`, redesign ini boleh ganti ke `rounded-full` untuk CTA utama supaya sesuai referensi aquafix, TAPI harus konsisten diterapkan ke SEMUA tombol CTA primary di semua halaman, bukan cuma sebagian.
- Navbar (`(public)/layout.tsx`): sticky, border-bottom tipis (sudah ada), TAMBAHKAN shadow HANYA saat halaman sudah di-scroll (butuh state client-side scroll listener, atau `sticky` + CSS scroll-based kalau memungkinkan tanpa JS tambahan).
- Filter bar (`pelatihan/filter-bar.tsx`, `katalog/filter-bar.tsx`): styling dropdown jadi pill/rounded, minimalis, bukan form berat — pertahankan fungsi filter/sort yang sudah ada, cuma redesign visual.
- Tombol WhatsApp floating (`floating-whatsapp.tsx`): redesain agar menyatu dengan palet baru (bukan hijau WhatsApp default kontras kasar) — versi monokrom mengikuti warna brand (Primary biru atau varian gelap) dengan ikon WA tetap terlihat jelas.
- FAQ accordion (`faq-accordion.tsx`): minimalis, garis pemisah tipis, ikon plus/minus sederhana, tanpa shadow.

---

## Tugas eksekusi

Ini satu prompt komprehensif untuk seluruh redesign — Alif akan menguji bertahap per halaman (Beranda dulu, baru Pelatihan+Detail, baru Katalog+Detail) sebelum commit, jadi **paparkan dulu rencana urutan pengerjaan section demi section sebelum menulis kode** (pola yang sama seperti blok-blok Fase 12.6 sebelumnya), dan **kerjakan satu halaman sampai benar dan teruji sebelum lanjut ke halaman berikutnya** — jangan digabung sekaligus dalam satu commit besar.

Urutan yang disarankan:
1. `globals.css` — update token warna (`--primary`/`--secondary`/`--accent` dst sesuai poin 2), tambah font serif baru untuk heading.
2. `hero-section.tsx` — migrasi token lama → shadcn (menuntaskan migrasi yang belum selesai), terapkan tipografi+warna baru.
3. Beranda lengkap — semua section (`SaleBanner`, `JadwalBatchSection`/`ContentCard`, `ProdukSection`, `VerifyCtaSection`, `CompanyProfileSection`, `InstrukturSection`, `TestimoniSection`, `FaqSection`) + footer + navbar — styling baru diterapkan konsisten.
4. Pelatihan listing + Detail Pelatihan — styling baru, termasuk `PelatihanCard`, `FilterBar`, tabs, benefit pills, dst.
5. Katalog listing + Detail Produk — styling baru, termasuk `ProdukCard`, `FilterBar`, galeri, quote dialog.
6. Halaman statis (Tentang Kami, FAQ, Verify, Kebijakan Privasi, dst — pakai `static-page-body.tsx`) — pastikan ikut styling baru meski kontennya sederhana.

**MOBILE FIRST WAJIB** di setiap halaman — cek 375px di setiap tahap sebelum lanjut ke bagian berikutnya.

**Yang TIDAK BOLEH diubah:**
- Copy/teks yang sudah ada di `messages/id.json`/`en.json` atau database — HANYA styling/layout yang diredesain, bukan konten.
- Jangan menambahkan dark mode/toggle tema ke halaman publik — tetap `ForceLightDocument`, selalu light.
- Jangan mengubah logic fetch data (query Supabase, struktur props antar komponen) kecuali murni untuk kebutuhan styling (misal menambah field yang memang sudah di-select tapi belum dipakai).
- Jangan menyentuh halaman Admin, Auth (`(auth)`), Kelas (`(kelas)`), atau Dashboard User (`(user)`) — scope murni `(public)` route group.
- **F04.3 (harga tersembunyi) WAJIB tetap terjaga** — redesign Katalog menyentuh langsung halaman yang query `products_public` (bukan `products`), verifikasi ulang lewat Network tab bahwa redesign TIDAK membocorkan field harga di response API untuk produk yang harganya disembunyikan.

---

## Verifikasi akhir (sebelum lapor selesai)

1. `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` — tidak ada error baru.
2. Semua halaman publik (Beranda, Pelatihan listing+detail, Katalog listing+detail, halaman statis) pakai token warna baru secara konsisten — tidak ada sisa token lama (`--warna-*`) yang ketinggalan di komponen manapun.
3. Buka di 375px — semua halaman nyaman dipakai, tidak ada scroll horizontal.
4. Buka Incognito baru dengan preferensi sistem Dark — semua halaman publik tetap light (regresi dark-mode-bocor tidak boleh muncul lagi).
5. **WAJIB**: DevTools Network tab di halaman Katalog sebagai user yang belum berhak lihat harga → response API TIDAK mengandung field harga (F04.3 tidak regresi).
6. Card produk/batch: shadow HANYA muncul saat hover, tidak ada shadow default. Navbar: shadow HANYA saat sudah di-scroll.
7. Badge status batch pakai 3 warna semantik jelas berbeda sesuai token baru.
8. Laporkan: (a) font serif final yang dipakai, (b) apakah nilai warna primary/secondary/accent yang diusulkan perlu disesuaikan untuk kontras aksesibilitas (4.5:1 minimum, terutama teks di atas Primary/Secondary), (c) konfirmasi `hero-section.tsx` sudah migrasi penuh ke token shadcn.
