---
version: alpha
name: Hexatara-design-reference
description: "Referensi gabungan untuk Design System v2 Hexatara — DIRAKIT dari 4 DESIGN.md (Linear, Cal.com, Mintlify, Vercel), diseleksi dan disesuaikan penuh dengan brief resmi Hexatara (design-system-v2.md). INI BUKAN palet warna baru: --warna-utama (#1E40AF) dan --warna-aksen (#F59E0B) WAJIB tetap dipakai persis seperti di design-system-v2.md. File ini murni referensi struktur — skala radius, ritme spacing, disiplin shadow-hanya-mengambang, hierarki tipografi angka-sebagai-hero, dan batas komponen — bukan sumber warna."

sumber:
  - linear_DESIGN.md — struktur elevasi tanpa shadow berat (surface ladder), disiplin satu warna aksen, tracking huruf negatif pada display besar
  - cal_DESIGN.md — skala shadow lembut bertingkat untuk kartu mengambang, radius hierarkis, ritme spacing 96px antar section
  - mintlify_DESIGN.md — kepadatan tipografi untuk halaman baca panjang (cocok untuk materi/LMS), disiplin radius yang konsisten
  - vercel_DESIGN.md — filosofi shadow bertumpuk lembut (bukan drop-shadow tunggal berat), skala radius per-konteks (tombol vs kartu vs input)

colors:
  # SUMBER KEBENARAN: design-system-v2.md. TIDAK BOLEH diubah oleh referensi ini.
  warna-utama: "#1E40AF"
  warna-aksen: "#F59E0B"
  warna-aksen-hover: "#D97706"
  warna-sukses: "#059669"
  warna-bahaya: "#DC2626"
  warna-teks: "#111827"
  warna-teks-2: "#4B5563"
  warna-latar: "#FFFFFF"
  warna-latar-2: "#F9FAFB"
  # Catatan: keempat DESIGN.md sumber punya palet sendiri (lavender Linear,
  # hitam Cal.com, mint Mintlify, mesh-gradient Vercel) — SEMUA diabaikan.
  # Hanya struktur/rasio yang diambil, bukan hex value warnanya.

typography:
  # Ukuran mengikuti pola "angka sebagai hero" design-system-v2.md —
  # skala diambil dari rasio Linear/Cal.com/Mintlify, disesuaikan agar
  # angka statistik/harga bisa tampil signifikan lebih besar dari teks sekitar.
  angka-hero:
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.5px
    catatan: "Dipakai untuk harga produk, jumlah peserta, rating angka. TANPA ikon dekoratif di sampingnya (larangan eksplisit design-system-v2.md)."
  display-lg:
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -1px
  display-md:
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.5px
  headline:
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0
  title:
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    catatan: "Untuk halaman materi/LMS (§12.5.3), pakai line-height 1.5+ mengikuti pola Mintlify — dirancang untuk bacaan panjang, jangan dipadatkan."
  body-sm:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
  button:
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.0

rounded:
  # Skala radius hierarkis — pola konsisten di keempat sumber:
  # radius kecil untuk kontrol interaktif kecil, radius besar untuk kartu.
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px
  full: 9999px
  catatan: "md (8px) untuk tombol/input, lg (12px) untuk card konten, xl (16px) HANYA untuk kartu besar (hero mockup/gallery). Jangan lompat level tanpa alasan — pola dari cal_DESIGN.md dan mintlify_DESIGN.md."

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px
  catatan: "Ritme 96px antar section (dari cal_DESIGN.md) — cukup lapang untuk kesan premium tapi tidak berlebihan seperti Vercel (192px)."

elevation:
  # INI BAGIAN PALING PENTING — pola shadow-hanya-mengambang design-system-v2.md
  # paling dekat dengan filosofi Linear (surface ladder, TANPA shadow di
  # section/header) dikombinasi dengan resep shadow lembut Cal.com/Vercel
  # untuk elemen yang MEMANG mengambang (card, dropdown, modal, popup).
  flat:
    treatment: "TIDAK ADA shadow, TIDAK ADA border dekoratif"
    dipakai-pada: "header/navbar, section wrapper, tabel biasa, tombol (pola Linear: section besar tetap datar)"
  mengambang-default:
    treatment: "var(--shadow-float): 0 1px 3px rgba(17,24,39,0.08), 0 1px 2px rgba(17,24,39,0.04)"
    dipakai-pada: "card batch/produk/materi, dropdown menu, modal/dialog, popup — persis sesuai design-system-v2.md"
    catatan: "Resep shadow ini SUDAH ditetapkan di design-system-v2.md, JANGAN diganti dengan shadow dari DESIGN.md manapun. Filosofi 'shadow lembut bertumpuk, bukan drop-shadow tunggal berat' dari vercel_DESIGN.md dan cal_DESIGN.md dipakai sebagai justifikasi resep ini, bukan sebagai resep baru."
  mengambang-hover:
    treatment: "var(--shadow-float-hover): 0 4px 12px rgba(17,24,39,0.10), 0 2px 4px rgba(17,24,39,0.06)"
    dipakai-pada: "state hover pada card yang mengambang, transform translateY(-2px) bersamaan"

komponen-referensi:
  # Bukan daftar komponen final Hexatara (itu sudah ada di design-system-v2.md
  # bagian Reusability — ContentCard, StatusBadge, StarRating, ImageUploadField,
  # DataTable). Ini catatan pola STRUKTURAL yang layak dicontoh dari sumber.
  card-konten:
    pola-diambil: "Disiplin satu bentuk kartu per fungsi (cal_DESIGN.md membedakan feature-card vs product-mockup-card vs testimonial-card by BACKGROUND bukan by shape) — terapkan ke ContentCard Hexatara: satu komponen, beda hanya lewat props (varian warna badge/status), BUKAN beda shape/radius per konteks pemakaian (batch/produk/materi)."
    radius: "{rounded.lg} 12px, konsisten di semua varian ContentCard"
  hierarki-tombol:
    pola-diambil: "Linear dan Vercel sama-sama disiplin: HANYA SATU warna aksen untuk CTA primer di satu layar, tombol sekunder pakai outline/border netral, tidak pernah dua warna aksen bersaing. Ini PERSIS aturan 'one primary three secondary' design-system-v2.md — 3 tombol sekunder harus SAMA bobot visualnya satu sama lain (border/outline style, warna teks netral), bukan salah satu dibuat lebih menonjol."
    larangan: "JANGAN pakai badge-pastel warna-warni seperti cal_DESIGN.md (orange/pink/violet/emerald) untuk CTA — itu melanggar aturan satu-warna-aksen-flat Hexatara. Badge status Hexatara (StatusBadge) tetap pakai palet semantik sendiri (hijau=dibuka, dst) sesuai design-system-v2.md, bukan palet dekoratif dari sumber manapun."
  tipografi-angka:
    pola-diambil: "linear_DESIGN.md dan vercel_DESIGN.md sama-sama menahan display weight di 600 (tidak pernah 700+) untuk headline biasa — TAPI design-system-v2.md eksplisit minta angka statistik/harga di weight 700 SEBAGAI HERO. Jadi: headline halaman tetap 600, angka statistik/harga naik ke 700 sebagai pengecualian yang disengaja, bukan inkonsistensi."
  halaman-materi-lms:
    pola-diambil: "mintlify_DESIGN.md body-md 16px/line-height 1.5 dirancang khusus untuk dokumentasi panjang — pola ini paling relevan untuk halaman baca bab materi (§12.5.3), BUKAN untuk card ringkas di listing (Pelatihan/Produk) yang tetap pakai body-sm 14px."
  navbar-admin-collapsible:
    pola-diambil: "mintlify_DESIGN.md sidebar-nav-item + sidebar-nav-item-active (background {colors.surface} saat aktif, transparan saat tidak) — pola sederhana ini cocok untuk navbar Admin dua-level collapsible (§12.5.10/ADR-017), state aktif cukup lewat background, tanpa border tebal atau ikon berlebihan."

animasi-hover:
  # design-system-v2.md sudah fix transition-hover: 200ms cubic-bezier(0.4,0,0.2,1)
  # Referensi dari sumber: SEMUA 4 DESIGN.md sepakat "jangan dokumentasikan hover
  # berlebihan" — cal_DESIGN.md eksplisit "Don't add hover state styling beyond
  # what the system already encodes". Ini menguatkan aturan Hexatara: hover halus
  # (warna/shadow berubah), TIDAK ADA scale/bounce, TIDAK ADA animasi otomatis.
  konfirmasi: "Keempat sumber konsisten pada prinsip ini — tidak ada satu pun yang perlu ditiru resepnya secara spesifik karena design-system-v2.md sudah lebih ketat (elegan, bukan playful) dibanding standar SaaS umum di keempat sumber."

zero-ai-slop:
  catatan: "Tidak ada satu pun dari 4 DESIGN.md sumber yang relevan untuk aturan ini — larangan em dash, frasa generik AI, bullet berlebihan di copy publik adalah aturan konten Hexatara sendiri (design-system-v2.md), tidak diturunkan dari referensi visual manapun. Tetap berlaku penuh, tidak terpengaruh file ini."
---

## Cara pakai file ini

File ini BUKAN pengganti `design-system-v2.md` — itu tetap sumber kebenaran tunggal untuk warna, aturan shadow, tipografi angka-hero, dan larangan zero-AI-slop. File ini adalah **lapisan referensi struktural kedua**, dirakit dari 4 `DESIGN.md` (`linear_DESIGN.md`, `cal_DESIGN.md`, `mintlify_DESIGN.md`, `vercel_DESIGN.md`) yang sudah dipilih sebelumnya karena gayanya paling dekat dengan filosofi minimalist/premium Hexatara.

Saat menjalankan blok prompt `§12.5.1 Design system v2` dan blok-blok redesign halaman berikutnya (`§12.5.6`–`§12.5.8`, `§12.5.14`), lampirkan file ini BERSAMA `design-system-v2.md` sebagai referensi rasa struktural, dengan instruksi eksplisit ke Claude Code:

> "Gunakan `hexatara_DESIGN.md` sebagai referensi struktur (radius, spacing, elevasi, disiplin komponen) SAJA. Semua warna WAJIB tetap dari `design-system-v2.md` (`--warna-utama`, `--warna-aksen`, dst) — JANGAN pernah pakai warna dari file referensi manapun."

## Ringkasan seleksi: apa yang diambil, apa yang dibuang

Empat `DESIGN.md` sumber punya identitas warna dan mood yang sangat berbeda dari brief Hexatara (Linear gelap-lavender, Cal.com hitam-monokrom, Mintlify hijau-mint dengan hero gradient langit, Vercel hitam-putih dengan mesh gradient warna-warni sebagai dekorasi utama). Karena Hexatara eksplisit meminta **tema putih, satu warna aksen flat tanpa gradient**, seleksi berikut HANYA mengambil pola struktural yang independen dari warna:

| Aspek | Diambil dari | Alasan |
|---|---|---|
| Skala radius (sm/md/lg/xl hierarkis) | Cal.com + Mintlify | Kedua sumber punya disiplin radius yang sama: kecil untuk kontrol, besar untuk kartu — konsisten dengan kebutuhan Hexatara |
| Filosofi elevasi "shadow hanya yang perlu" | Linear (surface ladder tanpa shadow di section besar) | Paling dekat dengan aturan eksplisit design-system-v2.md: section/header TIDAK ada shadow |
| Resep shadow lembut bertumpuk (bukan drop-shadow tunggal) | Vercel + Cal.com | Menguatkan (bukan mengganti) resep `--shadow-float` yang sudah ditetapkan Hexatara |
| Ritme spacing antar section (~96px) | Cal.com | Vercel terlalu lapang (192px) untuk skala produk Hexatara; Cal.com pas untuk "premium tapi tidak mewah berlebihan" |
| Kepadatan tipografi halaman baca panjang | Mintlify | Relevan khusus untuk halaman materi/LMS §12.5.3, bukan untuk card listing |
| Disiplin satu-warna-aksen di CTA | Linear + Vercel | Keduanya sangat ketat: satu warna aksen, tombol sekunder netral — cocok dengan aturan "one primary three secondary" |

**Yang SENGAJA dibuang dari keempatnya:** semua nilai warna mentah (hex lavender/hitam/mint/mesh-gradient), gaya dark-mode-only Linear, hero gradient atmosferik Mintlify dan Vercel (Hexatara TIDAK pakai gradient sama sekali sesuai larangan eksplisit), badge pastel warna-warni Cal.com, dan tracking huruf yang terlalu agresif (Linear -3px di display-xl) karena Hexatara memprioritaskan keterbacaan angka-sebagai-hero, bukan gaya editorial ekstrem.

## Catatan untuk sesi implementasi berikutnya

Kalau nanti menemukan kebutuhan pola struktural baru yang belum tercakup di sini (misalnya pola tabel data untuk DataTable admin §12.5.11, atau pola empty-state), boleh dirujuk balik ke `mintlify_DESIGN.md` (bagian `property-row`, `feature-comparison-table`) atau `vercel_DESIGN.md` (bagian `ex-data-table-cell`, `ex-empty-state-card`) — keduanya punya dokumentasi pola itu yang independen dari warna dan bisa diadaptasi dengan cara yang sama seperti file ini: ambil strukturnya, buang warnanya, ganti dengan token Hexatara.
