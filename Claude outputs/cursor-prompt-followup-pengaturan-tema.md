# Prompt Cursor — Lanjutan Pengaturan, Tema, Bahasa, Dropdown Akun (2026-09-13)

Tempel prompt di bawah ini ke Cursor persis seperti apa adanya (didahului template pemanggilan `@file` standar kita).

---

## Rujukan file (`@`)

```
@PRD.md
@ENGINEERING.md
@PANDUAN.md
@src/app/[locale]/layout.tsx
@src/app/admin/layout.tsx
@src/app/[locale]/(public)/layout.tsx
@src/app/globals.css
@src/lib/site-settings.ts
@src/lib/validations/pengaturan-admin.ts
@src/app/admin/(protected)/pengaturan/page.tsx
@src/app/admin/(protected)/pengaturan/pengaturan-forms.tsx
@src/app/admin/(protected)/pengaturan/actions.ts
@src/components/shell/admin-shell.tsx
@src/components/ui/dropdown-menu.tsx
@src/components/language-switcher.tsx
@src/components/public-nav-mobile.tsx
@messages/id.json
@messages/en.json
```

## Konteks

Ini kelanjutan langsung dari prompt Pengaturan sebelumnya (sudah dijalankan — `rekening`, `kontak` (wa/email/instagram), `admin_notify_email`, dan `harga_upgrade` sudah ada di `/admin/pengaturan`). Saya sudah cek kode sebelum menulis prompt ini, jadi temuan di bawah ini sudah diverifikasi langsung dari file — bukan asumsi. Tugasnya 5 poin, independen satu sama lain, tapi kerjakan berurutan sesuai nomor karena beberapa saling terkait (poin 1 dan 4 sama-sama menyentuh `admin-shell.tsx`/Pengaturan).

---

## Temuan kode yang sudah diverifikasi

**Poin 1 — Email kontak & jam operasional:**
- `messages/id.json` baris 336: `"serviceHours": "Senin - Jumat, 09.00 - 16.00 WIB"` — hardcoded string i18n, TIDAK ada di `site_settings`. (Catatan: teksnya "09.00-16.00", bukan "09.00-18.00" seperti yang saya kira sebelumnya — tapi tetap hardcoded, itu intinya.)
- `.env.local` baris 7: `ADMIN_NOTIFY_EMAIL=info@hexatara.com` — ini dipakai `getAdminNotifyEmail()` di `src/lib/site-settings.ts` sebagai fallback untuk field "Email notifikasi Admin" yang SUDAH ada di form Pengaturan (tujuan email saat ada lead baru — notifikasi internal, bukan kontak publik).
- `site_settings.kontak` (tipe `KontakSettings` di `src/lib/site-settings.ts`) SUDAH punya field `email`, sudah dipakai di footer publik (`(public)/layout.tsx` baris 116-120) dan SUDAH ada formnya di Pengaturan ("Kontak publik" → field Email). Tapi field ini kemungkinan masih kosong di database produksi (makanya baris footer email tidak muncul) — INI kemungkinan besar yang dimaksud user sebagai "hardcode info@hexatara.com", padahal sebenarnya field publiknya sudah ada tapi belum diisi, dan yang benar-benar hardcode adalah jam operasional.

**Poin 2 — Dark mode bocor ke halaman publik:**
- `src/app/[locale]/layout.tsx` — SATU root layout (`<html>`/`<body>`/`<ThemeProvider>`) dipakai bersama oleh SEMUA route group: `(public)`, `(auth)`, `(kelas)`, DAN `(user)`. `next-themes` dengan `attribute="class"` menaruh class `dark` di `<html>` yang sama untuk semuanya — tidak ada scoping per route group.
- `src/app/admin/layout.tsx` — Admin SUDAH punya root layout terpisah sendiri (`<html>` sendiri, `<ThemeProvider>` sendiri), makanya dark mode Admin tidak bocor ke halaman publik. Pola ini sudah ada dan terbukti jalan.
- `globals.css` — token brand lama (`--warna-utama`, `--warna-teks`, `--warna-latar`, `--warna-latar-2`, `--warna-sukses`, `--warna-bahaya`, dll — dipakai luas di halaman publik/auth) hanya didefinisikan di `:root`, TIDAK ADA override di blok `.dark { }`. Token shadcn baru (`--background`, `--sidebar-*`, dll) sudah punya override `.dark` lengkap.

**Poin 3 — Toggle bahasa (KONTRADIKSI, perlu investigasi Cursor, bukan Alif):**
- `src/components/language-switcher.tsx` — kode SUDAH pakai flag emoji (`🇮🇩`/`🇬🇧`), BUKAN teks "ID/EN". Trigger dan setiap item render flag + label.
- Komponen ini SUDAH dipasang benar: desktop di `(public)/layout.tsx` baris 49, mobile di `public-nav-mobile.tsx` baris 66 (di dalam Sheet).
- Ini kontradiksi dengan laporan Alif (masih lihat "ID/EN", klik flag tidak terjadi apa-apa). Kemungkinan penyebab: build/dev-server belum di-restart setelah perubahan terakhir, cache browser, atau ada komponen switcher lain/duplikat yang tidak ketemu di pencarian saya. **Jangan asumsikan ini bug kode dan "perbaiki" sesuatu yang sudah benar** — investigasi dulu kenapa yang tampil di browser beda dari source, laporkan temuannya sebelum ubah apapun di poin ini.

**Poin 4 — Crash `MenuGroupContext is missing` (root cause pasti):**
- `src/components/ui/dropdown-menu.tsx` baris 55-73: `DropdownMenuLabel` = wrapper tipis untuk `MenuPrimitive.GroupLabel` (Base UI, `@base-ui/react/menu`). Primitive ini WAJIB berada di dalam `Menu.Group`/`DropdownMenuGroup` — dipakai berdiri sendiri langsung throw `MenuGroupContext is missing`.
- `admin-shell.tsx` baris 479 (dropdown avatar topbar) DAN baris 352 (`ProfileMenu`, dipakai di sidebar desktop + mobile Sheet) — KEDUANYA taruh `<DropdownMenuLabel>` langsung diikuti `<DropdownMenuSeparator>`, TANPA `<DropdownMenuGroup>` pembungkus. Persis cocok dengan stack trace error yang Alif kirim (`DropdownMenuLabel` → `AdminShell (479:15)`).
- Cek project-wide: kemungkinan ada pemakaian lain yang sama polanya di luar 2 lokasi ini yang belum ketemu di investigasi saya — perlu di-grep juga oleh Cursor.

**Poin 5 — Widget akun di bawah sidebar bisa diklik:**
- `admin-shell.tsx` baris 313-361 (`ProfileMenu`) — ini `DropdownMenu` penuh (avatar + nama + email sebagai trigger button), dipasang di footer `<aside>` desktop (baris 420) DAN footer `<Sheet>` mobile (baris 447). Saat ini keduanya interaktif/clickable.

---

## Tugas

### 1. Email kontak resmi & jam operasional — lengkapi ke `site_settings.kontak`

Perluas `KontakSettings` (`src/lib/site-settings.ts`) dengan field baru `jam_operasional` (string bebas, contoh: `"Senin - Jumat, 09.00 - 16.00 WIB"`), default-nya ambil dari string yang sekarang ada di `messages/id.json` `footer.serviceHours` / versi Inggrisnya di `en.json` (biar tidak hilang saat migrasi).

Field `kontak.email` yang sudah ada TIDAK perlu dibuat baru — itu sudah jadi email kontak resmi publik. Tambahkan saja label/deskripsi yang lebih jelas di form Pengaturan supaya jelas bedanya dengan "Email notifikasi Admin" (yang satu itu untuk notifikasi internal saat ada lead baru, bukan tampil ke publik).

- Update `KontakSettings` type + `KontakPublikSchema` (Zod) di `src/lib/validations/pengaturan-admin.ts` untuk menyertakan `jam_operasional` (opsional, default string jam kerja saat ini kalau kosong).
- Update `KontakForm` di `pengaturan-forms.tsx`: tambah input jam operasional, perjelas deskripsi Card ("Kontak publik" → jelaskan email ini yang tampil di footer situs, beda dari email notifikasi Admin).
- Update `simpanKontakAction` di `actions.ts` untuk menyimpan `jam_operasional`.
- Update `(public)/layout.tsx` footer: ganti `{tFooter("serviceHours")}` (hardcoded i18n) jadi baca dari `kontak.jam_operasional` (fallback ke string default kalau kosong) — pola sama seperti `kontak.wa`/`kontak.email` yang sudah ada di situ.
- `messages/id.json` & `en.json`: boleh pertahankan `footer.serviceHours` sebagai fallback string default (jangan hapus, biar tidak ada baris kosong kalau Admin belum pernah isi), tapi bukan lagi satu-satunya sumber.
- **Field notifikasi (`admin_notify_email`) TIDAK diubah** — sudah benar sebagai email internal, biarkan seperti sekarang.

### 2. Dark mode: batasi ke dashboard User & Admin saja, publik/auth kembali ke light "off-white/snow"

Ini keputusan arsitektur dengan trade-off nyata — **investigasi dulu, ajukan proposal ke saya sebelum eksekusi** (pola yang sama seperti waktu §12.6.0 kemarin), jangan langsung pilih sepihak.

Dua opsi yang perlu dievaluasi (silakan tambah opsi lain kalau ketemu yang lebih baik):
- **(a)** Pecah `[locale]/layout.tsx` jadi dua root layout terpisah — satu untuk `(user)` (pakai `ThemeProvider` dgn dark mode, mirror pola `admin/layout.tsx` yang sudah terbukti jalan), satu untuk `(public)`+`(auth)`+`(kelas)` (tanpa dark mode, selalu light). Konsekuensi: butuh restrukturisasi route group / kemungkinan folder `[locale]` perlu dipecah lagi per grup dengan root layout masing-masing — cek apakah Next.js App Router mengizinkan ini tanpa duplikasi `<html>` yang konflik.
- **(b)** Tetap satu root layout, tapi paksa `(public)`/`(auth)`/`(kelas)` selalu light lewat cara lain (misal: `ThemeProvider` dengan `forcedTheme="light"` di level layout grup tersebut jika `next-themes` mendukung nested override, atau CSS override scoped ke wrapper grup itu).

Setelah menentukan opsi mana yang lebih aman untuk struktur project ini, baru eksekusi:
- Halaman `(public)`/`(auth)`/`(kelas)` selalu tampil light, dengan warna latar off-white/snow yang lebih lembut dari putih polos — usulkan nilai hex/oklch konkret untuk `--warna-latar` khusus terang ini (jangan `#FFFFFF` murni), tunjukkan pilihannya di ringkasan akhir.
- `(user)` dan Admin tetap punya toggle dark/light/system seperti sekarang.
- Sekalian perbaiki akar masalahnya: tambahkan override `.dark { }` untuk token `--warna-*` di `globals.css` (supaya kalaupun ada bagian yang masih pakai token lama di area yang dark-mode-able, tidak pecah tampilannya) — ini perbaikan yang aman dilakukan terlepas dari opsi (a) atau (b) yang dipilih.

### 3. Toggle bahasa — investigasi dulu, jangan langsung ubah kode

Source `language-switcher.tsx` SUDAH benar (flag emoji, sudah terpasang di layout publik desktop & mobile). Sebelum ubah apapun:
- Cek apakah dev server/build yang sedang dijalankan Alif representasi dari kode terbaru (kemungkinan perlu restart `pnpm dev` atau clear `.next` cache).
- Cek apakah ada komponen switcher bahasa lain yang mungkin ke-render duplikat/menimpa (grep `ID/EN`, `"id" \| "en"`, atau string literal lain yang mungkin jadi trigger lama).
- Laporkan hasil investigasi ke saya dulu sebelum melakukan perubahan kode — kemungkinan besar ini bukan bug kode sama sekali, cukup restart dev server.

### 4. Perbaiki crash `DropdownMenuLabel` — bungkus dengan `DropdownMenuGroup`

Di `admin-shell.tsx`:
- Baris ~479 (dropdown avatar topbar) dan baris ~352 (`ProfileMenu`, dipakai desktop aside + mobile Sheet): bungkus `<DropdownMenuLabel>...</DropdownMenuLabel>` dengan `<DropdownMenuGroup>` di kedua lokasi.
- Import `DropdownMenuGroup` dari `@/components/ui/dropdown-menu` (sudah diekspor di sana, tinggal ditambahkan ke import list `admin-shell.tsx`).
- **Audit seluruh codebase**: grep semua pemakaian `DropdownMenuLabel` (termasuk di luar `admin-shell.tsx`, misalnya di komponen dashboard User atau tempat lain yang belum saya cek) — pastikan setiap pemakaian dibungkus `DropdownMenuGroup`. Laporkan semua lokasi yang ditemukan dan diperbaiki.
- Setelah perbaikan, verifikasi manual: buka dropdown avatar topbar Admin, pastikan tidak crash dan menu Profil/Tentang Kami/Pengaturan/Keluar muncul normal.

### 5. Widget akun bawah sidebar — jadikan teks statis, tidak bisa diklik

`ProfileMenu` di `admin-shell.tsx` (baris 313-361), dipakai di dua tempat (footer `<aside>` desktop baris 420, footer `<Sheet>` mobile baris 447):
- Ganti dari `DropdownMenu`/`DropdownMenuTrigger` (button) jadi `<div>` statis — avatar + nama + email tetap tampil sama persis secara visual, tapi tanpa `onClick`, tanpa dropdown, tanpa style yang mengesankan interaktif (hapus `hover:bg-sidebar-accent` dan cursor pointer implisit dari elemen button).
- Menu akun (Profil/Tentang Kami/Pengaturan/Keluar) TETAP hanya ada di dropdown avatar topbar (yang sedang diperbaiki di poin 4) — jangan duplikasi menu ini ke sidebar.
- Pastikan versi collapsed (`collapsed && "justify-center"`, avatar-only tanpa teks) tetap terlihat sama, cuma tidak clickable.

---

## Verifikasi akhir (jalankan semua sebelum lapor selesai)

1. `pnpm lint` dan `pnpm build` — pastikan tidak ada error TypeScript/ESLint baru dari kelima perubahan di atas.
2. Buka `/admin/pengaturan` — form Kontak publik menampilkan field jam operasional baru, simpan berhasil, dan footer halaman publik (`/`) menampilkan jam operasional dari `site_settings` (bukan lagi dari `messages/id.json`).
3. Buka halaman publik dalam mode Incognito (tanpa localStorage tema tersimpan) — pastikan selalu light dengan warna off-white/snow, TIDAK terpengaruh preferensi sistem dark mode.
4. Buka `/dashboard` (User) dan `/admin` — pastikan toggle dark/light/system masih berfungsi normal seperti sebelumnya di kedua area ini.
5. Klik avatar dropdown topbar Admin — pastikan TIDAK crash, menu Profil/Tentang Kami/Pengaturan/Keluar semua muncul dan berfungsi.
6. Cek widget bawah sidebar (desktop & mobile) — pastikan tampilan sama, tapi klik di area itu tidak membuka apapun.
7. Laporkan balik ke saya: (a) hasil investigasi poin 3 (kenapa toggle bahasa tampak salah padahal kode benar), (b) opsi mana yang dipilih untuk poin 2 dan alasannya, (c) daftar lengkap lokasi `DropdownMenuLabel` yang diperbaiki di poin 4, (d) nilai warna off-white/snow yang dipakai untuk background light.
