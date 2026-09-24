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
ADMIN_NOTIFY_EMAIL=               # fallback saja — sumber utama: site_settings.admin_notify_email (lihat getAdminNotifyEmail)
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WA_ADMIN=             # format 62xxx
UPSTASH_REDIS_REST_URL=           # Sprint 2
UPSTASH_REDIS_REST_TOKEN=         # Sprint 2
RATE_LIMIT_VERIFY_ENABLED=false
NEXT_PUBLIC_SENTRY_DSN=           # F05.5 — publik (inline ke browser); bukan secret
```

Apa pun tanpa prefix `NEXT_PUBLIC_` hanya terbaca di server. Menambahkan prefix itu pada `SUPABASE_SERVICE_ROLE_KEY` adalah kebocoran total, bukan kesalahan kecil.

### 2.4 Sentry — kebijakan privasi (F05.5, 2026-09-23)

Pemantauan error lewat `@sentry/nextjs`. Wajib: event **tanpa** cookie, body form, email, atau data identitas (KTP). Di kode: `sendDefaultPii: false`, Session Replay off, `beforeSend` scrub + hapus `event.user`/`contexts.geo`, `setUser({ ip_address: null })`. Di dashboard: Prevent Storing of IP Addresses (Organization Security & Privacy).

**Keputusan final:** Geography (kota+negara) yang masih muncul dari **geo enrichment backend Sentry atas peer IP koneksi HTTPS ke ingest** diterima sebagai **batas wajar / acceptable risk**. Tiga lapis mitigasi (dashboard + beforeSend + setUser) sudah dicoba; Advanced Data Scrubbing / proxy tidak dilanjutkan — tidak proporsional, dan scrub UI tidak menghentikan pemrosesan IP di sisi Sentry. Data sensitif kritis yang wajib bersih sudah terverifikasi.

---

## 3. DATABASE — cara memakainya

Daftar tabel dan kolomnya ada di `PRD.md` Bagian 5. DDL-nya di `PANDUAN.md` Bagian 3.3. Bagian ini soal cara mengaksesnya dari kode.

### 3.1 Tiga client, tiga kegunaan

```
src/lib/supabase/
├─ client.ts   createBrowserClient   → Client Component saja (slot resmi — lihat catatan di bawah)
├─ server.ts   createServerClient    → Server Component & Server Action. Default
└─ admin.ts    service role          → HANYA untuk operasi yang harus melewati RLS
```

**`client.ts` — slot resmi, belum dipanggil di Fase 1.** Arsitektur Fase 1 murni server-first (ADR-001: baca di Server Component, tulis di Server Action). Tidak ada realtime subscription, `onAuthStateChange`, maupun query langsung dari Client Component. File ini **sengaja dipertahankan** sebagai pintu masuk resmi kalau nanti dibutuhkan auth/realtime di browser; **jangan hapus** hanya karena knip melaporkan unused. Diabaikan knip lewat `knip.json` → `ignore: ["src/lib/supabase/client.ts"]`. Keputusan serah-terima 2026-09-24.

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

**Konsekuensi.** Penskalaan horizontal per komponen tidak tersedia. Pada beban Fase 1 itu bukan kekurangan yang terasa. Kalau suatu saat perlu, pemisahan dilakukan saat ada alasannya, bukan sekarang. Client browser Supabase (`src/lib/supabase/client.ts`) tetap ada sebagai slot resmi (lihat §3.1) tetapi **tidak dipakai** selama pola server-first ini berlaku — bukan gap fitur, bukan dead code yang wajib dibuang.

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

### ADR-018 — LMS materi: video/gambar opsional per bab, lampiran file bisa diunduh
**2026-09-10 · Berlaku**

**Konteks.** Setelah §12.5.3 (ADR-013) dijalankan pertama kali, hasil implementasi belum sesuai referensi LMS yang diinginkan Alif (mirip Schoolabs/Coursera-style): sidebar navigasi materi masih flat, tidak ada tampilan konten visual (video/gambar), dan tidak ada cara bagi Admin melampirkan berkas yang bisa diunduh user (pengganti kolom komentar di referensi, yang tidak relevan untuk Hexatara). ADR-013 asli hanya mendefinisikan `konten_id`/`konten_en` sebagai HTML teks dari Tiptap, tanpa slot untuk video atau gambar per bab, dan tidak ada mekanisme lampiran file sama sekali.

**Keputusan.**
- Dua kolom baru di `material_chapters`: `video_url text` dan `gambar_url text`, KEDUANYA nullable dan independen satu sama lain. Admin bebas mengisi salah satu, keduanya, atau tidak sama sekali — tampilan bab menyesuaikan (bab teks-saja tetap valid, tidak wajib ada video/gambar). Ini murni penambahan kolom pada tabel yang sudah ada (ADR-013), bukan restrukturisasi.
- Tabel baru `material_chapter_files`: relasi one-to-many ke `material_chapters` (satu bab bisa punya banyak lampiran file, misal PDF slide + spreadsheet referensi dalam bab yang sama). Kolom: `judul_id`/`judul_en`, `deskripsi_id`/`deskripsi_en` (mengikuti konvensi dwibahasa proyek, sama seperti `material_chapters.judul_id`/`judul_en`), `url_file`, `urutan` (tunduk pola reorder otomatis ADR-014, sama seperti `material_chapters.urutan`).
- Di UI LMS materi, lampiran file bab aktif ditampilkan sebagai bagian dari sidebar/panel navigasi bab tersebut (bukan sebagai section "komentar" seperti referensi visual yang dilampirkan Alif) — tiap file tampil dengan judul, deskripsi singkat, dan tombol unduh. TIDAK ada fitur komentar/diskusi di LMS materi Hexatara, itu sengaja dihilangkan dari referensi.
- Progress bar dan checklist status (course completion) SUDAH ditentukan di ADR-013 — ADR ini tidak mengubah mekanismenya, hanya menegaskan bahwa UI-nya harus jelas menunjukkan posisi user (bab mana yang sedang dibaca, bab mana yang sudah selesai/tercentang, berapa persen total) supaya user tidak bingung, sesuai umpan balik Alif setelah melihat hasil implementasi pertama.

**Konsekuensi.** Menambah 1 tabel baru (`material_chapter_files`) di luar 24 tabel PRD §5 plus 4 tabel yang sudah ditambahkan Fase 12.5 sebelumnya (kini 5 tabel baru total) — SQL baru dijalankan manual oleh user (larangan #2, tidak dieksekusi otomatis). Ini murni perluasan ADR-013 (LMS materi), bukan ADR terpisah secara konseptual — dipecah jadi ADR-018 sendiri supaya riwayat perubahan pasca-implementasi-pertama tetap tercatat jelas terpisah dari desain awal.

Larangan §13.3 untuk KUIS tetap berlaku penuh dan sama sekali tidak tersentuh oleh ADR ini — file unduhan, video, dan gambar HANYA berlaku untuk MATERI, tidak ada perubahan apa pun pada mesin kuis F03.2.

---

### ADR-019 — Redesign total: adopsi Studio Admin design system (Fase 12.6)
**2026-09-10 · Berlaku**

**Konteks.** Alif memberikan referensi desain baru untuk seluruh Hexatara
(admin, dashboard user, termasuk halaman login/daftar): studio-admin.arhamkhnz.com,
starter dashboard Next.js berbasis shadcn/ui. Instruksinya eksplisit: "segala
komponen yang digunakan sebelumnya akan direplace" — ini bukan penyempurnaan
Fase 12.5, ini pivot arah desain. Diverifikasi langsung lewat browser
(termasuk pembacaan computed CSS custom properties, bukan tebakan visual) —
detail lengkap ada di `hexatara_ADMIN_DESIGN.md`.

Sebelum ADR ini ditulis, dicek status Fase 12.5 yang sedang berjalan: hanya
§12.5.1 (Design System v2 kerangka), §12.5.2 (perbaikan bug freemium), dan
§12.5.3 (LMS materi berbab, sudah 2 kali iterasi) yang benar-benar sudah
dijalankan. §12.5.4 (CRUD bab materi) BELUM SELESAI, dan §12.5.5 sampai
§12.5.17 SAMA SEKALI BELUM DIMULAI. Karena scope-nya nyaris sama persis
dengan yang akan dibangun ulang di Fase 12.6 (DataTable generik, crop gambar,
Dashboard User, halaman Auth, redesign Beranda/Pelatihan/Produk, dst),
melanjutkan blok-blok itu dengan design system LAMA lalu langsung
menggantinya adalah kerja dua kali yang sia-sia. Diputuskan: §12.5.4 sampai
§12.5.17 di PANDUAN.md diarsipkan (ditandai jelas, TIDAK dihapus, supaya
riwayat keputusan tetap tercatat) dan seluruh scope-nya diserap ke blok-blok
Fase 12.6 — pemetaan lengkap ada di catatan arsip di PANDUAN.md, tepat
sebelum §12.5.4.

**Keputusan.**
- **Dibuka Fase baru, bukan disisipkan ke Fase 12.5.** Fase 12.5 tetap
  tercatat apa adanya sebagai riwayat (§12.5.1–§12.5.3 tetap dipakai sebagai
  fondasi kode yang ada, dimigrasi bukan ditulis ulang dari nol). Fase 12.6
  — "Redesign Total: Adopsi Studio Admin Design System" — dimulai bersih
  dengan sistem desain baru, dikerjakan SEBELUM Sprint 5 seperti Fase 12.5.
- **Dependency baru DISETUJUI eksplisit oleh Alif** (larangan #7 PRD.md,
  butuh izin eksplisit — ini izinnya, dicatat di sini): shadcn/ui + Radix UI
  primitives, `class-variance-authority`, `@tanstack/react-table` (data
  table — ini juga menuntaskan izin yang sebelumnya digantung di F06.14/
  §12.5.11), `next-themes` (dark mode), Recharts atau library chart sejenis,
  `lucide-react` (ikon). Command Palette (`cmdk`, ⌘J) TIDAK wajib — boleh
  dipasang atau di-skip, diputuskan saat eksekusi §12.6.0, bukan fitur inti.
- **Warna: ikuti referensi APA ADANYA untuk sekarang** (preset "Neutral"
  bawaan shadcn/ui — achromatic, satu-satunya warna ber-hue adalah
  `destructive`/merah untuk aksi berbahaya), BUKAN token Hexatara
  (`--warna-utama` `#1E40AF`, `--warna-aksen` `#F59E0B`) yang selama ini jadi
  sumber kebenaran tunggal di seluruh blok §12.5.x. Ini keputusan SEMENTARA,
  eksplisit menunggu persetujuan Abi — dicatat sebagai blok PALING AKHIR
  Fase 12.6 (§12.6.14, murni catatan, TIDAK dieksekusi sampai Abi
  menyetujui). Sampai saat itu, seluruh dokumen desain (`hexatara_ADMIN_DESIGN.md`,
  blok-blok §12.6.x) sengaja memakai token referensi, bukan token Hexatara.
- **Radius `0.625rem` (10px) dan font Geist** dari referensi dipakai sebagai
  default baru, menggantikan skala radius `design-system-v2.md` sebelumnya —
  tunduk pada keputusan warna di atas (kalau Abi nanti minta radius/font ikut
  balik ke identitas Hexatara juga, itu bagian dari §12.6.14).
- **Halaman Auth pakai varian v2** referensi (form di kiri, panel highlight
  fitur di kanan) — dipilih Alif dari 2 varian yang ditemukan di referensi.
- **Prinsip mobile-first TETAP UTAMA**, ditegaskan ulang eksplisit oleh Alif
  saat ADR ini disepakati — bukan pengulangan basa-basi, tapi penekanan
  khusus karena redesign sebesar ini berisiko fokus ke desktop dulu. Setiap
  blok §12.6.x WAJIB diuji dari breakpoint mobile terlebih dahulu, sama
  seperti pola yang sudah ditegakkan di §12.5.3/ADR-018.
- **Dua AppShell terpisah**: satu untuk area Admin, satu untuk Dashboard
  User (role berbeda, navigasi berbeda) — keduanya pakai pola sidebar+topbar
  yang sama dari referensi, tapi konten sidebar berbeda. Halaman PUBLIK
  (Beranda, Pelatihan, Produk, dst) TIDAK memakai shell sidebar ini — tetap
  layout marketing biasa, hanya komponen dasarnya (button, card, badge,
  token warna/radius/font) yang ikut sistem baru.

**Konsekuensi.** Ini migrasi besar yang menyentuh HAMPIR SELURUH permukaan
UI Hexatara yang sudah ada, termasuk yang sudah DONE di F01-F04 (bukan cuma
Fase 12.5) — audit regresi visual menyeluruh WAJIB di penutup Fase 12.6
(§12.6.11), meneruskan pola yang sudah ada di §12.5.17 lama. Komponen lama
dari Fase 12.5 (`ContentCard`, `StatusBadge`, `StarRating`, `ImageUploadField`
kerangka §12.5.1) TIDAK dibuang logikanya, tapi tampilannya dibangun ulang di
atas primitif shadcn/ui baru. `hexatara_DESIGN.md` (referensi gaya
Linear/Cal.com/Mintlify/Vercel, dipakai Fase 12.5) TIDAK dipakai lagi di
Fase 12.6 — digantikan `hexatara_ADMIN_DESIGN.md`. Warna Hexatara yang sudah
jadi identitas brand (biru `#1E40AF`, aksen oranye `#F59E0B`) untuk sementara
tidak terlihat di UI sampai Abi menyetujui penyesuaian (§12.6.14) — risiko
ini diterima sadar oleh Alif, bukan kelalaian.

---

### ADR-020 — Pendaftaran pelatihan lengkap (RPC): identitas di `profiles`, tabel `batch_registrations` baru, bucket privat `identity-documents`
**2026-09-16 · Direvisi (lihat ADR-020r di bawah) — bagian ini dipertahankan sebagai riwayat keputusan awal, JANGAN dijadikan acuan implementasi**

**Konteks.** Abi (klien) meminta pendaftaran pelatihan RPC mengikuti syarat
data yang selama ini dikumpulkan lewat Google Form manual: nama sesuai KTP,
nomor KTP, tempat/tanggal lahir, alamat lengkap, kategori peserta (Penerbitan
Baru / Perpanjangan-Renewal), pilihan batch, foto KTP, pas foto, dan sumber
informasi. Alur "daftar minat" yang ada sekarang (F01.6 — nama + WhatsApp,
tersimpan ke `batch_leads`) eksplisit BUKAN pendaftaran resmi (PRD.md §6.4);
form baru ini justru dimaksudkan jadi pendaftaran resmi, jadi menggantikan
F01.6 di halaman publik, bukan tambahan di sampingnya.

Tiga keputusan didiskusikan dan dikonfirmasi Alif sebelum SQL ditulis:

1. **Field identitas disimpan di `profiles` (akun), bukan di tabel
   pendaftaran per-batch.** Kategori "Perpanjangan/Renewal RPC" berarti
   peserta yang sama akan mendaftar lagi tiap ~2 tahun — data identitas
   sekali isi dipakai ulang, tidak diminta isi ulang tiap pendaftaran.
2. **Wajib login dulu, baru isi form pendaftaran batch** — bukan form
   gabungan identitas+akun sekali jalan seperti Google Form aslinya. Ini
   konsisten dengan alur auth F00.6 yang sudah ada (`/daftar` terpisah),
   tidak membuat jalur pendaftaran akun kedua yang paralel.
3. **Foto KTP dan pas foto masuk bucket privat + `createSignedUrl()`**,
   pola identik `certificates`/`payment-proofs` (Bagian 5.3 tabel bucket) —
   tidak ada alasan menyimpang untuk data identitas yang levelnya sama
   sensitifnya dengan bukti transfer.

Urutan kerja disepakati: Fase 12.6 (redesign publik) selesai dulu, modul ini
menyusul — supaya form baru dibangun di atas komponen/desain final, bukan
komponen lama yang akan diganti lagi (dikonfirmasi ulang 2026-09-16 setelah
Fase 12.6 selesai, form pendaftaran lengkap ini resmi dimulai sebagai
Fase 12.7 / Modul 7).

**Keputusan.**
- Tambah 6 kolom ke `profiles`: `nomor_ktp`, `tempat_lahir`, `tanggal_lahir`,
  `alamat_lengkap`, `foto_ktp_url`, `pas_foto_url`. Fungsi helper
  `profil_identitas_lengkap(user_id)` (`SECURITY DEFINER`, pola sama
  `is_admin()`) mengembalikan boolean, dipakai server action pendaftaran
  untuk validasi cepat tanpa mengulang enam pengecekan null di banyak tempat.
- Tabel baru `batch_registrations` — **bigserial**, BUKAN uuid (ADR-013
  sudah mengoreksi asumsi keliru sebelumnya bahwa semua tabel proyek ini
  uuid; hanya `profiles` dan `certificates` yang sengaja uuid). Kolom inti:
  `batch_id` (FK `batches`), `user_id` (FK `auth.users` langsung, uuid —
  pola sama `certificate_orders.user_id`, TIDAK di-embed lewat relasi
  Supabase otomatis karena `auth.users` bukan schema `public`, digabung
  manual di kode seperti pola `admin/upgrade/page.tsx`), `kategori_peserta`
  (enum baru `kategori_peserta_rpc`), `sumber_info`, `kode_referral`,
  `status` (enum baru `status_registrasi_batch`), `alasan_tolak`,
  `verified_by`/`verified_at`. Constraint unik `(batch_id, user_id)` — satu
  user tidak bisa daftar batch yang sama dua kali selagi masih menunggu
  atau sudah disetujui (boleh daftar ulang kalau ditolak).
- `batch_leads` (F01.6, Bagian 5.1) **TIDAK dihapus atau diarsipkan** —
  dipertahankan sebagai riwayat data lama. Menu Admin "Leads" yang sudah ada
  tidak langsung dibongkar; kalau ke depannya Alif ingin `batch_leads`
  dinonaktifkan total, itu keputusan terpisah yang diajukan lagi setelah
  alur baru stabil.
- Bucket storage privat baru `identity-documents` (`public = false`).
  Policy: user upload/baca hanya dokumen miliknya sendiri (path diawali
  `user_id`, konvensi `${userId}/ktp.jpg` dst — harus diikuti kode upload di
  F07.2), Admin baca semua lewat `is_admin()` untuk keperluan verifikasi
  F07.5.
- RLS penuh di `batch_registrations`: user baca & buat pendaftaran miliknya
  sendiri, Admin baca & update semua (verifikasi/tolak) — pola sama seluruh
  tabel lain di proyek ini, memutus rekursi lewat `is_admin()`.

**Konsekuensi.** Halaman detail batch (`pelatihan/[slug]`) kehilangan dialog
"daftar minat" ringan yang selama ini instan tanpa login — pendaftaran jadi
lebih panjang (wajib akun + data identitas lengkap), yang secara sadar
mengurangi kecepatan tapi menaikkan kelengkapan data sesuai kebutuhan
sertifikasi DKPPU. Pengaturan User (F07.2) bertambah kompleks dengan form
identitas + dua upload dokumen. Admin panel bertambah satu jalur verifikasi
baru (F07.5) di luar verifikasi pembayaran upgrade sertifikat yang sudah ada
— dua alur verifikasi berbeda (`certificate_orders` untuk upgrade freemium,
`batch_registrations` untuk pendaftaran RPC) sengaja TIDAK digabung karena
keduanya bagian sistem yang berbeda (Modul 3 vs Modul 7).

---

### ADR-020r — Revisi: pendaftaran TANPA wajib akun, `batch_registrations` jadi mandiri (bukan bergantung `profiles`)
**2026-09-16 · Berlaku — menggantikan keputusan #1 dan #2 ADR-020 di atas**

**Konteks.** Sebelum implementasi F07.3 dimulai, Abi meninjau ulang keputusan
"wajib login dulu baru bisa isi form pendaftaran" (ADR-020 keputusan #2) dan
menilai ini akan jadi hambatan nyata: akan selalu ada peserta (termasuk yang
sudah senior/berpengalaman) yang tidak mau repot bikin akun cuma untuk
mendaftar satu batch pelatihan. Didiskusikan dan dikonfirmasi Alif (via sesi
tanya-jawab terstruktur, 2026-09-16) — SQL Bagian 1-5 ADR-020 asli SUDAH
terlanjur dijalankan live di Supabase sebelum revisi ini muncul, jadi
perubahan ini berbentuk **migrasi ALTER tambahan**, bukan tulis ulang dari
nol.

**Keputusan.**

1. **Login tidak lagi wajib untuk mendaftar batch.** Siapa pun (dengan atau
   tanpa akun) bisa langsung mengisi form pendaftaran lengkap (identitas +
   kategori peserta + sumber info + kode referral) di halaman publik
   `pelatihan/[slug]`. Alur per kondisi:
   - **Tanpa akun** → form lengkap terbuka langsung, isi dari nol. Kalau
     mendaftar batch lain di kemudian hari, isi ulang lagi dari nol (tidak
     ada mekanisme cari/pakai-ulang data lama berdasar email — disepakati
     sengaja sederhana, Admin membedakan riwayat peserta lewat data per
     baris pendaftaran, bukan lewat akun).
   - **Sudah login, profil `profiles` lengkap** → form ter-prefill dari
     `profiles`, tinggal pilih kategori/batch/isi referral.
   - **Sudah login, profil belum lengkap** → form lengkap tetap langsung
     terbuka untuk diisi manual saat itu juga (TIDAK diblokir/gate) — di
     dashboard user muncul card pengingat terpisah (hilang otomatis begitu
     profil lengkap) yang mengarahkan ke halaman lengkapi profil, murni
     kemudahan untuk pendaftaran berikutnya, bukan syarat pendaftaran
     sekarang.
   - **Punya akun tapi belum login di device ini** → saat klik Daftar,
     tawarkan dua pilihan eksplisit ("Login dulu" / "Daftar tanpa akun
     sekarang"), user yang memilih.

   **Amandemen 2026-09-22 (F07.3 Fix A, diuji Alif).** User yang **sudah
   login** juga selalu melihat layar pilihan — bukan langsung ke form
   prefill (bug sebelumnya: sesi Admin/user menempel ke pendaftaran tamu
   dan menimpa `profiles`):
   - **"Daftar dengan akun ini"** → perilaku lama (prefill jika lengkap,
     taut `user_id`, sync identitas ke `profiles`, path foto `${userId}/…`).
   - **"Daftar tanpa taut akun"** → form kosong; FormData `sebagai_tamu=1`;
     server action memaksa `user_id = null`, path `registrasi/<id>/…`,
     **SKIP** sync `profiles`. Sama secara data dengan pendaftar anon.

2. **`batch_registrations` jadi mandiri — tidak lagi bergantung join ke
   `profiles` untuk data identitas.** Field identitas (nama lengkap, email,
   WhatsApp, nomor KTP, tempat/tanggal lahir, alamat, path foto KTP, path
   pas foto) diduplikasi langsung sebagai kolom di `batch_registrations`
   sendiri — snapshot per-pendaftaran, bukan referensi live ke `profiles`.
   Alasan: pendaftar tanpa akun tidak punya baris `profiles` sama sekali,
   dan Admin butuh satu bentuk data yang konsisten di panel verifikasi
   (F07.5) terlepas dari status akun pendaftarnya.
   - `user_id` di `batch_registrations` jadi **nullable** — diisi kalau
     pendaftar login saat submit, `null` kalau tidak. Dipakai untuk
     menautkan riwayat pendaftaran ke akun kalau ada, TIDAK untuk syarat
     insert.
   - Kolom `email` ditambahkan langsung di `batch_registrations` — sengaja
     tidak bergantung ke `auth.users.email` (yang notabene tidak bisa
     di-query lewat client biasa), sesuai arahan Abi: "email tidak berada di
     tabel akun".
   - **`profiles` TETAP menyimpan 6 kolom identitas** (keputusan #1 ADR-020
     asli tidak dibatalkan) — untuk pendaftar yang login, identitas yang
     mereka isi di form pendaftaran (atau di halaman Profil) tetap disalin
     ke `profiles` juga, supaya pendaftaran/renewal berikutnya bisa
     ter-prefill. Jadi ada duplikasi data yang disengaja: `profiles` = data
     "saat ini" yang dipakai ulang; `batch_registrations` = snapshot data
     persis saat pendaftaran itu dibuat (tidak berubah walau user edit
     profilnya belakangan).
3. **RLS `batch_registrations` bertambah policy INSERT untuk peran `anon`**
   (sebelumnya cuma `user_id = auth.uid()`), dengan `WITH CHECK` yang
   memastikan baris anon punya `user_id IS NULL` dan `email IS NOT NULL`
   (tidak boleh kosong dua-duanya). SELECT tetap TIDAK dibuka untuk `anon`
   — konfirmasi sukses ke pendaftar tanpa akun ditampilkan langsung dari
   hasil `insert().select()` di server action pada request yang sama, bukan
   query balik terpisah yang butuh baca ulang lewat RLS.
4. **Path upload KTP/pas foto untuk pendaftar tanpa akun** memakai id baris
   pendaftaran, bukan `user_id` (yang tidak ada) — alur dua langkah: server
   action insert baris `batch_registrations` dulu (tanpa path foto) untuk
   dapat `id`, baru upload ke path `registrasi/<id>/ktp.<ext>` dan
   `registrasi/<id>/pas-foto.<ext>`, baru update baris dengan path
   fotonya. Untuk pendaftar login, path tetap pola lama `${userId}/...`.
   Policy storage `identity-documents` diperluas: insert diperbolehkan untuk
   `anon` sepanjang path diawali `registrasi/` (tanpa syarat `auth.uid()`),
   dan untuk user login sepanjang path diawali `${auth.uid()}/` seperti
   sebelumnya. Admin tetap baca semua lewat `is_admin()`.
5. **Kode referral tetap teks bebas, dicatat apa adanya** — tidak ada
   validasi ke daftar kode resmi atau reward otomatis (berisiko menabrak
   larangan PRD §13.1 soal kupon/reward otomatis). Dicatat sebagai catatan
   potensi fitur add-on masa depan kalau Abi suatu saat ingin sistem
   referral yang lebih formal — BUKAN dikerjakan di Sprint 6 ini.
6. **Duplikat pendaftaran dari pendaftar tanpa akun** (email sama, batch
   sama) sengaja TIDAK dicegah otomatis oleh sistem — dibiarkan, Admin
   menilai manual saat verifikasi (F07.5) karena volume pendaftaran per
   batch kecil dan semua data lengkap sudah terlihat Admin saat itu.
   Constraint unik `(batch_id, user_id)` yang sudah ada TETAP berlaku untuk
   pendaftar yang login (`user_id` terisi) — tidak berubah.

**Konsekuensi.** `batch_registrations` sekarang tabel yang jauh lebih besar
(punya sendiri kolom identitas lengkap, bukan cuma metadata pendaftaran) —
disengaja demi kesederhanaan panel Admin dan supaya tidak bergantung status
akun. F07.4 ("gate data belum lengkap") yang sebelumnya didesain sebagai
penghalang wajib di PRD.md §9b sekarang **berubah jadi pengingat non-blokir**
(card dashboard) — bukan gate sungguhan, karena pendaftaran sekarang boleh
jalan dengan data yang diisi manual langsung di form, login atau tidak.
Migrasi SQL untuk revisi ini ditulis sebagai file BARU
(`usulan-sql-pendaftaran-tanpa-akun-adr020r.sql`) yang berisi `ALTER TABLE`
di atas skema `usulan-sql-pendaftaran-lengkap.sql` yang sudah berhasil
dijalankan — bukan menulis ulang `CREATE TABLE` dari nol, karena tabel sudah
ada dan mungkin sudah berisi data uji.

---

### ADR-021 — Modul 8: halaman Peserta Pendaftaran, filter batch, syarat/fasilitas (reuse batch_benefits + tabel baru batch_requirements), dua nomor WA, salin batch
**2026-09-17 · Berlaku**

**Konteks.** Setelah Sprint 6/Modul 7 (F07.1–F07.5) selesai dikerjakan Cursor
dan diuji Alif sepenuhnya, Abi menyampaikan empat kebutuhan operasional
tambahan lewat Alif:

1. Admin belum punya halaman yang menampilkan murni "siapa saja peserta yang
   sudah disetujui" per batch — panel verifikasi F07.5 fokusnya alur
   setujui/tolak, bukan rekap/export. Diklarifikasi dulu ke Alif: dicek
   `pendaftaran-batch/actions.ts` langsung, approve TIDAK menyentuh
   `certificate_orders` sama sekali — jadi ini murni kebutuhan halaman baru,
   BUKAN bug percampuran data antara pendaftaran batch dan upgrade
   sertifikat (dua sistem memang sengaja terpisah, ADR-020 konsekuensi).
2. Panel verifikasi F07.5 butuh filter per batch.
3. Konten dari Google Form asli (syarat peserta, daftar fasilitas, dua
   kontak WhatsApp berbeda untuk batch reguler vs Private & Inhouse
   Training) belum ada di halaman detail batch publik — Abi minta
   dimasukkan.
4. Supaya Abi tidak mengetik ulang seluruh konten batch setiap membuat batch
   baru, dibutuhkan cara menyalin konten dari batch lama.

**Riset kode sebelum menulis keputusan (penting, mengubah rancangan awal):**
dicek `src/types/database.ts` dan kode terkait, ditemukan tabel
`batch_benefits` SUDAH ADA (bigserial, `batch_id` FK, `teks_id`/`teks_en`
dwibahasa, `ikon`, `urutan` reorder) dan SUDAH dipakai untuk badge pills di
halaman detail batch publik (`pelatihan/[slug]/page.tsx`), dengan CRUD Admin
yang sudah ada di `admin/batch/[id]`. Rancangan awal (kolom
`syarat_peserta`/`fasilitas` baru di `batches`) DIBATALKAN setelah temuan
ini — fasilitas REUSE `batch_benefits` yang sudah ada, tidak ada skema baru
untuk itu. `site_settings` juga dicek langsung
(`src/lib/site-settings.ts`) — sudah key-value (`key`/`value jsonb`), jadi
dua nomor WA baru TIDAK butuh `ALTER TABLE`, cukup key baru.

**Keputusan.**
- Halaman Admin baru `/admin/peserta-pendaftaran` (F08.1) — TERPISAH dari
  `admin/pendaftaran-batch` (F07.5), bukan menggantikan. Menampilkan hanya
  baris `batch_registrations` dengan `status = 'disetujui'`, kolom langsung
  dari tabel itu sendiri (sudah mandiri sejak ADR-020r, tidak perlu join
  `profiles`). Filter dropdown per batch, tombol export **XLSX** (konsisten
  ADR-016) yang mengikuti filter aktif di tabel saat diklik. Sengaja TIDAK
  terhubung ke `certificate_orders` — status upgrade sertifikat tetap dicek
  terpisah di panel Upgrade (Modul 3) seperti sebelumnya.
- Filter batch (F08.2) ditambahkan sebagai dropdown murni di atas tabel
  `admin/pendaftaran-batch` yang sudah ada — tidak mengubah alur
  setujui/tolak.
- Card baru di halaman detail batch publik (F08.3), ditempatkan setelah
  card "Jadwal & Investasi", sebelum "Peralatan Belajar".
  **Fasilitas REUSE `batch_benefits` yang sudah ada** — tidak ada tabel/
  kolom baru untuk ini, Admin tinggal isi 7 item lewat form yang sudah ada
  (dipermudah lagi lewat F08.4 di bawah).
  **Syarat peserta adalah tabel BARU `batch_requirements`** — pola identik
  `batch_benefits` (bigserial, `batch_id` FK, teks dwibahasa, `ikon`
  opsional, `urutan`), karena maknanya beda ("boleh ikut" vs "kenapa ikut")
  meski strukturnya sama — dipisah tabelnya supaya kedua daftar bisa
  dikelola independen dengan reorder masing-masing.
  Dua kontak WA: **bukan kolom baru di `batches`**, disimpan sebagai KEY
  BARU `kontak_pelatihan` di `site_settings` (`{wa_reguler, wa_private}`),
  pola persis `upsertSiteSetting('kontak', …)` yang sudah ada — cukup
  fungsi baru `getKontakPelatihan()`/`simpanKontakPelatihanAction()` di
  kode, TIDAK butuh migrasi `ALTER TABLE`. TERPISAH dari key `kontak` yang
  sudah ada (WA umum, catatan 2026-09-13, dipakai `floating-whatsapp.tsx`).
  Disepakati SAMA untuk semua batch pelatihan, diatur lewat
  `/admin/pengaturan` yang sudah ada.
- **Fitur "Salin dari Batch Lain" (F08.4)** — tombol baru HANYA di form
  Tambah Batch Admin (sengaja TIDAK di form Edit, supaya tidak berisiko
  menimpa data batch aktif). Dropdown pilih batch sumber → server action
  menyalin kolom teks `batches` (deskripsi, silabus, lokasi, alamat, harga,
  rating, kategori) APA ADANYA, PLUS seluruh baris di 5 tabel terkait
  (`batch_benefits`, `batch_equipment`, `batch_faqs`, `batch_gallery`,
  `batch_requirements`) sebagai baris BARU (bukan referensi) ke batch
  tujuan. Field yang SENGAJA dikosongkan: `slug`, `judul_id`/`judul_en`,
  `tanggal_mulai`/`tanggal_selesai`, `status`, `hero_gambar_url` — field
  yang jelas unik/berubah tiap batch. `batch_leads`/`batch_registrations`
  (data pendaftaran) TIDAK PERNAH ikut disalin. Ini murni UI + server
  action, tidak butuh tabel/kolom baru di luar `batch_requirements` yang
  sudah didefinisikan untuk F08.3.

**Konsekuensi.** `admin/pendaftaran-batch` (F07.5) dan
`admin/peserta-pendaftaran` (F08.1) sekarang dua halaman Admin yang mirip
tapi berbeda tujuan (verifikasi vs rekap/export) — disengaja tidak digabung
supaya alur setujui/tolak F07.5 tetap sederhana dan tidak bercampur dengan
kebutuhan export. Form Admin Batch (CRUD `batches` yang sudah ada dari Fase
12.6) bertambah section pengelolaan `batch_requirements` (mirip
`batch_benefits` yang sudah ada) dan tombol "Salin dari Batch Lain" — perlu
dicek UI form itu tidak jadi terlalu panjang, pertimbangkan
accordion/section collapse kalau perlu (keputusan implementasi). Halaman
Pengaturan Admin (`/admin/pengaturan`, sudah diperluas 2026-09-13) bertambah
section baru untuk `kontak_pelatihan`. Fitur salin batch menambah
kompleksitas server action (satu transaksi/urutan insert yang menyentuh 6
tabel: `batches` + 5 tabel terkait) — perlu penanganan error yang jelas
kalau sebagian tabel gagal disalin (baris `batches` sudah terlanjur dibuat
tapi sebagian data terkait gagal ikut, misalnya).

---

### ADR-022 — Modul 9: Gambar detail tanpa crop paksa (pelatihan, produk), rasio hero beranda diselaraskan, lightbox publik
**2026-09-17 · Berlaku**

**Konteks.** Alif mengirim tangkapan layar tampilan publik yang sudah live
dan melaporkan beberapa gambar tampak terpotong tidak sesuai maksud upload
Abi — terutama poster pelatihan (infografis memanjang ke bawah) dan foto
produk (drone melebar dengan baling-baling terbentang). Ditelusuri ke kode:
`ImageUploadField` (komponen upload bersama, dipakai di banyak form Admin)
memaksa dialog crop dengan rasio terkunci di setiap titik upload gambar
publik — 16:9 untuk `batches.hero_gambar_url` dan slide `hero_slides`, 1:1
untuk `product_images`. Poster/foto yang bentuk aslinya beda dari rasio
terkunci itu otomatis kehilangan sebagian isi saat Abi meng-crop. Ditemukan
juga: kotak tampilan hero beranda di layar (persegi di HP, 4:3 di
desktop/tablet) TIDAK sama dengan rasio kunci upload-nya (16:9) — gambar
jadi terpotong DUA KALI (sekali saat upload, sekali lagi otomatis saat
ditampilkan). Panel gambar di halaman Masuk/Daftar/Lupa Sandi (`AuthShell`)
dicek juga — ternyata bukan pengaturan terpisah, otomatis mengambil slide
`hero_slides` aktif pertama.

Didiskusikan dengan Alif lewat rangkaian pertanyaan bertahap (mockup visual
dulu dipakai untuk menyamakan pemahaman sebelum keputusan diambil, karena
konsep "gambar tanpa crop" awalnya belum jelas bagi Alif/Abi):
1. Untuk pelatihan — disepakati DUA gambar terpisah: thumbnail (tetap
   dikunci rasio, khusus kartu daftar pelatihan) dan gambar detail (baru,
   tampil utuh di halaman detail).
2. Untuk produk — sempat dipertimbangkan pola sama (thumbnail terpisah),
   tapi Alif memilih tetap SATU galeri (tidak menambah langkah upload).
   Muncul juga kekhawatiran valid: kalau crop dihapus total, Abi bisa
   upload foto dengan latar warna tidak seragam atau rasio yang sangat
   berbeda antar produk, membuat tampilan katalog terlihat berantakan.
   Resolusi: dialog crop TETAP WAJIB muncul (bukan dihapus), tapi rasio
   dilepas jadi bebas (Abi sendiri yang menentukan area crop, bukan sistem
   yang memaksa 1:1) — tetap ada kontrol kualitas dari Abi, tanpa
   pemotongan otomatis yang tidak disengaja.
3. Untuk gambar detail pelatihan (poster), pola "crop bebas tapi tetap
   wajib" milik produk SENGAJA TIDAK dipakai — karena `ReactCrop` secara
   default memilih area 90% (bukan 100%) saat tanpa rasio terkunci,
   Abi bisa lupa menggeser ke area penuh dan poster tetap kehilangan
   sedikit bagian tepi. Untuk field ini dipilih: langsung upload tanpa
   dialog crop sama sekali (hanya kompresi ukuran), supaya tidak ada
   satupun jalur yang bisa memotong poster secara tidak sengaja.
4. Hero beranda — kotak tampilan di layar (persegi HP / 4:3 desktop)
   dikonfirmasi Alif SUDAH pas, tidak diubah. Yang diubah cuma rasio kunci
   saat upload, dari 16:9 menjadi 4:3, supaya paling dekat dengan kotak
   asli di kedua ukuran layar (masih ada sedikit crop tipis di sisi kanan
   -kiri pada HP, disadari dan diterima Alif sebagai kompromi, jauh lebih
   baik dari kondisi sekarang).
5. Gambar panel Masuk/Daftar — TIDAK dijadikan pengaturan terpisah (supaya
   tidak menambah field yang perlu dijaga Abi tanpa alasan kuat); cukup
   catatan di form Hero Beranda bahwa gambar itu juga dipakai di halaman
   tersebut.
6. Lightbox klik-untuk-perbesar (backdrop blur, pola sama seperti perbaikan
   aksesibilitas foto KTP/pas foto Admin di `pendaftaran-batch-detail.tsx`
   sebelumnya) diminta Alif untuk gambar hero pelatihan dan galeri produk
   di halaman publik — BUKAN untuk hero beranda (dekoratif, bukan halaman
   detail).

**Keputusan.**
- `batches` — kolom baru `gambar_detail_url` (nullable, lihat SQL). Field
  upload BARU di form Admin Batch: "Gambar Detail" — langsung upload +
  kompresi, TANPA dialog crop. `hero_gambar_url` (sudah ada) TETAP menjadi
  thumbnail — rasio 16:9 tetap dikunci, tetap dipakai di `PelatihanCard`
  (kartu daftar pelatihan). Halaman detail publik
  (`pelatihan/[slug]/page.tsx`) diganti render-nya: posisi hero yang
  sebelumnya memakai `hero_gambar_url` + `object-cover` sekarang memakai
  `gambar_detail_url` + `object-contain` (kalau kosong, fallback ke
  `hero_gambar_url` supaya batch lama yang belum diisi ulang tetap
  menampilkan sesuatu). Diberi lightbox klik-untuk-perbesar.
- `products`/`product_images` — TIDAK ADA kolom/tabel baru. `ImageUploadField`
  di form Admin Produk dipanggil TANPA prop `aspectRatio` (crop tetap
  wajib, rasio bebas — Admin yang menentukan area). Tampilan publik
  (`ProductGallery` dan kartu katalog) diganti dari `object-cover` jadi
  `object-contain` di dalam kotak yang TETAP satu ukuran konsisten (supaya
  grid/carousel tetap rapi), dengan latar kotak diganti putih polos
  (bukan abu-abu netral) supaya foto produk berlatar putih (kebiasaan
  standar katalog, sudah dipakai Abi) menyatu tanpa terlihat pembatas.
  Ditambah catatan kecil di form Admin: "Gunakan foto dengan latar
  belakang putih/polos untuk hasil terbaik." Diberi lightbox
  klik-untuk-perbesar juga, memakai gambar resolusi yang sama (tidak ada
  gambar terpisah khusus lightbox).
- `hero_slides` — TIDAK ADA kolom baru. `aspectRatio` di form Admin Hero
  Beranda diubah dari `16/9` menjadi `4/3`. Kotak tampilan di
  `HeroCarousel` (beranda) dan `AuthShell` (panel Masuk/Daftar/Lupa Sandi,
  yang meminjam gambar sama) TIDAK diubah. Form Admin Hero Beranda diberi
  teks keterangan bahwa gambar ini juga tampil di halaman Masuk/Daftar/
  Lupa Sandi.
- `ImageUploadField` (komponen bersama) mendapat dua penyesuaian yang
  BACKWARD-COMPATIBLE (default tetap perilaku lama untuk semua pemanggil
  lain yang tidak diubah): (1) prop baru `skipCrop` (boolean, default
  `false`) — kalau `true`, lewati dialog `ReactCrop` sepenuhnya, langsung
  kompresi + upload; dipakai HANYA di field "Gambar Detail" batch. (2) prop
  baru `previewFit` (`'cover' | 'contain'`, default `'cover'`) — mengatur
  cara pratinjau gambar yang sudah diunggah ditampilkan DI DALAM form
  Admin itu sendiri (sebelumnya hardcode `aspect-video` + `object-cover`,
  bisa menyesatkan Abi kalau dipakai untuk field yang justru dirancang
  tanpa crop). Field "Gambar Detail" batch dan galeri produk memakai
  `previewFit="contain"`.

**Konsekuensi.** Batch dan produk yang sudah ada sebelum ADR-022 punya
`gambar_detail_url` kosong (`null`) — halaman detail otomatis fallback ke
`hero_gambar_url` lama (masih akan terlihat terpotong seperti sekarang)
sampai Abi mengisi ulang gambar detail satu per satu; tidak ada migrasi
otomatis karena tidak ada cara memulihkan bagian poster yang sudah
terlanjur hilang dari crop lama. Foto produk yang sudah ada JUGA masih
tersimpan dalam bentuk 1:1 ter-crop dari sebelumnya (SQL ini tidak
mengubah data lama) — kualitas foto lama tidak otomatis membaik, hanya
foto yang diunggah ULANG setelah perubahan ini yang akan tampil utuh; Abi
perlu diberi tahu lewat prompt Cursor bahwa unggah ulang foto produk lama
disarankan bertahap. `ImageUploadField` menjadi sedikit lebih kompleks
(dua prop opsional baru) — perlu dicek semua pemanggil lain (popup,
material chapter, dll — ADR-015/ADR-018) tetap berjalan tanpa perubahan
karena kedua prop baru defaultnya menjaga perilaku lama.

---

### ADR-022b — Revisi F09.2: thumbnail produk terpisah, panah carousel dipindah ke dalam bingkai
**2026-09-17 · Berlaku · Merevisi sebagian ADR-022 (F09.2)**

**Konteks.** Setelah F09.2 (galeri produk crop bebas) dikerjakan Cursor dan diuji Alif di browser, muncul dua temuan:
1. Panah kiri/kanan `ProductGallery` di halaman detail produk publik menabrak elemen di luar kotak galeri (panah kanan menyentuh angka harga) — ditelusuri ke `CarouselPrevious`/`CarouselNext` (shadcn bawaan, `src/components/ui/carousel.tsx`) yang diposisikan `absolute` KELUAR dari kotak carousel (`-left-12`/`-right-12`), didesain dengan asumsi ada ruang kosong di sekitarnya — sementara layout `katalog/[slug]/page.tsx` (`grid lg:grid-cols-2`) menaruh galeri bersebelahan langsung dengan kolom info produk tanpa ruang ekstra.
2. Alif melaporkan kebingungan nyata setelah mencoba sendiri: dengan galeri rasio bebas (keputusan ADR-022 F09.2), foto pertama otomatis jadi cover kartu katalog TAPI kartu katalog memakai kotak `aspect-video` (16:9) — Admin tidak tahu ukuran/rasio berapa yang pas untuk foto yang diupload supaya hasil di kartu rapi. Ini kebalikan dari tujuan awal ADR-022 (mengurangi kebingungan Admin soal crop), jadi keputusan "satu galeri tanpa thumbnail terpisah" untuk produk **DICABUT** dan diganti mengikuti pola pelatihan yang sudah terbukti jelas bagi Admin.

**Keputusan.**
- Panah carousel: TIDAK mengubah komponen shared `carousel.tsx` (dipakai di tempat lain) — cukup override posisi lewat `className` di `ProductGallery` supaya panah jadi overlay DI DALAM kotak galeri (pola umum galeri produk), bukan di luar kotak.
- Produk mendapat kolom baru `products.thumbnail_url` — field Thumbnail terpisah di form Admin Produk, rasio terkunci 16:9 saat upload (pola identik `batches.hero_gambar_url`), ditempatkan DI ATAS section galeri yang sudah ada. Galeri (`product_images`, F09.2) **TIDAK diubah/dihapus** — tetap dipertahankan apa adanya untuk carousel detail produk, rasio tetap bebas seperti sebelumnya. Kartu katalog memakai `thumbnail_url` kalau sudah diisi (`object-cover`, rasio aman); kalau belum diisi (produk lama), fallback ke foto pertama galeri dengan `object-contain` + latar putih SEPERTI PERILAKU F09.2 SEBELUM REVISI INI — supaya produk lama tidak mendadak kosong/rusak tampilannya sebelum Admin sempat mengisi thumbnail satu per satu.

**Konsekuensi.** Produk sekarang punya DUA titik upload gambar (Thumbnail + galeri Foto Produk), sama seperti pelatihan — kompleksitas form Admin Produk bertambah sedikit, tapi menghilangkan ambiguitas yang justru jadi keluhan nyata Alif. Produk yang sudah ada sebelum revisi ini (termasuk yang sempat diisi ulang selama F09.2 berjalan tanpa thumbnail) TETAP fallback ke foto pertama galeri sampai Admin mengisi `thumbnail_url` satu per satu — tidak ada migrasi otomatis. `products_public` (VIEW publik) perlu dicek ulang oleh Cursor apakah kolom baru ini sudah ikut ter-expose (kalau VIEW pakai daftar kolom eksplisit, bukan `select *`, butuh migrasi SQL tambahan untuk update definisi VIEW — dicatat di prompt Cursor sebagai hal yang harus dilaporkan balik ke Alif, BUKAN dijalankan sendiri oleh Cursor).

---

### ADR-023 — Modul 10: bug kuis LMS, bukti pembayaran pendaftaran batch, infrastruktur email Resend penuh, verifikasi lintas-device, polish Admin
**2026-09-18 · Berlaku**

**Konteks.** Setelah deploy ke Vercel, Alif menguji langsung dan melaporkan 9 temuan sekaligus. Alif secara eksplisit meminta: kelompokkan temuan berdasarkan kesamaan, urutkan dari yang paling mudah dikerjakan, dan konfirmasi tiap keputusan lewat AskUserQuestion (dengan opsi Direkomendasikan) sebelum menulis SQL/prompt apa pun. Setiap temuan ditelusuri dulu ke kode sebelum dikelompokkan — bukan diasumsikan dari laporan Alif saja:

1. **Bug kuis LMS ("jawaban salah tapi tetap bisa submit").** Ditelusuri ke `course-reader.tsx` baris 143: `semuaSoalTerjawab = questions.every((q) => jawabanKuis[q.id] !== undefined)` — kondisi ini hanya mengecek soal "sudah dijawab" (ada entri), BUKAN "sudah dijawab BENAR". `QuizQuestionCard`/`QuizEngine` (dipakai juga di `/kuis` linear, `quiz-engine.tsx`) sudah benar menolak lanjut sebelum jawaban benar dipilih, tapi `EmbeddedQuiz` (dipakai di dalam LMS, §12.5.3) mengizinkan pindah/submit walau jawaban terakhir yang tersimpan salah, karena parent (`course-reader.tsx`) yang menentukan kapan tombol submit aktif, bukan kartu soalnya sendiri. Root cause murni satu baris logika, bukan komponen kartu soal.
2. **Link verifikasi email mengarah ke localhost di production.** Ditelusuri: kode SUDAH benar memakai `process.env.NEXT_PUBLIC_SITE_URL` di semua titik (`daftar/actions.ts`, `lupa-sandi/actions.ts`, `auth/confirm/route.ts`, dll) — bukan bug kode, kemungkinan besar env var itu belum diisi/salah di Vercel Dashboard untuk environment Production. Digabung penanganannya dengan temuan #9 (verifikasi lintas-device) karena keduanya sama-sama bagian dari perombakan arsitektur email verifikasi (lihat poin 5 di bawah).
3. **Urutan produk/pelatihan "hanya berfungsi di Beranda".** Dicek: query Beranda, `/pelatihan`, dan `/katalog` semuanya memakai `.order("urutan")` pada kolom yang sama secara konsisten — tidak ditemukan bug. Dikonfirmasi ke Alif via AskUserQuestion, disepakati SKIP (bukan bug), tidak masuk prompt Cursor. Kalau muncul lagi, perlu langkah reproduksi spesifik (item mana yang diubah urutannya, di halaman mana tidak berubah).
4. **Silabus admin vs akordion publik.** Dicek `pelatihan/[slug]/page.tsx`: fungsi `splitHtmlByHeadings()` SUDAH memecah rich-text silabus (`RichTextEditor`, `batch-form.tsx`) jadi item akordion berdasarkan heading — bukan fitur baru yang perlu dibangun, murni kurang jelas bagi Admin bahwa heading yang ditulis di editor menentukan pembagian akordion. Solusinya cukup keterangan/hint di form, bukan struktur input baru.
5. **Audit Resend vs email bawaan Supabase + desain email polos.** Ditelusuri: `templates.ts` SUDAH punya `baseLayout()` lengkap (header logo Hexatara, isi, footer kontak, warna cobalt mist) dipakai fungsi `templateVerifikasiEmail`/`templateResetSandi`/dll — TAPI dua fungsi itu tidak pernah dipanggil. Alur nyata (`daftar/actions.ts` → `supabase.auth.signUp()`, `lupa-sandi/actions.ts` → `supabase.auth.resetPasswordForEmail()`) memakai pengiriman email BAWAAN Supabase sepenuhnya (terbukti dari screenshot Alif: pengirim `noreply@mail.app.supabase.io` untuk reset password, polos tanpa styling) — bukan salah pilih SMTP, tapi arsitektur `signUp()`/`resetPasswordForEmail()` Supabase yang memang selalu mengirim email sendiri kalau dipanggil langsung dari client/server biasa. Dikonfirmasi ke Alif dua opsi perbaikan (ganti ke `admin.generateLink()` + kirim manual lewat Resend, VS konfigurasi SMTP custom di Supabase Dashboard) — dipilih opsi pertama karena kontrol desain penuh dan reuse template branded yang sudah ditulis. `SUPABASE_SERVICE_ROLE_KEY` sudah ada di env (dipakai `lib/supabase/admin.ts`), tidak perlu env var baru.
6. **Verifikasi email lintas-device.** Konteks dari Abi (klien, disampaikan Alif): user menyelesaikan LMS di laptop, klik "Dapatkan Sertifikat" → diarahkan ke form daftar → setelah daftar, buka email verifikasi di HP (device lain) → klik link di HP mengarah error localhost (temuan #1/#2) DAN sekalipun linknya benar, laptop (device asal, tempat form diisi) tidak pernah otomatis masuk dashboard — mekanisme `VerifikasiPoller` yang ada sekarang murni mengandalkan cookie SATU BROWSER yang sama (`router.refresh()` baca ulang cookie terbaru), sesuai komentar eksplisit di kode sendiri — TIDAK didesain untuk lintas-device. Dikonfirmasi arah baru ke Alif: device manapun yang klik link HANYA menandai status terverifikasi (layar centang besar, TIDAK login/buka dashboard di device itu); device ASAL yang polling status via server action, begitu terverifikasi baru dibuat sesi dan redirect otomatis ke dashboard di device asal. Alif menambahkan: layar menunggu di device asal perlu animasi (bukan cuma teks statis) supaya lebih menarik selagi menunggu. Bergantung pada keputusan poin 5 (arsitektur `generateLink`) karena link verifikasi tidak lagi otomatis membuat sesi di device manapun — device asal yang secara eksplisit menukar status jadi sesi lewat server action (pola: `admin.generateLink({type:'magiclink'})` lalu `verifyOtp()` dijalankan di request device asal sendiri supaya cookie sesi ditulis untuk device itu, bukan device yang klik link email).
7. **Bukti pembayaran pendaftaran batch.** Diminta: saat Admin menyetujui pendaftaran di `admin/pendaftaran-batch`, popup Setujui perlu input gambar bukti pembayaran dulu (diupload ADMIN, bukan peserta) sebelum tombol Setuju bisa diklik; bukti yang sama tampil di detail `peserta-pendaftaran`. Ditemukan pola yang sudah terbukti jalan: `certificate_orders.bukti_url` (bucket privat `payment-proofs`, `createSignedUrl` umur pendek 300 detik) — bedanya di sana USER yang upload bukti sendiri (alur upgrade sertifikat), sementara di sini ADMIN yang upload atas nama peserta (dikonfirmasi Alif: wajib diisi sebelum Setuju bisa diklik, meniru pola `certificate_orders`). Satu kolom baru `batch_registrations.bukti_url`, bucket storage direuse (`payment-proofs`), path baru (`batch-<id>.<ext>`) supaya tidak bentrok dengan path `certificate_orders` yang sudah pakai `<orderId>.<ext>`.
8. **Warna tombol Admin (edit=biru, delete=merah, setujui=hijau).** Dicek `src/components/ui/button.tsx` (shadcn shared, dipakai di seluruh Admin+publik): varian yang ada sekarang `default`/`outline`/`secondary`/`ghost`/`destructive`/`link` — TIDAK ada konvensi warna per-aksi eksplisit (tombol Setuju di `pendaftaran-batch-row-actions.tsx` masih `default`, Tolak masih `outline`). Ditambahkan varian BARU (`edit` biru, `success` hijau) ke `buttonVariants` yang sudah ada — aman karena hanya menambah varian baru, tidak mengubah varian lama yang sudah dipakai di banyak tempat — plus `destructive` (sudah ada, merah) dipakai konsisten untuk semua aksi hapus. Semua varian baru wajib dark-mode-friendly mengikuti pola token `oklch()` yang sudah dipakai varian lain.
9. **Menu Admin ambigu (Pendaftaran Batch/Peserta Pendaftaran vs Leads).** Dicek `admin-shell.tsx`: TIDAK ada route/menu terpisah bernama polos "Pendaftaran" yang jadi dead code — yang ada adalah `/admin/pendaftaran-batch` dan `/admin/peserta-pendaftaran` yang saat ini duduk di section "Batch", terpisah dari section "Leads" (isinya `/admin/leads/minat` "Pendaftaran Minat" dan `/admin/leads/penawaran` "Permintaan Penawaran") — kemiripan penamaan ("pendaftaran" muncul di kedua section) itulah sumber ambiguitas yang dirasakan Alif, bukan menu mati yang perlu dihapus. Solusi: pindahkan kedua item itu ke section "Leads", tidak ada penghapusan route.

**Keputusan.**
- **F10.1 (termudah — polish Admin, tanpa skema baru):** (9) pindahkan `Pendaftaran Batch`/`Peserta Pendaftaran` ke section Leads di `admin-shell.tsx`; (8) tambah varian `edit` (biru) dan `success` (hijau) ke `buttonVariants`, terapkan ke tombol edit/setujui di seluruh Admin, `destructive` (sudah ada) dipakai konsisten untuk hapus; (4) tambah hint di form Admin Batch bahwa heading di editor Silabus menentukan pembagian akordion publik.
- **F10.2 (cek operasional, tanpa kode):** (3) SKIP — dikonfirmasi bukan bug; (2) Alif mengecek/mengisi `NEXT_PUBLIC_SITE_URL` di Vercel Dashboard (Project Settings → Environment Variables → Production) sesuai domain live, redeploy — tidak butuh prompt Cursor.
- **F10.3 (bug kuis LMS, satu file):** perbaiki `semuaSoalTerjawab` supaya mengecek SEMUA soal terjawab BENAR (bukan sekadar terjawab). Kalau ada jawaban salah saat submit, tampilkan deskripsi bahwa belum 100% benar, tombol berubah jadi "Ulangi Ujian" — mereset HANYA state jawaban kuis (`jawabanKuis`, kembali ke soal nomor 1), progres bab materi (`selesai`) TETAP tersimpan (tidak perlu baca ulang materi) — dikonfirmasi Alif, alasan: dua state itu sudah terpisah di kode, dan menghukum baca ulang seluruh materi karena satu soal kuis salah bukan UX yang wajar.
- **F10.4 (bukti pembayaran, satu kolom baru):** `batch_registrations.bukti_url`, upload oleh Admin di dalam AlertDialog Setujui (`pendaftaran-batch-row-actions.tsx`), wajib diisi sebelum tombol Setuju aktif, ditampilkan juga di `peserta-pendaftaran-detail.tsx` lewat signed URL (pola sama `admin/upgrade/page.tsx`).
- **F10.5 (infrastruktur email, tanpa skema baru):** ganti `daftar/actions.ts`/`lupa-sandi/actions.ts` dari `supabase.auth.signUp()`/`resetPasswordForEmail()` langsung ke `supabaseAdmin.auth.admin.generateLink()` (tidak pernah memicu email bawaan Supabase) + kirim manual lewat `kirimEmailVerifikasi`/`kirimEmailResetSandi` (Resend, template branded yang sudah ada). `/auth/confirm/route.ts` disesuaikan untuk menerima flow baru.
- **F10.6 (verifikasi lintas-device, paling kompleks, bergantung F10.5):** link email HANYA menandai status terverifikasi (layar centang, tanpa sesi), device asal polling status lewat server action lalu membuat sesi sendiri begitu terverifikasi (`verifyOtp` dijalankan di request device asal). Layar menunggu diberi animasi (bukan teks statis).

**Konsekuensi.** F10.5/F10.6 mengubah alur inti autentikasi (signup/reset password) — butuh pengujian menyeluruh di device berbeda beneran (bukan dua tab satu browser) sebelum dianggap DONE, mengikuti Definisi Selesai §14. F10.4 menambah satu langkah wajib (upload bukti) ke alur approve yang sebelumnya satu klik — Admin perlu diberi tahu perubahan ini sebelum dipakai harian. F10.1/F10.3 risiko rendah, bisa dikerjakan dan diuji cepat. Dicatat sebagai Sprint 9/Modul 10 (F10.x) di `feature-registry.md`. Detail lengkap SQL di `usulan-sql-modul10-adr023.sql`, PRD.md §5.1f/§9e.

**Temuan tambahan saat eksekusi F10.1 (2026-09-18).** Cursor menemukan menu "Pendaftaran Minat" (F01.6 lama, `/admin/leads/minat`, tabel `batch_leads`) sudah orphan sepenuhnya — `DaftarMinatDialog`/`daftarMinatAction` tidak lagi dipanggil dari halaman publik mana pun sejak alur `batch_registrations` (ADR-020r) menggantikannya. Ini BUKAN keputusan baru — PRD.md §9b sejak ADR-020 pertama kali ditulis sudah menyatakan F01.6 "digantikan" dan `batch_leads` "TIDAK dihapus — dipertahankan sebagai riwayat", tinggal eksekusi pembersihan kode publik yang belum sempat dilakukan. Dikonfirmasi ke Alif sebelum Cursor menghapus apa pun (bukan inisiatif sepihak Cursor): hapus item menu, halaman/table/export/actions Admin Minat, komponen dialog publik, server action, dan validasi terkait; `/admin/leads` diarahkan redirect ke Penawaran; Overview dan Kursus Saya dialihkan membaca dari `batch_registrations`. Tabel `batch_leads` di Supabase **TIDAK dihapus** (riwayat lama tetap ada, konsisten PRD.md §9b). F01.6/F01.14 (baris Sprint 1) TIDAK diedit — tetap DONE sebagai catatan sejarah pengujian, sesuai kebijakan yang sama yang sudah dinyatakan di ADR-020. Detail lengkap di log `feature-registry.md` (Sprint 9, baris F10.1).

---

### ADR-024 — Modul 11: kategori produk/batch, ringkasan Leads, login Admin, status penawaran, polish i18n + UI
**2026-09-19 · Diperluas 2026-09-20 (F11.4–F11.6) · Diperluas 2026-09-22 (F11.7) · Berlaku**

**Konteks.** Setelah push F10.x, Alif melaporkan 3 temuan baru di Admin, ditelusuri dulu ke kode sebelum dikelompokkan:

1. **Form Tambah/Ubah Produk punya dua field "Kategori" berbeda.** Ditelusuri `produk-form.tsx` baris ~123–152: field `kategori` (`Input` teks bebas, tanpa validasi, placeholder "Contoh: Drone Survei") dan field `category_id` (`KategoriCombobox`, relasi ke tabel `product_categories`, dipakai untuk filter dropdown di halaman publik `/katalog`). Ditelusuri lebih lanjut ke pemakaian publik (`produk-card.tsx`, `katalog/[slug]/page.tsx`): field teks `kategori` TERNYATA masih dipakai sebagai label badge kategori yang tampil di card & detail produk publik — BUKAN dead code seperti kasus Pendaftaran Minat (ADR-023). `category_id` sendiri hanya dipakai untuk filter (`katalog/page.tsx`, `.eq("category_id", kategoriId)`), tidak pernah dipakai untuk menampilkan nama kategori ke publik. Dua field ini punya peran berbeda yang tumpang tindih secara visual di form, itulah sumber ambiguitas Admin — bukan duplikasi murni.
2. **Dashboard Admin (`/admin`) perlu ringkasan Leads + grafik lebih baik + angka stat lebih besar.** Ditelusuri `src/app/admin/(protected)/page.tsx`: 4 stat card saat ini (Lead baru 7 hari — gabungan `batch_registrations`+`quote_requests`, Menunggu verifikasi, Sertifikat bulan ini, Batch aktif) dan 1 grafik tren gabungan (garis tunggal, `LeadsTrendChart`, `recharts` sudah jadi dependency terpasang). Alif secara eksplisit meminta breakdown Leads per sumber (bukan digabung), grafik tren ditingkatkan (2 garis terpisah per sumber), dan tambahan pie/bar chart untuk data organik seperti distribusi status Leads dan Sertifikat.
3. **Halaman Login Admin (`/admin/login`) polos, tanpa identitas brand.** Ditelusuri `admin/login/page.tsx` — kartu login hanya judul teks "Login Admin", tanpa logo. Ditemukan komponen `BrandLogo` (`src/components/brand-logo.tsx`) yang SUDAH reusable dan dipakai konsisten di header sidebar Admin (`admin-shell.tsx` baris ~392, `variant="auto"` otomatis ganti aset terang/gelap) — tinggal dipakai ulang di halaman login, bukan bikin logo/komponen baru.

**Keputusan.**
- **F11.1 (kategori produk, perlu perubahan view):** hapus field teks `kategori` dari form Admin (`produk-form.tsx`). Badge kategori publik (`produk-card.tsx`, `katalog/[slug]/page.tsx`) diganti mengambil nama dari relasi `category_id` (join ke `product_categories`), bukan lagi teks bebas. View `products_public` perlu kolom tambahan `category_nama_id`/`category_nama_en` hasil JOIN — lihat `usulan-sql-modul11-adr024.sql`. Kolom `products.kategori` sendiri TIDAK dihapus dari tabel (data lama dipertahankan, sesuai kebiasaan proyek — lihat kasus `batch_leads` di ADR-023), hanya sudah tidak dipakai form/tampilan manapun setelah perubahan ini.
- **F11.2 (dashboard Admin, tanpa skema baru):** tambah section "Ringkasan Leads" terpisah dari 4 stat card yang ada — breakdown Pendaftaran Batch vs Permintaan Penawaran, masing-masing dengan breakdown status (menunggu/disetujui/ditolak untuk pendaftaran; baru/dihubungi/selesai untuk penawaran). Grafik tren (`LeadsTrendChart`) diubah dari 1 garis gabungan jadi 2 garis terpisah per sumber. Tambah 1 pie/donut chart distribusi status Leads gabungan dan 1 bar chart distribusi Sertifikat (misal per bulan, atau per status kalau ada). Angka pada 4 stat card yang sudah ada diperbesar (ukuran teks `text-2xl` → dinaikkan, dipertegas). Semua pakai `recharts` yang sudah jadi dependency, tidak ada library chart baru.
- **F11.3 (login Admin, tanpa skema baru):** tambahkan `BrandLogo` (komponen yang sudah ada, `variant="auto"`) ke kartu login Admin, susun ulang bagian atas kartu supaya terasa branded (logo + judul + deskripsi), tanpa mengubah field/logic form yang sudah berfungsi.
- **F11.4 (status penawaran, tanpa skema baru, 2026-09-19):** kolom Status di `/admin/leads/penawaran` diganti dari badge read-only jadi dropdown interaktif (`baru`/`dihubungi`/`selesai`), bebas pilih tanpa validasi urutan — pola sama `StatusPengirimanSelect` di upgrade. Enum `status_lead` dan kolom `quote_requests.status` sudah ada; murni server action + UI. Breakdown Ringkasan Leads F11.2 baru bermakna operasional setelah status bisa diubah.
- **F11.5 (kategori batch, tanpa DDL/view baru, 2026-09-20):** kasus sama F11.1 tapi di Batch — form punya tiga field kategori (`kategori_id`/`kategori_en` teks + `category_id` combobox). Hapus field teks dari form; badge/tabel Admin + publik baca nama dari join `batches.category_id`→`batch_categories` (query langsung ke tabel `batches`, BUKAN view baru). Suggestions detail hanya lewat `category_id` (fallback teks dihapus). Kolom `batches.kategori_id`/`kategori_en` TIDAK dihapus dari DB. Bersyarat diagnosis: semua batch aktif sudah punya `category_id` (atau data dummy dibersihkan dulu).
- **F11.6 (polish publik/Admin, tanpa skema baru, 2026-09-20):** Hero Admin berhenti memakai field Teks Tombol ID/EN (publik memang hanya bungkus gambar dengan `cta_url`); FAQ detail batch diselaraskan ke pola accordion beranda/Silabus; footer tagline diganti; gap i18n EN ditutup (`batch.*`, dialog daftar → `batch.register.*`, tanggal & pesan WA mengikuti locale).
- **F11.7 (polish UI, tanpa DDL, 2026-09-22):** (a) filter kategori `/katalog` + `/pelatihan` — lebar trigger ikut teks di tablet/desktop (`sm:w-auto sm:min-w-48 sm:max-w-md`); (b) jam operasional footer dwibahasa — field `jam_operasional_en` di JSON `site_settings.kontak` (Admin Pengaturan), footer pilih by locale; (c) UI upload berkas konsisten lewat komponen baru `FileUploadField` (dashed + hint + preview): lampiran materi (upload saat Simpan, bukan saat pilih), bukti Setuju pendaftaran, bukti transfer user, impor sertifikat/soal CSV, FotoPicker daftar batch publik.

**Konsekuensi.** F11.1 mengubah definisi view `products_public` (bukan tabel/kolom baru, tapi tetap perubahan skema yang harus dijalankan manual oleh Alif di Supabase sesuai kebiasaan proyek — agent tidak pernah eksekusi DDL) dan berpotensi butuh regenerate `src/types/database.ts` sebelum Cursor mulai coding, supaya kolom baru `category_nama_id`/`category_nama_en` dikenali TypeScript. **Risiko keamanan yang harus dijaga:** PRD.md §5.2/ADR-004 mencatat `products_public` sengaja `security_invoker = off` (security definer view) supaya `harga` produk yang `tampilkan_harga = false` selalu NULL untuk publik — perubahan definisi view WAJIB memastikan properti ini tidak berubah, dan query uji `select harga from products_public where tampilkan_harga = false;` (semua baris harus NULL) WAJIB diulang setelah view diubah, sebelum F11.1 dianggap aman dikerjakan. F11.2 murni tampilan/query baca (tidak ada perubahan skema), risiko rendah. F11.3 murni tampilan, risiko rendah. F11.4 murni UI + update satu kolom status (tanpa DDL), risiko rendah; terhubung F11.2 — angka breakdown penawaran di dashboard hanya berubah setelah Admin memakai dropdown ini. F11.5 murni kode + join PostgREST (tanpa view/DDL); kolom teks kategori batch tetap di DB sebagai warisan. F11.6 murni copy/UI/i18n. F11.7 murni CSS filter + JSON kontak + komponen upload bersama (tanpa DDL). Dicatat sebagai Sprint 10/Modul 11 (F11.x) di `feature-registry.md`. Detail lengkap SQL di `usulan-sql-modul11-adr024.sql`.
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
| 2026-09-10 | **ADR-018 ditambahkan setelah uji coba pertama §12.5.3.** Alif menjalankan §12.5.3 (LMS materi) dan menemukan hasilnya belum sesuai ekspektasi: sidebar masih flat, tidak ada video/gambar, tidak ada lampiran file. Ditambahkan `material_chapters.video_url`/`gambar_url` (nullable, independen) dan tabel baru `material_chapter_files` (lampiran file per bab, one-to-many, dwibahasa `judul_id`/`judul_en`/`deskripsi_id`/`deskripsi_en`, tunduk pola reorder ADR-014). SQL baru di `docs/sql/16_lms_video_gambar_file_bab.sql`, termasuk data dummy materi baru "Dasar Keselamatan Penerbangan Drone" untuk uji coba UI sebelum Admin panel-nya (§12.5.4) selesai dibuat. PANDUAN.md §12.5.3 ditulis ulang untuk mencakup layout LMS lengkap (sidebar Materi/File/Kuis, progress bar dan checklist status yang jelas) |
| 2026-09-10 | **ADR-019 — Fase 12.6 dibuka, redesign total.** Alif memberikan referensi baru (studio-admin.arhamkhnz.com, shadcn/ui) dan minta seluruh komponen lama direplace. Dicek status Fase 12.5: hanya §12.5.1–§12.5.3 sudah jalan, §12.5.4 belum selesai, §12.5.5–§12.5.17 belum dimulai sama sekali — scope-nya diserap ke Fase 12.6 alih-alih dibangun dua kali (dengan design system lama lalu diganti lagi). §12.5.4–§12.5.17 di PANDUAN.md diarsipkan (ditandai, tidak dihapus). Dependency baru disetujui eksplisit: shadcn/ui, Radix UI, `@tanstack/react-table`, `next-themes`, Recharts, `lucide-react` (Command Palette/`cmdk` opsional). Warna mengikuti preset "Neutral" referensi untuk sementara (achromatic + merah untuk destructive), BUKAN token Hexatara — menunggu persetujuan Abi, dicatat sebagai blok paling akhir §12.6.14. Auth pakai varian v2 (form kiri, panel highlight kanan). Prinsip mobile-first ditegaskan ulang sebagai prioritas utama di setiap blok. Referensi struktural lengkap di `hexatara_ADMIN_DESIGN.md`, menggantikan `hexatara_DESIGN.md` untuk Fase 12.6 |
| 2026-09-16 | **ADR-020r — revisi pendaftaran RPC: login tidak lagi wajib.** Sebelum F07.3 mulai dikerjakan, Abi meninjau ulang keputusan #2 ADR-020 (wajib login dulu) dan menilai ini hambatan nyata untuk peserta yang tidak mau bikin akun. Direvisi lewat sesi tanya-jawab terstruktur dengan Alif: pendaftaran sekarang bisa tanpa akun (form lengkap langsung, isi ulang tiap kali), `batch_registrations` jadi mandiri (identitas diduplikasi ke tabel ini sendiri, `user_id` nullable, kolom `email` baru), `profiles` tetap simpan identitas untuk reuse pendaftar yang login, F07.4 berubah dari gate wajib jadi pengingat non-blokir. SQL Bagian 1-5 ADR-020 asli sudah terlanjur dijalankan live sebelum revisi ini — migrasi tambahan ditulis sebagai file SQL baru (`usulan-sql-pendaftaran-tanpa-akun-adr020r.sql`, berisi `ALTER TABLE`), bukan menulis ulang `CREATE TABLE`. Detail lengkap di ADR-020r |
| 2026-09-13 | **Menu Pengaturan Admin dilengkapi (koreksi keterlambatan Sprint 1) + PRD.md §8.7 direvisi (disetujui Alif).** `/admin/pengaturan` sejak awal cuma stub placeholder ("belum dibangun, menyusul Sprint 1") — terlewat waktu eksekusi Sprint 1/Fase 8. Dilengkapi jadi hub pengaturan sistem via `site_settings`: (1) rekening bank — key `rekening` sudah dipakai duluan di dashboard User, dipertahankan; (2) kontak publik — nomor WhatsApp (menggantikan env var `NEXT_PUBLIC_WA_ADMIN` yang sebelumnya jadi satu-satunya sumber di `floating-whatsapp.tsx`), Instagram, email kontak (dua terakhir belum dipakai di kode manapun, disediakan untuk pemakaian masa depan); (3) `admin_notify_email` — menggantikan env var `ADMIN_NOTIFY_EMAIL` yang sebelumnya dipakai dengan non-null assertion (`!`) di `lib/email/send.ts`, berisiko crash kalau env var kosong, sekarang fallback ke env var lama kalau setting belum diisi; (4) **harga upgrade sertifikat** (`HARGA_CERT_ONLY`/`HARGA_CERT_MERCH`/`HARGA_MERCH_ADDON`) — **perubahan keputusan produk**, sebelumnya PRD.md §8.7 menyatakan harga adalah konstanta tetap yang tidak bisa diubah mekanisme apapun (acceptance criteria khusus menguji ini). Direvisi: harga sekarang bisa diubah Admin lewat `site_settings`, `constants.ts` jadi nilai default/fallback, larangan "Banner tidak boleh impor `constants.ts`" tetap berlaku (sale banner tetap tidak boleh pengaruhi harga). Detail revisi ada di PRD.md §8.7 langsung. Menu "Pengaturan" yang sebelumnya section terpisah di `AdminShell` sidebar (§12.6.0) dipindahkan jadi item dropdown avatar topbar, sekalian dengan menu Profil (edit profil + ganti password Admin) dan Tentang Kami (halaman deskripsi produk) yang baru ditambahkan |
| 2026-09-17 | **ADR-021 — Modul 8: Sprint 6 (F07.1-F07.5) selesai dan diuji Alif seluruhnya.** Abi menyampaikan 4 kebutuhan operasional tambahan lewat Alif setelah pengujian: (1) halaman Admin baru "Peserta Pendaftaran" (F08.1) — daftar murni peserta `disetujui` dari `batch_registrations`, filter per batch, export XLSX mengikuti filter aktif, TIDAK terhubung `certificate_orders` (dicek dulu ke kode, approve F07.5 memang tidak menyentuh tabel itu — bukan bug, murni kebutuhan halaman baru); (2) filter batch ditambahkan ke panel verifikasi `admin/pendaftaran-batch` (F07.5) yang sudah ada (F08.2); (3) konten dari Google Form asli (syarat peserta, fasilitas, dua kontak WA berbeda untuk reguler vs Private & Inhouse) dimasukkan sebagai card baru di halaman detail batch publik, ditempatkan setelah "Jadwal & Investasi" sebelum "Peralatan Belajar" (F08.3); (4) fitur "Salin dari Batch Lain" di form Tambah Batch supaya Abi tidak mengetik ulang konten tiap batch baru (F08.4). **Riset kode sebelum menulis keputusan mengubah rancangan awal:** ditemukan tabel `batch_benefits` SUDAH ADA dan sudah dipakai di halaman publik — fasilitas REUSE tabel itu, BUKAN kolom baru di `batches` seperti rancangan awal. Syarat peserta jadi tabel BARU `batch_requirements` (pola identik `batch_benefits`). `site_settings` dicek sudah key-value — dua nomor WA jadi KEY BARU `kontak_pelatihan`, BUKAN kolom baru. F08.4 (salin batch) muncul dari diskusi lanjutan Alif soal cara paling efisien mengisi `batch_benefits`/`batch_requirements` untuk batch baru — solusinya diperluas jadi salin SELURUH konten batch (deskripsi, silabus, 5 tabel terkait) kecuali field yang jelas unik per-batch (slug, judul, tanggal, status, poster). Dicatat sebagai Sprint 7 (bukan lanjutan F07.x) di `feature-registry.md` supaya riwayat Sprint 6 tetap bersih sebagai unit kerja yang sudah selesai. Detail lengkap di ADR-021, PRD.md §5.1d/§9c |
| 2026-09-17 | **ADR-022 — Modul 9: gambar detail tanpa crop paksa, rasio hero beranda diselaraskan, lightbox publik.** Alif melaporkan tangkapan layar tampilan publik live menunjukkan poster pelatihan dan foto produk terpotong tidak sesuai maksud upload — ditelusuri ke `ImageUploadField` yang memaksa rasio crop terkunci di semua titik upload gambar publik (16:9 untuk hero pelatihan & hero beranda, 1:1 untuk foto produk), ditambah kotak tampilan hero beranda di layar (persegi HP/4:3 desktop) ternyata TIDAK sama dengan rasio kunci upload (16:9) — menyebabkan crop dobel. Dibahas bertahap dengan Alif (mockup visual dipakai dulu untuk menyamakan pemahaman): pelatihan dapat field baru `gambar_detail_url` (langsung upload TANPA dialog crop sama sekali, paling aman dari potongan tidak sengaja), sedang thumbnail (`hero_gambar_url`, 16:9) dipertahankan untuk kartu. Produk TETAP satu galeri (tidak menambah field), tapi dialog crop dilepas rasio-nya jadi bebas (Admin yang atur sendiri, bukan sistem) setelah Alif mengingatkan risiko tampilan berantakan kalau crop dihapus total — kotak tampilan publik tetap satu ukuran konsisten, latar diganti putih polos supaya foto produk (yang umumnya sudah berlatar putih) menyatu tanpa terlihat pembatas. Hero beranda: kotak tampilan TIDAK diubah (sudah pas menurut Alif), hanya rasio kunci upload yang diselaraskan dari 16:9 ke 4:3. Panel gambar halaman Masuk/Daftar/Lupa Sandi (`AuthShell`) dikonfirmasi bukan pengaturan terpisah — meminjam slide `hero_slides` aktif pertama — cukup diberi catatan di form Hero Beranda, tidak dibuatkan field baru. Ditambahkan juga lightbox klik-untuk-perbesar (pola sama dengan perbaikan aksesibilitas `pendaftaran-batch-detail.tsx`) untuk hero pelatihan dan galeri produk publik. `ImageUploadField` (komponen bersama) mendapat dua prop opsional baru yang backward-compatible: `skipCrop` dan `previewFit`. SQL hanya satu kolom baru (`batches.gambar_detail_url`) — tidak ada tabel/kolom baru untuk produk, hero beranda, atau lightbox (murni perubahan kode). Dicatat sebagai Sprint 8/Modul 9 (F09.x) di `feature-registry.md`, terpisah dari Modul 8 (operasional pendaftaran) karena topiknya beda (media/tampilan lintas pelatihan+produk+beranda). Detail lengkap di ADR-022, PRD.md §5.1e/§9d |
| 2026-09-17 | **ADR-022b — revisi F09.2 setelah diuji Alif: thumbnail produk terpisah, panah carousel dipindah ke dalam bingkai.** Dua temuan dari pengujian browser: (1) panah carousel galeri produk menabrak kolom harga di sebelahnya — `CarouselPrevious`/`CarouselNext` (shadcn bawaan) diposisikan keluar kotak (`-left-12`/`-right-12`), diperbaiki lewat override `className` di `ProductGallery` (posisi ke dalam kotak), TANPA mengubah komponen shared `carousel.tsx`; (2) Alif melaporkan bingung menentukan ukuran/rasio foto untuk cover kartu katalog karena galeri produk sengaja dibuat rasio bebas (ADR-022 F09.2) sementara kartu katalog pakai kotak 16:9 tetap — keputusan "satu galeri tanpa thumbnail" untuk produk DICABUT, diganti kolom baru `products.thumbnail_url` (rasio 16:9 terkunci saat upload, pola identik `batches.hero_gambar_url`), ditempatkan terpisah dari galeri (`product_images`, TIDAK diubah, tetap dipakai carousel detail). Kartu katalog fallback ke foto pertama galeri kalau `thumbnail_url` belum diisi, supaya produk lama tidak rusak tampilannya. SQL tambahan (`usulan-sql-modul9-adr022b.sql`, satu kolom baru) diajukan — WAJIB dijalankan manual oleh Alif sebelum revisi F09.2 dikerjakan. Detail lengkap di ADR-022b, PRD.md §5.1e |
| 2026-09-18 | **ADR-023 — Modul 10: bug kuis LMS, bukti pembayaran pendaftaran batch, infrastruktur email Resend penuh, verifikasi lintas-device, polish Admin.** Alif menyampaikan 9 temuan sekaligus setelah deploy Vercel, dengan instruksi eksplisit: kelompokkan berdasarkan kesamaan, urutkan termudah dulu, konfirmasi tiap keputusan lewat AskUserQuestion sebelum menulis SQL/prompt. Semua 9 ditelusuri ke kode dulu sebelum dikelompokkan — dua di antaranya (urutan produk/pelatihan, silabus admin) ternyata BUKAN bug/fitur baru setelah dicek (lihat Konteks ADR-023 untuk rinciannya). Dikelompokkan jadi 6 kelompok kerja (F10.1–F10.6) diurutkan termudah→tersulit: F10.1 polish Admin (menu Leads, warna tombol, hint silabus, tanpa skema baru), F10.2 cek operasional (env var Vercel + konfirmasi bukan bug, tanpa kode), F10.3 bug kuis LMS (satu baris logika salah di `course-reader.tsx`, plus fitur baru "Ulangi Ujian" mereset kuis saja bukan materi — dikonfirmasi Alif), F10.4 bukti pembayaran pendaftaran batch (kolom baru `batch_registrations.bukti_url`, pola sama `certificate_orders.bukti_url` tapi diupload Admin bukan user), F10.5 infrastruktur email (ganti `supabase.auth.signUp()`/`resetPasswordForEmail()` ke `admin.generateLink()` + kirim manual lewat Resend, supaya template branded yang SUDAH ADA di `templates.ts` tapi tidak pernah dipanggil akhirnya terpakai), F10.6 verifikasi lintas-device (bergantung F10.5 — device yang klik link email hanya menandai status, device asal yang polling dan login otomatis). SQL hanya satu kolom baru (`usulan-sql-modul10-adr023.sql`) — WAJIB dijalankan manual oleh Alif sebelum F10.4 dikerjakan. Detail lengkap di ADR-023, PRD.md §5.1f/§9e |
| 2026-09-19 | **ADR-024 — Modul 11: dua field kategori produk, ringkasan Leads di dashboard Admin, redesign login Admin.** Alif melaporkan 3 temuan baru setelah push F10.x, ditelusuri ke kode dulu: (1) form Tambah/Ubah Produk punya dua field "Kategori" — teks bebas (`kategori`, ternyata masih dipakai untuk badge publik, BUKAN dead code) dan relasi (`category_id`, dipakai untuk filter publik) — sumber ambiguitas Admin, bukan duplikasi murni; (2) dashboard Admin diminta ringkasan Leads terpisah per sumber, grafik tren ditingkatkan jadi 2 garis, tambahan pie/bar chart untuk data organik (status Leads, Sertifikat), dan angka stat card diperbesar; (3) halaman Login Admin polos, padahal komponen `BrandLogo` (sudah reusable, dipakai di sidebar Admin) tinggal dipasang ulang. Dikelompokkan jadi 3 kelompok kerja (F11.1–F11.3): F11.1 kategori produk (hapus field teks dari form, badge publik pindah baca dari relasi `category_id` lewat kolom baru di view `products_public` — BUKAN kolom tabel baru, kolom `products.kategori` sendiri tidak dihapus dari DB, hanya tidak dipakai lagi), F11.2 dashboard (murni tampilan/query baca, `recharts` yang sudah jadi dependency, tanpa skema baru), F11.3 login Admin (murni tampilan, pasang ulang komponen yang sudah ada). SQL hanya perubahan definisi view (`usulan-sql-modul11-adr024.sql`) — WAJIB dijalankan manual oleh Alif, dan definisi ASLI view harus dibaca dulu dari Supabase sebelum `CREATE OR REPLACE` dijalankan (draf di file SQL adalah rekonstruksi, bukan salinan pasti). Detail lengkap di ADR-024 |
| 2026-09-20 | **ADR-024 diperluas — F11.4–F11.6.** F11.4 (2026-09-19): dropdown Status penawaran. F11.5: kasus kategori Batch sama F11.1 (hapus teks form, badge dari join `batch_categories`, tanpa DDL/view; bersyarat diagnosis `category_id`). F11.6: polish Hero (tanpa teks tombol), FAQ detail = Silabus, footer tagline baru, gap i18n EN ditutup. |
| 2026-09-22 | **ADR-020r amandemen F07.3 Fix A + ADR-024 F11.7.** Fix A: user login tetap pilih "dengan akun" / "tanpa taut akun" (`sebagai_tamu` → `user_id` null, skip sync `profiles`). F11.7: filter kategori lebar ikut teks; `jam_operasional_en` di JSON kontak; `FileUploadField` konsisten (lampiran/bukti/impor/FotoPicker). Diuji Alif — DONE di `feature-registry.md`. |
| 2026-09-24 | **Email lead: DB-first + keputusan `minat_batch`.** Penerima `kirimEmailLeadBaru` lewat `getAdminNotifyEmail()` (`site_settings.admin_notify_email`, fallback `ADMIN_NOTIFY_EMAIL`) — e2e inbox F04.5 LOLOS. Cabang tipe `minat_batch` **ditahan** sampai Fase 2 (email notifikasi pendaftaran batch); jangan bersihkan sebagai dead code. Tercatat PRD.md §15 + kandidat Fase 2 di `feature-registry.md`. |