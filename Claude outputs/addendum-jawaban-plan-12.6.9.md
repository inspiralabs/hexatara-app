# Jawaban untuk plan.md §12.6.9 — tempel ke Cursor

Ini balasan atas `plan.md` yang kamu buat. Jawaban di bawah untuk 4 poin yang kamu tanyakan, plus satu klarifikasi tambahan (hero background) yang tidak eksplisit di prompt awal. Baca semua sebelum mulai Tahap 0.

---

## 1. Skema scoping warna: **1A — `data-surface="public"` scoped override** (dikonfirmasi, bukan default kamu yang dipakai begitu saja — ini keputusan sadar)

Alasan: `:root` di `globals.css` dipakai bersama oleh Admin, Dashboard User, Auth, dan Publik. Kalau `--primary`/`--secondary`/`--accent` diedit langsung di `:root`, otomatis bocor ke Admin dan Dashboard User — itu melanggar aturan tetap di header prompt awal ("Admin dan Dashboard User TETAP token Neutral yang sudah ada, JANGAN ikut diubah"). Pendekatan `data-surface="public"` yang scoped lewat atribut di `(public)/layout.tsx` adalah satu-satunya cara yang benar-benar mengisolasi palet baru ke halaman publik saja tanpa menyentuh token yang dipakai surface lain.

Implementasi: taruh atribut `data-surface="public"` di elemen pembungkus teratas pada `(public)/layout.tsx` (atau langsung di `<body>` kalau `(public)/layout.tsx` bukan pemilik `<body>` — cek dulu, karena root `[locale]/layout.tsx` yang pegang `<html>`/`<body>`). Override token pakai selector `[data-surface="public"] { --primary: ...; --secondary: ...; --accent: ...; }` di `globals.css`, BUKAN redefinisi `:root`. Pastikan komponen publik (`hero-section.tsx`, `sale-banner.tsx`, `produk-section.tsx`, `jadwal-batch-section.tsx`, dll) semua ada di dalam elemen yang membawa atribut ini.

## 2. Modifikasi komponen shared (`ContentCard`, `StatusBadge`, dll): **2A — buat varian khusus publik, JANGAN ubah komponen shared langsung**

Alasan: `ContentCard` dan `StatusBadge` dipakai juga oleh Dashboard User (`(user)`). Kalau propnya/stylingnya diubah langsung, risiko regresi visual di Dashboard User yang sudah selesai (§12.6.8, DONE, F06.17) — padahal blok ini scope-nya cuma publik. Kalau `ContentCard` butuh varian visual baru untuk publik (misal border-radius lebih besar, shadow berbeda, padding berbeda), tambahkan lewat prop varian (misal `variant="public"` atau terima `className` override dari pemanggil) alih-alih mengubah default styling komponennya. Kalau ternyata butuh perubahan struktural besar yang tidak masuk akal sebagai prop varian, berhenti dan tanya saya dulu sebelum bikin komponen duplikat baru dari nol.

## 3. Font serif: **Fraunces**

Dipakai untuk heading di halaman publik saja (bukan Admin/Dashboard User). Import via `next/font/google`, sesuai batasan di header prompt awal (tidak butuh izin dependency baru karena built-in Next.js).

## 4. CTA `rounded-full` (pill-shaped): **hanya untuk halaman publik, BUKAN global**

Jangan ubah `src/components/ui/button.tsx` (dipakai lintas surface). Terapkan `rounded-full` sebagai override class di level pemanggilan komponen untuk konteks publik saja (CTA di hero, kartu produk/batch, sale banner, dll) — pola yang sama seperti keputusan poin 2 di atas: styling publik ditambahkan lewat class/prop tambahan di titik pemakaian, bukan mengubah default komponen shared.

---

## Klarifikasi tambahan: "hero background"

Yang saya maksud "hero background" adalah band/area datar di BELAKANG konten hero (teks + carousel) — bukan gambar carousel itu sendiri, bukan kartu. Ini warna latar polos yang terlihat di strip atas halaman Beranda, Pelatihan, dan Katalog.

Saya sudah cek kode: `hero-section.tsx` saat ini adalah `<section className="mx-auto max-w-6xl px-4 py-16 md:py-24">` — TIDAK punya class `bg-*` sendiri sama sekali. Jadi warna yang terlihat di belakangnya murni warisan dari `--background` yang di-set di level `(public)/layout.tsx`/`<body>`, bukan sesuatu yang dimiliki komponen hero. Ini konsisten dengan prinsip di prompt awal (off-white/snow sebagai `--background` global halaman publik) — jadi SECARA WARNA sudah benar arahnya, tidak perlu warna baru khusus untuk hero.

Yang PERLU diperhatikan saat Tahap 1 (Beranda) mengerjakan hero:
- `hero-section.tsx` masih pakai token LEGACY (`bg-warna-latar`, `text-warna-teks`, `text-warna-teks-2`, `border-warna-latar-2`, `text-warna-utama`, `bg-warna-aksen`) — BELUM dimigrasikan ke token shadcn (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`, `bg-primary`) yang sudah dipakai di `hero-carousel.tsx`, `sale-banner.tsx`, `produk-section.tsx`, `jadwal-batch-section.tsx` di sekitarnya. Migrasi token ini WAJIB dilakukan di Tahap 1, supaya hero konsisten dengan komponen lain dan supaya `data-surface="public"` override di poin 1 di atas benar-benar berlaku (kalau masih pakai token legacy `--warna-*`, override token shadcn baru tidak akan kena ke hero).
- Section-level `<section>` boleh diberi `bg-background` eksplisit (bukan cuma mengandalkan warisan dari `<body>`) supaya jelas dan predictable — sekalian pastikan tidak ada override warna lain yang tidak sengaja menimpa di antara `<body>` dan `<section>`.
- Dua kartu penawaran (`GraduationCap`/`ShoppingBag`) di dalam hero pakai `bg-warna-latar` juga (background kartu, BUKAN background section) — ini beda elemen, migrasikan ke `bg-card` atau `bg-background` (sesuaikan kontras terhadap section di belakangnya) sebagai bagian dari migrasi token yang sama, bukan bagian terpisah.

Singkatnya: tidak ada warna baru yang perlu diputuskan untuk hero background — cukup pastikan `hero-section.tsx` ikut migrasi ke token shadcn + `data-surface="public"` scoping di Tahap 1, supaya section itu benar-benar ambil warna dari sistem token baru, bukan token lama yang terpisah.

---

Silakan mulai Tahap 0 (Fondasi) sesuai urutan yang sudah kamu susun di plan.md.
