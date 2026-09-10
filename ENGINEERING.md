# HEXATARA — ENGINEERING

> **Baca `PRD.md` lebih dulu.** Berkas ini menjawab **BAGAIMANA**, bukan **APA**.
>
> Kalau kamu mencari daftar fitur, aturan bisnis, atau kriteria selesai — itu di `PRD.md`.
> Berkas ini berisi pola implementasi, konvensi kode, dan keputusan arsitektur.

| Pertanyaan | Berkas |
|---|---|
| Fitur apa yang harus dibangun, perilakunya bagaimana, selesainya kapan | `PRD.md` |
| Larangan dan alasan bisnisnya | `PRD.md` Bagian 13 |
| Skema database: tabel apa saja, kolomnya untuk apa | `PRD.md` Bagian 5 + `PANDUAN.md` Bagian 3.3 |
| **Bagaimana cara menulis kodenya di proyek ini** | **berkas ini** |
| Status tiap fitur | `feature-registry.md` |
| Langkah setup dan alur kerja harian | `PANDUAN.md` |

---

## PENGALIHAN NOMOR BAGIAN

Berkas ini pernah memuat spesifikasi produk. Isi itu sekarang pindah ke `PRD.md`. Berkas prompt lama merujuk nomor bagian versi sebelumnya — tabel ini menerjemahkannya.

| Rujukan lama | Sekarang di |
|---|---|
| ENGINEERING.md Bagian 1 (apa ini) | `PRD.md` Bagian 1 |
| ENGINEERING.md Bagian 3 (daftar tabel) | `PRD.md` Bagian 5 |
| ENGINEERING.md Bagian 4 (peran) | `PRD.md` Bagian 3 |
| ENGINEERING.md Bagian 5 (business logic) | `PRD.md` Bagian 7.4–7.6, 8.5–8.8 |
| ENGINEERING.md Bagian 5.6 (dwibahasa) | `PRD.md` Bagian 4.2 |
| ENGINEERING.md Bagian 6 (routing) | `PRD.md` Bagian 4 |
| ENGINEERING.md Bagian 7 (design token) | `PRD.md` Bagian 12 + Bagian 7 berkas ini |
| **ENGINEERING.md Bagian 9 (25 larangan)** | **`PRD.md` Bagian 13** |
| **ENGINEERING.md Bagian 10 (spesifikasi fitur)** | **`PRD.md` Bagian 6–11** |
| ENGINEERING.md Bagian 11 (filosofi kerja) | Bagian 9 berkas ini |
| ENGINEERING.md Bagian 12 (ADR) | Bagian 10 berkas ini |

---

## 0. CARA KERJA — cek urutan ini sebelum menulis kode

1. `PRD.md` Bagian 0 — kewenangan dokumen
2. `feature-registry.md` — fitur mana yang dikerjakan, statusnya apa
3. `PRD.md` bagian modul yang relevan — perilaku dan acceptance criteria
4. Berkas ini — pola implementasi untuk hal yang akan kamu tulis
5. **Paparkan rencana. Tunggu persetujuan.** Baru tulis kode
6. Selesai + **user konfirmasi sudah tes sendiri di browser** → update `feature-registry.md`

**Jangan pernah menandai DONE atas inisiatif sendiri.** Definition of Done ada di `PRD.md` Bagian 14.

**Migrasi SQL dijalankan manual oleh user di Supabase SQL Editor. Agent tidak pernah mengeksekusi DDL.** Kalau butuh perubahan skema: tulis SQL-nya sebagai usulan, jelaskan kenapa, tunggu user menjalankannya dan mengonfirmasi.

---

## 1. ARSITEKTUR

**Monolit tertata.** Satu aplikasi Next.js App Router. Bukan microservice, bukan arsitektur berlapis. ADR-001.

Tiga aturan yang menentukan bentuk hampir semua kode di proyek ini:

| Aturan | Artinya |
|---|---|
| **Server Component sebagai default** | `"use client"` hanya kalau butuh state, event handler, atau browser API. Kalau ragu, jangan pakai |
| **Baca lewat Server Component** | Ambil data langsung di komponen dengan `createServerClient`. Tidak ada layer service, tidak ada API route untuk pembacaan internal |
| **Tulis lewat Server Action** | Bukan route handler. `src/app/api/` hanya untuk yang benar-benar butuh HTTP endpoint dari luar |

Konsekuensinya: tidak ada state management library, tidak ada data-fetching library, tidak ada ORM. Kalau kamu merasa membutuhkan salah satunya, kamu sedang melawan arsitekturnya — berhenti dan katakan.

**Kode wajib portabel.** Sistem pindah ke Hostinger VPS setelah stabil di Vercel 2–4 minggu. Apa pun yang hanya ada di Vercel menjadi utang. ADR-006.

---

## 2. STACK & LIBRARY TERLARANG

Stack lengkap ada di `PRD.md` Bagian 2. Yang perlu ditegaskan di sisi teknis:

### 2.1 Versi yang mengikat

| Layer | Versi | Catatan implementasi |
|---|---|---|
| Next.js | 15.x App Router | Bukan Pages Router. `use context7` saat menyentuh API-nya |
| TypeScript | 5.x, `strict: true` | `any` dilarang. Kalau tipenya sulit, `unknown` lalu persempit |
| Tailwind | 4.x | Konfigurasi lewat CSS, bukan `tailwind.config.ts` gaya v3 |
| shadcn/ui | terbaru | Komponen di `src/components/ui/` — **jangan diedit manual** |
| next-intl | 4.x | Aktif sejak Fase 9. Routing digabung ke `src/proxy.ts` (bukan `middleware.ts` terpisah — Next.js 16 memakai konvensi `proxy.ts`) |

### 2.2 Yang dilarang dipasang

| Dilarang | Alasan teknis |
|---|---|
| `@vercel/blob`, Edge Config, Edge Runtime | Sistem pindah ke VPS. Ini jadi utang |
| Prisma, Drizzle, ORM apa pun | Supabase client + tipe generated sudah cukup. ORM menambah lapisan tanpa manfaat di skala ini |
| Redux, Zustand, Jotai | Server Component + `useState` cukup. Tidak ada state global di aplikasi ini |
| React Query, SWR | Data diambil di server. Cache Next.js sudah menanganinya |
| Framer Motion, library animasi | Pengguna sampai usia 70 tahun. Animasi menambah beban tanpa membantu keterbacaan |
| `next-i18next`, `react-i18next` | Tidak kompatibel dengan App Router. Pakai `next-intl` |
| Library chart | Tidak ada dashboard analitik di Fase 1 |
| `next-themes` | Tidak ada dark mode. Design token hanya mode terang |
| `xlsx` dari npm | CVE-2023-30533. Pasang dari `cdn.sheetjs.com` — lihat `PANDUAN.md` Fase 2.2 |

Daftar paket yang **terpasang** beserta alasan tiap paket ada: `PANDUAN.md` Fase 2.7.

### 2.3 Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # SERVER ONLY. Tidak pernah menyentuh browser
RESEND_API_KEY=
EMAIL_FROM=
ADMIN_NOTIFY_EMAIL=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WA_ADMIN=             # format 62xxx
UPSTASH_REDIS_REST_URL=           # Sprint 2
UPSTASH_REDIS_REST_TOKEN=         # Sprint 2
RATE_LIMIT_VERIFY_ENABLED=false
```

Apa pun tanpa prefix `NEXT_PUBLIC_` hanya terbaca di server. Menambahkan prefix itu pada `SUPABASE_SERVICE_ROLE_KEY` adalah kebocoran total, bukan kesalahan kecil.

---

## 3. DATABASE — cara memakainya

Daftar tabel dan kolomnya ada di `PRD.md` Bagian 5. DDL-nya di `PANDUAN.md` Bagian 3.3. Bagian ini soal cara mengaksesnya dari kode.

### 3.1 Tiga client, tiga kegunaan

```
src/lib/supabase/
├─ client.ts   createBrowserClient   → Client Component saja
├─ server.ts   createServerClient    → Server Component & Server Action. Default
└─ admin.ts    service role          → HANYA untuk operasi yang harus melewati RLS
```

`admin.ts` **wajib** diawali:

```ts
import 'server-only';
```

Baris itu membuat impor dari Client Component gagal saat build, bukan gagal diam-diam di produksi. Komentar peringatan saja tidak cukup — komentar bisa terlewat, error build tidak.

`admin.ts` dipakai di **tempat-tempat yang memang perlu menembus RLS dengan sengaja**: aktivasi sertifikat (F03.8), operasi Admin, dan Server Action publik yang menulis ke tabel tanpa policy insert/update untuk anon (misalnya F01.6 — `batch_leads` sengaja tidak punya policy insert anon). Kalau kamu memakainya di tempat lain, hampir pasti policy RLS-nya yang perlu diperbaiki, bukan client-nya yang perlu diganti.

### 3.2 Tipe database — generated, jangan ditulis tangan

```powershell
pnpm supabase gen types typescript --project-id REF > src/types/database.ts
```

Jalankan ulang **setiap kali skema berubah.** Jangan pernah menulis interface tabel manual — itu menghidupkan kembali kelas halusinasi yang sudah dihapus berkas generated ini.

### 3.3 RLS — pola yang wajib dan pola yang mematikan

RLS aktif di semua tabel. Pengecekan admin lewat `public.is_admin()` yang `SECURITY DEFINER`.

**Jangan pernah menulis policy pada `profiles` yang melakukan subquery ke `profiles`.** Hasilnya `infinite recursion detected in policy`, dan seluruh autentikasi mati — bukan cuma tabel itu. `is_admin()` ada persis untuk memutus lingkaran itu.

```sql
-- SALAH — rekursi, mematikan seluruh auth
create policy "admin baca semua" on profiles for select
using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- BENAR
create policy "admin baca semua" on profiles for select
using (public.is_admin());
```

**Jangan menonaktifkan RLS "sementara supaya jalan dulu."** Yang sementara itu tidak pernah dinyalakan lagi.

### 3.4 View publik — kapan wajib dipakai

| Jalur | Wajib lewat |
|---|---|
| `/verify` dan `/verify/[token]` | `certificates_public` |
| `/katalog` dan `/katalog/[slug]` | `products_public` |

Alasannya bukan gaya. RLS bekerja **per baris**, bukan per kolom. Membatasi kolom yang terlihat publik hanya bisa lewat view.

`.from('certificates')` atau `.from('products')` di jalur publik **adalah bug**, dan bug yang gejalanya tidak terlihat: halamannya tampak benar, tapi data yang tidak boleh keluar ikut terkirim di payload dan terlihat di tab Network.

`products_public` berjalan `security_invoker = off` — sebagai pemilik view. Anon tidak pernah diberi akses ke tabel `products` sama sekali. Supabase linter menandai ini "security definer view"; **peringatan itu diharapkan dan sengaja tidak diperbaiki.** ADR-004.

Cara mengujinya, jalankan di SQL Editor:

```sql
select nama_id, harga from products_public where tampilkan_harga = false;
```

Semua baris `harga` harus NULL.

### 3.5 Constraint adalah penjaga, bukan hiasan

Empat aturan bisnis paling kritis dijaga database, bukan kode. Kalau kodemu salah, Postgres tetap menolak.

| Constraint | Menjaga |
|---|---|
| `chk_free_track_tanpa_expiry` | `free_track` tidak boleh punya `tanggal_kedaluwarsa` |
| `uq_free_track_per_user` | satu akun satu sertifikat free track |
| `uq_satu_jawaban_benar` | tepat satu opsi benar per soal |
| `chk_alamat_merch` | paket bermerchandise wajib punya alamat setelah bukti diunggah |

**Jangan pernah menghapus atau melonggarkan salah satunya untuk "memperbaiki" error.** Error dari constraint ini berarti kodenya yang salah. Perbaiki kodenya.

Kalau kamu menemukan alasan nyata bahwa constraint-nya yang keliru, katakan — jangan ubah diam-diam. Perubahannya dicatat sebagai ADR baru.

### 3.6 Fungsi database yang dipanggil dari kode

| Fungsi | Dipanggil dari | Catatan |
|---|---|---|
| `next_certificate_number(jenis)` | F03.8 dan F02.7 | Mengunci baris. Jangan pernah menghitung nomor sendiri di TypeScript |
| `status_sertifikat(tanggal)` | sudah menjadi kolom `status` di `certificates_public` | Jangan menghitung ulang di TypeScript — nanti dua sumber kebenaran |
| `is_admin()` | policy RLS | Bukan dipanggil dari TypeScript. Untuk kode pakai `requireAdmin()` |

---

## 4. AUTH & OTORISASI

### 4.1 Guard

```
src/lib/auth/guard.ts
├─ requireUser()   → melempar/redirect kalau belum login
└─ requireAdmin()  → melempar/redirect kalau bukan admin
```

**`requireAdmin()` dipanggil di setiap Server Component DAN setiap Server Action di bawah `/admin`.**

Pengecekan di layout saja tidak cukup, dan ini bukan sikap paranoid: Server Action punya endpoint sendiri dan bisa dipanggil langsung dengan `fetch` tanpa pernah melewati layout mana pun. Layout mengamankan tampilan; guard di dalam action mengamankan datanya.

```ts
// SALAH — hanya layout yang dijaga
export async function hapusBatch(id: number) {
  await supabase.from('batches').delete().eq('id', id);
}

// BENAR
export async function hapusBatch(id: number) {
  await requireAdmin();
  await supabase.from('batches').delete().eq('id', id);
}
```

### 4.2 Login terpisah

`/admin/login` terpisah dari `/login`, dan berada **di luar** prefix locale. Persyaratan BRD 7.3.

### 4.3 Persetujuan penyimpanan data

`defaultChecked` **dilarang di seluruh proyek ini.** Kotak centang persetujuan wajib tidak tercentang saat halaman dibuka, dan itu diuji di acceptance criteria.

Simpan waktunya ke kolom `consent_at`, bukan boolean. Boolean `true` tidak memberi tahu kapan persetujuan diberikan.

---

## 5. POLA IMPLEMENTASI

Aturan perilakunya ada di `PRD.md`. Ini cara menuliskannya.

### 5.1 Server Action — bentuk standar

```ts
'use server';

export async function simpanLead(input: unknown) {
  // 1. Otorisasi dulu, sebelum apa pun
  //    (untuk aksi publik seperti ini, dilewati — tapi untuk /admin wajib)

  // 2. Validasi dengan Zod. SELALU di server.
  const data = LeadSchema.parse(input);

  // 3. Operasi database
  const supabase = await createServerClient();
  const { error } = await supabase.from('batch_leads').insert({ ... });

  // 4. Error jadi pesan berbahasa Indonesia, tanpa detail teknis
  if (error) return { ok: false, pesan: 'Gagal menyimpan. Coba lagi.' };

  // 5. Efek samping SETELAH data aman tersimpan
  await kirimEmailAdmin(...);

  return { ok: true };
}
```

**Validasi client hanya untuk kenyamanan, bukan pengaman.** Zod di server adalah satu-satunya yang menentukan.

**Urutan langkah 3 dan 5 tidak boleh dibalik.** Contoh paling konkret: form minat F01.6 menyimpan ke database **dulu**, baru membuka WhatsApp. Kalau dibalik dan penyimpanan gagal, lead-nya hilang — dan alasan form itu ada di database justru supaya tidak ada lead yang hilang.

### 5.2 Transaksi F03.8 — pola batal-semua

Aktivasi sertifikat adalah delapan langkah yang harus berhasil semua atau tidak sama sekali. Sertifikat setengah jadi lebih buruk daripada tidak ada sertifikat: nomornya sudah terpakai, penggunanya sudah membayar, dan tidak ada yang bisa diverifikasi.

Langkahnya ada di `PRD.md` Bagian 8.8. Pola implementasinya:

- Langkah database (2–4, 6) dibungkus satu fungsi Postgres yang dipanggil lewat `.rpc()`, sehingga rollback ditangani Postgres — bukan dirangkai lewat beberapa panggilan terpisah dari TypeScript yang tidak bisa dibatalkan sebagian.
- Langkah non-database (5 generate PDF, 7 email) dikerjakan **setelah** transaksi berhasil. PDF gagal masih bisa dibuat ulang; baris certificates yang terlanjur dibuat tanpa pembayaran tidak bisa ditarik kembali.
- Kalau fungsi Postgres-nya perlu dibuat, **usulkan SQL-nya, jangan jalankan sendiri.**

### 5.3 Berkas & bucket

| Bucket | Public | Cara akses dari kode |
|---|---|---|
| `content`, `products`, `materials` | ya | URL publik biasa, lewat `next/image` |
| `certificates`, `payment-proofs` | **tidak** | `createSignedUrl()` berumur pendek, dipanggil di server |

**Jangan pernah menyusun URL bucket privat secara manual.** URL publik ke bucket privat menghasilkan 400, dan menjadikannya publik "supaya jalan" membuka seluruh sertifikat dan bukti transfer ke internet.

Semua gambar yang diunggah Admin **dikompres di browser sebelum naik**, dengan `browser-image-compression`. Foto dari HP berukuran 5 MB dan acceptance criteria F05.2 menuntut Lighthouse mobile ≥ 90 — dua hal itu tidak bisa hidup bersama tanpa kompresi.

Host Supabase harus terdaftar di `next.config.ts` → `images.remotePatterns`, atau gambar tidak muncul **tanpa pesan error apa pun.**

### 5.4 PDF sertifikat

`pdf-lib` di server, menimpa template di `public/templates/sertifikat.pdf`. Hasilnya disimpan ke bucket privat `certificates`.

Untuk preview: **server tidak pernah mengirim `public_token` ke klien.** Bukan dikirim lalu di-blur dengan CSS — tidak dikirim sama sekali. Blur di sisi klien bisa dibatalkan siapa pun yang membuka DevTools, dan acceptance criteria menguji tepat hal ini.

Kalau template dari Hexatara memakai font non-standar, butuh `@pdf-lib/fontkit`. Jangan dipasang sebelum templatenya ada dan terbukti membutuhkannya.

### 5.5 Import CSV/Excel — laporan per baris

Pola yang sama untuk F02.8 dan F03.13:

```
Berhasil: 47 baris
Gagal: 3 baris
  Baris 12 — nomor sertifikat sudah ada
  Baris 28 — format tanggal terbit tidak dikenali
  Baris 39 — nama lengkap kosong
```

Baris gagal **dilewati**, sisanya tetap masuk. Satu baris rusak tidak boleh menggagalkan 200 baris lain. Jangan membungkus seluruh import dalam satu transaksi — itu justru melanggar acceptance criteria.

Nomor baris yang dilaporkan adalah nomor baris **di berkas Excel milik Admin**, termasuk baris header. Nomor indeks array tidak berguna bagi orang yang harus memperbaiki berkasnya.

### 5.6 Ekspor CSV

`papaparse`, UTF-8 **dengan BOM**. Tanpa BOM, Excel di Windows merusak huruf beraksen dan nama peserta jadi berantakan.

```ts
const csv = Papa.unparse(rows);
const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
```

Nama berkas berpola `leads-batch-YYYY-MM-DD.csv`.

### 5.7 Email

Lima pemicu, tidak lebih. Daftarnya di `PRD.md` Bagian 11. **Email keenam adalah pelanggaran scope.**

Helper di `src/lib/email/`. Template ditulis sebagai fungsi yang mengembalikan HTML — tanpa library template tambahan; lima email tidak membutuhkannya.

Kegagalan kirim email **tidak boleh menggagalkan operasi utamanya.** Lead yang tersimpan tapi emailnya gagal tetap lead yang tersimpan. Catat kegagalannya, jangan lempar ke pengguna.

### 5.8 Editor Tiptap

Dipakai untuk kolom `deskripsi_*`, `silabus_*`, `konten_*`. Menyimpan HTML sebagai `text`.

HTML dari Admin ditampilkan lewat `dangerouslySetInnerHTML`. Karena hanya Admin yang bisa mengisinya dan Admin sudah punya akses penuh ke sistem, ini bukan lubang XSS baru — tapi **jangan pernah memakai pola yang sama untuk konten dari pengguna umum.**

Batasi ekstensi Tiptap ke yang benar-benar dipakai: heading, bold, italic, bullet list, ordered list, link. Toolbar yang penuh tombol tidak membantu Admin yang jarang memakainya.

### 5.9 Dwibahasa

**Aktif sejak Fase 9.** Migrasi ke next-intl sudah selesai — lihat riwayat keputusan di ADR-009.

Satu helper dipakai di mana-mana:

```ts
// src/lib/i18n/pick.ts
export function pick<T>(id: T | null, en: T | null, locale: string): T | null {
  return locale === 'en' ? (en ?? id) : id;
}
```

Jangan pernah menulis `locale === 'en' ? x.judul_en : x.judul_id` langsung di komponen. Tanpa `??`, konten Inggris yang kosong menghasilkan bagian kosong di halaman — persis yang dilarang acceptance criteria.

`localePrefix: 'as-needed'`. URL Indonesia tidak berprefix, dan itu **terkunci permanen** karena QR di sertifikat fisik bergantung padanya. ADR-003.

### 5.10 Rate limit

Di balik `RATE_LIMIT_VERIFY_ENABLED`. Kalau Hexatara menolak fiturnya, ubah env jadi `false` — **tanpa menyentuh kode.** Feature flag yang perlu perubahan kode bukan feature flag. ADR-008.

---

## 6. KONVENSI KODE

### 6.1 TypeScript

- `strict: true`. `any` dilarang. Kalau tipenya sulit, `unknown` lalu persempit.
- Tipe database dari `src/types/database.ts` (generated). **Jangan tulis interface tabel manual.**
- Setelah Lampiran B dipasang: `noUncheckedIndexedAccess` aktif — `arr[0]` bertipe `T | undefined`, tangani.

### 6.2 Penamaan

| Hal | Gaya | Contoh |
|---|---|---|
| Nama berkas | `kebab-case` | `batch-card.tsx` |
| Komponen | `PascalCase` | `BatchCard` |
| Fungsi & variabel | `camelCase` | `hitungStatusSertifikat` |
| Kolom database | `snake_case`, Bahasa Indonesia | `tanggal_kedaluwarsa` |
| Server Action | kata kerja Bahasa Indonesia | `simpanLead`, `aktifkanSertifikat` |

Bahasa Indonesia untuk hal yang berhubungan dengan domain bisnis, Bahasa Inggris untuk hal teknis. `hitungStatusSertifikat` benar; `calculateCertificateStatus` juga benar; `hitungCertificateStatus` tidak.

### 6.3 Struktur folder

**Struktur sekarang, sejak migrasi dwibahasa di Fase 9:**

```
src/
├─ app/
│  ├─ [locale]/
│  │  ├─ (public)/     landing, batch, verify, materi, kuis, katalog
│  │  ├─ (auth)/       login, daftar, lupa-sandi, reset-sandi, verifikasi-email
│  │  └─ (user)/       dashboard
│  ├─ admin/           Admin Panel — Indonesia saja, TIDAK ikut pindah ke [locale]
│  └─ api/             hanya untuk yang benar-benar butuh HTTP endpoint
├─ components/ui/      shadcn, JANGAN diedit manual
├─ components/         komponen milik aplikasi
├─ i18n/                routing.ts, request.ts, navigation.ts (next-intl)
├─ lib/
│  ├─ supabase/        client.ts, server.ts, admin.ts
│  ├─ auth/            guard.ts
│  ├─ i18n/             pick.ts
│  ├─ validations/     skema Zod per modul
│  ├─ certificate/     penomoran, status, generate PDF, QR
│  ├─ email/           helper Resend + template
│  └─ constants.ts     harga upgrade
└─ types/database.ts   generated, JANGAN diedit tangan
```

Rute publik, akun, dan pengguna berada di bawah `src/app/[locale]/`. `admin/` dan `src/app/auth/confirm/route.ts` (target link email Supabase) sengaja tetap di luar — keduanya harus bebas prefix locale.

### 6.4 Komponen

- Komponen shadcn di `src/components/ui/` **tidak diedit manual.** Kalau butuh varian baru, bungkus dengan komponen sendiri di `src/components/`.
- Satu komponen satu berkas. Komponen yang hanya dipakai satu halaman boleh tinggal di folder halaman itu.
- Mobile-first: tulis untuk 375px dulu, lebarkan dengan `sm:` `md:` `lg:`. **Bukan sebaliknya.**

### 6.5 Error dan pesan pengguna

- Pesan yang dilihat pengguna berbahasa Indonesia dan **tidak membocorkan detail teknis.** "Gagal menyimpan. Coba lagi." — bukan pesan error Postgres.
- Detail teknis dicatat di server. Setelah Lampiran B.2, `console.log` menjadi error lint — pakai mekanisme log yang disepakati atau hapus.
- Tiga keadaan di `/verify` — Berlaku, Invalid, Tidak ditemukan — **harus berbeda secara visual dan kalimat.** Bagi verifikator yang memeriksa dokumen orang, Invalid dan Tidak ditemukan berujung pada tindakan yang berbeda.

---

## 7. DESIGN TOKEN — implementasi

Nilai dan alasannya di `PRD.md` Bagian 12. Cara memasangnya:

Token ditulis sebagai CSS variable di `src/app/globals.css`, lalu dirujuk lewat Tailwind. Tailwind 4 mengonfigurasi tema di CSS, bukan di `tailwind.config.ts`.

```css
:root {
  --warna-utama:   #1E40AF;
  --warna-aksen:   #F59E0B;
  --warna-sukses:  #059669;
  --warna-bahaya:  #DC2626;
  --warna-teks:    #111827;
  --warna-teks-2:  #4B5563;
  --warna-latar:   #FFFFFF;
  --warna-latar-2: #F9FAFB;
}
```

Font `Inter` lewat `next/font/google`. **Tanpa font kedua. Tanpa dark mode.**

Empat aturan yang diuji, bukan aspirasi:

| Aturan | Nilai |
|---|---|
| Font dasar | 16px, jangan lebih kecil |
| Teks sekunder | minimum 14px |
| Area sentuh | minimum 44×44px |
| Kontras | minimum 4.5:1 |

Jangan menulis nilai warna langsung di komponen. Kalau sebuah warna belum ada tokennya, tanyakan — jangan tambahkan sendiri.

---

## 8. SEBELUM MENYATAKAN SELESAI

Checklist teknis. Definition of Done yang lengkap — termasuk butir yang hanya bisa dipenuhi manusia — ada di `PRD.md` Bagian 14.

- [ ] `pnpm tsc --noEmit` bersih
- [ ] `pnpm lint` bersih
- [ ] `pnpm build` lolos
- [ ] Halaman dibuka di viewport 375px dan tidak rusak, tanpa scroll horizontal
- [ ] Tidak ada `console.log` tertinggal
- [ ] Tidak ada data rahasia di kode yang dikirim ke browser
- [ ] Tidak ada `.from('certificates')` atau `.from('products')` di jalur publik
- [ ] Acceptance criteria fitur ini di `PRD.md` sudah dicek satu per satu

**Jangan mengklaim sesuatu berjalan tanpa menjalankannya.** Kalau kamu tidak bisa menjalankannya, katakan begitu.

---

## 9. FILOSOFI KERJA — LAZY SENIOR DEV

> Filosofi ini juga ditegakkan otomatis oleh plugin **Ponytail** kalau sudah dipasang (`PANDUAN.md` Fase 6.0). Bagian ini tetap ada supaya aturannya berlaku walau plugin-nya tidak aktif.

Lazy berarti efisien, bukan ceroboh. Kode terbaik adalah kode yang tidak perlu ditulis.

Sebelum menulis kode apa pun, berhenti di anak tangga pertama yang sudah cukup:

1. Apakah ini benar-benar perlu dibangun?
2. Apakah sudah ada di codebase ini? Pakai ulang helper yang ada, jangan tulis ulang
3. Apakah standard library sudah menyediakannya?
4. Apakah fitur bawaan platform mencakupnya?
5. Apakah dependency yang sudah terpasang menyelesaikannya?
6. Bisa satu baris? Buat satu baris
7. Baru kalau semuanya tidak cukup: tulis kode minimum yang berfungsi

Tangga ini berjalan **setelah** memahami masalah, bukan menggantikannya. Baca task dan kode yang tersentuh, telusuri alur nyata dari ujung ke ujung, baru naik tangga.

**Bug fix = akar masalah, bukan gejala.** Laporan bug hanya menyebutkan gejala. Grep semua pemanggil fungsi yang disentuh, perbaiki fungsinya sekali saja. Satu guard di sana lebih kecil diff-nya daripada satu per pemanggil, dan menambal hanya jalur yang disebut tiket akan meninggalkan pemanggil lain yang masih rusak.

### Aturan tambahan

- Tidak ada abstraksi yang tidak diminta secara eksplisit
- Tidak ada dependency baru kalau bisa dihindari
- Tidak ada boilerplate yang tidak diminta siapa pun
- Hapus lebih diutamakan daripada tambah. Membosankan lebih baik daripada rumit. Sesedikit mungkin berkas
- Diff terpendek yang berfungsi menang — tapi hanya setelah memahami masalahnya. Perubahan terkecil di tempat yang salah bukan lazy, itu bug kedua
- Pertanyakan permintaan kompleks: "Apakah benar perlu X, atau Y sudah cukup?"
- Tandai penyederhanaan sengaja yang memotong sudut nyata dengan komentar `ponytail:` yang menyebutkan batasannya dan jalur upgrade-nya

### TIDAK lazy soal

Memahami masalah. Validasi input di trust boundary. Error handling yang mencegah kehilangan data. Keamanan. Aksesibilitas.

Kode non-trivial meninggalkan **satu** pemeriksaan yang bisa dijalankan — assert sederhana atau satu berkas test kecil. One-liner trivial tidak perlu test. Tiga tempat yang wajib punya test disebut di `PANDUAN.md` Lampiran B.4.

### Untuk Hexatara secara khusus

Tiga hal ini tidak boleh disederhanakan dengan alasan apa pun, karena kesalahannya tidak bisa diperbaiki belakangan:

- **Data sertifikat.** Tidak bisa direkonstruksi kalau hilang
- **Aktivasi QR.** Aktivasi yang salah berarti sertifikat sah beredar tanpa pembayaran
- **Aksesibilitas.** Pengguna sampai usia 70 tahun. Font kecil bukan pilihan gaya, itu penghalang akses

---

## 10. CATATAN KEPUTUSAN (ADR)

> Keputusan yang dibatalkan **dicoret, tidak dihapus.** Tambahkan ADR baru di bawah, jangan mengedit yang lama.

### ADR-001 — Monolit Next.js, bukan microservice
**2026-09-05 · Berlaku**

**Konteks.** BRD-HXT-001 dan PoC Juli 2026 menyebut arsitektur berlapis. Fase 1 dikerjakan satu developer dalam delapan minggu dengan trafik rendah, dan BRD 13.4 sendiri menandai arsitektur itu kemungkinan besar tidak proporsional.

**Keputusan.** Satu aplikasi Next.js App Router. Server Component untuk baca, Server Action untuk tulis.

**Konsekuensi.** Penskalaan horizontal per komponen tidak tersedia. Pada beban Fase 1 itu bukan kekurangan yang terasa. Kalau suatu saat perlu, pemisahan dilakukan saat ada alasannya, bukan sekarang.

---

### ADR-002 — Dwibahasa lewat kolom ganda, bukan tabel terjemahan
**2026-09-05 · Berlaku**

**Konteks.** Dua pilihan: kolom `_id`/`_en` dalam satu baris, atau tabel `*_translations` terpisah. Tabel terpisah unggul kalau bahasanya bisa bertambah jadi lima atau sepuluh. Hexatara pasti dua.

**Keputusan.** Kolom ganda, dengan fallback `nilai_en ?? nilai_id` lewat helper `pick()`.

**Konsekuensi.** Menambah bahasa ketiga berarti migrasi menambah kolom di banyak tabel. Kalau itu terjadi — dan tidak ada indikasi akan terjadi — biaya migrasinya masih lebih kecil daripada biaya JOIN di setiap query dan form Admin dua lapis selama Fase 1 sampai Fase 3.

---

### ADR-003 — `localePrefix: 'as-needed'`, URL Indonesia tanpa prefix
**2026-09-05 · Berlaku · TIDAK BISA DIUBAH SETELAH SERTIFIKAT DICETAK**

**Konteks.** QR pada sertifikat fisik yang sudah dicetak tidak bisa ditarik kembali. URL `/verify/{token}` harus tetap valid bertahun-tahun ke depan.

**Keputusan.** `hexatara.com/` Indonesia tanpa prefix, `hexatara.com/en/...` Inggris.

**Konsekuensi.** Begitu sertifikat pertama dicetak dengan QR, struktur URL `/verify` terkunci permanen. Redirect bisa menolong, tapi bergantung pada redirect selama satu dekade adalah utang yang tidak perlu diambil.

---

### ADR-004 — `products_public` berjalan sebagai pemilik view
**2026-09-05 · Berlaku**

**Konteks.** Acceptance criteria Modul 4: harga produk yang disembunyikan tidak boleh ditemukan lewat inspeksi kode halaman atau respons API. RLS bekerja per baris, bukan per kolom. Menyembunyikan di komponen React tidak cukup — angkanya tetap ikut dalam payload halaman dan terlihat di tab Network.

**Keputusan.** `security_invoker = off` pada `products_public`. Anon tidak pernah diberi akses ke tabel `products`. View mengembalikan `harga` sebagai NULL di sisi database.

**Konsekuensi.** Supabase linter memunculkan peringatan "security definer view". Peringatan itu diharapkan dan sengaja tidak diperbaiki. Konsekuensi lain: setiap jalur publik yang menyentuh `products` langsung akan gagal — dan itu justru yang diinginkan, karena kegagalannya terlihat saat development, bukan berupa kebocoran diam-diam di produksi.

---

### ADR-005 — Sertifikat preview tidak membuat baris di `certificates`
**2026-09-05 · Berlaku**

**Konteks.** Kalau preview sudah membuat baris, halaman `/verify` berisi sertifikat yang belum dibayar dan harus disaring di setiap query. Satu query yang lupa menyaring berarti sertifikat gratisan lolos verifikasi.

**Keputusan.** Preview dihasilkan on the fly dari `profiles`. Baris `certificates` dibuat setelah Admin menyetujui pembayaran.

**Konsekuensi.** Nomor sertifikat baru ada saat aktivasi, tidak bisa ditampilkan di preview. Itu justru benar secara bisnis — nomor yang belum berlaku sebaiknya memang belum diberitahukan.

---

### ADR-006 — Vercel dulu, Hostinger VPS setelah go-live
**2026-09-05 · Berlaku**

**Konteks.** BRD Bagian 8 menyebut server berada dalam ekosistem InspiraLabs. Menyiapkan VPS, Nginx, sertifikat SSL, dan pipeline deploy di awal berarti beberapa hari yang tidak menghasilkan fitur apa pun, sementara tenggat domain dan pemeriksaan DKPPU berjalan.

**Keputusan.** Fase 1 di Vercel. Pindah ke VPS setelah sistem stabil 2–4 minggu.

**Konsekuensi.** Seluruh kode wajib portabel. Tanpa `@vercel/blob`, tanpa Edge Config, tanpa Edge Runtime. Perlu dikomunikasikan ke Hexatara bahwa penempatan akhir tetap sesuai BRD, hanya urutan waktunya yang berbeda.

---

### ADR-007 — Terjemahan Inggris otomatis = add-on berbayar, bukan Fase 1
**2026-09-05 · Menunggu keputusan Hexatara**

**Konteks.** Menerjemahkan materi, soal kuis, dan penjelasan tiap opsi ke Bahasa Inggris adalah beban konten yang jatuh ke pihak Hexatara, dan itu tidak masuk dalam estimasi delapan minggu. Terjemahan otomatis secara teknis mudah, tapi tidak ada dalam scope BRD, dan menambahkannya diam-diam persis pola yang dilarang BRD 13.2.

**Keputusan.** Tidak dibangun di Fase 1. Kolom `_en` yang kosong otomatis menampilkan versi Indonesia, jadi tidak ada yang rusak kalau fitur ini tidak ada. Ditawarkan ke Hexatara sebagai add-on terpisah.

**Konsekuensi.** Kalau disetujui: tombol "Draft terjemahan EN" di Admin Panel, hasilnya wajib direview manusia sebelum disimpan. Istilah regulasi penerbangan sering diterjemahkan meleset oleh mesin, dan di konteks DKPPU salah terjemah bukan sekadar canggung.

Yang tidak akan pernah dilakukan: menerjemahkan saat halaman dibuka. Biayanya per pengunjung, hasilnya berubah tiap kali, dan Google tidak bisa mengindeks halaman Inggrisnya.

**Tindakan terbuka:** sampaikan ke Abi sebagai penawaran terpisah beserta harganya.

---

### ADR-008 — Rate limit `/verify` di balik feature flag
**2026-09-05 · Berlaku**

**Konteks.** BRD 7.2 menandai throttling sebagai usulan teknis yang memerlukan konfirmasi klien saat review, dan menyebut butir ini dihapus tanpa memengaruhi fungsi modul apabila tidak disetujui.

**Keputusan.** Dibangun, dikendalikan `RATE_LIMIT_VERIFY_ENABLED`. Kalau ditolak, ubah env jadi `false`.

**Konsekuensi.** Satu dependency (Upstash) yang mungkin tidak terpakai. Ukurannya kecil dan gratis di tier yang dipakai, jauh lebih murah daripada mencabut lalu memasang ulang kode.

---

### ADR-009 — Dwibahasa ditunda ke Sprint 1.5
**2026-09-05 · Berlaku**

**Konteks.** BRD 13.3 menyarankan dwibahasa dibangun sejak fondasi karena lebih murah daripada ditambahkan belakangan. Secara biaya itu benar. Yang tidak masuk hitungan: `[locale]` + middleware + berkas JSON menambah tiga sumber kegagalan sebelum ada satu halaman pun yang bisa dilihat, dan developer solo yang halaman `/`-nya menghasilkan 404 di hari pertama tidak punya versi pembanding yang berfungsi.

**Keputusan.** Sprint 0 dan 1 dibangun Bahasa Indonesia saja dengan struktur `src/app/(public)/`. Migrasi ke next-intl dikerjakan sebagai satu langkah terarah di akhir Sprint 1, prosedurnya di `PANDUAN.md` Lampiran C.

**Konsekuensi.** Ada satu langkah pemindahan berkas yang tidak akan ada kalau dibangun dari awal, dan seluruh teks Sprint 0–1 perlu diekstrak sekali. Biayanya nyata tapi terukur — satu sampai dua hari, dikerjakan saat sudah ada halaman jadi sebagai pembanding.

Skema database tidak terpengaruh: kolom `_id`/`_en` sudah ada sejak SQL skema dijalankan, jadi tidak ada migrasi database saat dwibahasa masuk. Scope tidak berkurang — dwibahasa tetap masuk Fase 1 sesuai BRD.

---

### ADR-010 — `xlsx` dipasang dari CDN SheetJS, bukan npm
**2026-09-05 · Berlaku**

**Konteks.** Versi terakhir `xlsx` di npmjs.org adalah 0.18.5, yang terkena CVE-2023-30533 (prototype pollution, tingkat High). Perbaikannya ada di 0.19.3, tetapi versi itu tidak pernah diterbitkan ke npm — SheetJS memindahkan distribusinya ke CDN sendiri.

**Keputusan.** Dipasang dari `https://cdn.sheetjs.com/xlsx-<versi>/xlsx-<versi>.tgz`. API-nya identik, tidak ada perubahan kode.

**Konsekuensi.** `package.json` memuat URL, bukan nomor versi — pembaruan tidak otomatis terdeteksi tooling npm biasa, jadi versinya perlu dicek manual saat ada laporan keamanan baru. Alternatif kalau CDN terblokir jaringan: `exceljs`, yang berarti menulis ulang kode import.

---

### ADR-011 — Rating bintang manual Admin, kolom opsional di `batches` dan `products`
**2026-09-09 · Berlaku**

**Konteks.** BRD/PRD tidak menyebut sistem rating sama sekali. User (Alif) meminta tampilan bintang 5 di card pelatihan dan produk untuk kelengkapan visual premium, tanpa sistem review sungguhan (di luar scope Fase 1 — butuh alur submit, moderasi, dan tidak ada waktu untuk itu di 8 minggu).

**Keputusan.** Tambah kolom `rating` (numeric(2,1), nullable, check antara 0.0-5.0) di `batches` dan `products`. Diisi manual oleh Admin lewat form CRUD yang sudah ada. Kalau NULL, card tidak menampilkan bintang sama sekali — bukan menampilkan 0.0 atau placeholder kosong.

**Konsekuensi.** Ini bukan rating yang terverifikasi dari peserta/pembeli sungguhan — murni angka yang diinput Admin berdasarkan pertimbangannya sendiri (bisa dari testimoni, bisa estimasi). Kalau Hexatara suatu saat minta sistem review sungguhan, ini jadi utang migrasi: kolom manual perlu diganti dengan agregasi dari tabel review baru. Untuk Fase 1, trade-off ini diterima karena tidak ada waktu/scope untuk sistem review penuh.

---

### ADR-011b — Hero gallery pakai `hero_slides` yang sudah ada, bukan tabel baru
**2026-09-09 · Berlaku**

**Konteks.** User minta kotak galeri gambar di sisi kanan hero Beranda — poster produk/pelatihan yang bisa diklik menuju halaman terkait, dikelola Admin sebagai carousel. Sempat dipertimbangkan tabel baru "Hero Gallery" khusus.

**Keputusan.** TIDAK ada tabel baru. `hero_slides` (PANDUAN.md §3.3, sudah ada sejak Sprint 0/1 untuk F01.3) sudah punya seluruh kolom yang dibutuhkan: `gambar_url`, `cta_url` (link tujuan bebas — bisa ke `/pelatihan`, `/katalog`, atau slug spesifik), `urutan` (dipakai sebagai urutan carousel, sekaligus tunduk ke pola reorder otomatis ADR-014), `is_active`, judul/subjudul dwibahasa. F01.3 ("Hero produk unggulan + CTA utama") secara konsep memang dirancang untuk kebutuhan yang sama.

**Konsekuensi.** Tidak ada SQL baru untuk fitur ini. Admin Panel yang mengelola `hero_slides` (sudah ada dari Sprint 1) diperluas tampilannya jadi carousel di hero (bukan cuma satu slide statis, kalau implementasi sebelumnya hanya menampilkan satu slide aktif) — ini perubahan tampilan/komponen, bukan skema.

---

### ADR-012 — Kategori produk & pelatihan dinamis, dua tabel baru
**2026-09-09 · Berlaku**

**Konteks.** Kategori produk dan pelatihan saat ini kemungkinan hardcode/enum. User minta keduanya dikelola dinamis oleh Admin (tambah/ubah/hapus kategori sendiri), dipanggil lewat dropdown searchable di form produk/batch.

**Keputusan.** Dua tabel baru: `product_categories` (id, nama_id, nama_en, urutan, is_active) dan `batch_categories` (struktur sama). Kolom `products.category_id` dan `batches.category_id` sebagai FK, nullable saat transisi data lama.

**Konsekuensi.** Data kategori existing (kalau ada, tersimpan sebagai teks bebas di `products`/`batches`) perlu dipetakan manual ke kategori baru saat migrasi — Admin perlu meninjau dan mencocokkan satu per satu. Filter kategori di halaman publik (Pelatihan, Produk) sekarang query ke tabel terpisah, bukan `DISTINCT` dari kolom teks.

---

### ADR-013 — LMS Freemium: materi berbab (`material_chapters`), progress tersimpan di database
**2026-09-09 · Berlaku**

**Konteks.** PRD §8.5 mendesain kuis stateless (state di React, tidak di database) karena tidak ada kondisi gagal yang mungkin — cocok untuk kuis correctable yang selalu berakhir 100%. Tapi user sekarang minta pengalaman LMS penuh untuk MATERI: banyak bab per materi, wajib dibaca berurutan (tidak bisa skip), course completion & progress bar per bab, dan yang penting — progress ini harus bertahan lintas sesi/device untuk user yang sudah login (memperbaiki bug alur freemium yang membuat user kembali ke awal saat login ulang).

Materi ditulis Admin langsung di rich text editor Tiptap (bukan import dari file eksternal), konsisten dengan pola `deskripsi_*`/`silabus_*`/`konten_*` yang sudah ada.

**Keputusan.**
- Tabel baru `material_chapters`: banyak bab per `materials`, flat (bukan bertingkat modul>bab), dengan `urutan` (reindex otomatis saat diubah — lihat ADR-014), `judul_id`/`judul_en`, `konten_id`/`konten_en` (HTML dari Tiptap).
- Tabel baru `material_progress`: satu baris per (`user_id`, `chapter_id`), kolom `is_selesai` dan `selesai_at`. Ditulis saat user menyelesaikan syarat baca (scroll ke akhir konten, lihat ADR untuk detail validasi) di client, dikonfirmasi lewat Server Action ke server.
- Course content (daftar bab) terkunci berurutan: bab ke-N hanya bisa diklik kalau bab 1..N-1 sudah `is_selesai`. Divalidasi di server (Server Action menolak submit bab N kalau bab N-1 belum selesai), bukan cuma di UI — supaya tidak bisa diakali lewat DevTools.
- Menu kuis (yang sudah ada, F03.2, tidak diubah alurnya) hanya terbuka setelah SEMUA bab materi `is_selesai` untuk user itu.
- User yang sudah login (dari Dashboard User) langsung masuk ke LMS materi+kuis tanpa form daftar di akhir — beda dari pengunjung anonim yang tetap lewat form daftar akun di ujung alur (PRD §8.3 tidak berubah untuk anonim).

**Konsekuensi.** Ini pengecualian eksplisit terhadap prinsip "state kuis tidak di database" — tapi PENGECUALIAN INI HANYA UNTUK MATERI, bukan kuis. Kuis (F03.2) tetap 100% stateless sesuai PRD §8.5, tidak ada perubahan sama sekali di sana; larangan §13.3 (tidak ada tabel riwayat pengerjaan KUIS) tetap berlaku penuh. `material_progress` adalah tabel progress MATERI, bukan riwayat skor kuis — tidak melanggar larangan yang ada karena larangan itu spesifik soal kuis.

Menambah 2 tabel baru di luar 24 tabel PRD §5 — perlu SQL baru yang dijalankan manual oleh user (tidak dieksekusi otomatis, sesuai larangan #2).

Ini juga perluasan scope di luar BRD-HXT-002 asli (BRD §4.2 dan §13.2 melarang "progres peserta" dan "elemen LMS lain" untuk batch tersertifikasi berbayar) — tapi larangan itu spesifik untuk batch RPC berbayar yang delivery-nya tetap manual WhatsApp Group + Zoom (BRD §4.2 baris 2). Modul 3 (Freemium) adalah modul terpisah yang MEMANG sudah masuk scope resmi BRD sejak awal; perluasan di sini adalah pendalaman UX di dalam modul yang sudah disetujui, disetujui Alif sebagai pelaksana proyek pada 2026-09-09, bukan penambahan modul baru di luar BRD.

---

### ADR-014 — Reorder otomatis via drag-and-drop, berlaku di semua fitur berurutan
**2026-09-09 · Berlaku**

**Konteks.** Pola lama: Admin mengubah angka urutan manual di setiap baris, berisiko menghasilkan angka urutan yang bentrok (dua baris dengan urutan sama) karena baris lain tidak ikut bergeser otomatis. User eksplisit minta pola reorder otomatis diterapkan di semua tempat yang punya konsep urutan eksplisit: soal kuis (`quiz_questions`), bab materi (`material_chapters`, baru), dan produk katalog (`products.urutan`). Batch/pelatihan dikonfirmasi TETAP urut berdasarkan tanggal seperti sekarang — tidak diberi kolom urutan manual baru, jadi ADR ini tidak menyentuh `batches`.

**Keputusan.** UI reorder berbentuk drag-and-drop (bukan input angka manual). Saat urutan diubah, Server Action menghitung ulang SEMUA baris yang terpengaruh dalam satu transaksi — bukan hanya baris yang digeser. Pola implementasi: kirim array id sesuai urutan baru dari client, Server Action melakukan `UPDATE ... SET urutan = idx` per id dalam satu request, dibungkus transaksi (RPC Postgres kalau lintas banyak baris, mengikuti pola ADR yang sudah ada di §5.2 soal transaksi batal-semua).

**Konsekuensi.** Berlaku untuk `quiz_questions.urutan` (sudah ada), `material_chapters.urutan` (baru, ADR-013), `product_categories.urutan`/`batch_categories.urutan` (baru, ADR-012), dan `products.urutan` (sudah ada dari F04.6). Tidak ada kolom baru yang perlu ditambahkan untuk ADR ini sendiri — murni perubahan pola UI dan Server Action di tempat yang kolom urutannya sudah ada atau sudah direncanakan di ADR lain.

---

### ADR-015 — Popup landing: dua gambar terpisah per orientasi (mobile portrait, desktop landscape)
**2026-09-09 · Berlaku**

**Konteks.** Popup pembuka (F01.1) sebelumnya berbasis konten teks dari kolom `popups`. User sekarang minta popup berbasis gambar poster/flyer penuh yang diupload Admin, dengan orientasi berbeda untuk mobile (portrait) vs desktop/tablet (landscape) — bukan satu gambar yang di-crop otomatis, karena komposisi visual poster biasanya dirancang khusus per orientasi.

**Keputusan.** Tambah kolom `gambar_mobile_url` dan `gambar_desktop_url` di `popups` (menggantikan/melengkapi kolom konten teks yang ada). Client memilih gambar berdasarkan lebar viewport (breakpoint sama dengan breakpoint Tailwind `md:` yang sudah dipakai di seluruh proyek). Popup dibatasi ukuran (tidak memenuhi layar penuh — ada padding/margin dari tepi viewport, dengan tombol tutup yang jelas).

**Konsekuensi.** Admin wajib menyiapkan 2 file gambar per popup, bukan 1. Form CRUD popup di Admin Panel perlu 2 slot upload gambar terpisah dengan preview masing-masing. Popup lama (kalau ada baris existing berbasis teks) perlu migrasi data manual oleh Admin — tidak ada cara otomatis mengonversi teks jadi gambar.

---

### ADR-016 — Ekspor CSV diganti XLSX, seluruh titik ekspor dan import
**2026-09-09 · Berlaku · Membatalkan bagian ekspor dari ADR-010 soal `papaparse`**

**Konteks.** `papaparse` dengan BOM (§5.6, PRD §6.4/§6.5) dipilih di awal karena sederhana. Tapi Admin (Abi, pengguna awam) kesulitan dengan format CSV satu-kolom-dipisah-koma saat membuka di Excel — terutama pada data dengan banyak field (leads, sertifikat). XLSX per kolom asli jauh lebih mudah dibaca dan diedit non-teknis.

**Keputusan.** Ganti seluruh ekspor dan import CSV di sistem jadi XLSX, menggunakan `xlsx` yang SUDAH terpasang dari CDN SheetJS (ADR-010) — tidak perlu dependency baru:
- Ekspor lead (`/admin/leads`, kedua halaman) → `.xlsx`, kolom asli tanpa concat
- Template & hasil import sertifikat massal (F02.8) → `.xlsx`
- Template & hasil import bank soal (F03.13) — PRD §8.10 sudah menyebut Excel, jadi ini tinggal dikonfirmasi konsisten, bukan perubahan besar

**Konsekuensi.** PRD §6.4/§6.5 (acceptance criteria menyebut "CSV" eksplisit, termasuk pola nama file `leads-batch-YYYY-MM-DD.csv`) diperbarui jadi `.xlsx` — ini perubahan PRD, bukan cuma kode, karena mengubah acceptance criteria tertulis (lihat PRD.md §6.4/§6.5 dan riwayat perubahan di bawah). `papaparse` yang sudah terpasang jadi kandidat dependency unused setelah migrasi ini selesai — cek ulang dengan `pnpm knip` setelah seluruh titik ekspor/import berpindah ke XLSX, dan hapus `papaparse` dari dependencies kalau memang sudah tidak dipakai di mana pun.

---

### ADR-017 — Navbar Admin collapsible dengan sub-menu, menggantikan pola tab-in-page
**2026-09-09 · Berlaku**

**Konteks.** F01.14 (baru selesai 2026-09-09) memakai pola tab di dalam halaman untuk memisahkan pendaftaran minat vs permintaan penawaran. User sekarang minta pola ini diganti: setiap menu yang tadinya tab-in-page menjadi sub-item collapsible di navbar utama Admin. Navbar utama sendiri juga perlu bisa di-hide penuh (collapse ke ikon saja).

**Keputusan.** Navbar Admin diberi dua level: menu utama (Dashboard, Batch, Konten, Leads, Sertifikat, Upgrade, Materi, Produk, Pengaturan — sesuai peta route PRD §4) dan sub-menu di bawah menu yang punya lebih dari satu tampilan data (Leads → Pendaftaran Minat, Permintaan Penawaran; Materi → Materi & Bab, Bank Soal; Batch → Daftar Batch, Kategori Pelatihan; Produk → Daftar Produk, Kategori Produk). Navbar bisa di-collapse penuh jadi strip ikon (state disimpan di client, misal localStorage, murni preferensi tampilan per device).

**Konsekuensi.** `/admin/leads` yang baru selesai dirombak pola tab-nya (dikerjakan ulang, bukan pekerjaan sia-sia — komponen tabel dan ekspornya tetap dipakai ulang, hanya kontainer navigasinya yang berubah dari `<Tabs>` ke routing sub-menu, kemungkinan `/admin/leads/minat` dan `/admin/leads/penawaran` sebagai route terpisah). Ini dikerjakan SEBELUM Sprint 5 (hardening), sebagai bagian dari paket redesign, bukan sesudahnya.

---

### Template ADR baru

```
ADR-0XX — judul
YYYY-MM-DD · Berlaku | Menunggu | Dibatalkan oleh ADR-0YY

Konteks: masalah apa, batasan apa
Keputusan: apa yang dipilih
Konsekuensi: apa yang jadi lebih sulit karena pilihan ini
```

---

## 11. RIWAYAT PERUBAHAN STRUKTUR

| Tanggal | Perubahan |
|---|---|
| 2026-09-05 | Dokumen dibuat dari BRD-HXT-002 v1.1. Stack dikunci |
| 2026-09-05 | **BRD-HXT-001 dan seluruh dokumen PoC Juli 2026 adalah visi Fase 3, BUKAN scope aktif.** Kalau menemukan rujukan ke LMS, dashboard korporat, atau microservice di dokumen lama, abaikan |
| 2026-09-05 | Validasi domain email 3 lapis **dipindahkan ke Fase 2** |
| 2026-09-05 | Sertifikat `free_track` **berlaku selamanya**. Catatan internal lama yang menyebut masa berlaku 1 tahun sudah tidak berlaku |
| 2026-09-05 | **Dokumen dipecah.** Isi produk — daftar fitur, aturan bisnis, acceptance criteria, 25 larangan — pindah ke `PRD.md`. Berkas ini menjadi murni teknis. Tabel pengalihan nomor bagian ada di bagian paling atas |
| 2026-09-05 | ADR-009 (dwibahasa ditunda ke Sprint 1.5) dan ADR-010 (`xlsx` dari CDN) ditambahkan |
| 2026-09-09 | **Fase 12.5 — Redesign & Upgrade Sistem** disepakati Alif, dikerjakan sebelum Sprint 5. ADR-011 s/d ADR-017 ditambahkan (rating bintang manual, hero gallery pakai `hero_slides` existing, kategori produk/pelatihan dinamis, LMS materi berbab dengan progress database, reorder otomatis universal, popup dua gambar per orientasi, ekspor/import CSV diganti XLSX, navbar Admin dua level collapsible). PRD.md Modul 6 ditambahkan (F06.x) sebagai pendokumentasian fitur-fitur ini. PRD.md §6.4/§6.5 diperbarui dari CSV ke XLSX mengikuti ADR-016. SQL baru di `docs/sql/15_redesign_upgrade_fase12.5.sql`, dijalankan manual oleh Alif sebelum blok prompt PANDUAN.md §12.5 dimulai |
| 2026-09-10 | **Koreksi SQL 15 (ADR-013).** Draf pertama salah asumsi seluruh primary key proyek bertipe `uuid`. Dikonfirmasi lewat query `information_schema.columns` terhadap database live: hampir semua tabel inti (`materials`, `products`, `batches`, `popups`, `quiz_questions`, dst) memakai `bigint identity`, hanya `certificates` dan `profiles` yang sengaja `uuid`. `material_chapters.id`/`material_id` dan `material_progress.id`/`chapter_id` diperbaiki jadi `bigint`; `material_progress.user_id` tetap `uuid` (mengacu `auth.users`). ADR-011 (rating) dan ADR-012 (kategori, `product_categories`/`batch_categories` — sengaja `uuid` karena tabel baru) sudah berhasil dijalankan sebelum koreksi ini dan tidak terpengaruh. **Pelajaran untuk sesi berikutnya: selalu verifikasi tipe kolom lewat query ke database live sebelum menulis DDL baru, jangan berasumsi dari pola sebagian tabel** |
