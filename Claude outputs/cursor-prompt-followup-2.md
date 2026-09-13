# Prompt Cursor — Perbaikan Dark Mode, Hero Gradient, Bendera SVG, Drag Urutan Produk (2026-09-13, lanjutan #2)

Tempel prompt di bawah ini ke Cursor persis seperti apa adanya (didahului template pemanggilan `@file` standar kita).

---

## Rujukan file (`@`)

```
@src/app/[locale]/layout.tsx
@src/app/[locale]/(public)/layout.tsx
@src/app/[locale]/(auth)/layout.tsx
@src/app/[locale]/(kelas)/layout.tsx
@src/app/[locale]/(user)/layout.tsx
@src/app/admin/layout.tsx
@src/components/shell/theme-provider.tsx
@src/app/globals.css
@src/components/hero-carousel.tsx
@src/components/hero-section.tsx
@src/components/language-switcher.tsx
@src/components/public-nav-mobile.tsx
@src/app/admin/(protected)/produk/produk-table.tsx
@src/app/admin/(protected)/produk/produk-row-actions.tsx
@src/app/admin/(protected)/produk/actions.ts
@src/app/admin/(protected)/produk/page.tsx
@src/app/admin/(protected)/konten/hero-slide-list.tsx
@src/app/admin/(protected)/konten/hero-slide-actions.ts
@src/lib/reorder.ts
@src/components/admin/reorder-buttons.tsx
@src/components/data-table.tsx
package.json
```

## Konteks

Saya sudah investigasi langsung ke kode sebelum menulis prompt ini (bukan tebakan). Beberapa temuan penting yang mengubah cara mengerjakan poin-poin di bawah — baca dulu sebelum eksekusi.

---

## Temuan kode yang sudah diverifikasi

**Poin dark mode publik — root cause KENAPA 3x perbaikan sebelumnya gagal:**

`src/components/shell/theme-provider.tsx` adalah wrapper tipis `next-themes` dengan `attribute="class"`. `src/app/[locale]/layout.tsx` (root layout) membungkus **SELURUH** children — `(public)`, `(auth)`, `(kelas)`, DAN `(user)` — dengan SATU `<ThemeProvider>` TANPA `forcedTheme` (`defaultTheme="system"`, `enableSystem={true}`). Percobaan perbaikan sebelumnya menambahkan `<ThemeProvider forcedTheme="light">` yang DI-NESTED di dalam `(public)/layout.tsx`, `(auth)/layout.tsx`, `(kelas)/layout.tsx` — ini **tidak bisa berhasil secara struktural**: `next-themes` menaruh script inline + `class="dark"`/`class="light"` langsung ke elemen `<html>` dari provider PALING LUAR yang mount duluan (di root layout, dekat `<body>`). Provider yang di-nest di dalamnya cuma menyediakan context `useTheme()` versi lokal ke komponen di bawahnya — TIDAK menulis ulang `class` di `<html>` yang sudah lebih dulu diatur provider luar. Makanya di Chrome baru/Incognito dengan preferensi sistem gelap, `<html>` tetap dapat `class="dark"` dari provider root, terlepas dari provider `forcedTheme="light"` apapun yang ditumpuk di dalamnya.

Bukti di kode: `(public)/layout.tsx`, `(auth)/layout.tsx`, `(kelas)/layout.tsx` SUDAH punya `<ThemeProvider forcedTheme="light">` nested — App Router memang mengizinkan menulisnya, tapi secara runtime ini efeknya nol untuk `<html>` karena providernya bersarang di dalam provider root yang sudah menyalakan dark mode duluan. `(user)/layout.tsx` TIDAK punya `ThemeProvider` sendiri sama sekali — dia ikut provider dark-mode-able dari root, itu sudah benar (User memang boleh dark mode). Admin (`src/app/admin/layout.tsx`) sudah benar sejak awal karena py structural yang beda total: dia punya root `<html>` SENDIRI, terpisah dari `[locale]/layout.tsx` — bukan nested provider, tapi root yang benar-benar independen.

**Kesimpulan perbaikan yang benar:** root `[locale]/layout.tsx` TIDAK BOLEH lagi jadi satu-satunya provider dark-mode-able untuk semua route group. Provider yang boleh punya `enableSystem`/dark mode nyata HANYA boleh ada di `(user)/layout.tsx` (dan Admin, yang sudah terpisah). Root `[locale]/layout.tsx` sendiri harus selalu light (tidak usah `ThemeProvider` dark-mode-able sama sekali di situ), dan provider `forcedTheme="light"` yang sudah ditambahkan ke `(public)`/`(auth)`/`(kelas)` boleh dihapus karena jadi tidak perlu lagi kalau akar masalahnya sudah dibenahi di root.

**Warna latar publik:** `globals.css` baris 100: `--warna-latar: #FFFFFF` — putih murni, ini yang membuat "putihnya kurang halus" seperti dikeluhkan.

**Toggle bahasa:** disetujui, ganti dari emoji flag (`🇮🇩`/`🇬🇧` di `language-switcher.tsx`) ke SVG flag kecil — sudah dikonfirmasi kode selama ini benar, cuma render emoji flag di Windows Chrome sering jadi kode huruf "ID"/"GB", bukan gambar bendera.

**Drag urutan Produk:** Codebase SUDAH punya pola reorder universal yang established (dipakai di Hero Slide, kemungkinan juga Popup/Banner/Instruktur/Testimoni) — bukan drag-and-drop, tapi **tombol naik/turun** (`ReorderButtons` dari `@/components/admin/reorder-buttons`, helper `moveItem` dari `@/lib/reorder`, dan action `reorderXxxAction` yang mengirim array id urutan baru ke server). `ProdukTable` saat ini justru BELUM pakai pola ini sama sekali — dia pakai `DataTable` generik (TanStack Table, sortable/filterable/pagination), kolom `urutan` cuma ditampilkan+bisa di-sort klik header, tidak bisa diubah manual. Tidak ada `reorderProdukAction` di `actions.ts`.

---

## Tugas

### 1. Perbaiki akar masalah dark mode publik (bukan tambal lagi)

- `src/app/[locale]/layout.tsx`: hapus `<ThemeProvider>` yang membungkus `{children}` di situ — ganti dengan render langsung tanpa provider dark-mode-able (children langsung, atau kalau `Toaster`/struktur lain butuh dibungkus sesuatu, pakai `<>...</>` fragment, BUKAN `ThemeProvider` yang `enableSystem`). Efeknya: root layout jadi selalu-light secara default, tidak ada script `next-themes` yang menyalakan dark class di `<html>` untuk siapapun kecuali yang eksplisit membungkus dirinya sendiri.
- `src/app/[locale]/(user)/layout.tsx`: TAMBAHKAN `<ThemeProvider>` (TANPA `forcedTheme`, biarkan `enableSystem` aktif) membungkus `<DashboardUserShell>` di situ — supaya toggle dark/light/system User tetap berfungsi persis seperti sekarang, hanya providernya dipindah ke sini.
- `src/app/[locale]/(public)/layout.tsx`, `(auth)/layout.tsx`, `(kelas)/layout.tsx`: HAPUS `<ThemeProvider forcedTheme="light">` yang membungkus children di ketiga file ini (sudah tidak diperlukan lagi setelah root tidak lagi dark-mode-able secara default) — biarkan children dirender langsung tanpa provider tema apapun.
- Pastikan `suppressHydrationWarning` tetap ada di elemen `<html>` `[locale]/layout.tsx` (sudah ada, jangan dihapus) — tetap dibutuhkan karena `(user)` tetap punya dark-mode client-side.
- **Verifikasi krusial**: buka halaman publik (`/`, `/pelatihan`, `/katalog`, `/login`, `/daftar`, `/lupa-sandi`) di jendela Incognito BARU dengan preferensi sistem OS/browser di-set ke Dark — pastikan SEMUA tetap tampil light, tidak ada elemen yang jadi gelap sama sekali. Lalu buka `/dashboard` (User) di jendela yang sama — pastikan toggle dark/light/system di situ MASIH berfungsi normal seperti sebelumnya.

### 2. Warna latar publik — off-white/snow

Ganti `--warna-latar` di `globals.css` dari `#FFFFFF` ke off-white yang lebih lembut, contoh `#FAFAF9` atau `#FBFAF8` (snow/off-white hangat, bukan abu-abu dingin) — silakan sesuaikan sedikit kalau ada pertimbangan kontras terhadap `--warna-teks`/`--warna-utama` yang sudah ada, tapi jangan sampai jadi terlihat abu-abu kotor. Ini HANYA berlaku untuk halaman yang pakai token `--warna-*` (semua halaman publik/auth/kelas) — jangan sentuh token shadcn Neutral (`--background` dst.) yang dipakai Admin/User dashboard.

### 3. Toggle bahasa — ganti ke SVG flag kecil

Di `src/components/language-switcher.tsx`:
- Ganti `BENDERA` dari emoji (`🇮🇩`/`🇬🇧`) jadi elemen `<svg>` inline kecil (ukuran ~20×15px, rounded corner tipis) untuk bendera Indonesia (merah-putih) dan Inggris/UK (Union Jack, karena kode Indonesia untuk locale `en` di project ini memang direpresentasikan dengan flag Inggris) — bisa pakai path SVG bendera sederhana (dua-warna solid untuk Indonesia sudah cukup, sudah representatif) supaya render konsisten di semua device/browser tanpa bergantung font emoji sistem.
- Terapkan di trigger DAN di setiap `DropdownMenuItem` (baris tempat `BENDERA[locale]`/`BENDERA.id`/`BENDERA.en` dipakai sekarang).
- Tidak perlu ubah apapun di `public-nav-mobile.tsx` — komponen itu cuma render `<LanguageSwitcher />`, otomatis ikut berubah.

### 4. Hero banner — gradasi gelap ke transparan dari bawah ke atas pada gambar

Di `src/components/hero-carousel.tsx` (komponen yang render gambar slide hero):
- Tambahkan overlay gradient di atas gambar tiap slide: gelap (misal `black/60` atau `black/70`) di bagian BAWAH gambar, transparan penuh di bagian ATAS — arah dari bawah ke atas (`bg-gradient-to-t from-black/70 via-black/20 to-transparent` atau nilai serupa, sesuaikan dengan struktur JSX yang ada sekarang).
- Tujuannya supaya teks (judul/subjudul slide, kalau ada yang di-overlay di atas gambar) lebih terbaca terhadap gambar terang di baliknya — cek dulu di kode apakah teks judul/subjudul memang dirender DI ATAS gambar (overlay) atau terpisah di luar gambar; kalau ternyata terpisah (bukan overlay), gradient tetap ditambahkan untuk estetika/kedalaman visual gambar itu sendiri, tapi beri tahu saya kalau strukturnya ternyata beda dari yang saya kira supaya saya tahu apakah pengait teksnya perlu disesuaikan juga.
- Pastikan overlay tidak menghalangi tombol navigasi carousel (panah kiri/kanan) yang sudah ada — z-index/pointer-events overlay harus tidak mengganggu interaksi.

### 5. Urutan Produk bisa diubah manual — pakai pola reorder yang sudah established (bukan drag-and-drop baru)

**Catatan sebelum eksekusi**: Alif minta "drag and drop (geser)", tapi codebase ini sudah punya pola reorder universal yang konsisten dipakai di banyak tempat (Hero Slide, dan kemungkinan Popup/Banner/Instruktur/Testimoni — cek juga apakah keempatnya benar pakai pola sama) yaitu **tombol naik/turun**, BUKAN drag pointer. Menambah library drag-and-drop baru (misal `@dnd-kit`, belum ada di `package.json`) hanya untuk satu tabel Produk akan bikin dua pola UX interaksi berbeda untuk hal yang sama di Admin (sebagian pakai tombol, satu-satunya pakai drag). **Rekomendasi saya: pakai pola tombol naik/turun yang sama seperti Hero Slide**, supaya konsisten dan tidak menambah dependency baru. Kalau Alif tetap ingin drag pointer sungguhan (geser dengan mouse/jari), beri tahu saya dulu sebelum Cursor pasang library baru — investasi konsistensi vs. permintaan literal "drag n drop" ini keputusan produk kecil yang lebih baik dikonfirmasi daripada saya putuskan sepihak.

**Kalau Alif setuju pola tombol (asumsi default untuk eksekusi sekarang):**
- Ubah `ProdukTable` (`src/app/admin/(protected)/produk/produk-table.tsx`) dari pakai `DataTable` generik menjadi struktur tabel manual mirip `HeroSlideList` — kolom "Urutan" diisi `ReorderButtons`, state lokal `daftar` di-sync dari prop `produk` via `useEffect`, fungsi `pindah(index, arah)` pakai `moveItem` dari `@/lib/reorder`.
- **PENTING**: pertahankan fitur search (`searchColumnId="nama_id"`) yang sudah ada di `ProdukTable` saat ini — kalau perlu, gunakan filter manual sederhana di atas array `daftar` (bukan lewat TanStack Table) supaya reorder dan search tetap bisa jalan bersamaan tanpa konflik. Kalau field kategori/harga/aktif yang sekarang jadi kolom `DataTable` mau dipertahankan juga, tetap render sebagai kolom tabel manual seperti pola `HeroSlideList`.
- Tambahkan `reorderProdukAction(ids: number[])` baru di `src/app/admin/(protected)/produk/actions.ts`, isi logic sama seperti `reorderHeroSlideAction` (cek dulu isinya di `hero-slide-actions.ts` untuk menyamakan pola: biasanya loop `update` per id dengan `urutan` baru sesuai index array, dibungkus `requireAdmin()` di awal, `revalidatePath` di akhir).
- Verifikasi: buka `/admin/produk`, pastikan tombol naik/turun berfungsi, urutan tersimpan setelah refresh, dan search tetap bisa dipakai bersamaan.

---

## Verifikasi akhir (jalankan semua sebelum lapor selesai)

1. `pnpm lint` dan `pnpm build` — pastikan tidak ada error baru.
2. Buka halaman publik di Incognito baru, preferensi sistem Dark — pastikan SEMUA halaman publik/auth (termasuk beranda, pelatihan, katalog, login, daftar, lupa sandi) tetap light dengan warna latar off-white baru, TIDAK ada elemen gelap sama sekali.
3. Buka `/dashboard` (User) — pastikan toggle dark/light/system masih berfungsi seperti sebelumnya (regresi paling penting untuk dicek, karena provider dipindah).
4. Buka `/admin` — pastikan toggle dark/light/system Admin tidak terpengaruh perubahan ini sama sekali (sudah terpisah dari awal, tapi tetap perlu dicek tidak ada regresi tidak sengaja).
5. Cek toggle bahasa di halaman publik (desktop & mobile) — pastikan bendera SVG tampil sebagai gambar bendera nyata, bukan kode huruf, dan klik berfungsi ganti locale.
6. Cek hero banner di beranda — gradient gelap-ke-transparan dari bawah terlihat di gambar slide, tombol panah kiri/kanan carousel tetap bisa diklik normal.
7. Cek `/admin/produk` — reorder tombol naik/turun berfungsi, urutan tersimpan ke database, search tetap jalan.
8. Laporkan balik: (a) nilai hex off-white final yang dipakai, (b) konfirmasi provider `ThemeProvider` sekarang cuma ada di root Admin + `(user)/layout.tsx` (tidak ada lagi di root `[locale]/layout.tsx` maupun nested di `(public)`/`(auth)`/`(kelas)`), (c) apakah struktur teks-di-atas-gambar hero sesuai asumsi saya di poin 4 atau beda, (d) konfirmasi keputusan pola reorder Produk (tombol, sesuai rekomendasi, atau ternyata drag sungguhan diminta ulang).
