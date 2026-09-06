# PANDUAN HEXATARA — DARI NOL SAMPAI RILIS

> **Satu berkas. Semuanya ada di sini.** Tidak ada dokumen lain yang perlu kamu buka
> saat bekerja — seluruh SQL, seluruh prompt, seluruh cara uji, dan seluruh perintah
> commit ada di dalam berkas ini, berurutan dari Fase 0 sampai Fase 14.
>
> Windows 11 · PowerShell · pnpm · Claude Code · Supabase · Vercel

---

## ATURAN MAIN — baca sekali, satu menit

**1. Kerjakan berurutan, Fase 0 sampai Fase 14.** Jangan lompat. Kalau kamu melihat
sesuatu yang menarik tapi belum waktunya, itu ada di Lampiran — kerjakan nanti, atau
tidak sama sekali.

**2. Setiap langkah punya kotak `CEK`.** Kalau isinya tidak muncul di layarmu, JANGAN
lanjut. Di bawah tiap `CEK` ada `KALAU GAGAL`. Jawabannya sudah di situ — tidak perlu
tanya AI.

**3. Kotak berpagar tiga backtick yang berisi prompt adalah yang kamu tempel ke chat
Claude Code.** Bagian **SETELAH BLOK INI** di bawahnya adalah bagianmu — jangan
ditempel ke chat.

**4. RTK dan claude-mem tidak ada di jalur utama.** Keduanya di Lampiran D dan boleh
kamu lewati selamanya. Yang masuk jalur utama hanya **Ponytail** dan **Context7**, dan
itu pun baru di Fase 6 — setelah aplikasimu sudah jalan dan sudah pernah deploy.

**5. Perintah selalu dijalankan di PowerShell**, bukan Command Prompt lama. Terminal
bawaan VS Code sudah PowerShell — pakai itu (`Ctrl` + `` ` ``).

**6. Path project ini punya spasi** (`Nawa Inspira Digital`). Setiap `cd` ke sana
**wajib pakai tanda kutip.** Ini penyebab error `cd: cannot find path` yang paling sering.

---

## PETA — kamu sekarang di mana

Centang setiap kali selesai. Ini satu-satunya cara tahu posisi kalau besok kamu lupa.

### Bagian 1 — Setup, sekali seumur project, selesai dalam satu hari

- [ ] **Fase 0** — Alat sudah benar (±10 menit)
- [ ] **Fase 1** — Project jalan di browser (±15 menit) ← kemenangan pertama
- [ ] **Fase 2** — Dependency terpasang (±15 menit)
- [ ] **Fase 3** — Database Supabase siap (±40 menit)
- [ ] **Fase 4** — Berkas konteks & tipe database siap (±20 menit)
- [ ] **Fase 5** — Sudah pernah deploy ke Vercel (±15 menit)

### Bagian 2 — Cara kerja, baca sekali lalu rujuk terus

- [ ] **Fase 6** — Pasang Ponytail & Context7, pahami siklus lima langkah (±30 menit)

### Bagian 3 — Membangun, berminggu-minggu

- [ ] **Fase 7** — Sprint 0: Fondasi (3–4 hari)
- [ ] **Fase 8** — Sprint 1: Landing Page (5–7 hari)
- [ ] **Fase 9** — Sprint 1.5: Migrasi dwibahasa (1–2 hari)
- [ ] **Fase 10** — Sprint 2: Verifikasi Sertifikat (3–4 hari)
- [ ] **Fase 11** — Sprint 3: Sertifikat Gratis (7–10 hari) ← terberat
- [ ] **Fase 12** — Sprint 4: Katalog Produk (3–4 hari)
- [ ] **Fase 13** — Sprint 5: Hardening (2–3 hari)

### Bagian 4 — Rilis

- [ ] **Fase 14** — Rilis ke hexatara.com

Kalau besok kamu lupa sudah sampai mana: buka `feature-registry.md`, cari baris `TODO`
pertama. Itu posisimu.

---

## DAFTAR ISI

| Fase                                                 | Isi                                                             |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| [Fase 0](#fase-0--cek-alat)                          | Cek Node, Git, pnpm, Claude Code. Buat empat akun               |
| [Fase 1](#fase-1--project-jalan-di-browser)          | `create-next-app`, halaman pertama terbuka                      |
| [Fase 2](#fase-2--dependency)                        | Paket aplikasi, Excel dari CDN, Tiptap, komponen shadcn         |
| [Fase 3](#fase-3--database-supabase)                 | Project Supabase, 12 blok SQL, bucket, akun Admin               |
| [Fase 4](#fase-4--berkas-konteks--tipe-database)     | `.env.local`, berkas konteks AI, tipe database                  |
| [Fase 5](#fase-5--deploy-kosong-ke-vercel)           | Push GitHub, deploy pertama, arahkan Supabase Auth              |
| [Fase 6](#fase-6--cara-kerja)                        | Ponytail, Context7, siklus lima langkah, cara uji, skrip commit |
| [Fase 7](#fase-7--sprint-0-fondasi)                  | Supabase client, auth, layout, email                            |
| [Fase 8](#fase-8--sprint-1-landing-page)             | Pop-up, banner, batch, form minat, Admin CMS                    |
| [Fase 9](#fase-9--sprint-15-migrasi-dwibahasa)       | next-intl, `[locale]`, helper `pick()`                          |
| [Fase 10](#fase-10--sprint-2-verifikasi-sertifikat)  | `/verify`, status kedaluwarsa, import massal                    |
| [Fase 11](#fase-11--sprint-3-sertifikat-gratis)      | Kuis, preview, upgrade, aktivasi QR                             |
| [Fase 12](#fase-12--sprint-4-katalog-produk)         | Katalog, harga tersembunyi, form penawaran                      |
| [Fase 13](#fase-13--sprint-5-hardening--rilis)       | Aksesibilitas, SEO, sapuan anti scope creep                     |
| [Fase 14](#fase-14--rilis-ke-hexataracom)            | Domain, SMTP, backup, checklist go-live                         |
| [Lampiran A](#lampiran-a--kalau-macet)               | Daftar error dan penyebabnya                                    |
| [Lampiran B](#lampiran-b--pagar-kualitas)            | TypeScript ketat, a11y, knip, vitest, husky                     |
| [Lampiran C](#lampiran-c--template-dokumen-as-built) | Template serah terima per modul                                 |
| [Lampiran D](#lampiran-d--tools-opsional)            | MCP tambahan, claude-mem, RTK, pindah VPS                       |

---

## BERKAS APA SAJA YANG ADA

Setelah Fase 4 selesai, folder project berisi lima berkas markdown di root:

| Berkas                  | Menjawab                                             | Dibaca                | Kapan kamu menyentuhnya                      |
| ----------------------- | ---------------------------------------------------- | --------------------- | -------------------------------------------- |
| **PANDUAN.md**          | langkah kerja, dari nol sampai rilis                 | **kamu**              | tiap hari — ini berkas yang sedang kamu baca |
| **PRD.md**              | **APA** yang dibangun, perilakunya, kriteria selesai | Claude Code, otomatis | jarang — kalau scope berubah                 |
| **ENGINEERING.md**      | **BAGAIMANA** menulis kodenya: pola, konvensi, ADR   | Claude Code, otomatis | jarang — kalau ada keputusan teknis baru     |
| **feature-registry.md** | fitur mana sudah, mana belum                         | Claude Code, otomatis | **tiap sub-fitur selesai**                   |
| **CLAUDE.md**           | pointer, memuat ketiganya lewat `@import`            | Claude Code, otomatis | sekali di Fase 4                             |

Pembagiannya tegas: **PRD menjawab APA, ENGINEERING menjawab BAGAIMANA, PANDUAN
menjawab KAPAN dan DENGAN CARA APA.**

`CLAUDE.md` memakai sintaks `@import` milik Claude Code, jadi PRD, ENGINEERING, dan
feature-registry **termuat otomatis tiap sesi.** Kamu tidak perlu menyebut berkas apa
pun di prompt — itulah sebabnya prompt di Fase 7–13 bisa pendek.

Paket dokumenmu ada di:

```
D:\01_Projects\Nawa Inspira Digital\hexatara\ngoding\kit\
├─ PANDUAN.md            ← berkas ini
├─ PRD.md
├─ ENGINEERING.md
├─ feature-registry.md
├─ CLAUDE.md
└─ pw_supabase.txt       ← JANGAN PERNAH DISALIN KE PROJECT
```

> ### ⚠ `pw_supabase.txt`
>
> Berkas itu berisi password database. **Jangan pernah menyalinnya ke folder project.**
> Kalau ikut tersalin lalu ter-commit, password database Hexatara masuk ke GitHub dan
> seluruh isi database terbuka. Daftar salin di Bagian 4.2 sudah mengecualikannya —
> ikuti daftarnya, jangan salin seluruh folder sekaligus.
>
> Simpan berkas itu di luar folder project, misalnya di pengelola kata sandi.

---

# FASE 0 — CEK ALAT

Tidak ada yang di-install di fase ini kecuali pnpm.

## 0.1 Cek Node dan Git

```powershell
node -v
git --version
```

**CEK** — `node -v` menampilkan `v20.x.x` atau lebih tinggi, `git --version` menampilkan nomor versi.

**KALAU GAGAL**

- Node tidak dikenali atau versinya v18 ke bawah → unduh **LTS** di https://nodejs.org, install, **tutup semua jendela PowerShell dan VS Code**, buka lagi, ulangi. Jangan ambil versi "Current".
- Git tidak dikenali → unduh di https://git-scm.com, install dengan semua pilihan bawaan, tutup dan buka ulang terminal.

Menutup dan membuka ulang terminal itu wajib. PATH tidak diperbarui di jendela yang sudah terlanjur terbuka — ini penyebab nomor satu "sudah install tapi tetap tidak dikenali".

## 0.2 Pasang pnpm

```powershell
npm install -g pnpm
pnpm -v
```

**CEK** — muncul nomor versi.

**KALAU GAGAL**

- Tidak dikenali setelah install → tutup dan buka ulang PowerShell.
- `running scripts is disabled on this system` → jalankan ini sekali, lalu ulangi:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
  ```

## 0.3 Cek Claude Code

Kamu memakai extension Claude Code di VS Code. Extension itu **pembungkus dari CLI yang sama** — perintah setup seperti `claude mcp add` dan `/plugin install` dijalankan di **terminal VS Code**, bukan di panel chat.

```powershell
claude --version
```

**CEK** — muncul nomor versi.

**KALAU GAGAL**

```powershell
npm install -g @anthropic-ai/claude-code
claude --version
```

Lalu di VS Code: Extensions → cari "Claude Code" terbitan Anthropic → Install → login dengan akun Claude Pro. Buka panel dengan `Ctrl+Esc`.

## 0.4 Buat empat akun

| Layanan  | Alamat       | Login pakai | Untuk apa                 |
| -------- | ------------ | ----------- | ------------------------- |
| GitHub   | github.com   | —           | menyimpan kode            |
| Vercel   | vercel.com   | **GitHub**  | hosting                   |
| Supabase | supabase.com | **GitHub**  | database + auth + storage |
| Resend   | resend.com   | —           | email                     |

Login Vercel dan Supabase pakai tombol "Continue with GitHub" — lebih sedikit password, dan Vercel butuh akses GitHub nanti.

**CEK** — kamu bisa membuka dashboard keempatnya.

> **Belum perlu Upstash.** Rate limit `/verify` ada di balik feature flag dan dikerjakan di Sprint 2.

---

---

# FASE 1 — PROJECT JALAN DI BROWSER

Target fase ini: **halaman Next.js terbuka di browser.** Belum ada fitur, belum ada database.

## 1.1 Masuk ke folder induk

```powershell
cd "D:\01_Projects\Nawa Inspira Digital\Development"
```

Perhatikan tanda kutipnya. Tanpa itu PowerShell membaca `Nawa` sebagai perintah dan gagal.

**CEK**

```powershell
pwd
```

Menampilkan `D:\01_Projects\Nawa Inspira Digital\Development`.

**KALAU GAGAL** — kalau foldernya belum ada:

```powershell
mkdir "D:\01_Projects\Nawa Inspira Digital\Development" -Force
cd "D:\01_Projects\Nawa Inspira Digital\Development"
```

## 1.2 Buat project

```powershell
pnpm create next-app@latest hexatara --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

Kalau muncul pertanyaan yang belum terjawab flag di atas:

| Pertanyaan                         | Jawab                |
| ---------------------------------- | -------------------- |
| `Would you like to use Turbopack?` | **No**               |
| pertanyaan lain apa pun            | Enter (pakai bawaan) |

Turbopack dijawab No karena beberapa paket di Fase 2 belum mulus dengannya. Bukan soal cepat-lambat — soal ada error yang tidak perlu kamu hadapi minggu ini.

Hasilnya: `D:\01_Projects\Nawa Inspira Digital\Development\hexatara\`

## 1.3 Jalankan

```powershell
cd hexatara
pnpm dev
```

Buka http://localhost:3000

**CEK** — halaman selamat datang Next.js muncul di browser.

**KALAU GAGAL**

- `Port 3000 is in use` → Next.js pindah sendiri ke 3001. Baca baris terakhir di terminal, pakai alamat yang disebut.
- Error modul → `pnpm install` lalu `pnpm dev` lagi.
- Layar putih kosong → tunggu 10 detik. Kompilasi pertama memang lambat.

Biarkan `pnpm dev` **tetap berjalan.** Untuk perintah lain, buka terminal kedua (`Ctrl` + `Shift` + `` ` ``).

## 1.4 Simpan ke Git

Terminal kedua, di dalam folder `hexatara`:

```powershell
git init
git add -A
git commit -m "chore: init next.js"
```

**CEK** — muncul ringkasan `xx files changed`.

**KALAU GAGAL** — kalau Git minta identitas:

```powershell
git config --global user.name "Alif Ayatulloh"
git config --global user.email "email-github-kamu@contoh.com"
```

lalu ulangi `git commit`.

## 1.5 Buka di editor

```powershell
code .
```

**Kemenangan pertama selesai.** Centang Fase 1 di peta.

---

---

# FASE 2 — DEPENDENCY

Enam blok. Jalankan berurutan.

Daftar ini diturunkan dari acceptance criteria di `PRD.md` satu per satu, bukan dari "paket yang biasanya dipakai project Next.js". Tabel 2.7 menjelaskan tiap paket ada untuk fitur mana — **baca itu sebelum menyetujui AI menambah dependency apa pun.**

## 2.1 Paket aplikasi

```powershell
pnpm add @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers pdf-lib qrcode papaparse resend date-fns clsx tailwind-merge lucide-react server-only browser-image-compression
```

## 2.2 Excel — dipasang terpisah, baca alasannya

**Jangan `pnpm add xlsx`.** Versi terakhir SheetJS di npm adalah 0.18.5, dan versi itu kena **CVE-2023-30533** — prototype pollution tingkat High. Perbaikannya ada di 0.19.3, tapi **0.19.3 tidak pernah diterbitkan ke npmjs.org**; SheetJS memindahkan distribusinya ke CDN sendiri. Jadi `pnpm add xlsx` hari ini memasang paket rentan yang tidak akan pernah dapat pembaruan.

```powershell
pnpm add https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```

Cek nomor versi terbaru di https://cdn.sheetjs.com sebelum menjalankan. API-nya sama persis, jadi `import * as XLSX from 'xlsx'` tetap berfungsi.

**CEK** — di `package.json`, baris `"xlsx"` menunjuk ke URL `cdn.sheetjs.com`, bukan nomor versi biasa.

**KALAU GAGAL** — kalau URL ditolak jaringan, pakai `pnpm add exceljs` dan sebutkan di prompt import bahwa yang dipakai `exceljs`.

## 2.3 Editor teks untuk Admin

```powershell
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/pm
```

`PRD.md` Bagian 10.2: silabus adalah daftar bernomor. Dengan `<textarea>` polos Admin tidak punya cara membuatnya, dan indikator "Kemandirian Admin" gagal sejak hari pertama. Kolom `deskripsi_*`, `silabus_*`, dan `konten_*` menyimpan HTML.

## 2.4 Paket tipe (dev)

```powershell
pnpm add -D @types/qrcode @types/papaparse
```

## 2.5 Komponen UI

```powershell
pnpm dlx shadcn@latest init
```

| Pertanyaan    | Jawab       |
| ------------- | ----------- |
| Base color    | **Neutral** |
| CSS variables | **Yes**     |
| sisanya       | Enter       |

Lalu — daftar ini lebih panjang dari yang biasa dipakai, dan tiap tambahannya ada karena satu acceptance criteria tertentu:

```powershell
pnpm dlx shadcn@latest add button input textarea label select card dialog alert-dialog dropdown-menu tabs badge table form sonner accordion sheet checkbox radio-group switch calendar popover skeleton carousel alert separator avatar
```

**CEK** — `pnpm dev` masih normal, dan `src/components/ui/` berisi sekitar 25 berkas `.tsx` termasuk `checkbox.tsx`, `calendar.tsx`, `radio-group.tsx`, `switch.tsx`.

**KALAU GAGAL**

- `init` tidak menemukan Tailwind → pastikan kamu di folder `hexatara` (`pwd`), bukan di `Development`.
- Satu komponen gagal → tambahkan sisanya dulu, lalu ulangi yang gagal sendirian: `pnpm dlx shadcn@latest add calendar`.
- Halaman error setelah `init` → hentikan `pnpm dev` (`Ctrl+C`), jalankan lagi.

## 2.6 Izinkan gambar dari Supabase Storage

Foto instruktur, galeri, dan produk tersimpan di Supabase. `next/image` menolak host yang tidak didaftarkan, dan gejalanya **gambar tidak muncul tanpa pesan error** — dua jam terbuang untuk satu baris konfigurasi.

Buka `next.config.ts`, tambahkan di dalam objek config:

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'xxxxx.supabase.co', pathname: '/storage/v1/object/public/**' },
  ],
},
```

Ganti `xxxxx` dengan Project Reference ID. Kamu mendapatkannya di Fase 3.2 — kalau belum punya, lewati dan kembali ke sini setelah Fase 3.

## 2.7 Kenapa tiap paket ada

**Kalau AI meminta menambah paket yang tidak ada di sini, tanya dulu fitur mana yang membutuhkannya.** `PRD.md` larangan nomor 7 melarang dependency baru tanpa izin eksplisit — tabel ini yang membuat larangan itu bisa ditegakkan.

| Paket                                    | Ada untuk                                                                                                                                                                                                                                          |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@supabase/supabase-js`, `@supabase/ssr` | seluruh akses database, auth, storage                                                                                                                                                                                                              |
| `zod`                                    | validasi input sisi server di tiap Server Action                                                                                                                                                                                                   |
| `react-hook-form`, `@hookform/resolvers` | form minat (F01.6), registrasi, penawaran (F04.5), seluruh form Admin                                                                                                                                                                              |
| `pdf-lib`                                | PDF sertifikat preview dan final (F03.4)                                                                                                                                                                                                           |
| `qrcode`                                 | QR pada sertifikat aktif (F03.8)                                                                                                                                                                                                                   |
| `papaparse`                              | ekspor CSV lead (F01.14), import CSV sertifikat (F02.8)                                                                                                                                                                                            |
| `xlsx` dari CDN                          | import Excel sertifikat (F02.8) dan bank soal (F03.13)                                                                                                                                                                                             |
| `resend`                                 | lima pemicu email di PRD Bagian 11                                                                                                                                                                                                                 |
| `date-fns`                               | kedaluwarsa +2 tahun, format tanggal Indonesia, periode tayang banner                                                                                                                                                                              |
| `lucide-react`                           | ikon                                                                                                                                                                                                                                               |
| `clsx`, `tailwind-merge`                 | dipakai helper `cn()` bawaan shadcn                                                                                                                                                                                                                |
| `server-only`                            | **penegak larangan nomor 3.** `import 'server-only'` di baris pertama `src/lib/supabase/admin.ts` membuat `SUPABASE_SERVICE_ROLE_KEY` yang bocor ke komponen klien jadi **error saat build**, bukan sekadar komentar peringatan yang bisa terlewat |
| `browser-image-compression`              | Admin mengunggah foto HP 5 MB. Tanpa kompresi, acceptance criteria Lighthouse ≥ 90 (F05.2) tidak tercapai. Dipakai juga di unggah bukti transfer (F03.6)                                                                                           |
| `@tiptap/*`                              | tab Deskripsi & Silabus yang diisi Admin (F01.12)                                                                                                                                                                                                  |

Komponen shadcn yang perlu dijelaskan:

| Komponen               | Ada untuk                                                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkbox`             | kotak persetujuan penyimpanan data. Acceptance criteria menguji bahwa kotak ini **tidak tercentang saat halaman dibuka**. Tanpa komponennya, fitur ini tidak bisa dibangun |
| `calendar` + `popover` | tiap kolom tanggal: jadwal batch, periode tayang banner, terbit & kedaluwarsa sertifikat                                                                                   |
| `radio-group`          | pilih paket upgrade Rp 30.000 / Rp 150.000 (F03.5)                                                                                                                         |
| `switch`               | aktif/nonaktif popup dan banner, tampil/sembunyi harga per produk (F04.3)                                                                                                  |
| `alert-dialog`         | konfirmasi hapus di seluruh CRUD Admin. `dialog` biasa tidak menahan klik tidak sengaja                                                                                    |
| `dropdown-menu`        | aksi per baris tabel Admin                                                                                                                                                 |
| `carousel`             | galeri dokumentasi batch (F01.5) dan foto produk (F04.2)                                                                                                                   |
| `skeleton`             | keadaan memuat. Tanpa ini AI menulis spinner sendiri di tiap halaman, berbeda-beda                                                                                         |
| `alert`                | pesan "tidak ditemukan" vs "Invalid" di `/verify` yang wajib berbeda secara visual (F02.6)                                                                                 |

## 2.8 Yang SENGAJA tidak dipasang

Sama pentingnya. Kalau AI mengusulkan salah satu, jawabannya tidak — dan alasannya ada di sini.

| Tidak dipasang                  | Kenapa                                                                      |
| ------------------------------- | --------------------------------------------------------------------------- |
| Redux, Zustand, Jotai           | Server Component + `useState` cukup. Tidak ada state global di aplikasi ini |
| React Query / SWR               | Server Component sudah mengambil data di server                             |
| Prisma, Drizzle, ORM apa pun    | Supabase client + tipe generated sudah cukup                                |
| Framer Motion / library animasi | Pengguna sampai usia 70 tahun                                               |
| Recharts / library chart        | Tidak ada dashboard analitik di Fase 1                                      |
| `next-themes`                   | Design token Hexatara hanya mode terang. Tidak ada dark mode di BRD         |
| Midtrans / SDK payment          | Larangan nomor 8                                                            |
| Library WhatsApp / Fonnte       | Larangan nomor 23. Tombol WA hanya tautan `wa.me`                           |
| `@vercel/blob`, Edge Config     | Larangan nomor 6. Sistem pindah ke VPS                                      |

## 2.9 Simpan

```powershell
git add -A
git commit -m "chore: dependencies + shadcn"
```

> **Ditunda, bukan dibuang:** `next-intl` (Lampiran C), `@upstash/ratelimit` + `@upstash/redis` (Sprint 2), `@pdf-lib/fontkit` (hanya kalau template sertifikat memakai font khusus — Sprint 3), `@sentry/nextjs` (Sprint 5, F05.5), `vitest`, `knip`, `husky` (Lampiran B).

---

---

# FASE 3 — DATABASE SUPABASE

Fase paling banyak klik, paling sedikit ketik. Sekali seumur project.

## 3.1 Buat project Supabase

supabase.com → **New Project**

| Isian             | Nilai                                                        |
| ----------------- | ------------------------------------------------------------ |
| Name              | `hexatara-prod`                                              |
| Database Password | **isi dari `kit\pw_supabase.txt`**, atau buat baru yang kuat |
| Region            | **Southeast Asia (Singapore)**                               |

Tunggu sekitar 2 menit sampai statusnya hijau.

Password itu tidak bisa dilihat lagi setelah halaman ditutup, dan kamu membutuhkannya untuk backup di Fase 7. Simpan di pengelola kata sandi — **bukan di dalam folder project.**

## 3.2 Ambil kredensial

Supabase → **Settings** → **API**. Salin tiga nilai:

| Yang disalin            | Nanti jadi                      |
| ----------------------- | ------------------------------- |
| Project URL             | `NEXT_PUBLIC_SUPABASE_URL`      |
| `anon` `public`         | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY`     |

Salin juga **Project Reference ID** — potongan acak di Project URL, contoh `abcdefghijk` dari `https://abcdefghijk.supabase.co`.

> `service_role` melewati seluruh Row Level Security. **Hanya boleh ada di server.** Kalau key ini pernah masuk ke kode yang dikirim ke browser, seluruh database Hexatara terbuka.

## 3.3 Jalankan SQL — 12 blok, satu per satu

Supabase → **SQL Editor** → **New query**.

Untuk **setiap** blok di bawah, berurutan dari 1 sampai 12:

1. Salin seluruh isi blok kodenya
2. Tempel ke SQL Editor
3. Klik **Run**
4. **Tunggu tulisan `Success`** sebelum lanjut ke blok berikutnya

Satu blok satu Run. Jangan digabung — kalau gabungan gagal, kamu tidak tahu bagian mana
yang salah.

**Kalau muncul error selain yang tercantum di Bagian 3.3.13, berhenti.** Jangan lanjut
ke blok berikutnya. Salin pesan errornya utuh, tempel ke Claude Code bersama isi blok
SQL yang gagal. Jangan menebak sendiri di database.

### 3.3.1 — Extension & tipe enum

Mengaktifkan `pgcrypto`, membuat 6 tipe enum, dan fungsi `set_updated_at()`. Aman diulang.

```sql
-- 01 — Extension & tipe enum
-- Jalankan pertama. Aman diulang.

create extension if not exists pgcrypto;

do $$ begin
  create type jenis_sertifikat as enum ('free_track','existing_manual','rpc_certified');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_batch as enum ('upcoming','open','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type paket_upgrade as enum ('cert_only','cert_merch','merch_addon');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_order as enum ('menunggu_bukti','menunggu_verifikasi','disetujui','ditolak');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_kirim as enum ('tidak_ada','belum_diproses','diproses','dikirim','diterima');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_lead as enum ('baru','dihubungi','selesai');
exception when duplicate_object then null; end $$;

-- Helper: updated_at otomatis
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
```

### 3.3.2 — Profil pengguna & gate admin

Tabel `profiles` dan `activity_logs`, fungsi `is_admin()` yang `SECURITY DEFINER`, dan trigger yang membuat baris profil otomatis saat user mendaftar.

```sql
-- 02 — Profil pengguna & gate admin

create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  nama_lengkap          text not null default '',
  whatsapp              text,
  role                  text not null default 'user' check (role in ('user','admin')),
  free_track_selesai_at timestamptz,          -- penanda kuis selesai. Lihat ENGINEERING.md Bagian 5.5
  created_at            timestamptz not null default now()
);

-- SECURITY DEFINER supaya policy pada profiles tidak memanggil balik profiles.
-- Tanpa ini muncul "infinite recursion detected in policy" dan seluruh auth mati.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Profil dibuat otomatis saat user mendaftar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nama_lengkap)
  values (new.id, coalesce(new.raw_user_meta_data->>'nama_lengkap', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Riwayat aktivitas dashboard pengguna
create table if not exists public.activity_logs (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  aksi       text not null,
  detail     jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_activity_user on public.activity_logs(user_id, created_at desc);
```

### 3.3.3 — Konten landing page

Tujuh tabel yang dikelola Admin: `popups`, `sale_banners`, `hero_slides`, `instructors`, `company_profile`, `testimonials`, `site_settings`.

```sql
-- 03 — Konten landing page (dikelola Admin)

create table if not exists public.popups (
  id            bigserial primary key,
  judul_id      text not null,
  judul_en      text,
  isi_id        text not null,
  isi_en        text,
  gambar_url    text,
  cta_teks_id   text,
  cta_teks_en   text,
  cta_url       text,
  is_active     boolean not null default false,
  tayang_mulai  date,
  tayang_selesai date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- KONTEN MURNI. Tidak menyentuh nominal transaksi apa pun.
-- Tanpa kolom diskon, tanpa kode kupon, tanpa waktu berakhir untuk hitung mundur.
create table if not exists public.sale_banners (
  id              bigserial primary key,
  judul_id        text not null,
  judul_en        text,
  teks_id         text,
  teks_en         text,
  urgensi_id      text,          -- teks biasa yang diketik Admin, BUKAN timer
  urgensi_en      text,
  tombol_teks_id  text,
  tombol_teks_en  text,
  tombol_url      text,
  is_active       boolean not null default false,
  tayang_mulai    date,
  tayang_selesai  date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.hero_slides (
  id            bigserial primary key,
  judul_id      text not null,
  judul_en      text,
  subjudul_id   text,
  subjudul_en   text,
  gambar_url    text,
  cta_teks_id   text,
  cta_teks_en   text,
  cta_url       text,
  urutan        int not null default 0,
  is_active     boolean not null default true,
  updated_at    timestamptz not null default now()
);

create table if not exists public.instructors (
  id          bigserial primary key,
  nama        text not null,
  foto_url    text,
  jabatan_id  text,
  jabatan_en  text,
  bio_id      text,
  bio_en      text,
  urutan      int not null default 0,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create table if not exists public.company_profile (
  id          smallint primary key default 1 check (id = 1),
  judul_id    text not null default '',
  judul_en    text,
  konten_id   text not null default '',
  konten_en   text,
  gambar_url  text,
  updated_at  timestamptz not null default now()
);
insert into public.company_profile (id) values (1) on conflict do nothing;

create table if not exists public.testimonials (
  id         bigserial primary key,
  nama       text not null,
  peran_id   text,
  peran_en   text,
  isi_id     text not null,
  isi_en     text,
  foto_url   text,
  urutan     int not null default 0,
  is_active  boolean not null default true,
  updated_at timestamptz not null default now()
);

-- key-value: nomor rekening, nama bank, teks global
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
```

### 3.3.4 — Batch pelatihan

Tabel `batches` beserta empat tabel anaknya: benefit, peralatan, galeri, dan FAQ.

```sql
-- 04 — Batch pelatihan & isi halaman detail

create table if not exists public.batches (
  id              bigserial primary key,
  slug            text not null unique,
  judul_id        text not null,
  judul_en        text,
  kategori_id     text,
  kategori_en     text,
  deskripsi_id    text,
  deskripsi_en    text,
  silabus_id      text,
  silabus_en      text,
  lokasi_id       text,
  lokasi_en       text,
  alamat          text,
  tanggal_mulai   date,
  tanggal_selesai date,
  harga           bigint,
  status          status_batch not null default 'upcoming',
  hero_gambar_url text,
  urutan          int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_batch_tayang on public.batches(is_active, tanggal_mulai);

create table if not exists public.batch_benefits (
  id       bigserial primary key,
  batch_id bigint not null references public.batches(id) on delete cascade,
  teks_id  text not null,
  teks_en  text,
  ikon     text,
  urutan   int not null default 0
);

create table if not exists public.batch_equipment (
  id       bigserial primary key,
  batch_id bigint not null references public.batches(id) on delete cascade,
  teks_id  text not null,
  teks_en  text,
  urutan   int not null default 0
);

create table if not exists public.batch_gallery (
  id         bigserial primary key,
  batch_id   bigint not null references public.batches(id) on delete cascade,
  gambar_url text not null,
  caption_id text,
  caption_en text,
  urutan     int not null default 0
);

create table if not exists public.batch_faqs (
  id       bigserial primary key,
  batch_id bigint not null references public.batches(id) on delete cascade,
  tanya_id text not null,
  tanya_en text,
  jawab_id text not null,
  jawab_en text,
  urutan   int not null default 0
);

create index if not exists idx_benefit_batch  on public.batch_benefits(batch_id, urutan);
create index if not exists idx_equip_batch    on public.batch_equipment(batch_id, urutan);
create index if not exists idx_gallery_batch  on public.batch_gallery(batch_id, urutan);
create index if not exists idx_faq_batch      on public.batch_faqs(batch_id, urutan);
```

### 3.3.5 — Lead pendaftaran & penawaran

Tabel `batch_leads` dan `quote_requests`. Data pribadi — hanya Admin yang boleh membacanya.

```sql
-- 05 — Lead: pendaftaran minat batch & permintaan penawaran produk
-- Data pribadi. Hanya Admin yang boleh membaca.

create table if not exists public.batch_leads (
  id         bigserial primary key,
  batch_id   bigint references public.batches(id) on delete set null,
  nama       text not null,
  email      text,
  whatsapp   text not null,
  catatan    text,
  consent_at timestamptz not null,   -- centang persetujuan, tidak pernah default tercentang
  status     status_lead not null default 'baru',
  created_at timestamptz not null default now()
);

-- Form biasa. TANPA validasi domain, MX lookup, atau audit log — itu scope Fase 2.
create table if not exists public.quote_requests (
  id          bigserial primary key,
  product_id  bigint,
  nama        text not null,
  perusahaan  text,
  email       text not null,
  whatsapp    text,
  kebutuhan   text,
  consent_at  timestamptz not null,
  status      status_lead not null default 'baru',
  created_at  timestamptz not null default now()
);

create index if not exists idx_lead_batch on public.batch_leads(created_at desc);
create index if not exists idx_lead_quote on public.quote_requests(created_at desc);
```

### 3.3.6 — Katalog produk

Tabel `products` dan `product_images`. Anon **tidak** diberi akses ke tabel ini — jalur publik hanya lewat view `products_public` di berkas 11.

```sql
-- 06 — Katalog produk
-- Anon TIDAK diberi akses ke tabel ini. Jalur publik hanya lewat view products_public.

create table if not exists public.products (
  id             bigserial primary key,
  slug           text not null unique,
  nama_id        text not null,
  nama_en        text,
  deskripsi_id   text,
  deskripsi_en   text,
  spesifikasi_id text,
  spesifikasi_en text,
  kategori       text,
  harga          bigint,
  tampilkan_harga boolean not null default true,
  urutan         int not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.product_images (
  id         bigserial primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  url        text not null,
  urutan     int not null default 0
);

alter table public.quote_requests
  drop constraint if exists quote_requests_product_id_fkey;
alter table public.quote_requests
  add constraint quote_requests_product_id_fkey
  foreign key (product_id) references public.products(id) on delete set null;

create index if not exists idx_produk_tayang on public.products(is_active, urutan);
create index if not exists idx_gambar_produk on public.product_images(product_id, urutan);
```

### 3.3.7 — Tabel sertifikat terpadu

Aset paling penting di sistem ini. Termasuk constraint `chk_free_track_tanpa_expiry`, unique index `uq_free_track_per_user`, fungsi `next_certificate_number()`, dan `status_sertifikat()`.

```sql
-- 07 — TABEL SERTIFIKAT TERPADU
-- Aset paling penting di sistem ini. Data sertifikat tidak bisa direkonstruksi kalau hilang.
-- Baca ENGINEERING.md Bagian 5.1 dan 5.2 sebelum mengubah apa pun di file ini.

create table if not exists public.certificates (
  id                  uuid primary key default gen_random_uuid(),
  nomor_sertifikat    text not null unique,
  jenis               jenis_sertifikat not null,
  nama_lengkap        text not null,
  tanggal_terbit      date not null,
  tanggal_kedaluwarsa date,                 -- NULL = berlaku selamanya
  user_id             uuid references auth.users(id) on delete set null,
  qr_aktif            boolean not null default false,
  public_token        text not null unique default encode(gen_random_bytes(9),'hex'),
  catatan             text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- free_track WAJIB tanpa kedaluwarsa. Dijaga database, bukan cuma dijaga kode.
alter table public.certificates drop constraint if exists chk_free_track_tanpa_expiry;
alter table public.certificates add constraint chk_free_track_tanpa_expiry
  check (jenis <> 'free_track' or tanggal_kedaluwarsa is null);

-- Satu akun satu sertifikat free track.
create unique index if not exists uq_free_track_per_user
  on public.certificates (user_id)
  where jenis = 'free_track' and user_id is not null;

create index if not exists idx_sert_nomor on public.certificates(nomor_sertifikat);
create index if not exists idx_sert_token on public.certificates(public_token);

drop trigger if exists trg_sert_updated on public.certificates;
create trigger trg_sert_updated before update on public.certificates
  for each row execute function public.set_updated_at();

-- Penomoran berurutan per jenis, prefix berbeda supaya tidak tabrakan.
create table if not exists public.certificate_counters (
  jenis       jenis_sertifikat primary key,
  last_number bigint not null default 0
);
insert into public.certificate_counters (jenis, last_number) values
  ('free_track',0), ('existing_manual',0), ('rpc_certified',0)
on conflict do nothing;

create or replace function public.next_certificate_number(p_jenis jenis_sertifikat)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_next   bigint;
  v_prefix text;
begin
  update public.certificate_counters
     set last_number = last_number + 1
   where jenis = p_jenis
  returning last_number into v_next;

  v_prefix := case p_jenis
    when 'free_track'      then 'HXT-FT-'
    when 'existing_manual' then 'HXT-CERT-'
    when 'rpc_certified'   then 'HXT-RPC-'
  end;

  return v_prefix || lpad(v_next::text, 6, '0');
end $$;

-- Status dihitung saat query. Tidak pernah disimpan, tidak butuh cron.
create or replace function public.status_sertifikat(p_exp date)
returns text language sql immutable
as $$
  select case
    when p_exp is null            then 'berlaku'
    when p_exp < current_date     then 'invalid'
    else 'berlaku'
  end;
$$;
```

### 3.3.8 — Materi & bank soal

Tabel `materials`, `quiz_questions`, `quiz_options`. **Tidak ada** tabel riwayat pengerjaan — kuis tidak menyimpan skor.

```sql
-- 08 — Materi & bank soal free track
-- TIDAK ADA tabel riwayat pengerjaan. Kuis tidak menyimpan skor. Lihat ENGINEERING.md Bagian 5.5.

create table if not exists public.materials (
  id           bigserial primary key,
  judul_id     text not null,
  judul_en     text,
  deskripsi_id text,
  deskripsi_en text,
  file_url     text not null,
  urutan       int not null default 0,
  is_active    boolean not null default true,
  updated_at   timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id            bigserial primary key,
  urutan        int not null default 0,
  pertanyaan_id text not null,
  pertanyaan_en text,
  is_active     boolean not null default true,
  updated_at    timestamptz not null default now()
);

-- Penjelasan menempel di OPSI, bukan di soal.
-- Umpan balik harus spesifik terhadap kesalahan yang dibuat pengguna.
create table if not exists public.quiz_options (
  id             bigserial primary key,
  question_id    bigint not null references public.quiz_questions(id) on delete cascade,
  urutan         int not null default 0,
  label_id       text not null,
  label_en       text,
  is_correct     boolean not null default false,
  penjelasan_id  text,          -- diisi untuk opsi SALAH
  penjelasan_en  text
);

create index if not exists idx_opsi_soal on public.quiz_options(question_id, urutan);

-- Tepat satu jawaban benar per soal.
create unique index if not exists uq_satu_jawaban_benar
  on public.quiz_options (question_id) where is_correct;
```

### 3.3.9 — Permintaan upgrade sertifikat

Tabel `certificate_orders` dengan constraint `chk_alamat_merch`. Pengiriman digabung di tabel ini, bukan tabel terpisah.

```sql
-- 09 — Permintaan upgrade sertifikat
-- Transfer manual + konfirmasi sadar Admin. Tidak ada payment gateway di Fase 1.
-- Pengiriman digabung di tabel ini, bukan tabel terpisah — satu pesanan satu pengiriman.

create table if not exists public.certificate_orders (
  id                bigserial primary key,
  user_id           uuid not null references auth.users(id) on delete cascade,
  paket             paket_upgrade not null,
  nominal           bigint not null,     -- 30000 / 150000 / 120000, dari src/lib/constants.ts
  status            status_order not null default 'menunggu_bukti',
  bukti_url         text,                -- bucket privat payment-proofs
  alasan_tolak      text,
  alamat_pengiriman jsonb,               -- wajib untuk cert_merch & merch_addon
  status_pengiriman status_kirim not null default 'tidak_ada',
  catatan_kirim     text,
  verified_by       uuid references auth.users(id) on delete set null,
  verified_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Paket bermerchandise wajib punya alamat begitu buktinya diunggah.
alter table public.certificate_orders drop constraint if exists chk_alamat_merch;
alter table public.certificate_orders add constraint chk_alamat_merch
  check (
    paket = 'cert_only'
    or status = 'menunggu_bukti'
    or alamat_pengiriman is not null
  );

create index if not exists idx_order_user   on public.certificate_orders(user_id, created_at desc);
create index if not exists idx_order_antrean on public.certificate_orders(status, created_at);

drop trigger if exists trg_order_updated on public.certificate_orders;
create trigger trg_order_updated before update on public.certificate_orders
  for each row execute function public.set_updated_at();
```

### 3.3.10 — Row Level Security

Seluruh policy RLS. Ini berkas terpanjang. Kalau ada yang gagal, jangan lanjut ke berkas 11.

```sql
-- 10 — Row Level Security
-- Aktif di SEMUA tabel. Pengecekan admin lewat is_admin() yang SECURITY DEFINER.
-- JANGAN membuat policy pada profiles yang subquery ke profiles — itu recursion.

alter table public.profiles            enable row level security;
alter table public.activity_logs       enable row level security;
alter table public.popups              enable row level security;
alter table public.sale_banners        enable row level security;
alter table public.hero_slides         enable row level security;
alter table public.instructors         enable row level security;
alter table public.company_profile     enable row level security;
alter table public.testimonials        enable row level security;
alter table public.site_settings       enable row level security;
alter table public.batches             enable row level security;
alter table public.batch_benefits      enable row level security;
alter table public.batch_equipment     enable row level security;
alter table public.batch_gallery       enable row level security;
alter table public.batch_faqs          enable row level security;
alter table public.batch_leads         enable row level security;
alter table public.quote_requests      enable row level security;
alter table public.products            enable row level security;
alter table public.product_images      enable row level security;
alter table public.certificates        enable row level security;
alter table public.certificate_counters enable row level security;
alter table public.materials           enable row level security;
alter table public.quiz_questions      enable row level security;
alter table public.quiz_options        enable row level security;
alter table public.certificate_orders  enable row level security;

-- ---------- PROFIL ----------
drop policy if exists "profil: baca milik sendiri" on public.profiles;
create policy "profil: baca milik sendiri" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "profil: ubah milik sendiri" on public.profiles;
create policy "profil: ubah milik sendiri" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profil: admin kelola" on public.profiles;
create policy "profil: admin kelola" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- RIWAYAT AKTIVITAS ----------
drop policy if exists "aktivitas: baca milik sendiri" on public.activity_logs;
create policy "aktivitas: baca milik sendiri" on public.activity_logs
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- ---------- KONTEN PUBLIK: siapa pun boleh baca yang aktif, admin kelola ----------
do $$
declare t text;
begin
  foreach t in array array[
    'popups','sale_banners','hero_slides','instructors','testimonials',
    'batches','materials','quiz_questions'
  ] loop
    execute format('drop policy if exists "publik: baca aktif" on public.%I', t);
    execute format(
      'create policy "publik: baca aktif" on public.%I
         for select to anon, authenticated using (is_active = true)', t);

    execute format('drop policy if exists "admin: kelola" on public.%I', t);
    execute format(
      'create policy "admin: kelola" on public.%I
         for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Tabel anak & singleton: baca bebas, tulis admin
do $$
declare t text;
begin
  foreach t in array array[
    'batch_benefits','batch_equipment','batch_gallery','batch_faqs',
    'product_images','quiz_options','company_profile'
  ] loop
    execute format('drop policy if exists "publik: baca" on public.%I', t);
    execute format(
      'create policy "publik: baca" on public.%I
         for select to anon, authenticated using (true)', t);

    execute format('drop policy if exists "admin: kelola" on public.%I', t);
    execute format(
      'create policy "admin: kelola" on public.%I
         for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- CATATAN: quiz_options dapat dibaca publik, termasuk kolom is_correct.
-- Ini disengaja. Kuisnya correctable tanpa kegagalan — tidak ada yang bisa dicurangi.
-- Menyembunyikannya berarti satu round-trip server per jawaban tanpa manfaat apa pun.

-- ---------- PRODUK: anon TIDAK diberi akses. Publik lewat view products_public ----------
drop policy if exists "produk: admin kelola" on public.products;
create policy "produk: admin kelola" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- SERTIFIKAT: publik hanya baca yang QR-nya aktif ----------
drop policy if exists "sertifikat: publik baca yang aktif" on public.certificates;
create policy "sertifikat: publik baca yang aktif" on public.certificates
  for select to anon, authenticated using (qr_aktif = true);

drop policy if exists "sertifikat: admin kelola" on public.certificates;
create policy "sertifikat: admin kelola" on public.certificates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "counter: admin saja" on public.certificate_counters;
create policy "counter: admin saja" on public.certificate_counters
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- LEAD: hanya Admin yang boleh membaca. Data pribadi. ----------
drop policy if exists "lead batch: admin baca" on public.batch_leads;
create policy "lead batch: admin baca" on public.batch_leads
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "lead penawaran: admin baca" on public.quote_requests;
create policy "lead penawaran: admin baca" on public.quote_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Form publik menulis lewat Server Action dengan service role, bukan dari browser.
-- Karena itu tidak ada policy INSERT untuk anon di sini. Itu disengaja:
-- tanpa policy insert, tidak ada yang bisa membanjiri tabel lead langsung dari PostgREST.

-- ---------- PESANAN UPGRADE ----------
drop policy if exists "pesanan: milik sendiri" on public.certificate_orders;
create policy "pesanan: milik sendiri" on public.certificate_orders
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "pesanan: buat sendiri" on public.certificate_orders;
create policy "pesanan: buat sendiri" on public.certificate_orders
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "pesanan: admin kelola" on public.certificate_orders;
create policy "pesanan: admin kelola" on public.certificate_orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Pengguna sengaja TIDAK diberi hak UPDATE.
-- Kalau bisa update barisnya sendiri, dia bisa mengubah status jadi 'disetujui'.
-- Unggah ulang bukti dijalankan lewat Server Action yang memvalidasi transisi statusnya.

-- ---------- PENGATURAN ----------
drop policy if exists "pengaturan: publik baca" on public.site_settings;
create policy "pengaturan: publik baca" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "pengaturan: admin kelola" on public.site_settings;
create policy "pengaturan: admin kelola" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
```

### 3.3.11 — View publik

View `certificates_public` dan `products_public`. Keduanya WAJIB dipakai untuk seluruh akses anonim.

```sql
-- 11 — View publik
-- WAJIB dipakai untuk seluruh akses anonim. Lihat ENGINEERING.md Bagian 3.

-- Membatasi KOLOM yang terlihat publik. RLS bekerja per baris, bukan per kolom,
-- jadi pembatasan kolom harus lewat view. Tanpa email, telepon, alamat (BRD 7.2).
drop view if exists public.certificates_public;
create view public.certificates_public
with (security_invoker = on) as
select
  nomor_sertifikat,
  jenis,
  nama_lengkap,
  tanggal_terbit,
  tanggal_kedaluwarsa,
  public_token,
  public.status_sertifikat(tanggal_kedaluwarsa) as status
from public.certificates;

grant select on public.certificates_public to anon, authenticated;

-- Harga produk yang disembunyikan dijadikan NULL DI DATABASE, bukan di antarmuka.
-- security_invoker = off disengaja: view berjalan sebagai pemilik sehingga anon
-- tidak pernah butuh akses ke tabel products, dan angka harganya tidak pernah
-- ikut terkirim dalam respons apa pun. Supabase linter akan menandai ini sebagai
-- "security definer view" — peringatan itu memang diharapkan. Lihat ENGINEERING.md Bagian 12, ADR-004.
drop view if exists public.products_public;
create view public.products_public
with (security_invoker = off) as
select
  p.id, p.slug,
  p.nama_id, p.nama_en,
  p.deskripsi_id, p.deskripsi_en,
  p.spesifikasi_id, p.spesifikasi_en,
  p.kategori, p.urutan,
  case when p.tampilkan_harga then p.harga else null end as harga,
  p.tampilkan_harga
from public.products p
where p.is_active = true;

grant select on public.products_public to anon, authenticated;

-- Cara mengujinya:
--   select harga from products_public where tampilkan_harga = false;
-- Semua baris harus NULL. Kalau ada angka muncul, acceptance criteria Modul 4 gagal.
```

### 3.3.12 — Data contoh

**Data untuk pengembangan.** Berguna untuk menguji Modul 2 sebelum data asli dari Abi datang. Bersihkan sebelum go-live — lihat Bagian 14.4.

```sql
-- 12 — Data contoh untuk development
-- JANGAN dijalankan di produksi.
-- Modul 2 bisa dibangun penuh dengan data ini sambil menunggu data existing dari Abi.

insert into public.site_settings (key, value) values
  ('rekening', '{"bank":"BCA","nomor":"1234567890","atas_nama":"PT Hexatara Indonesia"}'),
  ('kontak',   '{"wa":"6281210374787","email":"info@hexatara.com"}')
on conflict (key) do nothing;

update public.company_profile set
  judul_id  = 'Tentang Hexatara Indonesia',
  judul_en  = 'About Hexatara Indonesia',
  konten_id = 'Hexatara Indonesia menyelenggarakan pelatihan pilot drone bersertifikat dan menyediakan drone Autel beserta produk pendukungnya.',
  konten_en = 'Hexatara Indonesia runs certified drone pilot training and supplies Autel drones and related equipment.'
where id = 1;

insert into public.batches (slug, judul_id, judul_en, kategori_id, lokasi_id, tanggal_mulai, tanggal_selesai, harga, status)
values
  ('rpc-oktober-2026','Pelatihan RPC Batch Oktober 2026','RPC Training October 2026 Batch','Sertifikasi RPC','Jakarta Selatan','2026-10-06','2026-10-10',4500000,'open'),
  ('rpc-november-2026','Pelatihan RPC Batch November 2026','RPC Training November 2026 Batch','Sertifikasi RPC','Jakarta Selatan','2026-11-03','2026-11-07',4500000,'upcoming'),
  ('rpc-agustus-2026','Pelatihan RPC Batch Agustus 2026','RPC Training August 2026 Batch','Sertifikasi RPC','Jakarta Selatan','2026-08-04','2026-08-08',4500000,'closed')
on conflict (slug) do nothing;

insert into public.products (slug, nama_id, nama_en, deskripsi_id, kategori, harga, tampilkan_harga)
values
  ('autel-evo-ii-pro','Autel EVO II Pro','Autel EVO II Pro','Drone kamera 6K dengan sensor 1 inci.','Drone',42000000,true),
  ('autel-evo-max-4t','Autel EVO Max 4T','Autel EVO Max 4T','Drone enterprise multi-sensor untuk misi industri.','Drone',185000000,false),
  ('paket-baterai-evo','Paket Baterai EVO','EVO Battery Pack','Baterai cadangan beserta hub pengisian.','Aksesori',6500000,true)
on conflict (slug) do nothing;

-- Tiga keadaan verifikasi yang berbeda, semuanya harus bisa diuji:
--   berlaku 2 tahun / sudah kedaluwarsa / tanpa masa berlaku
insert into public.certificates
  (nomor_sertifikat, jenis, nama_lengkap, tanggal_terbit, tanggal_kedaluwarsa, qr_aktif)
values
  ('HXT-CERT-000001','existing_manual','Budi Santoso','2026-03-15','2028-03-15',true),
  ('HXT-CERT-000002','existing_manual','Siti Rahmawati','2023-01-20','2025-01-20',true),
  ('HXT-FT-000001',  'free_track',     'Andi Prasetyo','2026-08-01',null,        true)
on conflict (nomor_sertifikat) do nothing;

update public.certificate_counters set last_number = 2 where jenis = 'existing_manual';
update public.certificate_counters set last_number = 1 where jenis = 'free_track';

insert into public.quiz_questions (urutan, pertanyaan_id, pertanyaan_en) values
  (1,'Berapa ketinggian terbang maksimum drone rekreasi di Indonesia tanpa izin khusus?',
     'What is the maximum flight altitude for recreational drones in Indonesia without special permission?')
on conflict do nothing;

insert into public.quiz_options (question_id, urutan, label_id, label_en, is_correct, penjelasan_id, penjelasan_en)
select q.id, v.urutan, v.label_id, v.label_en, v.benar, v.pen_id, v.pen_en
from public.quiz_questions q,
(values
  (1,'50 meter','50 meters',   false,'Batas resminya lebih tinggi dari ini. Terbang terlalu rendah di area terbuka justru menambah risiko tabrakan dengan penghalang.','The official limit is higher than this.'),
  (2,'120 meter','120 meters', true, null, null),
  (3,'150 meter','150 meters', false,'Ini batas yang berlaku di sebagian negara lain, bukan di Indonesia. Ketinggian maksimum di Indonesia adalah 120 meter.','This is the limit in some other countries, not Indonesia.'),
  (4,'Tidak ada batas','No limit', false,'Selalu ada batas ketinggian. Melebihi 120 meter berpotensi memasuki ruang udara pesawat berawak.','There is always an altitude limit.')
) as v(urutan,label_id,label_en,benar,pen_id,pen_en)
where q.urutan = 1
on conflict do nothing;
```

### 3.3.13 — CEK setelah kedua belas blok

Jalankan di SQL Editor:

```sql
select count(*) as jumlah_tabel
from information_schema.tables
where table_schema = 'public' and table_type = 'BASE TABLE';
```

Hasilnya harus **24**.

Lalu buktikan view harga tersembunyi benar-benar bekerja:

```sql
select nama_id, harga from products_public where tampilkan_harga = false;
```

Kolom `harga` **semuanya harus NULL.** Kalau ada angka muncul, acceptance criteria
Modul 4 sudah gagal sejak awal — dan itu jauh lebih murah diperbaiki sekarang daripada
di Sprint 4.

Terakhir, pastikan fungsi penomoran ada:

```sql
select public.next_certificate_number('free_track');
```

Harus mengembalikan `HXT-FT-000001`.

**KALAU GAGAL**

| Pesan error                                 | Artinya                                                                                                           |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `relation "xxx" already exists`             | Blok itu sudah pernah dijalankan. Lewati, lanjut ke blok berikutnya                                               |
| `relation "xxx" does not exist`             | Ada blok sebelumnya yang belum dijalankan atau gagal. Kembali ke nomor terkecil yang belum kamu Run               |
| `type "xxx" does not exist`                 | Blok 1 belum jalan                                                                                                |
| `function public.is_admin() does not exist` | Blok 2 belum jalan. Blok 10 bergantung padanya                                                                    |
| `permission denied`                         | Kamu menjalankannya bukan sebagai owner. Pastikan lewat SQL Editor di dashboard Supabase, bukan lewat client lain |
| error lain                                  | **Berhenti.** Salin utuh, tempel ke Claude Code bersama blok SQL-nya                                              |

---

## 3.4 Catat riwayat migrasi

Migrasi di project ini dijalankan manual. Satu-satunya catatan kenapa skemanya berbentuk
begini adalah tabel ini — isi tanggalnya sekarang, jangan nanti.

| Blok | Nama                | Dijalankan tanggal |
| ---- | ------------------- | ------------------ |
| 1    | Extension & enum    | 06/09/2026         |
| 2    | Profil & gate admin | 06/09/2026         |
| 3    | Konten landing      | 06/09/2026         |
| 4    | Batch               | 06/09/2026         |
| 5    | Lead                | 06/09/2026         |
| 6    | Produk              | 06/09/2026         |
| 7    | Sertifikat          | 06/09/2026         |
| 8    | Materi & kuis       | 06/09/2026         |
| 9    | Pesanan upgrade     | 06/09/2026         |
| 10   | RLS                 | 06/09/2026         |
| 11   | View publik         | 06/09/2026         |
| 12   | Data contoh         | 06/09/2026         |

Migrasi berikutnya — kalau suatu saat skema perlu berubah — ditulis sebagai berkas baru
di `docs/sql/13_*.sql`, **diusulkan AI dan dijalankan olehmu**, lalu ditambahkan ke tabel
ini. Prompt untuk memintanya ada di Bagian 6.6.

---

## 3.5 Bucket Storage

Supabase → **Storage** → **New bucket**. Buat lima, perhatikan kolom Public:

| Nama bucket      | Public?   | Isi                                  |
| ---------------- | --------- | ------------------------------------ |
| `content`        | **ya**    | foto instruktur, galeri, hero, popup |
| `products`       | **ya**    | foto produk                          |
| `materials`      | **ya**    | materi PPT/PDF                       |
| `certificates`   | **tidak** | PDF sertifikat, lewat signed URL     |
| `payment-proofs` | **tidak** | bukti transfer, Admin saja           |

**CEK** — lima bucket muncul, dan `certificates` serta `payment-proofs` bertanda Private.

## 3.6 Akun Admin pertama

Supabase → **Authentication** → **Users** → **Add user** → **Create new user**

- Email: email Abi
- Password: sementara, kirim lewat jalur pribadi
- **Centang "Auto Confirm User"**

Salin **UUID** user yang baru dibuat, lalu di SQL Editor:

```sql
update profiles set role = 'admin' where id = 'TEMPEL-UUID-DI-SINI';
```

**CEK**

```sql
select id, role from profiles where role = 'admin';
```

Harus ada satu baris.

**KALAU GAGAL** — `0 rows updated` berarti baris `profiles` belum ada. Trigger pembuatnya ada di `02_profiles_auth.sql`; kalau berkas itu dijalankan **setelah** user dibuat, trigger tidak menangkapnya. Hapus user tadi, buat ulang, lalu update lagi.

## 3.7 Simpan

Database sudah siap. Belum ada yang berubah di folder project pada fase ini — SQL
dijalankan langsung di Supabase dari Bagian 3.3 — jadi belum ada yang perlu di-commit.

Yang perlu kamu simpan justru di luar repo:

- **Password database** → pengelola kata sandi, bukan folder project
- **Project Reference ID** → dipakai di Bagian 2.6 dan 4.4
- **Tabel riwayat migrasi** di Bagian 3.4 → isi tanggalnya sekarang

**CEK terakhir Fase 3** — di Supabase, keempat hal ini benar:

- [ done ] Table Editor menampilkan 24 tabel
- [ done ] `select ... from products_public where tampilkan_harga = false` → `harga` semuanya NULL
- [ done ] Lima bucket ada, dan `certificates` serta `payment-proofs` bertanda **Private**
- [ done ] `select id, role from profiles where role = 'admin'` → ada satu baris

# FASE 4 — BERKAS KONTEKS & TIPE DATABASE

## 4.1 Buat `.env.local`

Di VS Code, buat berkas `.env.local` **di root project** — sejajar dengan `package.json`, bukan di dalam `src/`.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

RESEND_API_KEY=re_...
EMAIL_FROM="Hexatara <onboarding@resend.dev>"
ADMIN_NOTIFY_EMAIL=info@hexatara.com

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WA_ADMIN=6281210374787

RATE_LIMIT_VERIFY_ENABLED=false
```

Ganti tiga baris pertama dengan nilai dari Fase 3.2. `RESEND_API_KEY` dari resend.com → **API Keys** → **Create API Key**.

`EMAIL_FROM` sengaja memakai `onboarding@resend.dev` dulu — alamat itu berfungsi tanpa verifikasi domain. Diganti di Fase 7.

**CEK**

```powershell
git status
```

`.env.local` **tidak** muncul di daftar berkas yang akan di-commit. Kalau muncul, tambahkan barisnya ke `.gitignore` sekarang juga.

## 4.2 Salin berkas konteks — daftarnya, bukan seluruh folder

Jalankan dari dalam folder `hexatara`:

```powershell
$kit = "D:\01_Projects\Nawa Inspira Digital\hexatara\ngoding\kit"

Copy-Item "$kit\CLAUDE.md"            -Destination "."
Copy-Item "$kit\PRD.md"               -Destination "."
Copy-Item "$kit\ENGINEERING.md"       -Destination "."
Copy-Item "$kit\feature-registry.md"  -Destination "."
Copy-Item "$kit\PANDUAN.md"           -Destination "."

mkdir docs\AS_BUILT -Force
mkdir docs\sql -Force
```

> **`pw_supabase.txt` sengaja tidak ada di daftar ini.** Jangan menambahkannya. Jangan
> pakai `Copy-Item "$kit\*"` — itu akan ikut menyalin password ke folder yang sebentar
> lagi di-push ke GitHub.

Dua folder `docs\` dibuat kosong. `docs\AS_BUILT\` diisi di Fase 13.5 sebagai dokumen
serah terima; `docs\sql\` baru terpakai kalau suatu saat ada migrasi baru nomor 13 ke atas.
SQL untuk skema awal tidak perlu disalin — seluruhnya sudah ada di Bagian 3.3 berkas ini
dan sudah kamu jalankan.

Hasil akhirnya:

```
hexatara\
├─ CLAUDE.md
├─ PRD.md
├─ ENGINEERING.md
├─ feature-registry.md
├─ PANDUAN.md            ← berkas ini, ikut masuk project
├─ .env.local            ← tidak pernah di-commit
├─ next.config.ts
├─ src\
└─ docs\
   ├─ sql\               kosong, untuk migrasi 13+
   └─ AS_BUILT\          kosong, diisi di Fase 13.5
```

**CEK**

```powershell
Get-ChildItem -Name *.md
Get-ChildItem -Name docs
```

Muncul 5 berkas `.md` di root dan dua folder di `docs\`.
**Pastikan `pw_supabase.txt` TIDAK ada.**

## 4.3 Tambahkan PRD.md ke CLAUDE.md

`CLAUDE.md` bawaan paket belum memuat `PRD.md`. Buka berkas itu dan pastikan tiga baris pertama berbunyi:

```markdown
# HEXATARA

@PRD.md
@ENGINEERING.md
@feature-registry.md
```

Ini yang membuat ketiga berkas **termuat otomatis tiap sesi Claude Code**, sehingga prompt-mu bisa pendek dan tidak perlu menempel ulang isi dokumen.

**Perhatian:** `@import` tidak dievaluasi di dalam blok kode. Pastikan tiga baris itu berdiri sendiri, tidak terbungkus backtick.

## 4.4 Tipe database

```powershell
pnpm add -D supabase
pnpm supabase login
pnpm supabase gen types typescript --project-id REF_KAMU > src/types/database.ts
```

Ganti `REF_KAMU` dengan Project Reference ID dari Fase 3.2.

**CEK** — buka `src/types/database.ts`. Isinya panjang, dan kamu bisa menemukan `certificates`, `batches`, `quiz_options` di dalamnya.

**KALAU GAGAL**

- `login` membuka browser → izinkan, kembali ke terminal.
- Berkas kosong atau berisi error → REF salah atau login belum jadi. Jalankan `pnpm supabase projects list` untuk melihat REF yang benar.
- Perintah tidak dikenali → ulangi `pnpm add -D supabase`.

Ini langkah yang **paling banyak menghemat waktumu nanti.** Setelah berkas ini ada, kalau AI mengarang nama kolom, TypeScript menolaknya sebelum kodenya sempat dijalankan. **Ulangi perintah `gen types` setiap kali skema database berubah.**

## 4.5 Simpan

```powershell
git add -A
git commit -m "chore: konteks AI + env + generated types"
```

**CEK** — jalankan `git show --stat HEAD` dan pastikan **tidak ada** `.env.local` maupun `pw_supabase.txt` di daftarnya.

---

---

# FASE 5 — DEPLOY KOSONG KE VERCEL

Deploy dikerjakan **sekarang**, saat aplikasinya masih halaman kosong. Kalau ada yang salah di sini, penyebabnya cuma satu-dua hal dan mudah dilacak. Kalau ditunda sampai semua fitur jadi, penyebabnya bisa dua puluh hal sekaligus — dan itu selalu terjadi di malam sebelum deadline.

## 5.1 Push ke GitHub

Buat repo di github.com → **New repository** → nama `hexatara` → **Private** → **jangan centang apa pun** → Create.

```powershell
git remote add origin https://github.com/USERNAME-KAMU/hexatara.git
git branch -M main
git push -u origin main
```

**CEK** — refresh halaman repo, berkasnya muncul. **Buka repo di browser dan pastikan `.env.local` dan `pw_supabase.txt` tidak ada di sana.**

**KALAU GAGAL**

- Diminta username/password → GitHub tidak lagi menerima password di terminal. Install GitHub CLI dari https://cli.github.com, lalu `gh auth login` dan ulangi push.
- `remote origin already exists` → `git remote remove origin` lalu ulangi.

## 5.2 Deploy

vercel.com → **Add New** → **Project** → pilih repo `hexatara` → **Import**

Framework: Next.js (terdeteksi sendiri, jangan diubah).

Buka **Environment Variables**, tempel **seluruh isi `.env.local`** apa adanya. Vercel menerima tempelan banyak baris sekaligus.

Klik **Deploy**. Tunggu 2–3 menit.

**CEK** — dapat URL `https://hexatara-xxxx.vercel.app`, dan halaman Next.js terbuka di situ.

**KALAU GAGAL**

- `Missing environment variable` → ada baris env yang belum tertempel. Settings → Environment Variables → lengkapi → **Redeploy**.
- Build error TypeScript → jalankan `pnpm build` di lokal, perbaiki, commit, push. Vercel deploy ulang otomatis.

## 5.3 Arahkan Supabase Auth

Supabase → **Authentication** → **URL Configuration**:

- **Site URL:** URL Vercel kamu
- **Redirect URLs:** URL Vercel kamu diikuti `/**`

Kalau ini dilewat, tautan verifikasi email mengarah ke localhost dan **tidak ada satu pun pengguna yang bisa mengaktifkan akunnya** — dan gejalanya tidak muncul sebagai error, jadi tidak ketahuan sampai ada yang mengeluh.

**Setup selesai.** Mulai sekarang setiap `git push` otomatis membuat versi baru di Vercel.

---

---

# FASE 6 — CARA KERJA

Fase ini tidak menghasilkan kode. Isinya dua pemasangan terakhir, lalu satu siklus kerja
yang kamu ulang puluhan kali sampai Sprint 5 selesai. Baca sekali sampai habis, lalu
rujuk kembali kapan pun.

---

## 6.0 Pasang dua hal yang membuat prompt bekerja

Baru sekarang, setelah aplikasimu jalan dan sudah pernah deploy. Dua-duanya, tidak lebih.

### Ponytail — rem anti-kode-berlebih

Ponytail membuat agent berpikir seperti senior developer yang malas: sebelum menulis kode, dia naik tangga keputusan — apakah ini perlu dibangun, apakah sudah ada di codebase, apakah platform sudah menyediakannya. Ini **filosofi yang sama** dengan `ENGINEERING.md` Bagian 9, tapi ditegakkan tiap giliran, bukan cuma tertulis.

Di **panel chat Claude Code**, kirim **dua prompt terpisah** — jangan digabung, install-nya gagal kalau digabung:

```
/plugin marketplace add DietrichGebert/ponytail
```

lalu setelah selesai:

```
/plugin install ponytail@ponytail
```

Tutup dan buka ulang sesi.

**CEK** — jalankan `/plugin` di panel chat, `ponytail` muncul sebagai terpasang.

**Yang perlu kamu tahu:** Ponytail bekerja lewat hook yang menyuntik aturannya **otomatis tiap giliran.** Kamu **tidak perlu mengetik `/ponytail` di prompt.** Jatah "maksimal dua skill per prompt" tetap utuh untuk `/impeccable`, `/test-driven-development`, dan seterusnya.

Konfigurasinya di Windows ada di `%APPDATA%\ponytail\config.json`.

### Context7 — dokumentasi versi terbaru

Tanpa ini, AI menulis pola Next.js dari ingatannya — yang bisa satu-dua versi tertinggal. Jalankan di **terminal VS Code**:

```powershell
claude mcp add context7 -- npx -y @upstash/context7-mcp
```

**CEK** — ketik `/mcp` di panel chat, `context7` terhubung.

**KALAU GAGAL** — lewati. Gantinya, sebutkan versi eksplisit di prompt: "Next.js 15 App Router". Panduan ini tetap berjalan tanpa Context7.

**Cara memakainya:** tambahkan `use context7` di prompt saat menyentuh Next.js App Router, next-intl, Supabase SSR, pdf-lib, atau shadcn. Prompt di Fase 7–13 sudah memuat baris itu di tempat yang perlu.

> MCP lain — Playwright, Supabase, shadcn — ada di **Lampiran D** dan boleh dilewati selamanya.

---

---

## 6.1 Urutan sprint

Seluruh prompt ada di berkas ini, di Fase 7 sampai 13. Tidak ada berkas prompt terpisah.

| Fase                                           | Sprint  | Isi                                                           | Perkiraan |
| ---------------------------------------------- | ------- | ------------------------------------------------------------- | --------- |
| [7](#fase-7--sprint-0-fondasi)                 | 0       | Fondasi: Supabase client, auth, layout, kerangka Admin, email | 3–4 hari  |
| [8](#fase-8--sprint-1-landing-page)            | 1       | Modul 1 — Landing Page + Admin CMS                            | 5–7 hari  |
| [9](#fase-9--sprint-15-migrasi-dwibahasa)      | **1.5** | **Migrasi dwibahasa ID/EN**                                   | 1–2 hari  |
| [10](#fase-10--sprint-2-verifikasi-sertifikat) | 2       | Modul 2 — Verifikasi Sertifikat                               | 3–4 hari  |
| [11](#fase-11--sprint-3-sertifikat-gratis)     | 3       | Modul 3 — Free Track (terberat)                               | 7–10 hari |
| [12](#fase-12--sprint-4-katalog-produk)        | 4       | Modul 4 — Katalog Produk                                      | 3–4 hari  |
| [13](#fase-13--sprint-5-hardening--rilis)      | 5       | Hardening, aksesibilitas, sapuan akhir                        | 2–3 hari  |

**Jangan melompat.** Sprint 3 menulis ke tabel `certificates` yang sama dengan Sprint 2 —
memulai Sprint 3 sebelum Modul 2 stabil berarti men-debug dua modul sekaligus.

---

## 6.2 URUTAN DWIBAHASA — kenapa Sprint 1.5, bukan Sprint 0

**Prompt di Fase 7 dan 8 sudah disesuaikan. Kamu tidak perlu mengedit apa pun** —
tempel apa adanya, urut dari Bagian 7.1.

Sprint 0 dan 1 dibangun **Bahasa Indonesia saja**, teks langsung di JSX. Struktur foldernya:

```
src/app/
├─ (public)/        landing, batch, verify, materi, kuis, katalog
├─ (auth)/          login, daftar, lupa-sandi
├─ (user)/          dashboard
└─ admin/           Admin Panel
```

Bukan `src/app/[locale]/...`. Setelah Fase 9 dijalankan, tiga folder pertama pindah ke
bawah `src/app/[locale]/`; `admin/` tetap di luar.

Alasannya tercatat sebagai **ADR-009** di `ENGINEERING.md`. Ringkasnya: `[locale]` +
middleware + berkas JSON menambah tiga sumber kegagalan sebelum ada satu halaman pun yang
bisa dilihat. Kalau halaman `/` menghasilkan 404 di hari pertama, kamu tidak punya versi
pembanding yang berfungsi.

Ini **tidak mengurangi scope.** Dwibahasa tetap masuk Fase 1 sesuai BRD, dan skema
database sudah menyediakan kolom `_id`/`_en` sejak Bagian 3.3 — tidak ada migrasi tambahan.

**Dua pagar yang menjaga ini:**

- Blok "Status dwibahasa saat ini" di `CLAUDE.md` melarang AI membuat folder `[locale]`
  sebelum waktunya. Blok itu dihapus di akhir Fase 9 — prompt penghapusnya ada di sana
- Bagian 7.2 sengaja dikosongkan dan diberi penjelasan ke mana perginya, bukan dihapus —
  supaya kamu tidak bertanya-tanya kenapa penomorannya lompat

---

## 6.3 SIKLUS LIMA LANGKAH — inti dari Fase 6

Ini yang kamu ulang puluhan kali sampai Sprint 5 selesai. **Satu putaran = satu sub-fitur.** Jangan menggabung dua sub-fitur dalam satu putaran, dan jangan melompati langkah mana pun.

```
┌─────────────────────────────────────────────────────────────┐
│  1. PROMPT     tempel satu blok → rencana → "kerjakan"      │
│                                                             │
│  2. UJI        kamu sendiri, di browser. Bukan AI.          │
│                gagal? → 6.9, kembali ke langkah 1            │
│                                                             │
│  3. UPDATE     tempel prompt 6.6 → feature-registry.md      │
│                terisi, kolom Bukti diisi hasil langkah 2     │
│                                                             │
│  4. COMMIT     jalankan skrip 6.7 → push ke GitHub          │
│                                                             │
│  5. TUTUP      /clear, lanjut sub-fitur berikutnya          │
└─────────────────────────────────────────────────────────────┘
```

**Kenapa urutannya begitu.** Langkah 3 sebelum langkah 4 supaya `feature-registry.md` yang sudah diperbarui ikut dalam commit yang sama — jadi riwayat git dan daftar status tidak pernah berbeda. Langkah 2 sebelum langkah 3 supaya kolom Bukti berisi hasil pengujian nyata, bukan tebakan.

Kalau besok kamu lupa sudah sampai mana: buka `feature-registry.md`, cari baris `TODO` pertama. Itu posisimu.

---

## 6.4 LANGKAH 1 — PROMPT

### Yang kamu lakukan

1. Buka panel Claude Code (`Ctrl+Esc`)
2. Ketik `/context` sekali. **Pastikan `PRD.md`, `ENGINEERING.md`, dan `feature-registry.md` muncul di daftar.** Kalau tidak, `@import` di `CLAUDE.md` salah jalur — perbaiki dulu, jangan lanjut
3. Gulir ke fase sprint yang sedang kamu kerjakan (Fase 7–13), salin **satu blok prompt** — bukan seluruh bagian
4. Tempel ke panel chat, kirim
5. **Tunggu dia memaparkan rencana. Jangan langsung suruh menulis kode**
6. Rencana melenceng → koreksi dengan kalimat, jangan dibiarkan lalu diperbaiki nanti
7. Rencana benar → balas `kerjakan`

### Kalau kamu menulis prompt sendiri

Pakai bentuk ini:

```
/impeccable

Baca PRD.md Bagian [N] dan ENGINEERING.md Bagian [M] dulu.
Cek feature-registry.md untuk status fitur ini.

Tugas: F0X.Y — [nama fitur]

[langkah 1, 2, 3 yang konkret]

Batasan:
- [larangan yang relevan untuk fitur INI saja, sebut nomornya]
- [...]

Selesai bila:
- [hal yang bisa saya cek sendiri di browser]

use context7 untuk [library yang disentuh]

Paparkan rencana dulu. Tunggu persetujuan sebelum menulis kode.
```

### Lima aturan prompt

1. **Jangan menempel ulang isi dokumen.** `@import` di `CLAUDE.md` sudah memuat PRD, ENGINEERING, dan feature-registry sebelum kamu mengetik apa pun. Cukup rujuk nomor bagiannya. Menempel ulang isi dokumen adalah cara tercepat menghabiskan kuota tanpa menambah kualitas.
2. **Maksimal dua skill per prompt.** Lebih dari itu instruksinya saling bersaing dan hasilnya lebih kabur. Ponytail tidak dihitung — dia otomatis.
3. **`use context7`** setiap kali menyentuh Next.js App Router, next-intl, Supabase SSR, pdf-lib, atau shadcn.
4. **Satu sub-fitur per prompt.** "Buat halaman detail batch" terlalu besar. "Buat komponen card Jadwal & Investasi saja" bisa dinilai benar-salahnya.
5. **Selalu minta rencana dulu.** Rencana salah lebih murah dikoreksi daripada kode salah.

### Skill mana untuk apa

| Skill                             | Panggil saat                                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `/impeccable`                     | mengerjakan UI apa pun. Ini yang membuat tampilannya tidak terlihat seperti template bawaan     |
| `/writing-plans`                  | awal tiap sprint                                                                                |
| `/executing-plans`                | saat mengeksekusi rencana itu                                                                   |
| `/brainstorming`                  | sebelum fitur yang belum jelas bentuknya — F03.2 mesin kuis, F03.4 preview sertifikat           |
| `/test-driven-development`        | F02.4, F03.8, penomoran sertifikat — tiga tempat yang salahnya tidak bisa diperbaiki belakangan |
| `/systematic-debugging`           | setiap kali ada bug yang tidak langsung ketemu                                                  |
| `/verification-before-completion` | sebelum menandai DONE                                                                           |
| `/design:ux-copy`                 | teks tombol, pesan error, empty state                                                           |
| `/requesting-code-review`         | setelah satu modul selesai, sebelum UAT                                                         |
| `/humanizer`                      | menulis pesan WhatsApp atau email ke Abi. **Jangan untuk kode**                                 |

---

## 6.5 LANGKAH 2 — UJI

**Ini langkah yang paling sering dilewat, dan yang paling menentukan hasil akhirnya.**

AI menilai kode dari apakah ia masuk akal, bukan dari apakah ia berjalan. Kalau kamu tidak membukanya sendiri, tidak ada yang memeriksa. Jangan pernah menerima "sudah saya tes" dari AI sebagai pengganti langkah ini.

### 6.5.1 Enam pemeriksaan wajib — untuk SETIAP sub-fitur

Jalankan berurutan. Kalau salah satu gagal, jangan lanjut ke langkah 3.

**1 — Kode lolos**

```powershell
pnpm tsc --noEmit
pnpm lint
```

Keduanya harus selesai tanpa output error.

**2 — Aplikasi jalan**

```powershell
pnpm dev
```

Buka http://localhost:3000. Halaman yang kamu kerjakan terbuka, tidak ada layar error merah.

**3 — Console browser bersih**

Tekan `F12` → tab **Console**. **Tidak boleh ada baris merah.** Peringatan kuning boleh diabaikan; error merah tidak.

**4 — Mobile 375px**

`F12` → klik ikon HP di pojok kiri atas panel DevTools → pilih lebar **375**.

- Tidak ada scroll ke samping
- Tidak ada teks atau tombol yang terpotong
- Tombol cukup besar untuk jempol

Ini bukan pemeriksaan kosmetik. Mayoritas pengguna Hexatara memakai HP, dan 375px adalah acceptance criteria yang diuji.

**5 — Klik yang seharusnya bisa diklik**

Setiap tombol dan tautan yang kamu lihat, klik. Yang seharusnya membuka sesuatu harus membuka sesuatu. Yang seharusnya menyimpan harus benar-benar menyimpan — **cek datanya masuk ke Supabase → Table Editor**, jangan percaya pesan sukses di layar.

**6 — Versi produksi lolos**

```powershell
pnpm build
```

Error yang tertangkap di laptopmu dalam 30 detik menghabiskan 3 menit kalau baru ketahuan di Vercel.

### 6.5.2 Resep uji per jenis fitur

Selain enam di atas, jalankan yang cocok dengan fitur yang baru selesai.

| Jenis fitur                        | Cara mengujinya                                                                                                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Halaman publik**                 | Buka di jendela **Incognito** (`Ctrl+Shift+N`). Halaman harus terbuka penuh tanpa login. Kalau malah diarahkan ke `/login`, guard-nya salah pasang                                    |
| **Form apa pun**                   | Isi lalu kirim → cek baris barunya muncul di Supabase Table Editor. Lalu kirim lagi dengan kolom wajib dikosongkan → harus muncul pesan error berbahasa Indonesia, bukan error teknis |
| **Kotak persetujuan**              | Muat ulang halaman dengan `Ctrl+Shift+R`. Kotaknya **harus kosong**. Kalau tercentang sendiri, itu pelanggaran acceptance criteria — laporkan ke AI, jangan diperbaiki manual         |
| **CRUD Admin**                     | Uji keempatnya: tambah → muncul di daftar; ubah → perubahan tersimpan setelah muat ulang; hapus → muncul konfirmasi dulu, lalu hilang; batal hapus → data masih ada                   |
| **Unggah gambar**                  | Unggah foto asli dari HP (2–5 MB) → cek ukuran berkas di Supabase Storage. **Harus jauh lebih kecil dari aslinya.** Kalau sama besar, kompresinya tidak jalan                         |
| **Halaman dengan gambar Supabase** | Gambar harus muncul. Kalau kotak kosong tanpa error, `remotePatterns` di `next.config.ts` belum diisi — Fase 2.6                                                                      |
| **Email**                          | Picu aksinya, lalu cek kotak masuk **dan folder spam**. Kalau tidak masuk sama sekali, cek Resend → Logs                                                                              |
| **Login / auth**                   | Uji tiga hal: login benar → masuk; login salah → pesan error, tidak masuk; buka `/admin` sebagai pengguna biasa → ditolak                                                             |
| **Ekspor CSV**                     | Unduh, **buka dengan Excel**. Nama yang mengandung huruf beraksen harus tampil benar. Kalau berantakan, BOM-nya hilang                                                                |
| **Import Excel/CSV**               | Sengaja rusak 2–3 baris di berkas contoh (kosongkan nama, tulis tanggal ngawur) → import → laporan harus menyebut **nomor baris yang salah**, dan baris sisanya tetap masuk           |

### 6.5.3 Resep uji khusus — fitur yang tidak bisa diuji dengan mengklik saja

Empat ini butuh kamu mengubah data dulu di Supabase. Lakukan lewat **Table Editor** atau **SQL Editor**.

**Status kedaluwarsa sertifikat — F02.4 dan F02.5**

Di SQL Editor, siapkan tiga baris uji:

```sql
-- sudah lewat → harus tampil Invalid, merah
update certificates set tanggal_kedaluwarsa = current_date - 1
where nomor_sertifikat = 'HXT-CERT-000001';

-- belum lewat → harus tampil Berlaku, hijau
update certificates set tanggal_kedaluwarsa = current_date + 30
where nomor_sertifikat = 'HXT-CERT-000002';
```

Lalu buka `/verify` dan cari ketiganya:

| Yang dicari                      | Harus tampil                                     |
| -------------------------------- | ------------------------------------------------ |
| `HXT-CERT-000001`                | **Invalid**, merah                               |
| `HXT-CERT-000002`                | **Berlaku**, hijau                               |
| sertifikat `free_track` mana pun | **Berlaku**, hijau, tulisan "Tanpa masa berlaku" |
| `HXT-CERT-999999` (tidak ada)    | **Tidak ditemukan**, abu-abu                     |

Dua yang terakhir harus **jelas berbeda** dari "Invalid" — beda warna dan beda kalimat. Bagi verifikator yang memeriksa dokumen orang, Invalid dan Tidak ditemukan berujung pada tindakan yang berbeda.

**Harga produk tersembunyi — F04.3**

1. Di Supabase, set satu produk `tampilkan_harga = false`
2. Buka halaman detail produk itu di browser
3. `F12` → tab **Network** → muat ulang halaman
4. `Ctrl+F` di panel Network, ketik **angka harga produk itu**
5. **Hasilnya harus nol.** Kalau angkanya ketemu di respons mana pun, query-nya menyentuh tabel `products` langsung, bukan view `products_public`

Verifikasi kedua, di SQL Editor:

```sql
select nama_id, harga from products_public where tampilkan_harga = false;
```

Kolom `harga` semuanya harus NULL.

**Mesin kuis — F03.2**

1. Buka `/kuis` **tanpa login**
2. Sengaja pilih jawaban salah → harus langsung ditandai merah **saat itu juga**, tidak menunggu selesai
3. Baca penjelasannya. Pilih opsi salah yang **lain** → penjelasannya harus **berbeda**. Kalau sama, itu penjelasan umum — melanggar acceptance criteria
4. Ganti ke jawaban benar → boleh, tanpa pengurangan apa pun
5. Selesaikan semua soal → hasilnya **100%**, muncul tombol "Dapatkan Sertifikat"
6. Cari di kode: tidak boleh ada `PASSING_SCORE`, `MIN_SCORE`, timer, atau tabel riwayat pengerjaan

**Sertifikat preview — F03.4**

1. Selesaikan kuis, daftar akun, buka halaman sertifikat preview
2. `F12` → tab **Network** → muat ulang
3. Cari `public_token` di seluruh respons
4. **Harus nol hasil.** Token tidak boleh dikirim ke browser sebelum Admin mengaktifkan. Kalau tokennya ada tapi di-blur dengan CSS, itu bisa dibatalkan siapa pun lewat DevTools — dan acceptance criteria menguji tepat hal ini

### 6.5.4 Catat apa yang kamu uji

Sambil menguji, tulis satu kalimat berisi **apa yang kamu klik dan apa hasilnya.** Kalimat ini dipakai dua kali: di `feature-registry.md` kolom Bukti (langkah 3), dan di pesan commit (langkah 4).

Buruk: `sudah dites, jalan`

Baik: `HXT-CERT-000002 exp 2025-01-20 tampil Invalid merah; HXT-FT-000001 tampil "tanpa masa berlaku" hijau; nomor ngawur tampil "tidak ditemukan" abu-abu; 375px tanpa scroll samping`

Enam bulan lagi, saat menyusun manual book atau mengerjakan Fase 2, contoh buruk tidak memberi tahu apa pun. Contoh baik memberi tahu segalanya — dan sudah setengah jadi sebagai isi manual book.

---

## 6.6 LANGKAH 3 — UPDATE BERKAS

Setelah pengujian lolos, `feature-registry.md` harus diperbarui **sebelum** kamu commit. Ini yang membuat AI di sesi berikutnya tahu fitur mana yang sudah selesai dan mana yang belum — sekaligus jadi pengingat posisimu sendiri.

### Prompt siap tempel

Ganti bagian dalam kurung siku, sisanya biarkan apa adanya.

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.

Saya sudah menguji F0X.Y sendiri di browser dan hasilnya sesuai.

Isi baris F0X.Y:
- Status  : DONE
- Berkas  : [daftar berkas utama yang dibuat/diubah, dipisah koma]
- Diuji   : [tanggal hari ini, format YYYY-MM-DD]
- Bukti   : [kalimat yang saya tulis di langkah 6.5.4]

Lalu tambahkan satu baris ke bagian "Log verifikasi" di bawah,
dengan format: YYYY-MM-DD  F0X.Y  [ringkasan satu kalimat]

Jangan mengubah status baris fitur lain.
Jangan menandai fitur lain DONE.
Tampilkan hasil akhir barisnya supaya saya bisa periksa.
```

**CEK** — buka `feature-registry.md`, pastikan hanya baris F0X.Y yang berubah dan kolom Bukti berisi kalimat pengujianmu, bukan kata "sudah dites".

### Kalau ada yang lebih dari sekadar status

Kadang saat mengerjakan sebuah fitur kamu menemukan sesuatu yang perlu dicatat permanen. Ini prompt-nya:

**Kalau AI melanggar aturan yang belum tertulis di mana pun** — tambahkan larangannya supaya tidak terulang:

```
Tambahkan satu larangan baru ke PRD.md Bagian 13, di kelompok yang paling cocok.

Larangan: [tulis larangannya]
Alasan: [kenapa ini masalah nyata di proyek ini]

Jangan mengubah larangan yang sudah ada. Jangan mengubah berkas lain.
```

**Kalau kamu mengambil keputusan teknis yang mengikat ke depan** — catat sebagai ADR:

```
Tambahkan ADR baru di ENGINEERING.md Bagian 10, nomor berikutnya setelah yang terakhir.

Konteks    : [masalah apa, batasan apa]
Keputusan  : [apa yang dipilih]
Konsekuensi: [apa yang jadi lebih sulit karena pilihan ini]

Jangan mengedit ADR yang sudah ada. Jangan menghapus apa pun.
```

**Kalau skema database perlu berubah** — AI **tidak boleh** menjalankannya:

```
Saya butuh perubahan skema: [jelaskan kebutuhannya]

Tulis SQL-nya sebagai USULAN di berkas baru docs/sql/13_[nama].sql.
Jangan menjalankannya — saya yang menjalankan manual di Supabase SQL Editor.
Jelaskan kenapa perubahan ini perlu, dan apa yang rusak kalau tidak dilakukan.
Setelah saya jalankan, saya sendiri yang menambahkan barisnya ke tabel riwayat
migrasi di PANDUAN.md Bagian 3.4.
```

Setelah kamu menjalankannya di Supabase, **jangan lupa**:

```powershell
pnpm supabase gen types typescript --project-id REF_KAMU > src/types/database.ts
```

Tanpa ini, tipe TypeScript-mu tertinggal dari database dan AI mulai mengarang nama kolom lagi.

---

## 6.7 LANGKAH 4 — COMMIT

### Skrip lengkap, jalankan berurutan

Ganti dua bagian dalam kurung siku. Sisanya tempel apa adanya.

```powershell
cd "D:\01_Projects\Nawa Inspira Digital\Development\hexatara"

pnpm tsc --noEmit
pnpm lint
pnpm build

git add -A
git commit -m "feat(F0X.Y): [ringkasan singkat fiturnya]" -m "Diuji: [kalimat bukti dari langkah 6.5.4]"
git push
```

Tiga perintah pertama adalah gerbangnya. **Kalau salah satu gagal, jangan commit** — perbaiki dulu.

**CEK** — buka repo di GitHub, commit terbaru muncul. Buka Vercel → Deployments, build baru berjalan otomatis dan berakhir hijau.

### Kenapa dua `-m`

`-m` pertama jadi judul commit, `-m` kedua jadi isinya. Hasilnya riwayat git yang membawa bukti pengujian:

```
feat(F02.4): status kedaluwarsa sertifikat otomatis

Diuji: HXT-CERT-000002 exp 2025-01-20 tampil Invalid merah;
HXT-FT-000001 tampil "tanpa masa berlaku" hijau; nomor ngawur
tampil "tidak ditemukan" abu-abu; 375px tanpa scroll samping
```

Saat serah terima ke Hexatara atau saat mengerjakan Fase 2, `git log` jadi catatan pengujian yang tidak perlu kamu susun ulang.

### Format pesan commit

```
<jenis>(<kode fitur>): <ringkasan huruf kecil, tanpa titik>
```

| Jenis      | Dipakai untuk                                      |
| ---------- | -------------------------------------------------- |
| `feat`     | fitur baru                                         |
| `fix`      | perbaikan bug                                      |
| `refactor` | merapikan kode tanpa mengubah perilaku             |
| `chore`    | dependency, konfigurasi, berkas dokumen            |
| `docs`     | perubahan pada PRD, ENGINEERING, PANDUAN, AS_BUILT |
| `test`     | menambah atau memperbaiki test                     |
| `style`    | murni tampilan, tanpa perubahan logika             |

### Daftar pesan commit — Sprint 0

| Kode   | Pesan commit                                                     |
| ------ | ---------------------------------------------------------------- |
| F00.1  | `chore: init next.js + tailwind + shadcn`                        |
| F00.2  | `feat(F00.2): supabase client browser, server, dan admin`        |
| F00.3  | `chore(F00.3): generate tipe database dari supabase`             |
| F00.4  | `feat(F00.4): dwibahasa next-intl` — **ditunda ke Sprint 1.5**   |
| F00.5  | `feat(F00.5): layout publik header, footer, floating whatsapp`   |
| F00.6  | `feat(F00.6): auth daftar, login, verifikasi email, reset sandi` |
| F00.7  | `feat(F00.7): login admin terpisah dan guard requireAdmin`       |
| F00.8  | `feat(F00.8): kerangka admin panel dan sidebar`                  |
| F00.9  | `feat(F00.9): helper resend dan template email`                  |
| F00.10 | `feat(F00.10): design token ke globals.css`                      |

### Daftar pesan commit — Sprint 1

| Kode   | Pesan commit                                             |
| ------ | -------------------------------------------------------- |
| F01.1  | `feat(F01.1): popup pembuka landing page`                |
| F01.2  | `feat(F01.2): sale banner dengan periode tayang`         |
| F01.3  | `feat(F01.3): hero produk unggulan dan cta utama`        |
| F01.4  | `feat(F01.4): section jadwal pelatihan mendatang`        |
| F01.5  | `feat(F01.5): halaman detail batch`                      |
| F01.6  | `feat(F01.6): form pendaftaran minat ke db dan whatsapp` |
| F01.7  | `feat(F01.7): galeri instruktur`                         |
| F01.8  | `feat(F01.8): company profile di bawah landing`          |
| F01.9  | `feat(F01.9): floating whatsapp button`                  |
| F01.10 | `feat(F01.10): testimoni`                                |
| F01.11 | `feat(F01.11): pemilih bahasa di halaman publik`         |
| F01.12 | `feat(F01.12): admin crud batch dan isi halaman detail`  |
| F01.13 | `feat(F01.13): admin crud konten landing`                |
| F01.14 | `feat(F01.14): admin daftar lead dan ekspor csv`         |
| 1.5    | `refactor: migrasi dwibahasa ke next-intl`               |

### Daftar pesan commit — Sprint 2

| Kode  | Pesan commit                                                    |
| ----- | --------------------------------------------------------------- |
| F02.1 | `feat(F02.1): halaman verify form pencarian nomor`              |
| F02.2 | `feat(F02.2): halaman hasil verify dari pemindaian qr`          |
| F02.3 | `feat(F02.3): tampilan hasil verifikasi lima kolom`             |
| F02.4 | `feat(F02.4): status kedaluwarsa sertifikat otomatis`           |
| F02.5 | `feat(F02.5): sertifikat tanpa masa berlaku`                    |
| F02.6 | `feat(F02.6): pesan sertifikat tidak ditemukan`                 |
| F02.7 | `feat(F02.7): admin crud sertifikat satuan`                     |
| F02.8 | `feat(F02.8): admin import massal sertifikat`                   |
| F02.9 | `feat(F02.9): rate limit endpoint verify di balik feature flag` |

### Daftar pesan commit — Sprint 3

| Kode   | Pesan commit                                                     |
| ------ | ---------------------------------------------------------------- |
| F03.1  | `feat(F03.1): halaman materi free track tanpa login`             |
| F03.2  | `feat(F03.2): mesin kuis correctable`                            |
| F03.4  | `feat(F03.4): sertifikat preview qr blur dan badge ready to fly` |
| F03.5  | `feat(F03.5): pilih paket upgrade sertifikat`                    |
| F03.6  | `feat(F03.6): unggah bukti transfer`                             |
| F03.7  | `feat(F03.7): admin verifikasi dan tolak pembayaran`             |
| F03.8  | `feat(F03.8): aktivasi qr dan terbitkan sertifikat`              |
| F03.9  | `feat(F03.9): dashboard pengguna free track`                     |
| F03.10 | `feat(F03.10): tambah merchandise menyusul`                      |
| F03.11 | `feat(F03.11): admin status pengiriman merchandise`              |
| F03.12 | `feat(F03.12): admin crud materi`                                |
| F03.13 | `feat(F03.13): admin crud bank soal dan import excel`            |

### Daftar pesan commit — Sprint 4 dan 5

| Kode  | Pesan commit                                              |
| ----- | --------------------------------------------------------- |
| F04.1 | `feat(F04.1): halaman katalog produk`                     |
| F04.2 | `feat(F04.2): halaman detail produk`                      |
| F04.3 | `feat(F04.3): tampil sembunyi harga per produk`           |
| F04.4 | `feat(F04.4): tombol kontak retail`                       |
| F04.5 | `feat(F04.5): form permintaan penawaran`                  |
| F04.6 | `feat(F04.6): admin crud produk`                          |
| F05.1 | `fix(F05.1): audit aksesibilitas kontras dan area sentuh` |
| F05.2 | `perf(F05.2): lighthouse mobile di atas 90`               |
| F05.3 | `feat(F05.3): halaman error 404 dan 500`                  |
| F05.4 | `feat(F05.4): metadata seo sitemap dan hreflang`          |
| F05.5 | `feat(F05.5): pemantauan error sentry`                    |
| F05.6 | `chore(F05.6): verifikasi backup supabase`                |
| F05.7 | `chore(F05.7): deploy produksi domain dan ssl`            |
| F05.8 | `docs(F05.8): isi dokumen as-built keempat modul`         |

### Commit di luar fitur

| Situasi                  | Pesan commit                                       |
| ------------------------ | -------------------------------------------------- |
| Perbaikan bug            | `fix(F0X.Y): [gejala yang diperbaiki]`             |
| Menambah larangan ke PRD | `docs: tambah larangan [ringkas] ke PRD bagian 13` |
| Menambah ADR             | `docs: ADR-0XX [judul keputusan]`                  |
| Usulan SQL baru          | `chore(sql): usulan migrasi 13_[nama]`             |
| Regenerate tipe database | `chore: regenerate tipe database`                  |
| Pasang pagar kualitas    | `chore: pasang knip, eslint a11y, dan husky`       |

---

## 6.8 LANGKAH 5 — TUTUP SESI

```
/clear
```

Lalu mulai sub-fitur berikutnya dari langkah 1.

**Satu sesi = satu sub-fitur.** Bukan demi hemat token: instruksi yang dibaca di pesan pertama makin lemah pengaruhnya di pesan kelima puluh, dan larangan-larangan itulah yang menahan scope creep. Sesi pendek membuat aturan tetap dekat.

Kalau sesi masih panjang tapi sub-fiturnya belum selesai, pakai `/compact`, bukan `/clear`.

---

## 6.9 KALAU LANGKAH 2 GAGAL

Jangan lanjut ke langkah 3. Jangan memperbaiki kodenya sendiri kalau kamu tidak yakin — itu membuat AI dan kamu bekerja di dua arah berbeda.

```
/systematic-debugging

Bug di F0X.Y: [gejala yang terlihat, bukan dugaan penyebabnya]
Langkah reproduksi: [1, 2, 3]
Yang diharapkan: [...]
Yang terjadi: [...]
Pesan error di console: [tempel utuh, jangan diringkas]

Cari akar masalahnya dulu, jangan menambal gejala.
Grep semua pemanggil fungsi yang tersentuh sebelum memilih perbaikan.
Paparkan diagnosis sebelum mengubah kode.
```

Setelah diperbaiki, **ulangi langkah 2 dari awal** — enam pemeriksaan wajib, bukan hanya bagian yang tadi rusak.

### Kalau hasilnya melanggar batasan

```
Ini melanggar larangan nomor [N] di PRD.md Bagian 13.
Hapus [bagian yang melanggar]. Jangan diganti dengan versi yang lebih halus —
memang tidak boleh ada sama sekali di Fase 1.
```

### Kalau AI ngaco berulang kali

Urutan yang harus dicoba, dari termurah:

1. **`/clear`, mulai sesi baru.** Konteks yang panjang membuat aturan di awal terlupakan. Ini menyelesaikan mayoritas kasus
2. **Cek `/context`** — kalau `PRD.md` tidak termuat, seluruh aturan hilang dan wajar saja dia ngaco
3. **Persempit tugasnya.** Satu komponen, bukan satu halaman penuh
4. **Tempel pesan error utuh**, bukan ringkasanmu. AI membaca stack trace lebih baik daripada deskripsi
5. **Kembalikan ke commit terakhir yang sehat:**
   ```powershell
   git reset --hard HEAD
   ```
   Ini menghapus perubahan yang belum di-commit. Karena itu commit setiap kali satu sub-fitur berhasil — supaya selalu ada titik mundur yang dekat

---

## 6.10 PERINTAH HARIAN

```powershell
cd "D:\01_Projects\Nawa Inspira Digital\Development\hexatara"

pnpm dev                  # localhost:3000, biarkan jalan di terminal terpisah
pnpm build                # uji versi produksi lokal — jalankan sebelum push
pnpm tsc --noEmit         # cek tipe
pnpm lint                 # cek gaya kode
pnpm knip                 # cari kode mati (setelah Lampiran B.3)
pnpm test                 # test tiga tempat kritis (setelah Lampiran B.4)
```

---

## 6.11 PERINTAH CLAUDE CODE YANG PERLU DIHAFAL

| Perintah          | Gunanya                                                 |
| ----------------- | ------------------------------------------------------- |
| `/clear`          | buang konteks, mulai bersih — antar sub-fitur           |
| `/compact`        | ringkas konteks saat sesi panjang belum selesai         |
| `/context`        | lihat berkas apa saja yang termuat dan berapa tokennya  |
| `/cost`           | pemakaian sesi ini                                      |
| `/mcp`            | cek MCP yang terhubung                                  |
| `/plugin`         | cek plugin terpasang                                    |
| `Esc`             | hentikan di tengah jalan saat arahnya salah             |
| `Esc Esc`         | mundur ke pesan sebelumnya dan ubah instruksinya        |
| `#` di awal pesan | simpan aturan baru ke CLAUDE.md permanen                |
| `Shift+Tab`       | ganti mode izin — plan mode berguna sebelum tugas besar |

`Esc` lebih hemat daripada membiarkan dia selesai lalu minta ulang. Kalau di paragraf pertama arahnya sudah salah, hentikan di situ.

**Jalankan `/context` sekali di awal tiap hari** untuk memastikan `PRD.md`, `ENGINEERING.md`, dan `feature-registry.md` benar-benar termuat. Kalau tidak muncul, `@import` di `CLAUDE.md` salah jalur — atau terbungkus backtick.

---

## 6.12 SAAT SATU MODUL SELESAI

Setelah semua baris satu sprint berstatus `DONE` di `feature-registry.md`:

**1 — Bersihkan kode mati**

```powershell
pnpm knip
```

Hapus apa yang dilaporkan, atau minta AI menghapusnya. AI sering meninggalkan helper dan komponen tak terpakai saat pendekatannya berubah di tengah jalan.

**2 — Minta review**

```
/requesting-code-review

Modul [n] sudah selesai, semua baris di feature-registry.md berstatus DONE.

Tinjau seluruh kode modul ini terhadap:
- acceptance criteria di PRD.md Bagian [N]
- 25 larangan di PRD.md Bagian 13
- checklist teknis di ENGINEERING.md Bagian 8

Laporkan temuan sebagai daftar, paling parah di atas.
Jangan memperbaiki apa pun dulu — saya yang memutuskan mana yang dikerjakan.
```

**3 — Isi dokumen serah terima**

```
Tugas: isi docs/AS_BUILT/M[n]-[nama].md.

Salin struktur dari docs/AS_BUILT/_TEMPLATE.md.
Isi dari apa yang BENAR-BENAR dibangun, bukan dari rencana di PRD.
Kalau ada yang dibangun berbeda dari rencana, tulis apa adanya beserta alasannya.
Sumber datanya: kode yang ada di repo dan kolom Bukti di feature-registry.md.

Jangan mengubah berkas lain.
```

**4 — Commit dan tandai**

```powershell
git add -A
git commit -m "docs: as-built modul [n] [nama]" -m "Semua fitur F0[n].x berstatus DONE dan diuji"
git tag -a "modul-[n]-selesai" -m "Modul [n] selesai, siap UAT Hexatara"
git push
git push --tags
```

Tag membuat kamu bisa kembali ke titik ini kapan saja, misalnya kalau UAT menemukan sesuatu dan kamu perlu membandingkan.

**5 — Serahkan ke Hexatara untuk UAT**

Kirim URL Vercel bersama daftar acceptance criteria modul itu dari `PRD.md`. Isi baris modul itu di tabel UAT di `feature-registry.md`.

Umpan balik yang masuk **dipilah dulu**: perbaikan dalam scope dikerjakan, permintaan baru dicatat sebagai kandidat Fase 2. Jangan langsung dikerjakan — itu persis bagaimana proyek delapan minggu berubah jadi empat belas minggu tanpa ada yang memutuskannya.

---

---

# FASE 7 — SPRINT 0: FONDASI

> Perkiraan 3–4 hari. Empat blok, satu sesi per blok.
> **Bahasa Indonesia saja.** Jangan membuat folder `[locale]` — lihat blok 0.B.

---

## 7.1 Supabase client & konstanta

```
/writing-plans

Baca PRD.md Bagian 5 dan ENGINEERING.md Bagian 3 dulu.

Tugas: F00.2 dan F00.3.

1. Buat src/lib/supabase/ berisi tiga berkas:
   - client.ts  : browser client (@supabase/ssr createBrowserClient)
                  dipakai HANYA di Client Component
   - server.ts  : server client dengan cookie handling untuk App Router
                  ini yang dipakai secara default
   - admin.ts   : service role client
                  WAJIB diawali baris: import 'server-only';
                  baris itu membuat impor dari Client Component gagal saat BUILD,
                  bukan gagal diam-diam di produksi

2. Buat src/lib/constants.ts berisi harga upgrade:
   HARGA_CERT_ONLY = 30000
   HARGA_CERT_MERCH = 150000
   HARGA_MERCH_ADDON = 120000

3. Buat src/types/database.ts sebagai placeholder — nanti ditimpa hasil
   generate Supabase CLI

Batasan:
- service role hanya di server. Kalau ada Client Component mengimpornya, itu bug fatal
- jangan pasang ORM apa pun (larangan nomor 7 di PRD.md Bagian 13)
- jangan menulis interface tabel manual — tipe database berasal dari generate

use context7 untuk pola @supabase/ssr terbaru di Next.js 15 App Router.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Buka `src/lib/supabase/admin.ts` — baris pertamanya `import 'server-only';`
- Coba impor `admin.ts` dari sebuah Client Component, lalu `pnpm build` → **harus gagal**. Hapus lagi impornya setelah terbukti gagal. Ini membuktikan pagarnya bekerja
- `pnpm tsc --noEmit` bersih

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F00.2 dan F00.3 sendiri dan hasilnya sesuai.
Isi kedua barisnya: Status DONE, Berkas src/lib/supabase/, Diuji [tanggal hari ini],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F00.2): supabase client browser, server, dan admin" -m "Diuji: impor admin.ts dari Client Component menggagalkan build seperti yang diharapkan"
git push
```

---

## 7.2 Dwibahasa — **DILEWATI DI SPRINT INI**

> **Jangan kerjakan sekarang.** Blok ini sengaja dikosongkan.
>
> Dwibahasa dikerjakan di **Fase 9**, setelah landing page Sprint 1 selesai dan sudah kamu lihat sendiri di browser.
>
> **Alasannya** (ADR-009 di `ENGINEERING.md`): `[locale]` + middleware + berkas JSON menambah tiga sumber kegagalan sebelum ada satu halaman pun yang bisa dilihat. Kalau halaman `/` menghasilkan 404 di hari pertama, kamu tidak punya versi pembanding yang berfungsi untuk mengetahui apakah penyebabnya routing, middleware, atau kodenya.
>
> **Ini tidak mengurangi scope.** Dwibahasa tetap masuk Fase 1 sesuai BRD — hanya digeser dua minggu. Skema database sudah menyediakan kolom `_id`/`_en` sejak `docs/sql/` dijalankan, jadi tidak ada migrasi database saat dwibahasa masuk.
>
> **Sampai `01b` dijalankan:** jangan membuat folder `[locale]`, jangan `pnpm add next-intl`, jangan membuat `messages/id.json`, jangan memakai helper `pick()`.
>
> F00.4 di `feature-registry.md` dibiarkan berstatus `TODO` sampai Sprint 1.5. Jangan ditandai SKIP — dia dikerjakan, hanya belakangan.

---

## 7.3 Autentikasi

```
/test-driven-development

Baca PRD.md Bagian 3 dan ENGINEERING.md Bagian 4 dulu.

Tugas: F00.6 dan F00.7.

Halaman pengguna di src/app/(auth)/:
  /daftar  /login  /lupa-sandi  /reset-sandi  /verifikasi-email

Halaman admin TERPISAH di src/app/admin/login/
  (BRD 7.3 — login Admin tidak boleh menyatu dengan login pengguna)

Guard di src/lib/auth/guard.ts berisi requireAdmin() dan requireUser().

CATATAN STRUKTUR: proyek ini BELUM dwibahasa. Route ada langsung di
src/app/(auth)/, BUKAN src/app/[locale]/(auth)/.
Jangan membuat folder [locale] — lihat CLAUDE.md bagian "Status dwibahasa".

Batasan:
- centang persetujuan penyimpanan data WAJIB tidak tercentang saat halaman dibuka.
  defaultChecked DILARANG di seluruh proyek ini
- simpan waktu persetujuan ke kolom consent_at, bukan boolean.
  Boolean true tidak memberi tahu kapan persetujuan diberikan
- sistem TIDAK PERNAH mengirim kata sandi dalam bentuk teks
- validasi pakai Zod di server. Validasi client hanya untuk kenyamanan
- requireAdmin() dipanggil di setiap Server Component DAN setiap Server Action
  di bawah /admin. Pengecekan di layout saja TIDAK CUKUP — Server Action punya
  endpoint sendiri dan bisa dipanggil langsung dengan fetch tanpa melewati layout

Selesai bila:
- daftar -> email verifikasi terkirim -> akun belum bisa dipakai sebelum diklik
- reset sandi lewat tautan bertoken, sekali pakai
- requireAdmin() menolak pengguna biasa DAN menolak saat dipanggil dari
  Server Action, bukan cuma di layout

use context7 untuk Supabase Auth + Next.js 15 App Router.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Daftar akun baru → email verifikasi masuk (cek folder spam juga)
- Coba login sebelum email diklik → **ditolak**
- Klik tautan verifikasi → login berhasil
- Reset sandi → tautan masuk, bisa dipakai sekali; klik tautan yang sama kedua kali → ditolak
- Muat ulang halaman daftar dengan `Ctrl+Shift+R` → kotak persetujuan **kosong**
- Login sebagai pengguna biasa, buka `/admin` → ditolak
- Cek Supabase → Table Editor → `batch_leads` atau `profiles`: kolom `consent_at` terisi waktu, bukan `true`

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F00.6 dan F00.7 sendiri di browser dan hasilnya sesuai.
Isi kedua barisnya: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F00.6): auth daftar, login, verifikasi email, reset sandi" -m "Diuji: akun baru tidak bisa login sebelum email diklik; tautan reset sekali pakai; centang persetujuan kosong saat halaman dibuka; /admin menolak pengguna biasa"
git push
```

---

## 7.4 Layout & design token

```
/impeccable

Baca PRD.md Bagian 12 dan ENGINEERING.md Bagian 7 dulu.

Tugas: F00.5, F00.8, F00.10.

1. Design token ke src/app/globals.css sesuai daftar di PRD.md Bagian 12.2.
   Tailwind 4 mengonfigurasi tema di CSS, bukan di tailwind.config.ts

2. Layout publik: header + nav + footer + floating WhatsApp button.
   Nomor WA dari NEXT_PUBLIC_WA_ADMIN

3. Kerangka Admin Panel: sidebar dengan seluruh menu di PRD.md Bagian 4,
   halamannya boleh kosong dulu

CATATAN: pemilih bahasa BELUM dipasang di sprint ini — dia masuk bersama
migrasi dwibahasa di Fase 9. Sisakan tempat untuknya di header
kalau memudahkan, tapi jangan render komponennya.

Batasan mobile-first — ini yang paling sering dilanggar:
- tulis untuk 375px DULU, lebarkan dengan sm: md: lg:. Bukan sebaliknya
- font dasar 16px, jangan lebih kecil. Pengguna sampai usia 70 tahun
- teks sekunder minimum 14px
- area sentuh minimum 44x44px
- kontras minimum 4.5:1
- floating WA HANYA tautan wa.me. Tanpa API, tanpa gateway, tanpa chatbot
  (larangan nomor 23)
- jangan pasang library animasi (larangan di ENGINEERING.md Bagian 2.2)
- jangan menulis nilai warna langsung di komponen. Semua lewat token

Selesai bila di viewport 375px tidak ada scroll horizontal di halaman mana pun.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- `F12` → mode HP → lebar **375** → tidak ada scroll ke samping di halaman mana pun
- Ukur satu tombol dengan DevTools → minimal 44×44px
- Klik floating WhatsApp → membuka WhatsApp dengan nomor Admin. Cek kodenya: tidak ada `fetch` ke API mana pun
- Sidebar Admin menampilkan seluruh menu di `PRD.md` Bagian 4, walau halamannya masih kosong
- Cari di kode: tidak ada nilai hex warna yang ditulis langsung di komponen

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F00.5, F00.8, dan F00.10 sendiri di browser dan hasilnya sesuai.
Isi ketiga barisnya: Status DONE, Berkas [daftar berkas], Diuji [06/09/2026]
Bukti [sudah berganti font dan sudah berubah menjadi humberger ketika resize]
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F00.5): layout publik, kerangka admin, dan design token" -m "Diuji: 375px tanpa scroll samping di semua halaman; tombol 44x44px; floating WA hanya tautan wa.me tanpa pemanggilan API"
git push
```

---

## 7.5 Helper email

> **Catatan status akun (2026-09-06):** Akun Resend didaftarkan atas nama InspiraLabs (bukan email pribadi/klien) — pemilik akun tetap InspiraLabs, sesuai kesepakatan dengan Alif. Verifikasi domain `hexatara.com` di Resend BELUM dilakukan — menunggu akses DNS dari Abi (lihat tabel "Diblokir/menunggu pihak lain" di `feature-registry.md`). Untuk fase ini, dev/testing tetap jalan pakai domain sandbox `onboarding@resend.dev` seperti sudah diatur di `.env.local` (Fase 4.1) — sandbox ini hanya bisa mengirim ke alamat email pemilik akun Resend sendiri, cukup untuk uji lima pemicu di bawah. Verifikasi domain + Custom SMTP produksi baru dikerjakan di Fase 14.3 setelah DNS tersedia.

```
Baca PRD.md Bagian 11 dulu.

Tugas: F00.9.

Buat src/lib/email/ berisi helper Resend dan template untuk LIMA pemicu:
1. registrasi akun          -> pengguna, tautan verifikasi
2. permintaan reset sandi   -> pengguna, tautan bertoken sekali pakai
3. pembayaran disetujui     -> pengguna, QR aktif
4. bukti pembayaran ditolak -> pengguna, alasan + minta kirim ulang
5. lead baru masuk          -> Admin

Template ditulis sebagai fungsi yang mengembalikan HTML.
Jangan memasang library template tambahan — lima email tidak membutuhkannya.

Batasan:
- LIMA pemicu, tidak lebih. Email keenam adalah pelanggaran scope (larangan nomor 24)
- tanpa email selamat datang, tanpa pengingat berkala, tanpa kampanye promosi
- sistem TIDAK PERNAH mengirim kata sandi dalam bentuk teks
- kegagalan kirim email TIDAK BOLEH menggagalkan operasi utamanya.
  Lead yang tersimpan tapi emailnya gagal tetap lead yang tersimpan.
  Catat kegagalannya, jangan lempar ke pengguna

Untuk sekarang cukup helper dan templatenya. Pemanggilnya menyusul di sprint
yang membutuhkan.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Picu satu email uji (misalnya lewat halaman daftar) → masuk ke kotak masuk, **cek folder spam juga**
- Kalau tidak masuk: buka resend.com → **Logs** → lihat statusnya
- Cari di kode: jumlah fungsi template **tepat lima**, tidak lebih
- Matikan sementara `RESEND_API_KEY` di `.env.local` → kirim form → **data tetap tersimpan**, aplikasi tidak error. Kembalikan env-nya setelah terbukti

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F00.9 sendiri dan hasilnya sesuai.
Isi baris F00.9: Status DONE, Berkas src/lib/email/, Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F00.9): helper resend dan lima template email" -m "Diuji: email verifikasi masuk; dengan RESEND_API_KEY dikosongkan data tetap tersimpan dan aplikasi tidak error"
git push
```

---

## 7.6 Sebelum lanjut ke Sprint 1

- [ ] F00.1, F00.2, F00.3, F00.5, F00.6, F00.7, F00.8, F00.9, F00.10 berstatus `DONE`
- [ ] F00.4 masih `TODO` — itu benar, dikerjakan di Sprint 1.5
- [ ] `pnpm build` lolos
- [ ] Sudah di-push, dan Vercel deploy-nya hijau
- [ ] Tidak ada folder `src/app/[locale]/` di project

---

# FASE 8 — SPRINT 1: LANDING PAGE

> Perkiraan 5–7 hari. Lima blok, satu sesi per blok.
> **Masih Bahasa Indonesia saja.** Teks ditulis langsung di JSX — belum lewat next-intl.
> Setelah sprint ini selesai, lanjut ke Fase 9.

---

## 8.1 Pop-up & sale banner

```
/impeccable /ponytail

Baca PRD.md Bagian 6.4 (F01.1 dan F01.2) dulu.

Tugas: F01.1 dan F01.2.

Pop-up: ambil satu baris popups yang is_active dan hari ini dalam periode tayang.
Tampilkan setelah halaman siap, jangan menghalangi render pertama.
Simpan penanda tutup di sessionStorage.
Kalau tidak ada baris yang cocok: TIDAK ADA pop-up — bukan pop-up kosong.

Sale banner: ambil satu baris sale_banners yang aktif dan dalam periode tayang.
Tampilkan judul, teks penawaran, pesan urgensi, satu tombol.

Batasan — ini titik scope creep yang disebut BRD 13.5:
- pesan urgensi (kolom urgensi_id) adalah TEKS BIASA yang diketik Admin.
  Bukan hitung mundur
- TIDAK BOLEH ada setInterval, setTimeout berulang, atau timer di komponen banner
  (larangan nomor 19)
- banner tidak menyentuh harga apa pun. Komponennya TIDAK BOLEH mengimpor
  src/lib/constants.ts (larangan nomor 18)
- tanpa kode kupon, tanpa harga coret, tanpa perhitungan diskon
- sessionStorage, BUKAN localStorage — pop-up muncul lagi pada kunjungan berikutnya

Teks ditulis langsung di JSX. Proyek ini belum dwibahasa — jangan memakai
next-intl atau helper pick(). Untuk konten dari database, pakai kolom _id saja.

Selesai bila:
- pop-up muncul, bisa ditutup, tidak muncul lagi dalam sesi yang sama
- banner dinonaktifkan dari Admin langsung hilang dari landing
- grep 'setInterval' di komponen banner: nol hasil

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Buka landing → pop-up muncul → tutup → muat ulang halaman (`F5`) → **tidak muncul lagi**
- Tutup seluruh tab, buka browser lagi → **muncul lagi** (ini beda `sessionStorage` dari `localStorage`)
- Di Supabase, set `popups.is_active = false` → muat ulang → tidak ada pop-up, dan **tidak ada kotak kosong**
- Set `sale_banners.is_active = false` → banner hilang seketika tanpa deploy
- Set `tayang_selesai` ke tanggal kemarin → banner hilang walau `is_active = true`
- Cari di kode komponen banner: `setInterval` → **nol hasil**; `constants` → **nol hasil**

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F01.1 dan F01.2 sendiri di browser dan hasilnya sesuai.
Isi kedua barisnya: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F01.1): popup pembuka dan sale banner" -m "Diuji: popup tidak muncul lagi setelah ditutup dalam sesi sama, muncul lagi di sesi baru; banner dinonaktifkan dari Admin hilang seketika; grep setInterval di komponen banner nol hasil"
git push
```

---

## 8.2 Hero, jadwal batch, instruktur, company profile

```
/impeccable /ponytail

Baca PRD.md Bagian 6.4 (F01.4) dan Bagian 12.3 dulu.

Tugas: F01.3, F01.4, F01.7, F01.8, F01.10.

Hero: hero_slides aktif, produk unggulan + CTA utama.
Jadwal: card batch berisi tanggal, tag kategori, judul, lokasi, harga, status.
Instruktur, company profile, testimoni: tampilkan dari tabelnya masing-masing.

Batasan:
- batch berstatus 'closed' TIDAK merender tombol Daftar Sekarang sama sekali.
  Bukan dirender lalu disabled — tombol disabled masih bisa diaktifkan lewat DevTools,
  dan acceptance criteria berbunyi "tidak menampilkan tombol yang dapat diklik"
- section yang datanya kosong DISEMBUNYIKAN, bukan dirender sebagai kerangka kosong
- gambar dari Supabase Storage lewat next/image.
  Host Supabase harus sudah terdaftar di next.config.ts remotePatterns —
  kalau gambar tidak muncul TANPA pesan error, itu penyebabnya

Teks ditulis langsung di JSX. Proyek ini belum dwibahasa — untuk konten dari
database pakai kolom _id saja. Jangan memakai helper pick(), belum ada.

ACCEPTANCE CRITERIA YANG WAJIB KAMU UKUR SENDIRI, BUKAN DIKIRA-KIRA:
Pada viewport 375px, dua penawaran inti — pelatihan drone dan penjualan drone —
terlihat TANPA scroll. Ukur dengan DevTools.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- `F12` → mode HP → lebar **375** → **dua penawaran inti terlihat tanpa scroll sama sekali.** Ini yang paling penting di sprint ini
- Di Supabase, set satu batch `status = 'closed'` → tombol "Daftar Sekarang" **hilang total**. Buka DevTools → Elements → cari tombolnya → **tidak ada elemennya**, bukan sekadar `disabled`
- Kosongkan tabel `testimonials` → section testimoni **hilang**, bukan jadi kotak kosong
- Semua gambar muncul. Kalau kotak kosong tanpa error → `remotePatterns` di `next.config.ts`

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F01.3, F01.4, F01.7, F01.8, F01.10 sendiri di browser dan
hasilnya sesuai.
Isi kelima barisnya: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F01.3): hero, jadwal batch, instruktur, company profile" -m "Diuji: di 375px dua penawaran inti terlihat tanpa scroll; batch closed tidak merender tombol daftar sama sekali di DOM; section testimoni kosong disembunyikan"
git push
```

---

## 8.3 Halaman detail batch

```
/impeccable /design:ux-copy /ponytail

Baca PRD.md Bagian 6.4 (F01.5) dulu.

Tugas: F01.5. Route: /batch/[slug]

Tujuh elemen wajib, sesuai BRD 5.A nomor 5:
1. hero judul
2. benefit pills                (batch_benefits)
3. tab Deskripsi + Silabus
4. card Jadwal & Investasi      (waktu, lokasi, tombol daftar)
5. card Dukungan Peserta        (kontak WhatsApp Admin)
6. card Peralatan Belajar       (batch_equipment)
7. FAQ (batch_faqs) + galeri dokumentasi (batch_gallery)

Deskripsi dan silabus disimpan sebagai HTML (diisi Admin lewat editor Tiptap
di blok 1.E). Render dengan dangerouslySetInnerHTML — aman di sini karena hanya
Admin yang bisa mengisinya. JANGAN memakai pola yang sama untuk konten dari
pengguna umum.

Galeri dokumentasi pakai komponen carousel dari shadcn yang sudah terpasang.

Batasan — titik scope creep BRD 13.5:
- ini halaman INFORMASI. Tanpa pendaftaran peserta penuh, tanpa pembayaran batch,
  tanpa unggah dokumen persyaratan, tanpa manajemen kuota kelas (larangan nomor 25)
- proses peserta batch tersertifikasi tetap manual lewat WhatsApp Group dan Zoom

Bagian yang datanya kosong DISEMBUNYIKAN, bukan dirender sebagai kerangka kosong.

Teks antarmuka ditulis langsung di JSX. Untuk konten database pakai kolom _id.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Buka satu batch dari landing → ketujuh elemen ada
- Di Supabase, hapus semua baris `batch_faqs` untuk batch itu → section FAQ **hilang**, bukan jadi judul tanpa isi. Ulangi untuk `batch_gallery` dan `batch_equipment`
- Tab Deskripsi ↔ Silabus berpindah tanpa memuat ulang halaman
- Galeri bisa digeser di HP dengan jempol
- 375px: tidak ada scroll samping, card tidak terpotong
- Cari di kode: tidak ada form pendaftaran peserta, tidak ada field unggah dokumen

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F01.5 sendiri di browser dan hasilnya sesuai.
Isi baris F01.5: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F01.5): halaman detail batch" -m "Diuji: ketujuh elemen tampil; FAQ dan galeri kosong disembunyikan bukan dirender kosong; tab deskripsi-silabus berpindah tanpa reload; 375px tanpa scroll samping"
git push
```

---

## 8.4 Form pendaftaran minat

```
/impeccable /design:ux-copy /ponytail

Baca PRD.md Bagian 6.4 (F01.6) dan ENGINEERING.md Bagian 5.1 dulu.

Tugas: F01.6.

URUTAN WAJIB PERSIS BEGINI:
  1. validasi Zod di server
  2. simpan ke batch_leads, isi consent_at          <- DULUAN
  3. kirim email pemberitahuan ke Admin
  4. tampilkan konfirmasi di layar
  5. buka wa.me dengan pesan terisi otomatis        <- TERAKHIR

Kenapa urutannya penting: kalau WhatsApp dibuka lebih dulu dan penyimpanan gagal,
lead-nya hilang. Alasan form ini ada di database justru supaya tidak ada lead
yang hilang saat percakapan WhatsApp tenggelam.

Kegagalan kirim email di langkah 3 TIDAK BOLEH menggagalkan langkah 4 dan 5.
Lead yang tersimpan tetap lead yang tersimpan.

Template pesan WA:
"Halo Admin Hexatara, saya {nama} ingin mendaftar batch "{judul}" ({tanggal}).
Kontak saya: {whatsapp}"

Batasan:
- centang persetujuan TIDAK tercentang saat halaman dibuka. defaultChecked dilarang
- simpan waktunya ke consent_at, bukan boolean
- form ini BUKAN pendaftaran resmi peserta
- insert lewat Server Action dengan service role. Tabel batch_leads tidak punya
  policy insert untuk anon, dan itu disengaja
- pesan error yang dilihat pengguna berbahasa Indonesia, tanpa detail teknis

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Isi form lengkap → kirim → cek Supabase `batch_leads`, **baris barunya ada**, kolom `consent_at` berisi waktu
- WhatsApp terbuka dengan pesan sudah terisi nama dan judul batch
- Kirim dengan kolom nama dikosongkan → pesan error **berbahasa Indonesia**, bukan pesan Postgres
- Muat ulang halaman `Ctrl+Shift+R` → kotak persetujuan **kosong**
- Kosongkan sementara `RESEND_API_KEY` → kirim form → **data tetap tersimpan** dan WhatsApp tetap terbuka. Kembalikan env-nya
- Buka `/batch/[slug]` di Incognito → form bisa diisi tanpa login

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F01.6 sendiri di browser dan hasilnya sesuai.
Isi baris F01.6: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F01.6): form pendaftaran minat ke db dan whatsapp" -m "Diuji: lead tersimpan sebelum WA terbuka; consent_at terisi waktu; centang kosong saat halaman dibuka; dengan RESEND dimatikan data tetap tersimpan"
git push
```

---

## 8.5 Admin Panel Modul 1

> **Blok terbesar di sprint ini. Kerjakan SATU TABEL PER SESI**, jangan semuanya sekaligus.
> Urutan yang disarankan: batches → popups → sale_banners → hero_slides → instructors → company_profile → testimonials → daftar lead.

```
/impeccable /ponytail

Baca PRD.md Bagian 10 dan ENGINEERING.md Bagian 5.3 dan 5.6 dulu.

Tugas: F01.12, F01.13, F01.14 — kerjakan HANYA tabel [SEBUT SATU TABEL] di sesi ini.

CRUD untuk tabel itu, dengan pola:
- daftar dengan aksi per baris lewat dropdown-menu
- form tambah/ubah
- hapus dengan konfirmasi alert-dialog. Dialog biasa tidak menahan klik tidak sengaja
- kolom tanggal pakai komponen calendar + popover
- toggle aktif/nonaktif pakai komponen switch

Pola form dwibahasa: satu form, field Indonesia dan Inggris BERDAMPINGAN.
Beri label jelas mana yang wajib. Field Inggris boleh kosong.
Ini TIDAK ada hubungannya dengan next-intl — kolom _en sudah ada di database
sejak awal, Admin boleh mengisinya sekarang walau tampilan publiknya belum dwibahasa.

Kolom deskripsi_*, silabus_*, konten_* memakai editor Tiptap.
Batasi ekstensinya ke: heading, bold, italic, bullet list, ordered list, link.
Toolbar penuh tombol tidak membantu Admin yang jarang memakainya.
Simpan hasilnya sebagai HTML di kolom text.

Unggah gambar: kompres di browser dengan browser-image-compression SEBELUM naik
ke Supabase Storage. Foto dari HP berukuran 5 MB, dan acceptance criteria F05.2
menuntut Lighthouse mobile >= 90 — dua hal itu tidak bisa hidup bersama tanpa kompresi.

Ekspor CSV (F01.14): papaparse, UTF-8 DENGAN BOM.
Tanpa BOM, Excel di Windows merusak huruf beraksen dan nama peserta jadi berantakan.
Nama berkas: leads-batch-YYYY-MM-DD.csv

Batasan — batas Admin Panel ada di PRD.md Bagian 10.1:
- TANPA laporan analitik, TANPA grafik penjualan, TANPA manajemen peran bertingkat
  (larangan nomor 25)
- requireAdmin() dipanggil di setiap Server Component DAN setiap Server Action.
  Pengecekan di layout saja TIDAK CUKUP — Server Action bisa dipanggil langsung

Paparkan rencana dulu.
```

### SETELAH BLOK INI — ulangi untuk tiap tabel

**Uji sendiri, keempat operasinya:**

- **Tambah** → muncul di daftar, dan muncul di halaman publik
- **Ubah** → perubahan tersimpan setelah halaman dimuat ulang
- **Hapus** → muncul konfirmasi dulu; klik Batal → data **masih ada**; klik Hapus → hilang
- **Toggle aktif** → langsung berpengaruh di halaman publik tanpa deploy

Khusus yang ada unggah gambar:

- Unggah foto asli dari HP (2–5 MB) → cek ukurannya di Supabase Storage → **jauh lebih kecil dari aslinya**

Khusus ekspor CSV:

- Unduh → **buka dengan Excel** → nama dengan huruf beraksen tampil benar, tidak berantakan

Keamanan:

- Login sebagai pengguna biasa → buka URL Admin langsung → **ditolak**

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru** (setelah SELURUH tabel selesai):

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F01.12, F01.13, F01.14 sendiri di browser dan hasilnya sesuai.
Isi ketiga barisnya: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit — satu commit per tabel:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F01.12): admin crud [nama tabel]" -m "Diuji: tambah, ubah, hapus dengan konfirmasi, dan toggle aktif semuanya berfungsi dan langsung terlihat di halaman publik"
git push
```

Commit terakhir sprint ini, setelah ekspor CSV:

```powershell
git commit -m "feat(F01.14): admin daftar lead dan ekspor csv" -m "Diuji: CSV terbuka rapi di Excel Windows, huruf beraksen tidak rusak"
git push
```

---

## 8.6 Sebelum lanjut

Sprint 1 selesai kalau seluruh baris F01.x berstatus `DONE`.

**Langkah berikutnya bukan Sprint 2, tapi Fase 9.** Kerjakan itu dulu selagi jumlah halaman masih sedikit — makin banyak halaman, makin banyak teks yang harus diekstrak.

---

# FASE 9 — SPRINT 1.5: MIGRASI DWIBAHASA

> Perkiraan 1–2 hari. Satu blok besar, dikerjakan dalam satu sesi bersih.
>
> **Kerjakan SETELAH Sprint 1 selesai** — landing page jadi dan sudah kamu lihat sendiri di browser. Jangan sebelumnya.
>
> Ini menggantikan Bagian 7.2 yang sengaja dikosongkan. Fitur yang diselesaikan: **F00.4** dan **F01.11**.

---

## 9.1 Kenapa sekarang, bukan di Sprint 0

Tercatat sebagai **ADR-009** di `ENGINEERING.md`. Ringkasnya: `[locale]` + middleware + berkas JSON menambah tiga sumber kegagalan sebelum ada satu halaman pun yang bisa dilihat. Kalau halaman `/` menghasilkan 404 di hari pertama, kamu tidak punya versi pembanding yang berfungsi.

Sekarang kamu punya landing page yang jalan. Kalau setelah migrasi ada yang rusak, kamu tahu persis apa yang berubah.

**Scope tidak berkurang.** Dwibahasa tetap masuk Fase 1 sesuai BRD. Skema database sudah menyediakan kolom `_id`/`_en` sejak `docs/sql/` dijalankan — tidak ada migrasi database di sini.

---

## 9.2 Sebelum mulai

```powershell
cd "D:\01_Projects\Nawa Inspira Digital\Development\hexatara"

git status
```

**Pastikan bersih** — tidak ada perubahan yang belum di-commit. Migrasi ini memindahkan banyak berkas; kalau ada yang salah, `git reset --hard HEAD` harus bisa mengembalikanmu ke keadaan sehat.

```powershell
git tag -a "sebelum-dwibahasa" -m "Titik aman sebelum migrasi next-intl"
pnpm add next-intl
```

Tag itu jalan mundurmu. Kalau migrasinya kacau: `git reset --hard sebelum-dwibahasa`.

---

## 9.3 Prompt migrasi

Tempel utuh ke panel Claude Code, di sesi yang baru di-`/clear`.

```
/writing-plans /ponytail

Baca PRD.md Bagian 4.1 dan 4.2, lalu ENGINEERING.md Bagian 5.9, lalu ADR-002,
ADR-003, dan ADR-009 di ENGINEERING.md Bagian 10.

Tugas: F00.4 dan F01.11 — pindahkan aplikasi ini dari Bahasa Indonesia saja
menjadi dwibahasa Indonesia/Inggris memakai next-intl 3.x pada Next.js 15
App Router.

Yang harus dilakukan:

1. Setup next-intl dengan localePrefix: 'as-needed'
   - hexatara.com/         -> Indonesia, TANPA prefix
   - hexatara.com/en/...   -> Inggris
   Ini TERKUNCI PERMANEN. QR pada sertifikat fisik yang sudah dicetak tidak bisa
   ditarik kembali, dan /verify/{token} harus tetap valid bertahun-tahun ke depan.

2. Pindahkan seluruh route publik, akun, dan pengguna ke src/app/[locale]/:
     src/app/(public)/  ->  src/app/[locale]/(public)/
     src/app/(auth)/    ->  src/app/[locale]/(auth)/
     src/app/(user)/    ->  src/app/[locale]/(user)/

   src/app/admin/ TIDAK IKUT PINDAH. Admin Panel berbahasa Indonesia saja,
   di luar prefix locale. Yang dwibahasa adalah ISI yang dikelola Admin,
   bukan antarmuka pengelolanya.

3. Buat middleware.ts next-intl dengan matcher yang MENGECUALIKAN
   /admin, /api, /_next, dan berkas statis.
   Matcher yang salah di sini adalah penyebab nomor satu halaman / jadi 404.

4. Ekstrak seluruh teks Indonesia yang saat ini tertulis langsung di JSX
   ke messages/id.json, bernamespace:
     common, nav, landing, batch, verify, quiz, catalog, auth, dashboard, admin
   Buat messages/en.json dengan struktur kunci yang SAMA PERSIS.
   Nilainya boleh disalin dari versi Indonesia untuk sementara — Hexatara yang
   akan mengisi terjemahannya.

5. Buat helper fallback dan pakai di SEMUA tempat yang membaca kolom _id/_en
   dari database:

   // src/lib/i18n/pick.ts
   export function pick<T>(id: T | null, en: T | null, locale: string): T | null {
     return locale === 'en' ? (en ?? id) : id;
   }

   Jangan pernah menulis locale === 'en' ? x.judul_en : x.judul_id langsung
   di komponen. Tanpa ?? , konten Inggris yang kosong menghasilkan bagian kosong
   di halaman — itu melanggar acceptance criteria BRD.

6. Tambahkan pemilih bahasa di header, tersedia di seluruh halaman publik.
   Berpindah bahasa harus TETAP di halaman yang sedang dibuka, bukan kembali
   ke beranda.

Batasan:
- JANGAN mengubah logika bisnis apa pun. Ini murni pemindahan teks dan routing
- JANGAN menambah dependency selain next-intl (larangan nomor 7)
- JANGAN menyentuh src/app/admin/
- JANGAN menerjemahkan konten database. Kolom _en kosong ditangani pick()
- JANGAN memakai next-i18next atau react-i18next — tidak kompatibel App Router
- JANGAN membangun terjemahan otomatis. Itu add-on terpisah, ADR-007

use context7 untuk next-intl 3.x + Next.js 15 App Router.

Paparkan rencanamu DAN daftar lengkap berkas yang akan dipindah dulu.
Tunggu persetujuan sebelum menulis kode.
```

---

## 9.4 SETELAH BLOK INI

### Uji sendiri — sembilan pemeriksaan

Ini migrasi paling berisiko di seluruh proyek. Jangan lewati satu pun.

| #   | Yang diuji                               | Harus                                                        |
| --- | ---------------------------------------- | ------------------------------------------------------------ |
| 1   | `http://localhost:3000/`                 | Terbuka, Bahasa Indonesia, **TIDAK** dialihkan ke `/id`      |
| 2   | `http://localhost:3000/en`               | Terbuka, Bahasa Inggris                                      |
| 3   | `http://localhost:3000/admin`            | Terbuka **tanpa** prefix locale, tetap Bahasa Indonesia      |
| 4   | `http://localhost:3000/batch/[slug]`     | Terbuka, detail batch utuh                                   |
| 5   | `http://localhost:3000/en/batch/[slug]`  | Terbuka, batch yang sama versi Inggris                       |
| 6   | Pemilih bahasa dari halaman detail batch | Pindah ke `/en/batch/[slug]` yang sama, **bukan** ke beranda |
| 7   | Konten yang kolom `_en`-nya kosong       | Menampilkan **versi Indonesia**, bukan bagian kosong         |
| 8   | Login, daftar, dashboard                 | Masih berfungsi di kedua bahasa                              |
| 9   | `pnpm build`                             | Lolos                                                        |

**Uji nomor 7 secara sengaja:** di Supabase, kosongkan `batches.judul_en` untuk satu batch → buka `/en/batch/[slug]` → judulnya harus muncul dalam Bahasa Indonesia. Kalau yang muncul kosong atau `null`, helper `pick()` tidak dipakai di tempat itu.

Plus enam pemeriksaan wajib di Bagian 6.5.1.

### Kalau `/` menghasilkan 404

Penyebabnya hampir selalu matcher middleware.

```
Halaman / menghasilkan 404 setelah migrasi next-intl.
Tampilkan isi middleware.ts.

Periksa apakah matcher-nya mengecualikan /admin, /api, /_next, dan berkas statis,
dan apakah localePrefix benar-benar 'as-needed' bukan 'always'.
Jangan mengubah apa pun sebelum kamu menjelaskan diagnosisnya.
```

Kalau setelah dua kali percobaan masih rusak, mundur dan mulai ulang dengan sesi bersih:

```powershell
git reset --hard sebelum-dwibahasa
```

### Update — tempel ke sesi baru

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F00.4 dan F01.11 sendiri di browser dan hasilnya sesuai.

Isi kedua barisnya: Status DONE, Berkas src/i18n/, messages/, middleware.ts,
src/lib/i18n/pick.ts, Diuji [tanggal hari ini],
Bukti [kalimat hasil pengujian saya].

Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

### Bersihkan penanda sementara

Blok "Status dwibahasa saat ini" di `CLAUDE.md` sudah tidak berlaku setelah migrasi ini. Hapus:

```
Tugas: hapus bagian "Status dwibahasa saat ini" dari CLAUDE.md.
Migrasi next-intl sudah selesai, jadi larangan membuat folder [locale]
sudah tidak berlaku.

Jangan mengubah bagian lain dari CLAUDE.md. Jangan menyentuh berkas lain.
```

Perbarui juga catatan di `ENGINEERING.md`:

```
Tugas: di ENGINEERING.md, ubah dua tempat yang menyebut dwibahasa "belum aktif":
- Bagian 2.1, baris next-intl
- Bagian 5.9, kalimat pertama
- Bagian 6.3, catatan struktur folder

Migrasi sudah selesai. Struktur sekarang memakai src/app/[locale]/ untuk route
publik, akun, dan pengguna; src/app/admin/ tetap di luar.

Jangan mengubah ADR-009 — itu catatan sejarah keputusan, biarkan apa adanya.
Jangan menyentuh berkas lain.
```

### Commit

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "refactor: migrasi dwibahasa ke next-intl" -m "Diuji: / Indonesia tanpa redirect ke /id; /en Inggris; /admin tanpa prefix locale; pemilih bahasa dari detail batch pindah ke halaman yang sama; judul_en kosong menampilkan versi Indonesia"
git push
```

Setelah Vercel hijau, tag lama boleh dihapus:

```powershell
git tag -d sebelum-dwibahasa
```

---

## 9.5 Sebelum lanjut ke Sprint 2

- [ ] Kesembilan pemeriksaan di atas lolos
- [ ] F00.4 dan F01.11 berstatus `DONE`
- [ ] Blok "Status dwibahasa saat ini" sudah dihapus dari `CLAUDE.md`
- [ ] `ENGINEERING.md` sudah diperbarui
- [ ] Vercel deploy hijau, dan URL produksinya sudah kamu buka sendiri di HP

Mulai Sprint 2 dari Fase 10. Sejak titik ini, seluruh route publik ada di bawah `src/app/[locale]/`, dan seluruh teks antarmuka lewat `messages/*.json`.

---

# FASE 10 — SPRINT 2: VERIFIKASI SERTIFIKAT

> Perkiraan 3–4 hari. Empat blok, satu sesi per blok.
> **Sudah dwibahasa** — Fase 9 harus sudah selesai. Route ada di bawah `src/app/[locale]/`, teks antarmuka lewat `messages/*.json`, konten database lewat `pick()`.

---

## 10.1 Halaman verifikasi publik

```
/impeccable /design:ux-copy /ponytail

Baca PRD.md Bagian 7 seluruhnya dulu, terutama 7.4, 7.6, dan 7.7.
Lalu ENGINEERING.md Bagian 3.4.

Tugas: F02.1 sampai F02.6.

Route:
  /verify          form pencarian nomor sertifikat
  /verify/[token]  hasil langsung dari pemindaian QR
  (keduanya di bawah src/app/[locale]/)

WAJIB query lewat view certificates_public, BUKAN tabel certificates.
View itu ada persis untuk membatasi kolom yang terlihat publik. RLS bekerja
per baris, bukan per kolom — pembatasan kolom hanya bisa lewat view.
.from('certificates') di jalur publik adalah BUG.

Empat keadaan yang harus jelas berbeda:
  ada, belum lewat tanggal   -> "Berlaku"                          hijau  #059669
  ada, sudah lewat tanggal   -> "Invalid"                          merah  #DC2626
  ada, kedaluwarsa NULL      -> "Berlaku — tanpa masa berlaku"     hijau
  tidak ada di database      -> "Tidak ditemukan"                  abu-abu

"Invalid" dan "Tidak ditemukan" harus berbeda SECARA VISUAL DAN KALIMATNYA.
Invalid berarti sertifikatnya nyata tapi sudah lewat masa berlakunya.
Tidak ditemukan berarti nomornya tidak pernah terdaftar.
Bagi verifikator yang sedang memeriksa dokumen seseorang, dua hal itu berujung
pada TINDAKAN YANG BERBEDA.

Untuk yang tanpa masa berlaku, tulis "Tanpa masa berlaku".
Jangan biarkan kolomnya kosong atau berisi tanda hubung.

Batasan:
- HANYA lima data yang ditampilkan: nama lengkap, nomor, tanggal terbit,
  masa berlaku, status. Tanpa email, telepon, alamat (BRD 7.2)
- pencarian HANYA berdasarkan nomor sertifikat.
  Pencarian berdasarkan nama TIDAK disediakan — supaya data tidak bisa ditelusuri
  tanpa memegang nomor sertifikat yang sah
- tanpa login
- status dihitung saat query lewat fungsi status_sertifikat(), yang sudah menjadi
  kolom 'status' di view. JANGAN menghitung ulang di TypeScript — nanti ada dua
  sumber kebenaran. Jangan simpan sebagai kolom, jangan buat cron job

Teks antarmuka lewat next-intl namespace 'verify'.

Selesai bila keempat keadaan di atas benar, diuji dengan data seed di
docs/sql/12_seed_dev.sql.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri — siapkan datanya dulu di SQL Editor:**

```sql
update certificates set tanggal_kedaluwarsa = current_date - 1
where nomor_sertifikat = 'HXT-CERT-000001';

update certificates set tanggal_kedaluwarsa = current_date + 30
where nomor_sertifikat = 'HXT-CERT-000002';
```

Lalu buka `/verify` dan cari satu per satu:

| Yang dicari                      | Harus tampil                                     |
| -------------------------------- | ------------------------------------------------ |
| `HXT-CERT-000001`                | **Invalid**, merah                               |
| `HXT-CERT-000002`                | **Berlaku**, hijau                               |
| sertifikat `free_track` mana pun | **Berlaku**, hijau, tulisan "Tanpa masa berlaku" |
| `HXT-CERT-999999`                | **Tidak ditemukan**, abu-abu                     |

Dua yang terakhir harus jelas berbeda dari Invalid — beda warna **dan** beda kalimat.

Lalu:

- Buka `/verify` di **Incognito** → terbuka penuh tanpa login
- Buka `/verify/[token]` dari sebuah sertifikat → hasil langsung tampil, tanpa input manual
- `F12` → Network → cari kata `email` dan `whatsapp` di respons → **nol hasil**
- Cari di kode: `.from('certificates')` → **nol hasil** di jalur publik
- `/en/verify` → versi Inggris terbuka
- 375px → tidak ada scroll samping

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F02.1 sampai F02.6 sendiri di browser dan hasilnya sesuai.
Isi keenam barisnya: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F02.1): halaman verifikasi sertifikat publik" -m "Diuji: HXT-CERT-000001 exp kemarin tampil Invalid merah; HXT-CERT-000002 tampil Berlaku hijau; free_track tampil tanpa masa berlaku; nomor ngawur tampil Tidak ditemukan abu-abu; Network tab tidak memuat email atau telepon"
git push
```

---

## 10.2 Admin: CRUD sertifikat satuan

```
/impeccable /design:ux-copy /ponytail

Baca PRD.md Bagian 7.4, 7.5, dan 7.8 dulu.

Tugas: F02.7.

Form: nomor (otomatis, bisa ditimpa), jenis, nama lengkap, tanggal terbit,
tanggal kedaluwarsa, qr_aktif, catatan.
Kolom tanggal pakai komponen calendar + popover.

PERILAKU KOLOM KEDALUWARSA YANG WAJIB PERSIS BEGINI:

  jenis = existing_manual atau rpc_certified
    -> terisi otomatis: tanggal terbit + 2 tahun
    -> Admin MASIH BISA mengubahnya (sertifikat fisik bisa berbeda)

  jenis = free_track
    -> kolomnya DINONAKTIFKAN dan DIKOSONGKAN
    -> bukan sekadar diberi peringatan
    -> database juga menolaknya lewat constraint chk_free_track_tanpa_expiry,
       tapi UI harus mencegahnya lebih dulu supaya Admin tidak melihat
       error database mentah

Nomor dari fungsi next_certificate_number(jenis) lewat .rpc().
JANGAN menghitung nomor sendiri di TypeScript — fungsi itu mengunci baris,
kode TypeScript tidak.

Batasan — titik scope creep BRD 13.5:
- JANGAN menyeragamkan masa berlaku semua jenis sertifikat (larangan nomor 11)
- JANGAN memberi free_track alur perpanjangan atau pengingat (larangan nomor 10)
- perpanjangan RPC = baris BARU dengan nomor BARU. Baris lama TIDAK di-update
- requireAdmin() di setiap Server Component DAN setiap Server Action

Admin Panel berbahasa Indonesia saja — tidak perlu next-intl di sini.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Pilih jenis `existing_manual`, isi tanggal terbit → kolom kedaluwarsa **terisi sendiri +2 tahun**
- Ubah tanggal kedaluwarsa itu jadi tanggal lain → **boleh**, tersimpan
- Ganti jenis ke `free_track` → kolom kedaluwarsa **kosong dan tidak bisa diklik**
- Simpan sertifikat `free_track` → berhasil, dan di Supabase kolom `tanggal_kedaluwarsa` benar-benar NULL
- Buat sertifikat baru tanpa mengisi nomor → nomornya terisi otomatis dengan prefix yang benar (`HXT-FT-`, `HXT-CERT-`, atau `HXT-RPC-`)
- Buat dua sertifikat jenis berbeda berturut-turut → nomornya **tidak tabrakan**
- Sertifikat yang baru dibuat langsung bisa dicari di `/verify`

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F02.7 sendiri di browser dan hasilnya sesuai.
Isi baris F02.7: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F02.7): admin crud sertifikat satuan" -m "Diuji: jenis RPC mengisi kedaluwarsa +2 tahun dan masih bisa diubah; jenis free_track menonaktifkan dan mengosongkan kolom kedaluwarsa; prefix HXT-FT dan HXT-CERT tidak tabrakan"
git push
```

---

## 10.3 Import massal sertifikat

```
/impeccable /test-driven-development /ponytail

Baca PRD.md Bagian 7.8 dan ENGINEERING.md Bagian 5.5 dulu.

Tugas: F02.8.

Admin mengunduh template CSV/Excel, mengisi, mengunggah.
Kolom: nomor_sertifikat, jenis, nama_lengkap, tanggal_terbit, tanggal_kedaluwarsa

POLA LAPORAN HASIL — WAJIB PER BARIS, BUKAN GAGAL-SEMUA:

  Berhasil: 47 baris
  Gagal: 3 baris
    Baris 12 — nomor sertifikat sudah ada
    Baris 28 — format tanggal terbit tidak dikenali
    Baris 39 — nama lengkap kosong

Baris yang gagal DILEWATI, sisanya tetap masuk.
Satu baris rusak TIDAK boleh menggagalkan 200 baris lain — ini acceptance
criteria eksplisit. JANGAN membungkus seluruh import dalam satu transaksi.

Nomor baris yang dilaporkan adalah nomor baris DI BERKAS EXCEL MILIK ADMIN,
termasuk baris header. Nomor indeks array tidak berguna bagi orang yang harus
memperbaiki berkasnya.

Aturan validasi:
- jenis free_track dengan tanggal kedaluwarsa terisi -> tolak baris itu,
  sebutkan alasannya
- jenis RPC tanpa tanggal kedaluwarsa -> isi otomatis terbit + 2 tahun
- nomor sertifikat duplikat -> tolak baris itu
- nama lengkap kosong -> tolak baris itu

Pakai papaparse untuk CSV, xlsx untuk Excel.
CATATAN: xlsx di proyek ini dipasang dari cdn.sheetjs.com, bukan npm — API-nya
identik, import 'xlsx' seperti biasa. Lihat ADR-010.

Proses di Server Action, bukan di browser.
Sediakan tombol unduh template.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri — sengaja rusakkan datanya:**

1. Unduh template, isi 10 baris
2. Rusakkan tiga di antaranya: satu kosongkan `nama_lengkap`, satu isi tanggal ngawur (`32/13/2026`), satu pakai nomor sertifikat yang sudah ada
3. Unggah

Yang harus terjadi:

- Laporan menyebut **7 berhasil, 3 gagal**
- Tiap baris gagal disebut **nomor barisnya di Excel** dan alasannya
- Cek Supabase → **7 baris masuk**, tidak nol
- Tambahkan satu baris `free_track` yang diisi tanggal kedaluwarsa → **ditolak** dengan alasan jelas, bukan error database mentah
- Tambahkan satu baris `rpc_certified` tanpa kedaluwarsa → masuk, dengan kedaluwarsa **terisi +2 tahun**
- Ulangi dengan berkas `.xlsx`, bukan `.csv` → hasil sama

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F02.8 sendiri di browser dan hasilnya sesuai.
Isi baris F02.8: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F02.8): admin import massal sertifikat" -m "Diuji: 10 baris dengan 3 sengaja rusak menghasilkan 7 masuk dan 3 dilaporkan dengan nomor baris Excel; free_track dengan kedaluwarsa ditolak; RPC tanpa kedaluwarsa terisi +2 tahun otomatis; berlaku sama untuk csv dan xlsx"
git push
```

---

## 10.4 Rate limit

```
/ponytail

Baca PRD.md Bagian 7.9 dan ADR-008 di ENGINEERING.md Bagian 10 dulu.

Tugas: F02.9.

@upstash/ratelimit pada pencarian /verify. 10 permintaan per menit per IP.
Dikendalikan env RATE_LIMIT_VERIFY_ENABLED. Kalau 'false', LEWATI SEPENUHNYA —
jangan cuma menaikkan angkanya.

BRD 7.2 menandai ini usulan teknis yang butuh konfirmasi klien. Kalau Hexatara
menolak, kita ubah env — TANPA MENYENTUH KODE. Feature flag yang perlu perubahan
kode bukan feature flag.

Saat kena limit: pesan ramah berbahasa Indonesia, bukan error 429 mentah.
Verifikator yang sedang memeriksa dokumen orang tidak perlu melihat kode HTTP.

Kamu perlu dua env baru: UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN.
Sebutkan itu di rencanamu supaya saya bisa mendaftar di upstash.com dulu.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Sebelum menguji:** daftar di upstash.com, buat database Redis, salin REST URL dan token ke `.env.local`, lalu set `RATE_LIMIT_VERIFY_ENABLED=true`.

**Uji sendiri:**

- Cari nomor sertifikat 12 kali berturut-turut dengan cepat → mulai permintaan ke-11 muncul **pesan berbahasa Indonesia**, bukan halaman error 429
- Tunggu satu menit → bisa mencari lagi
- Set `RATE_LIMIT_VERIFY_ENABLED=false` di `.env.local`, restart `pnpm dev` → cari 20 kali → **tidak ada pembatasan sama sekali**
- Cari di kode: tidak ada angka limit yang ditulis di dua tempat berbeda

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F02.9 sendiri di browser dan hasilnya sesuai.
Isi baris F02.9: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F02.9): rate limit endpoint verify di balik feature flag" -m "Diuji: permintaan ke-11 dalam satu menit menampilkan pesan Indonesia bukan 429 mentah; dengan RATE_LIMIT_VERIFY_ENABLED=false pembatasan hilang sepenuhnya tanpa perubahan kode"
git push
```

Jangan lupa tambahkan kedua env Upstash ke **Vercel → Settings → Environment Variables**, lalu **Redeploy**.

---

## 10.5 Sebelum lanjut ke Sprint 3

- [ ] Seluruh baris F02.x berstatus `DONE`
- [ ] Keempat keadaan di `/verify` sudah kamu uji sendiri dengan data nyata
- [ ] `pnpm knip` bersih
- [ ] Vercel deploy hijau, dan `/verify` sudah kamu buka di HP

**Modul 2 harus stabil sebelum Sprint 3 dimulai** — keduanya menulis ke tabel `certificates` yang sama. Mulai Sprint 3 di atas Modul 2 yang masih goyah berarti men-debug dua modul sekaligus.

---

# FASE 11 — SPRINT 3: SERTIFIKAT GRATIS

> Perkiraan 7–10 hari. **Sprint terberat.** Enam blok, satu sesi per blok, berurutan.
>
> **Jangan mulai sebelum Modul 2 stabil** — keduanya menulis ke tabel `certificates` yang sama.
>
> Sudah dwibahasa. Route publik di bawah `src/app/[locale]/`, teks lewat `messages/*.json`, konten database lewat `pick()`.

---

## 11.1 Materi & mesin kuis

```
/brainstorming /impeccable /ponytail

Baca PRD.md Bagian 8.5 seluruhnya dulu. Ini bagian yang paling sering dirusak
oleh "bantuan" AI.

Tugas: F03.1 dan F03.2.

/materi  daftar materi dari tabel materials, TANPA LOGIN
/kuis    mesin kuis, TANPA LOGIN

Perilaku kuis:
  pilih opsi
    BENAR  -> tandai hijau, kunci soal, lanjut
    SALAH  -> tandai merah SAAT ITU JUGA, tanpa menunggu kuis selesai
              tampilkan penjelasan MILIK OPSI ITU
              (quiz_options.penjelasan_id / penjelasan_en, lewat pick())
              biarkan pengguna memilih ulang di tempat
              tanpa pengurangan nilai, tanpa catatan kegagalan
  semua benar -> 100% -> tombol "Dapatkan Sertifikat"

YANG TIDAK BOLEH ADA DI KODE — titik scope creep nomor satu di BRD 13.5:
- konstanta ambang nilai dalam bentuk apa pun (PASSING_SCORE, MIN_SCORE, angka 70)
- penghitung percobaan yang membatasi
- timer atau hitung mundur
- insert ke tabel riwayat pengerjaan. Tabel itu memang tidak ada, dan tidak boleh dibuat
- kondisi apa pun yang bisa menghasilkan keadaan "gagal"
- papan peringkat
(larangan nomor 14, 15, 16, 17)

Penjelasan diambil dari opsi YANG DIPILIH pengguna, bukan satu penjelasan umum
untuk semua opsi salah. Orang yang salah memilih opsi B punya kesalahpahaman
yang berbeda dari yang memilih opsi C — dan acceptance criteria menguji tepat
hal ini. Karena itulah penjelasan menempel di quiz_options, bukan quiz_questions.

State kuis di React saja. TIDAK menyentuh database.

Selesai bila: grep 'PASSING\|MIN_SCORE\|attempt\|threshold' di kode kuis
mengembalikan nol hasil.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Buka `/materi` dan `/kuis` di **Incognito** → terbuka penuh **tanpa login**
- Pilih jawaban salah → ditandai merah **saat itu juga**, tidak menunggu kuis selesai
- Baca penjelasannya. Pilih opsi salah yang **lain** pada soal yang sama → penjelasannya **berbeda**. Kalau sama, itu penjelasan umum — melanggar acceptance criteria
- Ganti ke jawaban benar → diterima, tanpa pengurangan apa pun
- Ulangi satu soal lima kali → tidak ada batas, tidak ada peringatan
- Selesaikan semua soal → hasilnya **100%**, muncul tombol "Dapatkan Sertifikat"
- Cek Supabase → **tidak ada tabel baru**, tidak ada baris riwayat yang tersimpan
- Cari di kode kuis: `PASSING`, `MIN_SCORE`, `attempt`, `threshold`, `setInterval` → **nol hasil**
- `/en/kuis` → soal versi Inggris; kalau `pertanyaan_en` kosong → tampil versi Indonesia

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F03.1 dan F03.2 sendiri di browser dan hasilnya sesuai.
Isi kedua barisnya: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F03.2): mesin kuis correctable" -m "Diuji: kuis jalan tanpa login; jawaban salah ditandai seketika; opsi salah B dan C memberi penjelasan berbeda; percobaan tak terbatas; berakhir 100%; grep PASSING dan attempt nol hasil"
git push
```

---

## 11.2 Sertifikat preview

```
/impeccable /brainstorming /test-driven-development /ponytail

Baca PRD.md Bagian 8.6 dan ADR-005 di ENGINEERING.md Bagian 10 dulu.
Lalu ENGINEERING.md Bagian 5.3 dan 5.4.

Tugas: F03.4.

Setelah kuis selesai dan pengguna mendaftar:
  set profiles.free_track_selesai_at = now()
  tampilkan sertifikat preview di dashboard

Preview:
- TIDAK membuat baris di tabel certificates
- dihasilkan on the fly dari profiles
- QR diganti kotak blur berlabel "Aktif setelah upgrade"
- badge "Ready To Fly"
- boleh diunduh sebagai PDF bertanda PREVIEW

ATURAN KEAMANAN YANG TIDAK BISA DITAWAR:
Server TIDAK PERNAH mengirim public_token ke klien selama status masih preview.
Bukan dikirim lalu di-blur pakai CSS. TIDAK DIKIRIM SAMA SEKALI.
Blur di sisi klien bisa dibatalkan siapa pun yang membuka DevTools, dan
acceptance criteria BRD menguji tepat hal ini: "tidak dapat diakalkan menjadi
aktif dari sisi front-end" (larangan nomor 12).

Kenapa preview tidak membuat baris (ADR-005): kalau membuat, halaman /verify
berisi sertifikat yang belum dibayar dan harus disaring di setiap query.
Satu query yang lupa menyaring berarti sertifikat gratisan lolos verifikasi.

Generate PDF: pdf-lib, menimpa template di public/templates/sertifikat.pdf.
Isi yang ditempelkan: nama lengkap, nomor (KOSONG saat preview), tanggal, QR.
Simpan ke bucket PRIVAT 'certificates', akses lewat createSignedUrl() berumur pendek.
JANGAN menyusun URL bucket privat secara manual.

Batasan:
- JANGAN mencantumkan angka skor di sertifikat. Semua orang 100%, angkanya
  tidak bermakna (larangan nomor 16)
- JANGAN memakai tanda tangan digital tersertifikasi (larangan nomor 13)

use context7 untuk pdf-lib.
Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri — yang paling penting ada di nomor 3:**

1. Selesaikan kuis → daftar akun → verifikasi email → buka dashboard → sertifikat preview muncul dengan badge "Ready To Fly" dan QR blur
2. Cek Supabase → tabel `certificates` → **tidak ada baris baru**. Kalau ada, ADR-005 dilanggar
3. `F12` → tab **Network** → muat ulang halaman → `Ctrl+F` cari `public_token` → **nol hasil**. Kalau tokennya ada tapi di-blur dengan CSS, itu bisa dibatalkan siapa pun lewat DevTools
4. Unduh PDF preview → ada tanda **PREVIEW**, nomor sertifikat **kosong**, tidak ada angka skor
5. Salin URL PDF-nya, buka di Incognito → **kedaluwarsa** setelah beberapa saat (tanda signed URL bekerja)
6. Coba buka URL publik bucket `certificates` secara manual → **ditolak**

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F03.4 sendiri di browser dan hasilnya sesuai.
Isi baris F03.4: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F03.4): sertifikat preview qr blur dan badge ready to fly" -m "Diuji: preview tidak membuat baris di tabel certificates; pencarian public_token di tab Network nol hasil; PDF preview tanpa nomor dan tanpa angka skor; URL publik ke bucket certificates ditolak"
git push
```

---

## 11.3 Upgrade & pembayaran

```
/impeccable /design:ux-copy /ponytail

Baca PRD.md Bagian 8.7 dulu.

Tugas: F03.5, F03.6, F03.10.

Paket, dari src/lib/constants.ts:
  cert_only    Rp  30.000  TIDAK meminta alamat
  cert_merch   Rp 150.000  WAJIB alamat pengiriman
  merch_addon  Rp 120.000  hanya untuk cert_only yang SUDAH disetujui, WAJIB alamat

Pilihan paket pakai komponen radio-group.
Angkanya konstanta. Tidak ada yang menghitungnya, tidak ada diskon, tidak ada kupon.
Sale banner yang sedang aktif TIDAK mengubah angka ini — acceptance criteria
menguji itu secara khusus.

Alur status:
  menunggu_bukti -> menunggu_verifikasi -> disetujui
                                        \-> ditolak (+alasan) -> kirim ulang
                                                              -> menunggu_verifikasi

Ditolak BUKAN jalan buntu. Pengguna melihat alasannya di dashboard dan bisa
mengunggah ulang.

Unggah bukti ke bucket PRIVAT payment-proofs. Tidak pernah tampil di halaman
publik mana pun. Kompres gambar di browser sebelum naik.
Tampilkan instruksi transfer dari site_settings key 'rekening'.

Batasan — titik scope creep BRD 13.5:
- JANGAN memasang payment gateway apa pun, termasuk Midtrans (larangan nomor 8)
- JANGAN membaca bukti transfer secara otomatis
- JANGAN mengaktifkan QR berdasarkan status pembayaran apa pun selain tindakan
  sadar Admin (larangan nomor 9)
- pengguna TIDAK punya hak UPDATE pada certificate_orders. Unggah ulang lewat
  Server Action yang memvalidasi transisi statusnya — kalau tidak, pengguna bisa
  mengubah status jadi 'disetujui' sendiri lewat PostgREST tanpa menyentuh aplikasi
- constraint chk_alamat_merch sudah menjaga alamat wajib untuk paket bermerchandise.
  UI harus mencegahnya lebih dulu supaya Admin dan pengguna tidak melihat error
  database mentah

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Pilih paket **Rp 30.000** → form **tidak meminta alamat**
- Pilih paket **Rp 150.000** → form **wajib alamat**, tidak bisa lanjut tanpa diisi
- Unggah bukti transfer → statusnya jadi `menunggu_verifikasi`
- Cek Supabase Storage → berkasnya ada di bucket `payment-proofs`, dan bucket itu **Private**
- Coba buka URL publik berkas itu → **ditolak**
- Aktifkan sale banner di Admin → kembali ke halaman upgrade → harga **tetap Rp 30.000 dan Rp 150.000**. Ini acceptance criteria eksplisit
- Cari di kode: `midtrans`, `snap`, `payment gateway` → **nol hasil**
- Coba ubah status pesanan langsung lewat Supabase API sebagai pengguna biasa → **ditolak**

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F03.5, F03.6, F03.10 sendiri di browser dan hasilnya sesuai.
Isi ketiga barisnya: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F03.5): pilih paket upgrade dan unggah bukti transfer" -m "Diuji: paket 30rb tidak meminta alamat, 150rb mewajibkan alamat; bukti masuk bucket privat dan URL publiknya ditolak; harga tetap saat sale banner aktif; grep midtrans nol hasil"
git push
```

---

## 11.4 Admin: verifikasi pembayaran & aktivasi

> **Blok paling kritis di seluruh proyek.** Kesalahan di sini tidak bisa diperbaiki belakangan: nomor sertifikat sudah terpakai, pengguna sudah membayar.

```
/impeccable /test-driven-development /ponytail

Baca PRD.md Bagian 8.8 dan ENGINEERING.md Bagian 5.2 dan 3.6 dulu.

Tugas: F03.7, F03.8, F03.11.

/admin/upgrade — antrean pesanan berstatus menunggu_verifikasi.
Admin melihat bukti transfer lewat signed URL, lalu Setujui atau Tolak + alasan.

AKTIVASI — satu Server Action, satu transaksi, urutan persis begini:
  1. pastikan pesanan berstatus menunggu_verifikasi
  2. pastikan pengguna belum punya sertifikat free_track
  3. nomor = next_certificate_number('free_track')
  4. INSERT certificates: jenis free_track, tanggal_kedaluwarsa NULL, qr_aktif true
  5. generate PDF final dengan QR asli, simpan ke bucket
  6. ubah status pesanan jadi disetujui, isi verified_by dan verified_at
  7. kirim email "sertifikat aktif"
  8. catat ke activity_logs

KALAU LANGKAH MANA PUN GAGAL, BATALKAN SEMUANYA.
Sertifikat setengah jadi lebih buruk daripada tidak ada sertifikat: nomornya
sudah terpakai, pengguna sudah membayar, dan tidak ada yang bisa diverifikasi.

POLA IMPLEMENTASI (ENGINEERING.md Bagian 5.2):
- langkah database 2, 3, 4, 6 dibungkus SATU fungsi Postgres yang dipanggil
  lewat .rpc(), sehingga rollback ditangani Postgres — bukan dirangkai lewat
  beberapa panggilan terpisah dari TypeScript yang tidak bisa dibatalkan sebagian
- langkah non-database 5 (PDF) dan 7 (email) dikerjakan SETELAH transaksi berhasil.
  PDF gagal masih bisa dibuat ulang; baris certificates yang terlanjur dibuat
  tanpa pembayaran tidak bisa ditarik kembali
- kalau fungsi Postgres-nya perlu dibuat, USULKAN SQL-nya di berkas baru
  docs/sql/13_aktivasi.sql. JANGAN menjalankannya — saya yang menjalankan manual
  di Supabase SQL Editor

Tolak: status jadi ditolak, simpan alasan, kirim email berisi alasan itu.

Status pengiriman diperbarui manual:
  belum_diproses -> diproses -> dikirim -> diterima
JANGAN membuat integrasi tracking ekspedisi.

Selesai bila sertifikat hasil aktivasi LANGSUNG bisa diverifikasi di /verify.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

Kalau AI mengusulkan `docs/sql/13_aktivasi.sql`, jalankan dulu di Supabase SQL Editor, lalu:

```powershell
pnpm supabase gen types typescript --project-id REF_KAMU > src/types/database.ts
```

**Uji sendiri — jalur bahagia:**

1. Buat pesanan uji dari akun pengguna, unggah bukti
2. Login Admin → `/admin/upgrade` → pesanan muncul di antrean
3. Klik bukti transfer → gambar terbuka lewat signed URL
4. **Setujui** → cek Supabase: baris baru di `certificates`, `jenis = free_track`, `tanggal_kedaluwarsa` **NULL**, `qr_aktif = true`, nomornya berawalan `HXT-FT-`
5. Cek `certificate_orders`: status `disetujui`, `verified_by` dan `verified_at` terisi
6. Cek `activity_logs`: ada barisnya
7. Email "sertifikat aktif" masuk ke kotak masuk pengguna
8. Buka `/verify`, cari nomor sertifikat itu → **muncul, Berlaku, tanpa masa berlaku**
9. Pindai QR di PDF-nya dengan HP → membuka `/verify/[token]` dan langsung menampilkan hasil

**Uji sendiri — jalur gagal:**

10. **Tolak** satu pesanan dengan alasan → pengguna melihat alasannya di dashboard dan bisa **mengunggah ulang**
11. Setujui pesanan dari pengguna yang **sudah punya** sertifikat `free_track` → **ditolak**, tidak menerbitkan nomor baru (dijaga `uq_free_track_per_user`)
12. Setujui pesanan yang statusnya bukan `menunggu_verifikasi` → ditolak

**Uji sendiri — pembatalan:**

13. Sengaja rusakkan langkah PDF (misalnya rename `public/templates/sertifikat.pdf` sementara) → setujui satu pesanan → cek `certificates`: **tidak boleh ada baris setengah jadi tanpa PDF yang tidak bisa dibuat ulang**. Kembalikan nama berkasnya setelah selesai menguji

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F03.7, F03.8, F03.11 sendiri di browser dan hasilnya sesuai.
Isi ketiga barisnya: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build; pnpm test
git add -A
git commit -m "feat(F03.8): aktivasi qr dan terbitkan sertifikat" -m "Diuji: persetujuan Admin menerbitkan HXT-FT dengan kedaluwarsa NULL dan qr_aktif true, email terkirim, activity_logs terisi, dan nomornya langsung ditemukan di /verify; pengguna yang sudah punya free_track ditolak; penolakan menyimpan alasan dan pengguna bisa unggah ulang"
git push
```

---

## 11.5 Dashboard pengguna

```
/impeccable /ponytail

Baca PRD.md Bagian 8.9 dulu.

Tugas: F03.9.

Isinya PERSIS LIMA HAL, tidak lebih:
1. sertifikat (preview atau final, dengan tombol unduh)
2. status "Ready to Fly"
3. status pembayaran (termasuk alasan penolakan bila ada)
4. status pengiriman merchandise
5. riwayat aktivitas dari activity_logs

Batasan — batas dashboard ada di BRD 13.5:
- TANPA progres belajar
- TANPA riwayat kelas
- TANPA pusat notifikasi
- TANPA elemen LMS apa pun
(larangan nomor 25)

Unduh sertifikat lewat signed URL berumur pendek, bukan URL publik.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Dashboard menampilkan **tepat lima** bagian. Hitung. Kalau ada bagian keenam, hapus
- Sebagai pengguna yang belum upgrade → sertifikat preview, QR blur
- Sebagai pengguna yang sudah disetujui → sertifikat final, tombol unduh berfungsi
- Sebagai pengguna yang ditolak → **alasan penolakan terlihat**, ada tombol kirim ulang
- Riwayat aktivitas menampilkan baris dari `activity_logs`
- Buka `/dashboard` tanpa login → dialihkan ke `/login`

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F03.9 sendiri di browser dan hasilnya sesuai.
Isi baris F03.9: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F03.9): dashboard pengguna free track" -m "Diuji: tepat lima bagian, tidak lebih; preview untuk yang belum upgrade dan final untuk yang sudah; alasan penolakan terlihat dengan tombol kirim ulang; /dashboard tanpa login dialihkan ke /login"
git push
```

---

## 11.6 Admin: materi & bank soal

```
/impeccable /ponytail

Baca PRD.md Bagian 8.10 dan ENGINEERING.md Bagian 5.5 dulu.

Tugas: F03.12 dan F03.13.

CRUD materials: unggah PPT/PDF ke bucket materials, judul dan deskripsi
dalam dua bahasa (kolom _id dan _en), urutan.

CRUD bank soal: quiz_questions + quiz_options.
Satu form per soal: pertanyaan (ID/EN), empat opsi, tandai mana yang benar,
penjelasan untuk tiap opsi SALAH.

Import Excel, satu baris per soal:
  no | pertanyaan_id | pertanyaan_en | jawaban_benar |
  opsi_a_id | opsi_a_en | penjelasan_a_id | penjelasan_a_en |
  opsi_b_id | ... | opsi_c_id | ... | opsi_d_id | ...

jawaban_benar diisi a/b/c/d.
Kolom penjelasan untuk opsi yang BENAR dibiarkan kosong.
Seluruh kolom _en boleh kosong — sistem menampilkan versi Indonesia lewat pick().
Sediakan tombol unduh template.

Laporan hasil import mengikuti pola F02.8: per baris, gagal sebagian TIDAK
menggagalkan sisanya, dan nomor baris yang dilaporkan adalah nomor baris
di berkas Excel milik Admin.

Batasan:
- unique index uq_satu_jawaban_benar sudah menjaga tepat satu jawaban benar
  per soal. Tolak baris yang melanggar dengan pesan jelas, JANGAN biarkan error
  database mentah muncul ke Admin
- JANGAN menambahkan kolom skor, riwayat, atau ambang nilai ke tabel mana pun

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Unggah satu materi PPT → muncul di `/materi`, bisa diunduh tanpa login
- Tambah satu soal lewat form → muncul di `/kuis`
- Coba tandai **dua opsi** sebagai jawaban benar → **ditolak** dengan pesan jelas, bukan error Postgres
- Unduh template Excel, isi 5 soal, rusakkan satu (dua jawaban benar) → import → **4 masuk, 1 dilaporkan dengan nomor barisnya**
- Kosongkan seluruh kolom `_en` di template → import → berhasil, dan di `/en/kuis` soalnya tampil dalam Bahasa Indonesia
- Soal hasil import bisa dikerjakan di `/kuis`, dan penjelasan tiap opsi salah muncul sesuai opsinya

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F03.12 dan F03.13 sendiri di browser dan hasilnya sesuai.
Isi kedua barisnya: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F03.13): admin crud bank soal dan import excel" -m "Diuji: dua jawaban benar ditolak dengan pesan jelas bukan error Postgres; import 5 soal dengan 1 rusak menghasilkan 4 masuk dan 1 dilaporkan bernomor baris; kolom _en kosong menampilkan versi Indonesia di /en/kuis"
git push
```

---

## 11.7 Sebelum lanjut ke Sprint 4

- [ ] Seluruh baris F03.x berstatus `DONE` (F03.3 tetap `SKIP` — sudah tercakup F00.6)
- [ ] Alur penuh sudah kamu jalani sendiri dari ujung ke ujung: materi → kuis → daftar → preview → bayar → Admin setujui → QR aktif → terverifikasi di `/verify`
- [ ] `pnpm knip` bersih
- [ ] `pnpm test` lolos — F03.8 termasuk tiga tempat yang wajib punya test

---

# FASE 12 — SPRINT 4: KATALOG PRODUK

> Perkiraan 3–4 hari. Tiga blok, satu sesi per blok.
> Modul paling ringan setelah jalur B2B dipindahkan ke Fase 2 — tapi F04.3 punya satu jebakan yang paling mudah dikerjakan asal-asalan.

---

## 12.1 Katalog & detail produk

```
/impeccable /ponytail

Baca PRD.md Bagian 9.4 dan ADR-004 di ENGINEERING.md Bagian 10 dulu.
Lalu ENGINEERING.md Bagian 3.4.

Tugas: F04.1, F04.2, F04.3.

/katalog         daftar produk
/katalog/[slug]  detail: foto, deskripsi, spesifikasi
(keduanya di bawah src/app/[locale]/)

WAJIB query lewat view products_public, BUKAN tabel products.
Anon memang TIDAK diberi akses ke tabel products — itu disengaja, dan setiap
jalur publik yang menyentuhnya akan gagal. Kegagalan itu yang diinginkan:
terlihat saat development, bukan berupa kebocoran diam-diam di produksi.

HARGA TERSEMBUNYI — bagian tersulit di modul ini:
- produk dengan tampilkan_harga = false tetap menampilkan foto, deskripsi, dan
  spesifikasi LENGKAP. Yang hilang HANYA angka harganya
- ganti dengan "Hubungi kami untuk harga"
- view sudah mengembalikan harga sebagai NULL DI SISI DATABASE, jadi angkanya
  tidak pernah ikut dalam respons apa pun

Kenapa tidak cukup disembunyikan di komponen React: angkanya tetap ikut terkirim
dalam payload halaman dan terlihat di tab Network. Acceptance criteria berbunyi
"tidak dapat ditemukan melalui inspeksi kode halaman atau respons API".

Pengaturan ini PER PRODUK, bukan per kategori, bukan per jenis pengguna.

Foto produk pakai komponen carousel dari shadcn yang sudah terpasang.
Gambar lewat next/image dari bucket products.

Batasan — titik scope creep BRD 13.5:
- TANPA keranjang belanja
- TANPA checkout produk
- TANPA alur pemesanan
- TANPA pembuatan quotation otomatis
(larangan nomor 21 dan 22)

Katalog adalah ETALASE dan PENANGKAP LEAD. Bukan toko.

Teks antarmuka lewat next-intl namespace 'catalog'.
Konten database lewat pick().

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri — nomor 3 adalah acceptance criteria yang diuji Hexatara:**

1. Di Supabase, set satu produk `tampilkan_harga = false`
2. Buka halaman detail produk itu → foto, deskripsi, dan spesifikasi **lengkap**, harga diganti "Hubungi kami untuk harga"
3. `F12` → tab **Network** → muat ulang halaman → `Ctrl+F` di panel Network → ketik **angka harga produk itu** → **hasilnya harus nol**

Kalau angkanya ketemu di respons mana pun, query-nya menyentuh tabel `products` langsung, bukan view `products_public`.

Verifikasi kedua, di SQL Editor:

```sql
select nama_id, harga from products_public where tampilkan_harga = false;
```

Kolom `harga` **semuanya harus NULL**.

Lalu:

- Produk lain yang `tampilkan_harga = true` → harganya **tetap tampil**
- Buka `/katalog` di **Incognito** → terbuka tanpa login
- Cari di kode: `.from('products')` → **nol hasil** di jalur publik
- Cari di kode: `cart`, `keranjang`, `checkout` → **nol hasil**
- Carousel foto bisa digeser dengan jempol di 375px

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F04.1, F04.2, F04.3 sendiri di browser dan hasilnya sesuai.
Isi ketiga barisnya: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F04.3): katalog produk dengan tampil sembunyi harga" -m "Diuji: pencarian angka harga di tab Network untuk produk tersembunyi nol hasil; query products_public mengembalikan harga NULL; foto deskripsi spesifikasi tetap lengkap; grep from('products') di jalur publik nol hasil"
git push
```

---

## 12.2 Form permintaan penawaran

```
/impeccable /design:ux-copy /ponytail

Baca PRD.md Bagian 9.5 dulu.

Tugas: F04.4 dan F04.5.

Tombol kontak retail: tautan wa.me ke Admin, atau form penawaran.
Form: nama, perusahaan, email, whatsapp, kebutuhan, centang persetujuan.
Simpan ke quote_requests dengan consent_at, kirim email pemberitahuan ke Admin.

BATASAN PALING PENTING DI SPRINT INI:
TANPA validasi domain email.
TANPA MX record lookup.
TANPA daftar hitam domain.
TANPA audit log validasi.
(larangan nomor 20)

BRD 13.5 menyebut ini secara EKSPLISIT sebagai titik scope creep: AI coding
assistant mengenali pola "form email perusahaan" lalu menambahkan pemeriksaan
domain karena menganggapnya praktik baik. Di Fase 1 penyaringan calon pembeli
dikerjakan Admin secara manual. Seluruh validasi domain adalah scope Fase 2
yang sudah dianggarkan terpisah.

Validasi yang boleh ada HANYA format email standar (Zod .email()).

Kalau kamu merasa validasi domain sebaiknya ditambahkan, KATAKAN — jangan
ditambahkan. Larangan ini keputusan bisnis yang bisa ditinjau ulang, tapi
peninjauannya lewat percakapan, bukan lewat kode yang sudah terlanjur ditulis.

Batasan lain:
- centang persetujuan tidak tercentang saat halaman dibuka
- simpan waktunya ke consent_at, bukan boolean
- kegagalan kirim email tidak boleh menggagalkan penyimpanan data

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Isi form → kirim → cek Supabase `quote_requests`, baris barunya ada, `consent_at` terisi waktu
- Email pemberitahuan masuk ke `ADMIN_NOTIFY_EMAIL` (cek spam juga)
- Isi dengan email `test@gmail.com` → **diterima**. Kalau ditolak karena bukan domain perusahaan, larangan nomor 20 dilanggar
- Isi dengan email tanpa `@` → ditolak dengan pesan **berbahasa Indonesia**
- Muat ulang `Ctrl+Shift+R` → centang persetujuan **kosong**
- Cari di kode: `MX`, `dns.resolve`, `blacklist`, `domain` → **nol hasil**
- Tombol kontak retail → membuka WhatsApp dengan nomor Admin

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F04.4 dan F04.5 sendiri di browser dan hasilnya sesuai.
Isi kedua barisnya: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F04.5): form permintaan penawaran" -m "Diuji: email gmail diterima tanpa penolakan domain; grep MX dan blacklist nol hasil; consent_at terisi waktu; centang kosong saat halaman dibuka; email pemberitahuan masuk ke Admin"
git push
```

---

## 12.3 Admin: CRUD produk

```
/impeccable /ponytail

Baca PRD.md Bagian 10 dan ENGINEERING.md Bagian 5.3 dulu.

Tugas: F04.6.

CRUD products + product_images.
Field: slug, nama (ID/EN), deskripsi (ID/EN), spesifikasi (ID/EN), kategori,
harga, tampilkan_harga, urutan, is_active.

Toggle tampil/sembunyi harga pakai komponen switch. PER PRODUK — bukan per
kategori, bukan per jenis pengguna.

Unggah foto ke bucket products, atur urutannya.
Kompres di browser dengan browser-image-compression SEBELUM naik.

Kolom deskripsi_* dan spesifikasi_* memakai editor Tiptap, ekstensi dibatasi ke
heading, bold, italic, bullet list, ordered list, link.

Daftar permintaan penawaran + ekspor CSV, mengikuti pola F01.14:
papaparse, UTF-8 DENGAN BOM.

Batasan:
- requireAdmin() di setiap Server Component DAN setiap Server Action
- TANPA laporan analitik, TANPA grafik penjualan (larangan nomor 25)

Admin Panel berbahasa Indonesia saja — tidak perlu next-intl di sini.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Tambah produk baru → muncul di `/katalog`
- Toggle `tampilkan_harga` **off** → muat ulang halaman publik → harga hilang, diganti "Hubungi kami"; **ulangi uji Network** dari blok 4.A → angka harganya **tidak ada di respons**
- Toggle **on** lagi → harga muncul lagi
- Ubah `urutan` → posisinya di katalog berubah
- Set `is_active = false` → produk **hilang** dari katalog publik
- Unggah foto 3 MB dari HP → cek ukurannya di Supabase Storage → **jauh lebih kecil**
- Hapus produk → muncul konfirmasi; Batal → masih ada; Hapus → hilang
- Ekspor CSV permintaan penawaran → **buka di Excel** → huruf beraksen tidak rusak
- Login sebagai pengguna biasa → buka URL Admin produk → **ditolak**

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F04.6 sendiri di browser dan hasilnya sesuai.
Isi baris F04.6: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F04.6): admin crud produk" -m "Diuji: toggle tampil harga per produk langsung berpengaruh dan angkanya hilang dari respons Network; foto 3MB terkompres di Storage; CSV penawaran terbuka rapi di Excel; URL admin ditolak untuk pengguna biasa"
git push
```

---

## 12.4 Sebelum lanjut ke Sprint 5

- [ ] Seluruh baris F04.x berstatus `DONE`
- [ ] Uji Network untuk harga tersembunyi sudah kamu lakukan sendiri, bukan diasumsikan
- [ ] `pnpm knip` bersih
- [ ] Keempat modul sudah selesai — Sprint 5 adalah pengetatan dan rilis, bukan fitur baru

---

# FASE 13 — SPRINT 5: HARDENING & RILIS

> Perkiraan 2–3 hari. Lima blok.
> **Tidak ada fitur baru di sprint ini.** Semua yang dikerjakan di sini adalah pengetatan atas apa yang sudah ada.

---

## 13.1 Audit aksesibilitas

```
/impeccable /ponytail

Baca PRD.md Bagian 12.3 dan ENGINEERING.md Bagian 7 dulu.

Tugas: F05.1 dan F05.2.

Telusuri seluruh halaman publik dan periksa:
- font dasar 16px, teks sekunder minimum 14px
- kontras minimum 4.5:1 pada SETIAP kombinasi warna teks dan latar
- area sentuh minimum 44x44px pada semua tombol dan tautan
- indikator fokus keyboard terlihat jelas
- semua gambar punya alt text yang bermakna, bukan nama berkas
- form: label terhubung ke input, error diumumkan screen reader
- tidak ada scroll horizontal di 375px

Konteks yang membuat ini bukan formalitas: rentang usia pengguna mencapai
70 tahun. Font kecil dan kontras rendah bukan soal preferensi desain,
itu penghalang akses.

Target: Lighthouse mobile >= 90 untuk Performance DAN Accessibility.

Untuk Performance, periksa juga:
- semua gambar lewat next/image, bukan tag img biasa
- gambar yang diunggah Admin sudah terkompres (browser-image-compression)
- tidak ada library besar yang terpasang tapi tidak terpakai — jalankan pnpm knip

JALANKAN LIGHTHOUSE SENDIRI dan laporkan ANGKA ASLINYA.
Jangan menyimpulkan dari membaca kode.

Laporkan temuan sebagai daftar, paling parah di atas. Jangan memperbaiki apa pun
sebelum saya menyetujui daftarnya — sebagian mungkin sudah saya putuskan sebagai
tidak masalah.
```

### SETELAH BLOK INI

**Uji sendiri:**

- `F12` → tab **Lighthouse** → mode **Mobile** → Analyze → catat angka **Performance** dan **Accessibility**. Keduanya harus **≥ 90**
- Telusuri seluruh halaman publik hanya dengan **Tab** di keyboard → fokusnya selalu terlihat, tidak pernah hilang
- Perbesar halaman ke 200% (`Ctrl` + `+`) → teks masih terbaca, tata letak tidak rusak
- 375px → tidak ada scroll samping **di halaman mana pun**, termasuk `/verify`, `/kuis`, dan detail batch
- Ukur tombol terkecil dengan DevTools → **≥ 44×44px**

Kalau Lighthouse di bawah 90, minta perbaikan per temuan, jangan sekaligus.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menjalankan Lighthouse sendiri dan hasilnya sesuai target.
Isi baris F05.1 dan F05.2: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [angka Lighthouse asli untuk Performance dan Accessibility].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "fix(F05.1): audit aksesibilitas kontras, area sentuh, dan fokus keyboard" -m "Diuji: Lighthouse mobile Performance [angka] Accessibility [angka]; navigasi keyboard penuh tanpa fokus hilang; zoom 200% tata letak utuh; 375px tanpa scroll samping di semua halaman"
git push
```

---

## 13.2 SEO & halaman error

```
/impeccable /ponytail

Baca PRD.md Bagian 4.1 dulu.

Tugas: F05.3 dan F05.4.

- generateMetadata per halaman: judul, deskripsi, Open Graph
- hreflang id dan en pada setiap halaman publik
- sitemap.xml mencakup kedua bahasa
- robots.txt: izinkan publik, LARANG /admin dan /dashboard
- halaman 404 dan 500 dwibahasa, dengan jalan kembali yang jelas

Konteks: DKPPU memeriksa website ini secara rutin tiap periode pelatihan bulanan.
Halaman error yang rapi dan berbahasa Indonesia lebih baik daripada tumpukan
stack trace.

Halaman 404 harus menyediakan tautan ke /verify — verifikator yang salah ketik
nomor sertifikat sering mendarat di sana.

Batasan:
- jangan memasang library SEO tambahan. Metadata API bawaan Next.js sudah cukup
- jangan memakai API khusus Vercel (larangan nomor 6)

use context7 untuk Metadata API Next.js 15.

Paparkan rencana dulu.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Buka URL ngawur seperti `/halaman-tidak-ada` → halaman 404 rapi berbahasa Indonesia, ada jalan kembali
- Buka `/en/halaman-tidak-ada` → versi Inggris
- Buka `/sitemap.xml` → memuat URL kedua bahasa
- Buka `/robots.txt` → `/admin` dan `/dashboard` dilarang
- Lihat source halaman landing → ada tag `hreflang` untuk `id` dan `en`
- Tempel URL landing ke WhatsApp → preview Open Graph muncul dengan judul dan gambar yang benar

Plus enam pemeriksaan wajib di Bagian 6.5.1.

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F05.3 dan F05.4 sendiri di browser dan hasilnya sesuai.
Isi kedua barisnya: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "feat(F05.4): metadata seo, sitemap, hreflang, dan halaman error" -m "Diuji: 404 rapi dwibahasa dengan tautan ke /verify; sitemap.xml memuat kedua bahasa; robots.txt melarang /admin dan /dashboard; preview Open Graph muncul saat URL ditempel ke WhatsApp"
git push
```

---

## 13.3 Kesiapan produksi

```
/verification-before-completion /ponytail

Tugas: F05.5, F05.6, F05.7.

1. Pasang Sentry, verifikasi error benar-benar terkirim.
   Picu satu error sengaja, pastikan muncul di dashboard Sentry.

2. Backup: susun perintah pg_dump dan jelaskan cara mengujinya.
   JANGAN menjalankannya sendiri — saya yang menjalankan, karena butuh
   password database yang tidak ada di repo.

3. Daftar env produksi yang harus ada di Vercel, dan mana yang berbeda dari
   .env.local (NEXT_PUBLIC_SITE_URL dan EMAIL_FROM).

4. Periksa apakah ada kode yang bergantung pada API khusus Vercel.
   Sistem ini pindah ke Hostinger VPS setelah stabil (ADR-006), jadi
   @vercel/blob, Edge Config, dan Edge Runtime tidak boleh ada.

Batasan:
- Sentry TIDAK boleh mengirim data pribadi pengguna. Matikan pengiriman
  request body dan cookie
- jangan menambah dependency selain @sentry/nextjs

Langkah manual yang saya kerjakan sendiri ada di Fase 14.
Laporkan mana yang sudah siap dan mana yang menunggu saya.
```

### Yang kamu kerjakan sendiri — Fase 14

Blok prompt di atas hanya menyiapkan kodenya. Enam langkah ini kamu yang jalankan:

1. **Domain** — Vercel → Settings → Domains → tambah `hexatara.com`, pasang record DNS di Hostinger (Bagian 14.1)
2. **Env produksi** — `NEXT_PUBLIC_SITE_URL` dan `EMAIL_FROM` diubah, lalu **Redeploy** (7.2)
3. **Supabase Auth** — Site URL dan Redirect URLs ke domain produksi (7.2)
4. **Custom SMTP** — Supabase diarahkan ke Resend (7.3)
5. **Bersihkan data seed** — `12_seed_dev.sql` jangan tertinggal di produksi (7.4)
6. **Backup pertama** — `pg_dump`, lalu **uji pulihkan ke project Supabase kosong** (7.5)

Backup yang tidak pernah dicoba dipulihkan adalah harapan, bukan cadangan.

**Uji sendiri:**

- Picu error sengaja di produksi → muncul di dashboard Sentry dalam beberapa menit
- Buka satu error di Sentry → **tidak ada** email, nomor telepon, atau isi form pengguna di dalamnya
- Restore backup ke project Supabase kosong → tabel `certificates` **terisi utuh**
- Cari di kode: `@vercel/blob`, `EdgeConfig`, `runtime = 'edge'` → **nol hasil**

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Saya sudah menguji F05.5, F05.6, F05.7 sendiri dan hasilnya sesuai.
Isi ketiga barisnya: Status DONE, Berkas [daftar berkas], Diuji [tanggal],
Bukti [kalimat hasil pengujian saya, termasuk hasil uji restore backup].
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit:**

```powershell
pnpm tsc --noEmit; pnpm lint; pnpm build
git add -A
git commit -m "chore(F05.7): kesiapan produksi sentry, backup, dan env" -m "Diuji: error sengaja muncul di Sentry tanpa data pribadi; backup pg_dump berhasil dipulihkan ke project kosong dengan tabel certificates utuh; grep @vercel/blob dan runtime edge nol hasil"
git push
```

---

## 13.4 Sapuan akhir anti scope creep

> Jalankan ini **sebelum** dokumentasi as-built. Kalau ada temuan, perbaiki dulu — dokumen as-built harus menggambarkan kode yang benar-benar akan diserahkan.

```
/verification-before-completion

Sebelum serah terima, telusuri seluruh codebase dan buktikan tidak ada satu pun
dari ini yang tertinggal. LAPORKAN HASIL GREP-NYA, jangan cuma menyimpulkan.

grep untuk:
  PASSING_SCORE, MIN_SCORE, passing, threshold      -> harus nol
  setInterval di komponen banner                     -> harus nol
  coupon, discount, promo, kupon, diskon             -> harus nol
  midtrans, payment gateway, snap                    -> harus nol
  MX, dns.resolve, blacklist domain                  -> harus nol
  quiz_attempt, leaderboard, skor                    -> harus nol
  @vercel/blob, EdgeConfig, runtime = 'edge'         -> harus nol
  defaultChecked                                     -> harus nol
  from('products') di jalur publik                   -> harus nol
  from('certificates') di jalur publik               -> harus nol
  console.log                                        -> harus nol
  any (tipe TypeScript)                              -> harus nol

Lalu periksa satu per satu ke-25 larangan di PRD.md Bagian 13.
Untuk tiap larangan, sebutkan bukti bahwa ia tidak dilanggar — bukan sekadar
"tidak ditemukan pelanggaran".

Terakhir, telusuri seluruh acceptance criteria di PRD.md Bagian 6.5, 7.10, 8.11,
dan 9.6, lalu tandai mana yang sudah benar-benar DIUJI menurut kolom Bukti di
feature-registry.md — bukan yang sekadar terlihat sudah jalan.

Laporkan yang belum teruji sebagai daftar terpisah. Jangan menandai apa pun DONE.
```

### SETELAH BLOK INI

**Uji sendiri:**

```powershell
pnpm knip
pnpm test
pnpm build
```

Ketiganya bersih.

Lalu buka daftar temuan dari AI. Untuk tiap acceptance criteria yang dilaporkan **belum teruji**, uji sendiri sekarang dan isi kolom Bukti-nya. Ini kesempatan terakhir sebelum Hexatara yang menemukannya.

**Commit:**

```powershell
git add -A
git commit -m "chore: sapuan akhir anti scope creep" -m "Diuji: seluruh grep terlarang nol hasil; 25 larangan diperiksa satu per satu; acceptance criteria yang belum teruji sudah dilengkapi buktinya"
git push
```

---

## 13.5 Dokumentasi as-built

```
/ponytail

Baca Lampiran C dulu.

Tugas: F05.8.

Untuk tiap modul (1-4), buat docs/AS_BUILT/M[n]-[nama].md dari _TEMPLATE.md.
Kerjakan SATU MODUL PER SESI, jangan keempatnya sekaligus.

Isi berdasarkan yang BENAR-BENAR DIBANGUN, bukan yang direncanakan.
Sumber datanya: kode yang ada di repo, dan kolom Bukti di feature-registry.md.
Kalau ada yang berbeda dari PRD, tulis apa adanya beserta alasannya.

Bagian yang paling bernilai belakangan: "Keputusan saat implementasi" dan
"Yang sengaja TIDAK dibangun". Pertanyaan "kenapa dulu dibuat begini" dan
"kenapa fitur X tidak ada" hampir pasti muncul saat Fase 2 — dan yang
menanyakannya sering kali kita sendiri.

Bagian "Untuk manual book Hexatara" ditulis dengan sudut pandang Admin Hexatara
yang TIDAK punya latar belakang teknis. Tanpa istilah teknis, tanpa nama tabel,
tanpa nama berkas.

Jangan mengubah kode. Jangan mengubah PRD atau ENGINEERING.
```

### SETELAH BLOK INI

**Uji sendiri:**

- Baca bagian "Untuk manual book Hexatara" seolah kamu Abi → **tidak ada satu pun istilah teknis** yang perlu dijelaskan
- Bandingkan dengan `feature-registry.md` → tiap fitur `DONE` disebut di as-built
- Bagian "Yang sengaja TIDAK dibangun" berisi hal nyata dari PRD Bagian 15, bukan kosong

**Update — tempel ke sesi baru:**

```
Tugas: update feature-registry.md saja. Jangan sentuh berkas lain.
Dokumen as-built keempat modul sudah selesai dan sudah saya baca sendiri.
Isi baris F05.8: Status DONE, Berkas docs/AS_BUILT/, Diuji [tanggal],
Bukti [kalimat hasil pemeriksaan saya].
Isi juga tabel UAT untuk modul yang sudah siap diserahkan.
Tambahkan satu baris ke Log verifikasi.
Jangan mengubah status baris fitur lain.
```

**Commit dan tandai:**

```powershell
git add -A
git commit -m "docs(F05.8): dokumen as-built keempat modul" -m "Diuji: bagian manual book bebas istilah teknis; tiap fitur DONE tercakup; bagian yang sengaja tidak dibangun terisi"
git tag -a "fase-1-selesai" -m "Fase 1 selesai, siap serah terima Hexatara"
git push
git push --tags
```

---

## 13.6 Sebelum bilang "sudah live"

Checklist lengkap ada di Bagian 14.6. Kerjakan satu per satu, jangan dilewat.

Yang paling sering terlewat dan paling mahal akibatnya:

- [ ] Tautan verifikasi email mengarah ke domain produksi, bukan localhost
- [ ] Custom SMTP Resend aktif — SMTP bawaan Supabase dibatasi beberapa email per jam
- [ ] Data seed `12_seed_dev.sql` sudah dibersihkan dari produksi
- [ ] Backup pertama sudah diambil **dan sudah diuji pulihkan**
- [ ] Sale banner bisa dinonaktifkan dari Admin, berlaku seketika tanpa deploy

Yang terakhir itu persyaratan BRD 7.4: banner promosi harus bisa dimatikan saat periode pemeriksaan DKPPU.

---

## 13.7 Setelah serah terima

Umpan balik UAT dari Hexatara **dipilah dulu**: perbaikan dalam scope dikerjakan, permintaan baru dicatat di `feature-registry.md` bagian "Permintaan di luar scope" sebagai kandidat Fase 2.

Jangan langsung dikerjakan. Itu persis bagaimana proyek delapan minggu berubah jadi empat belas minggu tanpa ada yang memutuskannya.

---

# FASE 14 — RILIS KE HEXATARA.COM

Kerjakan setelah Sprint 5 selesai.

## 14.1 Domain

Setelah Abi memperpanjang hexatara.com dan memberi akses DNS:

Vercel → **Settings** → **Domains** → Add `hexatara.com` → pasang record yang diberikan Vercel di Hostinger. SSL aktif otomatis dalam beberapa menit.

## 14.2 Perbarui alamat — tiga tempat

| Di mana                             | Ubah jadi                                                           |
| ----------------------------------- | ------------------------------------------------------------------- |
| Vercel → Environment Variables      | `NEXT_PUBLIC_SITE_URL` = `https://hexatara.com`                     |
| Vercel → Environment Variables      | `EMAIL_FROM` = `Hexatara <noreply@hexatara.com>`                    |
| Supabase → Auth → URL Configuration | Site URL `https://hexatara.com`, Redirect `https://hexatara.com/**` |

Setelah mengubah env di Vercel, **wajib Redeploy.** Env yang ditambah tanpa redeploy tidak terbaca, dan gejalanya menyesatkan: aplikasi jalan tapi berperilaku seolah variabelnya kosong.

## 14.3 Email lewat domain sendiri

Resend → **Domains** → **Add Domain** → `hexatara.com`. Resend memberi 3 record DNS — kirim ke Abi untuk dipasang di Hostinger.

Setelah terverifikasi, Supabase → **Authentication** → **Emails** → **SMTP Settings** → aktifkan Custom SMTP:

```
Host: smtp.resend.com     Port: 587
User: resend              Password: RESEND_API_KEY kamu
Sender: noreply@hexatara.com
```

SMTP bawaan Supabase dibatasi beberapa email per jam dan ditujukan untuk testing. Kalau dibiarkan, pendaftaran gagal diam-diam begitu ada lebih dari segelintir orang mendaftar bersamaan — dan gagalnya tidak muncul sebagai error di aplikasi.

## 14.4 Bersihkan data contoh

`12_seed_dev.sql` memasukkan data contoh untuk pengembangan. Sebelum go-live, pastikan data itu sudah dihapus atau diganti data asli dari Hexatara.

**CEK** — buka `/verify`, cari nomor sertifikat contoh dari seed. Kalau masih muncul di produksi, hapus dulu.

## 14.5 Backup pertama

Supabase free tier **tidak menyediakan point-in-time recovery.** BRD Bagian 8 menyebut data sertifikat sebagai aset yang tidak bisa direkonstruksi kalau hilang. Backup manual bukan opsional.

```powershell
pg_dump "postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres" --clean --if-exists -f "backup-hexatara-2026-09-05.sql"
```

Mingguan, dan wajib sebelum tiap migrasi. Simpan di dua tempat — backup yang cuma ada di laptop bukan backup.

**Uji pemulihannya setidaknya sekali.** Restore ke project Supabase kosong, pastikan tabel `certificates` terisi utuh. Backup yang tidak pernah dicoba dipulihkan adalah harapan, bukan cadangan.

## 14.6 Sebelum bilang "sudah live"

- [ ] `/verify` terbuka tanpa login, dicoba di HP
- [ ] Daftar akun baru → email verifikasi masuk (cek folder spam juga)
- [ ] Reset password → tautan masuk dan berfungsi
- [ ] Login Admin → semua area PRD Bagian 10 bisa dibuka
- [ ] Produk berharga tersembunyi: DevTools → Network → cari angkanya → **nol hasil**
- [ ] Landing di HP 375px: dua penawaran inti terlihat tanpa scroll
- [ ] Lighthouse mobile ≥ 90 Performance dan Accessibility
- [ ] Sale banner bisa dinonaktifkan dari Admin, berlaku seketika tanpa deploy
- [ ] Harga upgrade tetap Rp 30.000 dan Rp 150.000 saat banner aktif
- [ ] Data seed sudah dibersihkan
- [ ] `pnpm knip` bersih (kalau Lampiran B sudah dipasang)
- [ ] Backup Supabase pertama sudah diambil **dan sudah diuji pulihkan**

## 14.7 Rollback

Vercel → **Deployments** → pilih versi sehat → **Promote to Production**. Sekitar 30 detik.

Ini jalur pemulihan tercepat. **Lakukan dulu, cari sebabnya setelahnya.** DKPPU memeriksa website ini rutin tiap periode pelatihan bulanan; situs mati saat pemeriksaan adalah masalah kepatuhan, bukan sekadar masalah teknis.

## 14.8 Pengingat perpanjangan

BRD Bagian 8 mewajibkan InspiraLabs memberi tahu perpanjangan layanan **minimal satu bulan sebelum masa aktif berakhir.** Pasang pengingat kalender untuk domain, Supabase, Vercel, dan Resend saat masing-masing pertama kali dibayar — bukan nanti.

---

---

# LAMPIRAN A — KALAU MACET

## A.1 Error yang sering muncul

| Gejala                                    | Penyebab hampir pasti                                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `cd: cannot find path`                    | Path punya spasi, `cd` tidak pakai tanda kutip                                                     |
| `pnpm tidak dikenali` setelah install     | terminal belum dibuka ulang                                                                        |
| `running scripts is disabled`             | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`                                              |
| Halaman `/` jadi 404 setelah sesi AI      | AI membuat `src/app/[locale]/` padahal Sprint 0–1 belum dwibahasa. Suruh pindahkan kembali         |
| `infinite recursion detected in policy`   | Policy RLS pada `profiles` subquery ke `profiles`. Pakai `is_admin()` yang `security definer`      |
| Email verifikasi tidak masuk              | Custom SMTP belum diisi, atau domain Resend belum terverifikasi                                    |
| Tautan verifikasi mengarah ke localhost   | Site URL di Supabase Auth masih localhost                                                          |
| Harga tersembunyi bocor di Network tab    | Query menyentuh tabel `products` langsung, bukan view `products_public`                            |
| Gambar Supabase tidak muncul, tanpa error | `remotePatterns` di `next.config.ts` belum diisi (Fase 2.6)                                        |
| Sertifikat tidak bisa diunduh             | Bucket `certificates` privat — butuh signed URL, bukan URL publik                                  |
| AI mengarang nama kolom                   | `src/types/database.ts` belum digenerate ulang setelah skema berubah                               |
| AI menulis pola Next.js lama              | Tambahkan `use context7` di prompt                                                                 |
| `PRD.md` tidak termuat                    | Cek `/context`. `@import` tidak dievaluasi di dalam blok kode — pastikan tidak terbungkus backtick |
| Build gagal di Vercel tapi jalan di lokal | ada env yang belum ditempel di Vercel, atau `pnpm build` belum dicoba di lokal                     |

## A.2 Kalau AI ngaco berulang kali

Urutan yang harus dicoba, dari termurah:

1. **`/clear`, mulai sesi baru.** Konteks yang panjang membuat aturan di awal terlupakan. Ini menyelesaikan mayoritas kasus.
2. **Persempit tugasnya.** Satu sub-fitur, bukan satu halaman penuh.
3. **Tempel pesan error utuh**, bukan ringkasanmu. AI membaca stack trace lebih baik daripada deskripsi.
4. **Cek `/context`** — kalau `PRD.md` tidak termuat, seluruh aturan hilang dan wajar saja dia ngaco.
5. **Kembalikan ke commit terakhir yang sehat:**
   ```powershell
   git reset --hard HEAD
   ```
   Ini menghapus perubahan yang belum di-commit. Karena itu commit setiap kali satu sub-fitur berhasil — supaya selalu ada titik mundur yang dekat.

## A.3 Kalau hasilnya mengecewakan

Hampir selalu satu dari tiga ini, berurutan dari yang paling sering:

1. **Prompt-nya kabur** — perbaiki prompt, jangan tambal hasilnya
2. **Konteks terlalu penuh** — `/clear`, mulai lagi dengan sub-fitur yang lebih kecil
3. **Aturannya memang belum ada** di `PRD.md` Bagian 13 — tambahkan, supaya tidak terulang

Nomor 3 yang paling bernilai jangka panjang. Tiap larangan idealnya lahir dari kesalahan nyata yang pernah terjadi, bukan dari dugaan.

---

---

# LAMPIRAN B — PAGAR KUALITAS

> **Pasang setelah Sprint 0 selesai dan halaman pertama sudah jalan.** Bukan sebelumnya.
>
> Alat-alat ini menjaga kode yang sudah ada. Kalau belum ada yang dijaga, dia cuma penghalang — dan `pre-commit` yang dipasang sebelum ada kode akan menolak commit pertamamu sendiri.

## B.1 TypeScript diperketat

`tsconfig.json`, di dalam `compilerOptions`:

```json
"noUncheckedIndexedAccess": true,
"noUnusedLocals": true,
"noUnusedParameters": true
```

`noUncheckedIndexedAccess` menangkap kelas bug yang paling sering ditinggalkan AI: `arr[0].nama` saat arraynya kosong.

Setelah ditambahkan, jalankan `pnpm tsc --noEmit`. Akan muncul beberapa error di kode yang sudah ada — wajar, perbaiki satu per satu. Kalau lebih dari 20, hapus dulu `noUnusedLocals` dan `noUnusedParameters`, sisakan `noUncheckedIndexedAccess` yang paling berdampak.

## B.2 Aksesibilitas jadi error

```powershell
pnpm add -D eslint-plugin-jsx-a11y
```

`eslint.config.mjs`:

```js
import jsxA11y from "eslint-plugin-jsx-a11y";
export default [
  jsxA11y.flatConfigs.strict,
  { rules: { "no-console": "error" } },
];
```

Pengguna Hexatara sampai usia 70 tahun. Menjadikan aksesibilitas sebagai error berarti tombol tanpa label tidak bisa lolos ke produksi, bukan sekadar diberi peringatan yang diabaikan.

## B.3 Kode mati ketahuan

```powershell
pnpm add -D knip
```

`knip.json`:

```json
{ "entry": ["src/app/**/*.{ts,tsx}"], "project": ["src/**/*.{ts,tsx}"] }
```

Jalankan `pnpm knip` di akhir tiap sprint. Ini alat anti-slop paling langsung: AI sering meninggalkan helper, komponen, dan tipe yang tidak pernah dipakai karena pendekatannya berubah di tengah jalan.

## B.4 Test — hanya untuk tiga tempat

```powershell
pnpm add -D vitest @vitejs/plugin-react
```

Tambahkan ke `package.json` bagian `scripts`:

```json
"test": "vitest run"
```

**Jangan menulis test untuk seluruh aplikasi.** Untuk satu developer, biaya perawatan test suite penuh melebihi manfaatnya. Tulis test hanya di tiga tempat yang salahnya tidak bisa diperbaiki belakangan:

| Apa                                   | Kenapa di sini                                                                                                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F02.4 — hitung status kedaluwarsa** | Tiga keadaan berbeda dan yang ketiga tidak boleh pernah jadi Invalid. Kesalahan di sini berarti sertifikat sah ditolak verifikator, atau sertifikat mati dinyatakan berlaku |
| **Penomoran sertifikat**              | Prefix per jenis tidak boleh tabrakan. Nomor yang sudah dicetak di sertifikat fisik tidak bisa ditarik kembali                                                              |
| **F03.8 — aktivasi sertifikat**       | Delapan langkah dalam satu transaksi. Kalau gagal di tengah, nomor sudah terpakai, pengguna sudah membayar, dan tidak ada yang bisa diverifikasi                            |

Ini persis tiga hal yang `ENGINEERING.md` Bagian 11 sebut tidak boleh disederhanakan dengan alasan apa pun.

Prompt yang dipakai, di sesi tersendiri:

```
/test-driven-development

Baca PRD.md Bagian 7.4 dan 7.5 dulu.

Tulis test Vitest untuk fungsi hitung status sertifikat di src/lib/certificate/.
Kasus yang wajib ada:
- tanggal_kedaluwarsa NULL          → selalu "berlaku", tidak pernah Invalid
- tanggal_kedaluwarsa kemarin       → "Invalid"
- tanggal_kedaluwarsa besok         → "berlaku"
- nomor tidak ada di database       → "tidak ditemukan", berbeda dari "Invalid"

Jangan menulis test untuk komponen UI. Jangan menambah dependency.
```

## B.5 Gerbang sebelum commit

**Pasang paling akhir, setelah B.1–B.4 semuanya bersih.**

```powershell
pnpm add -D husky
pnpm husky init
```

Isi `.husky/pre-commit`:

```bash
pnpm tsc --noEmit && pnpm lint
```

Commit ditolak kalau tipenya rusak atau ada `console.log`. Kalau ini terasa menghalangi di tengah pekerjaan, hapus saja berkasnya — dia melayani kamu, bukan sebaliknya.

---

---

# LAMPIRAN C — TEMPLATE DOKUMEN AS-BUILT

> Dipakai di Bagian 13.5, satu dokumen per modul.
> Salin isi blok di bawah ke `docs/AS_BUILT/M[n]-[nama].md`, lalu isi.

Diisi dari apa yang **benar-benar dibangun**, bukan dari rencana di PRD. Sumber datanya:
kode yang ada di repo, dan kolom Bukti di `feature-registry.md`.

Dua bagian yang paling bernilai belakangan: **"Keputusan saat implementasi"** dan
**"Yang sengaja TIDAK dibangun"**. Pertanyaan "kenapa dulu dibuat begini" dan "kenapa
fitur X tidak ada" hampir pasti muncul saat Fase 2 — dan yang menanyakannya sering kali
kita sendiri.

Bagian **"Untuk manual book Hexatara"** ditulis dengan sudut pandang Admin Hexatara yang
tidak punya latar belakang teknis. Tanpa istilah teknis, tanpa nama tabel, tanpa nama berkas.

````markdown
# MODUL [N] — [NAMA] · AS BUILT

> Diisi **setelah** modul selesai dan lolos UAT, bukan saat perencanaan.
> Dua kegunaannya: bahan mentah manual book untuk Hexatara, dan titik masuk saat modul ini
> disentuh lagi berbulan-bulan kemudian oleh orang yang sudah lupa detailnya — termasuk kamu sendiri.

**Selesai:** YYYY-MM-DD · **UAT:** YYYY-MM-DD · **Fitur:** FXX.1 – FXX.n

---

## Apa yang dilakukan modul ini

[2–3 kalimat, bahasa yang bisa dipahami Abi, bukan bahasa developer]

## Alur pengguna

[Langkah demi langkah, seperti yang benar-benar berjalan di sistem final.
Kalau berbeda dari BRD, tulis apa adanya dan sebutkan kenapa berbeda.]

```
1. Pengguna membuka ...
2. Sistem menampilkan ...
3. ...
```

## Yang bisa dilakukan Admin

| Tindakan | Halaman | Catatan |
| -------- | ------- | ------- |
|          |         |         |

## Tabel yang disentuh

| Tabel | Baca | Tulis | Catatan |
| ----- | ---- | ----- | ------- |
|       |      |       |         |

## Berkas utama

| Berkas | Isi |
| ------ | --- |
|        |     |

## Keputusan saat implementasi

[Apa yang berubah dari rencana awal, dan kenapa. Bagian ini yang paling sering menyelamatkan
waktu di kemudian hari — pertanyaan "kenapa dulu dibuat begini" hampir selalu muncul.]

## Yang sengaja TIDAK dibangun

[Rujuk ENGINEERING.md Bagian 9. Menuliskannya di sini mencegah pertanyaan yang sama
ditanyakan berulang kali oleh orang berbeda.]

## Diketahui belum sempurna

| Hal | Dampak | Rencana |
| --- | ------ | ------- |
|     |        |         |

## Untuk manual book Hexatara

[Poin-poin yang perlu masuk panduan pengguna. Tulis dengan sudut pandang Admin Hexatara
yang tidak punya latar belakang teknis.]
````

---

# LAMPIRAN D — TOOLS OPSIONAL

> **Boleh dilewati selamanya.** Tidak satu pun dibutuhkan untuk menyelesaikan Fase 1.
>
> Ini yang membuatmu berhenti di panduan lama. Sekarang posisinya benar: dipertimbangkan setelah kamu nyaman dengan alurnya, bukan sebagai syarat masuk. Semua perintah di lampiran ini sudah saya verifikasi ke sumber resminya.

## D.1 MCP tambahan

Sudah dipasang di Fase 6.0: **Context7**. Tiga di bawah ini opsional. Jalankan di terminal VS Code, satu per satu, dan **kalau salah satu gagal, lewati saja** — sisanya tetap berfungsi.

```powershell
# Claude membuka halaman dan melihat hasilnya sendiri
claude mcp add playwright -- npx -y @playwright/mcp@latest

# Claude membaca skema tabelmu langsung, tidak menebak nama kolom
claude mcp add supabase -- npx -y @supabase/mcp-server-supabase@latest --read-only --project-ref=REF_KAMU

# Komponen shadcn resmi, bukan komponen karangan
claude mcp add shadcn -- npx -y shadcn@latest mcp
```

Cek dengan `/mcp` di panel chat.

**Kalau harus memilih satu, pilih Playwright.** Tanpa itu, AI menulis UI lalu menebak apakah tampilannya benar. Dengan itu, dia membuka halamannya, mengambil tangkapan layar, dan melihat sendiri kalau tombolnya keluar dari layar di 375px.

Supabase MCP sengaja `--read-only`. Agent yang bisa `DROP TABLE` di database berisi sertifikat yang tidak bisa direkonstruksi adalah risiko yang tidak sepadan dengan kenyamanannya.

> Supabase MCP sebagian besar tergantikan oleh `pnpm supabase gen types` di Fase 4.4 — tipe generated sudah menghapus halusinasi nama kolom tanpa memberi agent akses apa pun ke database.

## D.2 claude-mem — memori antar sesi

Menyimpan ringkasan apa yang terjadi di sesi sebelumnya dan menyuntikkannya di awal sesi baru. Ini jawaban untuk "tiap buka sesi baru harus jelaskan ulang".

Di panel chat Claude Code:

```
/plugin marketplace add thedotmack/claude-mem
```

lalu:

```
/plugin install claude-mem
```

Tutup dan buka ulang sesi. Dokumentasi lengkapnya di https://docs.claude-mem.ai/installation

**Jangan pakai `npm install -g claude-mem`** — itu hanya memasang SDK-nya, tidak mendaftarkan hook maupun menjalankan worker. Ini kesalahan paling umum.

claude-mem menyimpan _apa yang terjadi_, bukan _apa aturannya_. Aturan tetap di `PRD.md` dan `ENGINEERING.md`. Keduanya saling melengkapi — memory mengingat "kemarin kita memperbaiki bug RLS di tabel orders", PRD mengingat "jangan pernah bypass RLS". **Jangan mengandalkan memory untuk menegakkan aturan.**

## D.3 RTK — hemat token

**Lewati ini kecuali kamu benar-benar sering kehabisan kuota.** RTK memotong output perintah terminal sebelum masuk ke konteks — satu sesi berisi `git diff` + `pnpm build` + `pnpm lint` bisa menghabiskan puluhan ribu token yang isinya progress bar dan baris log berulang.

Gratis, open source Apache 2.0, ada binary Windows.

1. Buka https://github.com/rtk-ai/rtk/releases
2. Unduh berkas Windows (`.zip` dengan `x86_64-pc-windows`)
3. Ekstrak, letakkan `rtk.exe` di `C:\Users\<namamu>\.local\bin`
4. Tambahkan folder itu ke PATH (Settings → Environment Variables → Path → New)
5. **Tutup dan buka ulang VS Code**

```powershell
rtk --version
rtk init --global
```

`rtk init --global` memasang hook PreToolUse di settings Claude Code, sehingga perintah Bash otomatis dikompres tanpa kamu lakukan apa-apa.

Jangan double-click `rtk.exe` — dia akan berkedip lalu tertutup. Jalankan dari terminal.

**Peringatan jujur:** RTK memampatkan output, dan output yang dipampatkan sesekali membuang baris yang ternyata penting. Kalau Claude terlihat salah paham soal hasil sebuah perintah, jalankan ulang perintah itu di terminal biasa dan tempel hasilnya, sebelum menyalahkan modelnya.

Ada dua proyek bernama `rtk` di crates.io — `cargo install rtk` bisa memasang yang salah. Karena itu unduh binary-nya langsung dari releases.

## D.4 Ponytail untuk Cursor

Kalau suatu saat kamu memakai Cursor untuk project ini, Ponytail tetap bisa dipakai — tapi caranya berbeda. Salin berkas aturan dari folder `.cursor/rules/` di repo https://github.com/DietrichGebert/ponytail ke folder `.cursor/rules/` di project ini. Mode ini hanya instruksi, tanpa hook.

## D.5 Pindah ke VPS

Kerjakan hanya setelah stabil di Vercel 2–4 minggu.

1. `output: 'standalone'` di `next.config.ts`
2. `Dockerfile` multi-stage Node 20 Alpine
3. VPS: Docker, Docker Compose, Nginx, Certbot
4. Nginx reverse proxy ke port 3000, SSL Let's Encrypt
5. Salin env ke `.env` di server
6. **Database tetap di Supabase.** Satu perubahan besar dalam satu waktu
7. Uji penuh di `staging.hexatara.com` dulu
8. Baru arahkan DNS `hexatara.com`
9. **Biarkan project Vercel hidup satu minggu** sebagai jalur mundur

Perbarui `NEXT_PUBLIC_SITE_URL`, Site URL Supabase Auth, dan domain Resend.

---

_Kalau ada langkah di Fase 0–6 yang tidak menghasilkan apa yang tertulis di kotak CEK-nya, itu bug di panduan ini, bukan kesalahanmu. Catat dan perbaiki panduannya — bukan kerjakan diam-diam dengan cara lain._
