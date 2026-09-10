# PRD — HEXATARA FASE 1

| Field | Isian |
|---|---|
| Kode dokumen | PRD-HXT-002 |
| Turunan dari | BRD-HXT-002 v1.1 (4 September 2026) |
| Produk | hexatara.com — Fase 1 |
| Klien | Hexatara Indonesia |
| Pelaksana | InspiraLabs (Nawa Inspira Digital) |
| Developer | Alif Ayatulloh Ar-Rizqy — solo full-stack |
| Perkiraan | 8 minggu, 6 sprint |

---

## 0. CARA MEMAKAI DOKUMEN INI

**Untuk AI agent:** ini berkas yang dibaca pertama tiap sesi. Isinya *apa* yang harus dibangun dan *bagaimana cara mengetahui itu sudah benar*. Kalau butuh detail teknis — DDL, konvensi kode, daftar larangan lengkap — buka `ENGINEERING.md`.

**Untuk manusia:** ini terjemahan BRD jadi bentuk yang bisa dieksekusi. Tiap fitur punya kode `F0X.Y`, cerita pengguna, dan kriteria selesai yang bisa dicek sendiri di browser.

### Urutan kewenangan kalau ada pertentangan

```
BRD-HXT-002 v1.1        ← menang atas segalanya. Dokumen kesepakatan dengan klien
  └─ PRD.md (ini)       ← menang soal PRODUK: fitur apa, perilakunya bagaimana, selesainya kapan
       └─ ENGINEERING.md ← menang soal TEKNIS: skema, konvensi, pola kode
            └─ PANDUAN.md Fase 7-13     ← prompt pelaksana. Tidak pernah menang atas apa pun
```

Kalau kamu menemukan pertentangan, **berhenti dan katakan.** Jangan pilih salah satu diam-diam. Dokumen yang kalah harus diperbaiki, dan perbaikannya dicatat di `ENGINEERING.md` Bagian 12 sebagai ADR baru.

### Berkas pendamping

| Berkas | Isi |
|---|---|
| `CLAUDE.md` | pointer, memuat berkas lain lewat `@import` |
| `PRD.md` | **berkas ini** — apa yang dibangun, kriteria selesai |
| `ENGINEERING.md` | skema DDL, 25 larangan, konvensi kode, 8 ADR |
| `feature-registry.md` | status tiap fitur. Diisi setelah kamu tes sendiri |
| `PANDUAN.md` | langkah kerja: setup, SQL skema, seluruh prompt sprint, cara uji, skrip commit |
| `docs/AS_BUILT/` | diisi setelah modul selesai, bahan manual book |

---

## 1. RINGKASAN PRODUK

### 1.1 Apa ini

Sistem web untuk **Hexatara Indonesia** — penyelenggara pelatihan pilot drone bersertifikat (Remote Pilot Certificate) dan penjual drone profesional Autel, berkedudukan di Bekasi.

Fase 1 mengganti **tiga proses manual** yang berjalan hari ini:

| Sekarang | Jadi |
|---|---|
| Katalog produk dikirim lewat percakapan WhatsApp satu per satu | Halaman katalog publik dengan kendali tampil/sembunyi harga |
| Keabsahan sertifikat dicek manual di spreadsheet oleh Admin | Halaman `/verify` publik, tanpa login, QR atau ketik nomor |
| Calon peserta dikenali lewat Google Form | Form minat tersimpan di database + diteruskan ke WhatsApp |

Ditambah satu hal baru: **jalur gratis (Free Track)** — materi dan kuis gratis yang menghasilkan sertifikat, dengan QR yang baru aktif setelah upgrade berbayar. Fungsinya menarik calon peserta pelatihan berbayar, sekaligus pendapatan kecil.

### 1.2 Konteks yang mengubah prioritas

Tiga hal ini bukan latar belakang. Ketiganya mengubah keputusan teknis, dan disebut ulang di tiap modul yang terpengaruh.

**DKPPU Kementerian Perhubungan memeriksa website ini rutin tiap periode pelatihan bulanan.** Website mati saat pemeriksaan adalah masalah kepatuhan, bukan sekadar masalah teknis. **Ketersediaan menang atas fitur.** Konsekuensi praktis: rollback lebih dulu, cari sebab belakangan; tidak ada deploy berisiko menjelang periode pelatihan.

**Rentang usia pengguna 17–70 tahun**, literasi digital campuran, mayoritas mengakses lewat smartphone. Font besar dan kontras tinggi bukan preferensi desain — itu persyaratan yang diuji di F05.1 dan F05.2.

**Data sertifikat tidak dapat direkonstruksi kalau hilang** (BRD Bagian 8). Supabase free tier tidak menyediakan point-in-time recovery. Backup manual bukan opsional, dan pemulihannya wajib diuji minimal sekali.

### 1.3 Indikator keberhasilan

Diambil apa adanya dari BRD Bagian 2.3. Ini yang ditanyakan Hexatara saat serah terima.

| Indikator | Target | Cara mengukurnya |
|---|---|---|
| Kejelasan landing page | Pengunjung menyebutkan dua penawaran inti tanpa scroll | Buka di 375px, ukur dengan DevTools |
| Verifikasi mandiri | Pihak ketiga memverifikasi tanpa menghubungi Admin | Buka `/verify` di HP tanpa login |
| Status kedaluwarsa | Nol pembaruan manual | Sertifikat lewat tanggal berubah sendiri |
| Pencatatan lead | Semua lead tercatat & bisa diekspor | Isi form → cek tabel → ekspor XLSX |
| Ketersediaan | Website hidup saat pemeriksaan DKPPU | Uptime |
| Kemandirian Admin | Admin menambah batch, produk, banner, sertifikat tanpa bantuan teknis | Abi melakukannya sendiri saat UAT |

### 1.4 Empat modul + dua pendukung

| No | Modul | Sprint |
|---|---|---|
| — | Fondasi: struktur, Supabase client, layout, auth, kerangka Admin | 0 |
| 1 | Landing Page (Prinsip 3 Detik) | 1 |
| 2 | Cek Validasi Sertifikat | 2 |
| 3 | Sertifikat Gratis (Freemium) | 3 |
| 4 | Katalog Produk | 4 |
| 5 | Admin Panel — dikerjakan menyebar di tiap sprint | 1–4 |
| 6 | Email Transaksional — 5 pemicu | 0, 3 |
| — | Hardening, aksesibilitas, rilis | 5 |

Modul 5 dan 6 bukan tambahan scope. Tanpa keduanya, Modul 1–4 tidak dapat dioperasikan Hexatara secara mandiri.

---

## 2. TECH STACK — TERKUNCI

Dikunci 5 September 2026 sesuai BRD Bagian 13.4. Mengubah baris mana pun butuh izin eksplisit dan ADR baru di `ENGINEERING.md` Bagian 12.

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 App Router |
| Bahasa | TypeScript strict |
| Styling | Tailwind CSS 4 |
| Komponen | shadcn/ui |
| Database | Supabase Postgres |
| Auth | Supabase Auth (email + password) |
| Storage | Supabase Storage |
| Dwibahasa | next-intl 3.x, `localePrefix: 'as-needed'` |
| Form | react-hook-form + Zod |
| Email | Resend |
| PDF sertifikat | pdf-lib + qrcode |
| Editor Admin | Tiptap |
| Import/ekspor data | xlsx dari cdn.sheetjs.com (Excel/XLSX) — seluruh titik ekspor dan import, ADR-016. `papaparse` (CSV) dipakai di awal, digantikan XLSX sepenuhnya 2026-09-09 |
| Rate limit | @upstash/ratelimit — di balik feature flag |
| Hosting | Vercel → Hostinger VPS setelah stabil |

**Arsitektur: monolit tertata.** Bukan microservice, bukan arsitektur berlapis. Satu developer, trafik rendah, delapan minggu. ADR-001.

**Kode wajib portabel.** Sistem pindah ke VPS setelah stabil di Vercel 2–4 minggu. Apa pun yang hanya ada di Vercel — `@vercel/blob`, Edge Config, Edge Runtime — menjadi utang. ADR-006.

Daftar lengkap paket, alasan tiap paket ada, dan daftar yang sengaja **tidak** dipasang ada di `PANDUAN.md` Fase 2.7 dan 2.8.

---

## 3. PERAN & HAK AKSES

Tiga peran. Tidak ada peran instruktur, korporat, atau peserta berbayar — modul yang membutuhkannya tidak ada di Fase 1.

| Peran | Cara masuk | Yang bisa dilakukan |
|---|---|---|
| **Pengunjung anonim** | tanpa akun | Landing, detail batch, form minat, `/verify`, materi, kuis, katalog, form penawaran |
| **Pengguna Free Track** | daftar mandiri, verifikasi email wajib | Semua hak anonim + dashboard pribadi + upgrade sertifikat |
| **Admin Hexatara** | dibuatkan InspiraLabs saat penyiapan | Seluruh Admin Panel (Bagian 10) |

### 3.1 Aturan otorisasi

- Peran disimpan di `profiles.role`, nilainya `user` atau `admin`. Tidak ada tabel `roles` atau `permissions` — dua peran tidak membutuhkannya.
- **Login Admin terpisah** di `/admin/login`, di luar prefix locale. Persyaratan BRD 7.3, bukan preferensi.
- Gate otorisasi ada di `src/lib/auth/guard.ts` sebagai `requireAdmin()` dan `requireUser()`.
- **`requireAdmin()` dipanggil di setiap Server Component DAN setiap Server Action di bawah `/admin`.** Pengecekan di layout saja tidak cukup — Server Action bisa dipanggil langsung dari luar tanpa melewati layout.
- Pengecekan admin di database lewat `public.is_admin()` yang `SECURITY DEFINER`. Fungsi ini ada untuk memutus rekursi: policy pada `profiles` yang melakukan subquery ke `profiles` menghasilkan `infinite recursion detected in policy` dan mematikan seluruh autentikasi.

### 3.2 Registrasi

| Aspek | Ketentuan |
|---|---|
| Data wajib | Nama lengkap, email, kata sandi |
| Alamat pengiriman | **Tidak** diminta saat registrasi. Hanya saat checkout paket bermerchandise |
| Verifikasi email | Wajib. Akun tidak bisa dipakai sebelum tautan diklik |
| Persetujuan Admin | Tidak diperlukan |
| Reset kata sandi | Tautan bertoken, sementara, sekali pakai. Sistem **tidak pernah** mengirim kata sandi dalam bentuk teks |
| Kotak persetujuan data | **Tidak tercentang saat halaman dibuka.** `defaultChecked` dilarang di seluruh proyek |

---

## 4. PETA ROUTE

```
PUBLIK — dwibahasa
/                          landing page
/pelatihan                 listing pelatihan (Fase 12.5/F06.11 — sebelumnya bagian dari landing;
                            rename dari /batch dikonfirmasi saat implementasi §12.5.7 PANDUAN.md,
                            redirect dari URL lama dijaga kalau sudah terindeks)
/pelatihan/[slug]          detail batch (sebelumnya /batch/[slug])
/verify                    form pencarian nomor sertifikat
/verify/[token]            hasil dari pemindaian QR
/materi                    ringkasan materi & kuis freemium (Fase 12.5/F06.2 — direstrukturisasi
                            jadi LMS berbab, lihat Bagian 9a.3)
/kuis                      mesin kuis (perilaku TIDAK berubah, lihat Bagian 9a.3)
/katalog                   daftar produk
/katalog/[slug]            detail produk
/tentang-kami  /faq  /ketentuan-layanan  /kebijakan-privasi  /syarat-ketentuan
                            halaman statis baru (F06.10, footer)
/en/...                    versi Inggris dari semua di atas

AKUN — dwibahasa
/daftar    /login    /lupa-sandi    /reset-sandi    /verifikasi-email

PENGGUNA — butuh login
/dashboard                 sertifikat, status, riwayat aktivitas
/dashboard/upgrade         pilih paket + unggah bukti transfer
/dashboard/merchandise     tambah merchandise menyusul

ADMIN — butuh role admin, Bahasa Indonesia saja, TANPA prefix locale
/admin/login
/admin                     beranda
/admin/batch               + /baru  /[id]
/admin/konten              popup, banner, hero, instruktur, company profile, testimoni
/admin/leads               pendaftaran minat + permintaan penawaran + ekspor XLSX
/admin/sertifikat          daftar, tambah satuan, import massal
/admin/upgrade             antrean verifikasi pembayaran
/admin/materi              materi + bank soal
/admin/produk              CRUD produk + tampil/sembunyi harga
/admin/pengaturan          rekening bank, nomor WA
```

### 4.1 Routing dwibahasa — keputusan permanen

`localePrefix: 'as-needed'`. `hexatara.com/` adalah Bahasa Indonesia **tanpa prefix**; `hexatara.com/en/...` Bahasa Inggris.

**Ini tidak bisa diubah setelah sertifikat pertama dicetak.** QR pada sertifikat fisik tidak bisa ditarik kembali — `hexatara.com/verify/{token}` harus tetap valid bertahun-tahun ke depan. Redirect bisa menolong, tapi bergantung pada redirect selama satu dekade adalah utang yang tidak perlu diambil. ADR-003.

**Admin Panel berbahasa Indonesia saja**, di luar `[locale]`. Yang dwibahasa adalah *isi* yang dikelola Admin, bukan antarmuka pengelolanya.

### 4.2 Mekanisme dwibahasa

| Yang diterjemahkan | Caranya |
|---|---|
| Label antarmuka | `messages/id.json` dan `messages/en.json`, bernamespace: `common, nav, landing, batch, verify, quiz, catalog, auth, dashboard, admin` |
| Konten yang dikelola Admin | Kolom ganda `_id` / `_en` di tabel yang sama. ADR-002 |

**Fallback wajib lewat satu helper, dipakai di mana-mana:**

```ts
// src/lib/i18n/pick.ts
export function pick<T>(id: T | null, en: T | null, locale: string): T | null {
  return locale === 'en' ? (en ?? id) : id;
}
```

Jangan pernah menulis `locale === 'en' ? x.judul_en : x.judul_id` langsung di komponen. Tanpa `??`, konten Inggris yang kosong menghasilkan bagian kosong di halaman — persis yang dilarang acceptance criteria BRD.

**Terjemahan otomatis tidak dibangun di Fase 1.** Kolom `_en` yang kosong menampilkan versi Indonesia, jadi tidak ada yang rusak kalau Hexatara belum mengisi. ADR-007.

---

## 5. MODEL DATA

24 tabel inti Fase 1, 2 view publik, 4 fungsi, ditambah 4 tabel baru dari Fase 12.5 (Modul 6 — lihat Bagian 5.1b dan ADR-011 s/d ADR-017 di `ENGINEERING.md`). DDL lengkap 24 tabel inti ada di `PANDUAN.md` Bagian 3.3, dijalankan **manual** oleh developer di Supabase SQL Editor. Migrasi baru nomor 13 ke atas ditulis sebagai berkas di `docs/sql/`, termasuk `docs/sql/15_redesign_upgrade_fase12.5.sql` untuk Fase 12.5.

**Agent tidak pernah mengeksekusi DDL.** Kalau butuh perubahan skema: tulis SQL-nya sebagai usulan, jelaskan kenapa, tunggu user menjalankannya dan mengonfirmasi.

### 5.1 Daftar tabel (24 tabel inti Fase 1)

| Kelompok | Tabel |
|---|---|
| Akun | `profiles`, `activity_logs` |
| Konten landing | `popups`, `sale_banners`, `hero_slides`, `instructors`, `company_profile`, `testimonials`, `site_settings` |
| Batch | `batches`, `batch_benefits`, `batch_equipment`, `batch_gallery`, `batch_faqs` |
| Lead | `batch_leads`, `quote_requests` |
| Produk | `products`, `product_images` |
| Sertifikat | `certificates`, `certificate_counters` |
| Free track | `materials`, `quiz_questions`, `quiz_options` |
| Upgrade | `certificate_orders` |

### 5.1b Tabel tambahan — Fase 12.5 (Modul 6, lihat Bagian 9a)

| Tabel | Ditambahkan oleh | Kegunaan |
|---|---|---|
| `product_categories` | ADR-012 | Kategori produk dinamis, CRUD Admin (F06.4) |
| `batch_categories` | ADR-012 | Kategori pelatihan dinamis, CRUD Admin (F06.4) |
| `material_chapters` | ADR-013 | Bab materi LMS freemium, urut dan berkunci progresif (F06.2) |
| `material_progress` | ADR-013 | Progress baca materi per user per bab, HANYA materi — bukan riwayat kuis (F06.2) |

Kolom baru pada tabel inti yang sudah ada: `batches.rating`, `products.rating` (ADR-011), `products.category_id`, `batches.category_id` (ADR-012), `popups.gambar_mobile_url`, `popups.gambar_desktop_url` (ADR-015). Tidak ada kolom `urutan` baru di `batches` — batch tetap urut berdasarkan tanggal (ADR-014).

### 5.2 View publik — WAJIB untuk akses anonim

| View | Kenapa ada |
|---|---|
| `certificates_public` | Membatasi **kolom** yang terlihat publik. RLS bekerja per baris, bukan per kolom — pembatasan kolom harus lewat view. Tanpa email, telepon, alamat (BRD 7.2). Mengembalikan kolom `status` hasil `status_sertifikat()` |
| `products_public` | Mengembalikan `harga` sebagai **NULL** untuk produk yang harganya disembunyikan, di sisi database |

`products_public` berjalan dengan `security_invoker = off`, artinya sebagai pemilik view. Ini disengaja: anon tidak pernah butuh akses ke tabel `products`, sehingga angka harganya tidak pernah ikut terkirim dalam respons apa pun. Supabase linter akan menandai ini "security definer view" — **peringatan itu memang diharapkan dan sengaja tidak diperbaiki.** ADR-004.

> **Query ke tabel `products` langsung dari jalur publik adalah bug, bukan pilihan gaya.**
> Cara mengujinya: `select harga from products_public where tampilkan_harga = false;` — semua baris harus NULL.

### 5.3 Fungsi database

| Fungsi | Gunanya |
|---|---|
| `is_admin()` | Pengecekan admin di policy RLS. `SECURITY DEFINER` untuk memutus rekursi |
| `handle_new_user()` | Trigger `on_auth_user_created` — membuat baris `profiles` otomatis saat user mendaftar |
| `next_certificate_number(jenis)` | Nomor urut per jenis dengan penguncian baris. Prefix berbeda mencegah tabrakan |
| `status_sertifikat(tanggal_kedaluwarsa)` | Menghitung `berlaku` / `invalid` saat query. Tidak pernah disimpan, tidak butuh cron |
| `set_updated_at()` | Trigger `updated_at` otomatis |

### 5.4 Aturan yang dijaga database, bukan cuma kode

Ini yang membedakan sistem yang dirancang dari sistem yang kebetulan jalan. Kalau kodenya salah, database tetap menolak.

| Aturan | Penjaganya |
|---|---|
| Sertifikat `free_track` tidak boleh punya tanggal kedaluwarsa | `chk_free_track_tanpa_expiry` |
| Satu akun hanya satu sertifikat `free_track` | unique index `uq_free_track_per_user` |
| Tepat satu jawaban benar per soal kuis | unique index `uq_satu_jawaban_benar` |
| Paket bermerchandise wajib punya alamat setelah bukti diunggah | `chk_alamat_merch` |
| Nomor sertifikat unik | unique constraint `nomor_sertifikat` |
| `public_token` unik dan acak | `default encode(gen_random_bytes(9),'hex')` |

### 5.5 Tabel yang SENGAJA TIDAK ADA

Kalau kamu merasa butuh salah satu dari ini, kamu sedang salah paham requirement.

| Tidak ada | Kenapa |
|---|---|
| `quiz_attempts`, `quiz_scores` | Kuis tidak menyimpan riwayat. Semua berakhir 100%. Papan peringkat dilarang |
| `coupons`, `promos`, `discounts` | Sale banner hanya menampilkan pesan. Tidak menyentuh nominal apa pun |
| `payments`, `transactions` | Tidak ada payment gateway. Bukti transfer adalah berkas di `certificate_orders` |
| `email_domain_blacklist`, `validation_logs` | Scope Fase 2 |
| `courses`, `enrollments`, `attendance` | Tidak ada LMS untuk batch tersertifikasi berbayar di Fase 1 — delivery tetap manual WhatsApp Group + Zoom (BRD §4.2). **Pengecualian tercatat:** `material_chapters`/`material_progress` (ADR-013, Bagian 5.1b) BUKAN pelanggaran baris ini — keduanya khusus MATERI freemium (Modul 3/6), bukan kelas berbayar, dan tidak menambah `courses`/`enrollments`/`attendance` |
| `roles`, `permissions` | Dua peran, kolom `profiles.role` sudah cukup |
| `shipments` | Pengiriman digabung di `certificate_orders` — satu pesanan satu pengiriman |

---

## 6. MODUL 1 — LANDING PAGE (PRINSIP 3 DETIK)

> BRD Bagian 5.A · Sprint 1 · prompt di `PANDUAN.md` Fase 8

### 6.1 Tujuan

Landing page adalah pintu masuk seluruh sistem. Prinsip yang disepakati: **keterbacaan 3 detik.** Begitu halaman dibuka, pengunjung harus langsung memahami bahwa Hexatara menyelenggarakan pelatihan pilot drone **dan** menjual drone — tanpa scroll, tanpa membaca paragraf pengantar.

Halaman boleh panjang ke bawah. Yang tidak boleh: informasi terpenting muncul belakangan.

### 6.2 Cerita pengguna

> Sebagai calon peserta pelatihan yang baru mengenal Hexatara dari pencarian Google, saya membuka hexatara.com di HP saya, dan dalam tiga detik saya tahu ini tempat pelatihan drone bersertifikat. Saya scroll ke bawah, melihat batch bulan depan, membuka detailnya, dan mengisi form minat. Percakapan WhatsApp saya dengan Admin sudah terbuka dengan pesan yang terisi otomatis.

### 6.3 Daftar fitur

| Kode | Fitur | Prio | Tabel |
|---|---|---|---|
| F01.1 | Pop-up pembuka | MUST | `popups` |
| F01.2 | Sale banner | MUST | `sale_banners` |
| F01.3 | Hero produk unggulan + CTA utama | MUST | `hero_slides` |
| F01.4 | Section "Jadwal Pelatihan Mendatang" | MUST | `batches` |
| F01.5 | Halaman detail batch | MUST | `batches` + 4 tabel anak |
| F01.6 | Form pendaftaran minat → DB + WhatsApp | MUST | `batch_leads` |
| F01.7 | Galeri instruktur | MUST | `instructors` |
| F01.8 | Company profile di bagian bawah landing | MUST | `company_profile` |
| F01.9 | Floating WhatsApp button | MUST | — |
| F01.10 | Testimoni | SHOULD | `testimonials` |
| F01.11 | Pemilih bahasa di seluruh halaman publik | MUST | — |
| F01.12 | Admin: CRUD batch + seluruh isi halaman detail | MUST | `batches` + anak |
| F01.13 | Admin: CRUD popup, banner, hero, instruktur, company profile, testimoni | MUST | konten landing |
| F01.14 | Admin: daftar lead + ekspor XLSX | MUST | `batch_leads` |

### 6.4 Perilaku yang mudah salah

**F01.1 — pop-up pembuka**

Pakai `sessionStorage`, **bukan** `localStorage`. "Tidak muncul lagi dalam sesi yang sama" berarti pop-up kembali muncul pada kunjungan berikutnya.

Tampilkan setelah halaman siap, jangan menghalangi render pertama. Ambil satu baris `popups` yang `is_active = true` dan tanggal hari ini berada dalam `tayang_mulai`–`tayang_selesai`. Kalau tidak ada baris yang cocok, **tidak ada pop-up** — bukan pop-up kosong.

**F01.2 — sale banner**

Yang dikelola Admin: judul, teks penawaran, pesan urgensi, teks tombol, tautan tombol, periode tayang, aktif/nonaktif.

`urgensi_id` adalah **teks biasa yang diketik Admin**. Bukan hitung mundur, bukan timer, bukan `setInterval`. **Kalau ada `setInterval` di komponen banner, itu pelanggaran acceptance criteria.**

Banner tidak menyentuh harga apa pun di sistem. Komponennya **tidak boleh mengimpor `src/lib/constants.ts`.**

Banner wajib bisa dinonaktifkan Admin kapan saja dan berlaku seketika tanpa deploy — termasuk saat periode pemeriksaan DKPPU (BRD 7.4).

**F01.4 / F01.5 — batch**

Card menampilkan: tanggal, tag kategori, judul, lokasi singkat, harga, status.

Status `closed` → tombol "Daftar Sekarang" **tidak dirender sama sekali.** Bukan dirender lalu diberi `disabled` — acceptance criteria berbunyi "tidak menampilkan tombol yang dapat diklik", dan tombol disabled masih bisa diaktifkan lewat DevTools.

Halaman detail wajib memuat **tujuh elemen**: benefit pills, tab Deskripsi & Silabus, card Jadwal & Investasi, card Dukungan Peserta, card Peralatan Belajar, FAQ, galeri dokumentasi. Bagian yang datanya kosong **disembunyikan**, tidak dirender sebagai kerangka kosong.

**F01.6 — form minat, urutannya penting**

```
isi form (nama, kontak, batch, centang persetujuan)
  → simpan ke batch_leads, isi consent_at
  → tampilkan konfirmasi di layar
  → buka wa.me dengan pesan terisi otomatis
  → kirim email pemberitahuan ke Admin
```

**Simpan dulu, baru buka WhatsApp.** Kalau WhatsApp dibuka lebih dulu dan penyimpanan gagal, lead-nya hilang — dan alasan form ini ada di database justru supaya tidak ada lead yang hilang saat percakapan WhatsApp tenggelam.

Template pesan WA:

```
Halo Admin Hexatara, saya {nama} ingin mendaftar batch "{judul_batch}" ({tanggal}).
Kontak saya: {whatsapp}
```

Ini **bukan pendaftaran resmi.** Seleksi, pembayaran, dan penerimaan peserta batch berjalan manual di luar sistem lewat WhatsApp Group dan Zoom.

**F01.9 — floating WhatsApp**

Hanya tautan `wa.me`. Tanpa API, tanpa gateway, tanpa blast, tanpa chatbot, tanpa balasan otomatis. Nomornya dari `NEXT_PUBLIC_WA_ADMIN`.

**F01.14 — ekspor XLSX** *(diubah dari CSV, ADR-016, 2026-09-09)*

`xlsx` dari CDN SheetJS (sudah terpasang, ADR-010), kolom asli per field tanpa concat — bukan satu kolom dipisah koma. Nama berkas: `leads-batch-YYYY-MM-DD.xlsx`. Alasan perubahan: Admin (Abi, pengguna awam) kesulitan membuka CSV satu-kolom-dipisah-koma di Excel, terutama pada data dengan banyak field. `papaparse` yang dipakai sebelumnya (dengan BOM UTF-8) jadi kandidat dependency unused — dicek dengan `pnpm knip` setelah seluruh titik ekspor/import berpindah ke XLSX.

### 6.5 Selesai bila — acceptance criteria BRD 13.1

- [ ] Pop-up muncul saat halaman pertama dibuka, dapat ditutup, tidak muncul lagi dalam sesi yang sama
- [ ] Isi dan status aktif pop-up dapat diubah dari Admin Panel tanpa menyentuh kode
- [ ] Sale banner dapat diisi, diatur periode tayangnya, dan dinonaktifkan sepenuhnya dari Admin Panel
- [ ] Sale banner tidak mengubah nominal harga apa pun — diuji dengan memastikan harga upgrade tetap Rp 30.000 dan Rp 150.000 saat banner aktif
- [ ] Tidak ada penghitung waktu mundur berjalan di dalam kode banner
- [ ] Pada layar 375px, dua penawaran inti terlihat **tanpa scroll**
- [ ] Section jadwal menampilkan tanggal, tag, judul, lokasi, harga, status
- [ ] Batch berstatus Closed tidak menampilkan tombol "Daftar Sekarang" yang dapat diklik
- [ ] Halaman detail batch memuat ketujuh elemen
- [ ] Form minat menyimpan ke database, menampilkan konfirmasi, mengarahkan ke WhatsApp dengan pesan terisi
- [ ] Data lead dapat diekspor ke XLSX (bukan lagi CSV, ADR-016), dan hasilnya terbuka rapi per kolom di Excel
- [ ] Floating WhatsApp hanya membuka tautan — tidak ada pemanggilan API di dalam kode
- [ ] Pengalih bahasa berfungsi di seluruh halaman publik, konten belum diterjemahkan menampilkan versi Indonesia
- [ ] Script autentikasi dimuat satu kali per halaman — tidak ada error deklarasi ganda di console

---

## 7. MODUL 2 — CEK VALIDASI SERTIFIKAT

> BRD Bagian 5.B · Sprint 2 · prompt di `PANDUAN.md` Fase 10

### 7.1 Tujuan

Halaman publik di `hexatara.com/verify`, dapat diakses tanpa login, untuk memverifikasi keabsahan sertifikat fisik yang diterbitkan Hexatara. Menggantikan pengecekan manual berbasis spreadsheet, sekaligus menghapus pekerjaan pembaruan status kedaluwarsa satu per satu.

Sistem ini **murni alat bantu pengecekan.** Legitimasi sertifikat dianggap terbukti apabila datanya muncul di halaman resmi Hexatara. Sertifikat tetap diterbitkan dengan tanda tangan basah untuk kepatuhan DKPPU.

### 7.2 Cerita pengguna

> Sebagai HRD perusahaan yang menerima lamaran seorang pilot drone, saya memindai QR di sertifikat yang dilampirkan. Halaman langsung menampilkan nama, nomor, tanggal terbit, masa berlaku, dan status — tanpa saya perlu login atau menghubungi siapa pun. Kalau sertifikatnya sudah lewat masa berlaku, saya melihat "Invalid" dengan jelas, dan itu berbeda dari "tidak ditemukan".

### 7.3 Daftar fitur

| Kode | Fitur | Prio |
|---|---|---|
| F02.1 | `/verify` — form pencarian nomor, tanpa login | MUST |
| F02.2 | `/verify/[token]` — hasil langsung dari QR | MUST |
| F02.3 | Tampilan hasil: nama, nomor, terbit, masa berlaku, status | MUST |
| F02.4 | Status kedaluwarsa otomatis | MUST |
| F02.5 | Sertifikat tanpa masa berlaku | MUST |
| F02.6 | Pesan "tidak ditemukan" | MUST |
| F02.7 | Admin: CRUD sertifikat satuan | MUST |
| F02.8 | Admin: import massal + laporan per baris | MUST |
| F02.9 | Rate limit endpoint pencarian | SHOULD |

### 7.4 Masa berlaku — dua perilaku berbeda

**Ini titik scope creep nomor satu.** AI cenderung "merapikan" jadi satu perilaku seragam. Jangan.

| Jenis | Masa berlaku | Perilaku |
|---|---|---|
| `free_track` | **Selamanya. `tanggal_kedaluwarsa` WAJIB NULL** | Tidak pernah "Invalid". Tampilkan "tanpa masa berlaku", bukan kolom kosong |
| `existing_manual` | 2 tahun | Otomatis "Invalid" saat lewat tanggal |
| `rpc_certified` | 2 tahun | Sama seperti di atas |

Nilai bawaan kedaluwarsa = tanggal terbit + 2 tahun, **dan Admin bisa menimpanya** kalau sertifikat fisiknya berbeda.

Status dihitung saat query lewat `status_sertifikat()`, **tidak pernah disimpan sebagai kolom.** Tidak ada cron job, tidak ada scheduled function.

Sertifikat kedaluwarsa **tetap tampil** dengan status Invalid — tidak dihapus, tidak jadi "tidak ditemukan", supaya riwayat keabsahan tetap dapat ditelusuri.

Perpanjangan menerbitkan **baris baru dengan nomor baru.** Baris lama dibiarkan kedaluwarsa. Jangan pernah meng-update baris lama.

### 7.5 Penomoran

```
free_track       → HXT-FT-000123
existing_manual  → HXT-CERT-000456
rpc_certified    → HXT-RPC-000789
```

Nomor urut per jenis dari `certificate_counters` lewat `next_certificate_number(jenis)` yang mengunci baris. Prefix berbeda mencegah tabrakan antar jenis — **ini diuji eksplisit di acceptance criteria.**

### 7.6 Empat keadaan yang harus jelas berbeda

| Keadaan | Tampilan | Warna |
|---|---|---|
| Ada, belum lewat tanggal | Berlaku | hijau `#059669` |
| Ada, sudah lewat tanggal | **Invalid** | merah `#DC2626` |
| Ada, `tanggal_kedaluwarsa` NULL | Berlaku — "Tanpa masa berlaku" | hijau |
| Tidak ada di database | **Tidak ditemukan** | abu-abu |

"Invalid" dan "Tidak ditemukan" harus **jelas berbeda secara visual dan kalimatnya.** Invalid berarti sertifikatnya nyata tapi sudah lewat masa berlakunya. Tidak ditemukan berarti nomornya tidak pernah terdaftar. Bagi verifikator yang sedang memeriksa dokumen orang, dua hal itu berujung pada **tindakan yang berbeda.**

Untuk yang tanpa masa berlaku, tulis "Tanpa masa berlaku" — jangan biarkan kolomnya kosong atau menampilkan tanda hubung.

### 7.7 Yang boleh ditampilkan — hanya lima

Nama lengkap, nomor sertifikat, tanggal terbit, masa berlaku, status.

**Tanpa email, telepon, alamat.** Karena itu query wajib lewat view `certificates_public`. Kalau kamu menulis `.from('certificates')` di jalur publik, itu bug.

Pencarian **hanya berdasarkan nomor sertifikat.** Pencarian berdasarkan nama tidak disediakan — supaya data tidak dapat ditelusuri tanpa memegang nomor sertifikat yang sah (BRD 7.2).

### 7.8 Input dan import

Saat Admin memilih jenis `existing_manual` atau `rpc_certified`, kolom tanggal kedaluwarsa terisi otomatis **terbit + 2 tahun**, dan Admin masih bisa mengubahnya.

Saat jenis `free_track`, kolom tanggal kedaluwarsa **dinonaktifkan dan dikosongkan.** Bukan sekadar diberi peringatan.

Import Excel/XLSX memakai pola **laporan per baris**:

```
Berhasil: 47 baris
Gagal: 3 baris
  Baris 12 — nomor sertifikat sudah ada
  Baris 28 — format tanggal terbit tidak dikenali
  Baris 39 — nama lengkap kosong
```

Baris yang gagal dilewati, sisanya tetap masuk. **Satu baris rusak tidak boleh menggagalkan 200 baris lain.**

### 7.9 Rate limit — di balik feature flag

BRD 7.2 menandainya sebagai usulan teknis yang butuh konfirmasi klien, dan menyebut butir ini dihapus tanpa memengaruhi fungsi modul apabila tidak disetujui.

Dibangun di balik `RATE_LIMIT_VERIFY_ENABLED`. Kalau Hexatara menolak, ubah env jadi `false` — tanpa menyentuh kode. 10 permintaan per menit per IP sudah cukup. ADR-008.

### 7.10 Selesai bila

- [ ] `/verify` dapat diakses tanpa login
- [ ] Pemindaian QR langsung menampilkan hasil tanpa input manual tambahan
- [ ] Pencarian manual menampilkan kelima kolom
- [ ] Sertifikat SIDOPI/RPC otomatis "Invalid" saat lewat tanggal — diuji dengan data yang tanggalnya sudah lewat
- [ ] Sertifikat free track menampilkan "tanpa masa berlaku" dan tidak pernah jadi Invalid
- [ ] Tanggal kedaluwarsa kosong tidak menimbulkan error
- [ ] Saat input SIDOPI/RPC, kedaluwarsa terisi otomatis +2 tahun dan masih bisa diubah
- [ ] Nomor tidak terdaftar menampilkan "tidak ditemukan" yang jelas berbeda dari "Invalid"
- [ ] `free_track` dan `existing_manual` dapat diverifikasi lewat halaman yang sama
- [ ] Prefix per jenis tidak menghasilkan tabrakan — diuji dengan dua jenis bernomor urut sama
- [ ] Import massal berhasil, baris salah format dilaporkan tanpa menggagalkan seluruh proses
- [ ] Halaman verifikasi tidak menampilkan email, telepon, maupun alamat

---

## 8. MODUL 3 — SERTIFIKAT GRATIS (FREEMIUM)

> BRD Bagian 5.C · Sprint 3 · prompt di `PANDUAN.md` Fase 11
> **Sprint terberat. Kerjakan berurutan, jangan paralel.**

### 8.1 Tujuan

Jalur gratis berfungsi sebagai pengalaman awal yang memperkenalkan calon peserta pada Hexatara sebelum mereka mengambil pelatihan tersertifikasi berbayar. Materi dan kuis diakses tanpa login. Sertifikat diperoleh setelah mendaftar akun. QR baru aktif setelah upgrade berbayar dikonfirmasi Admin.

### 8.2 Cerita pengguna

> Sebagai orang yang penasaran dengan aturan penerbangan drone, saya membuka materi gratis Hexatara tanpa mendaftar. Saya kerjakan kuisnya — tiap kali salah, saya langsung tahu kenapa, dan boleh mengganti jawaban. Tidak ada rasa gagal. Setelah semua benar, saya daftar akun dan mendapat sertifikat dengan badge "Ready To Fly", tapi QR-nya masih blur. Saya transfer Rp 30.000, unggah bukti, dan setelah Admin memverifikasi, QR saya aktif dan sertifikat saya bisa diverifikasi siapa pun.

### 8.3 Alur lengkap

```
buka materi (tanpa login)
  → kerjakan kuis (tanpa login)
  → semua soal benar = 100%
  → daftar akun + verifikasi email
  → sertifikat PREVIEW: QR blur, badge "Ready To Fly"
    TIDAK ada baris di tabel certificates
  → pilih paket: Rp 30.000 atau Rp 150.000
  → transfer manual + unggah bukti
  → Admin memverifikasi di Admin Panel     ← SATU-SATUNYA pemicu aktivasi
  → baris certificates dibuat, qr_aktif = true
  → email pemberitahuan ke pengguna
  → sertifikat bisa diverifikasi di /verify
```

### 8.4 Daftar fitur

| Kode | Fitur | Prio |
|---|---|---|
| F03.1 | Halaman materi, tanpa login | MUST |
| F03.2 | Mesin kuis *correctable* | MUST |
| F03.3 | Registrasi + verifikasi email | SKIP — sudah tercakup F00.6 |
| F03.4 | Sertifikat preview: QR blur + badge "Ready To Fly" | MUST |
| F03.5 | Pilih paket upgrade | MUST |
| F03.6 | Unggah bukti transfer | MUST |
| F03.7 | Admin: verifikasi / tolak pembayaran | MUST |
| F03.8 | Aktivasi QR + terbitkan sertifikat | MUST |
| F03.9 | Dashboard pengguna | MUST |
| F03.10 | Tambah merchandise menyusul | MUST |
| F03.11 | Admin: status pengiriman | MUST |
| F03.12 | Admin: CRUD materi | MUST |
| F03.13 | Admin: CRUD bank soal + import Excel | MUST |

### 8.5 F03.2 — mesin kuis, model *correctable*

Bagian yang paling sering dirusak oleh "bantuan" AI. Perilakunya:

```
Pengguna memilih opsi
  → BENAR  : tandai hijau, kunci soal, lanjut
  → SALAH  : tandai merah SAAT ITU JUGA
             tampilkan penjelasan MILIK OPSI ITU
             biarkan pengguna memilih ulang di tempat
             tidak ada pengurangan nilai, tidak ada catatan kegagalan
Semua soal benar → 100% → tombol "Dapatkan Sertifikat"
```

**Yang tidak boleh ada di kode:**

- konstanta ambang nilai dalam bentuk apa pun (`PASSING_SCORE`, `MIN_SCORE`, `70`)
- penghitung percobaan yang membatasi
- timer atau hitung mundur
- `insert` ke tabel riwayat pengerjaan
- kondisi apa pun yang bisa menghasilkan keadaan "gagal"

Penjelasan diambil dari `quiz_options.penjelasan_id` / `penjelasan_en` **milik opsi yang dipilih.** Satu penjelasan umum untuk semua opsi salah gagal memenuhi acceptance criteria — dan memang tidak berguna, karena orang yang salah memilih opsi B punya kesalahpahaman berbeda dari yang memilih opsi C.

State kuis ada di React, **tidak di database.** Kuis boleh dikerjakan tanpa login.

Penanda selesai adalah satu kolom, `profiles.free_track_selesai_at`, diisi setelah pengguna menyelesaikan kuis dan mendaftar. Nilai itu berasal dari klaim sisi klien — **dan itu memang tidak apa-apa**, karena semua orang dijamin berakhir di 100%. Tidak ada yang bisa dicurangi ketika tidak ada kegagalan yang mungkin. Menambahkan verifikasi sisi server untuk ini adalah kerumitan tanpa ancaman nyata.

### 8.6 F03.4 — sertifikat preview

```
PREVIEW  → dihasilkan on the fly dari profiles
           TIDAK ada baris di certificates
           QR diganti kotak blur berlabel "Aktif setelah upgrade"
           badge "Ready To Fly"
           boleh diunduh sebagai PDF bertanda PREVIEW

AKTIF    → dibuat SETELAH Admin menyetujui
           baris certificates jenis free_track, tanggal_kedaluwarsa NULL
           qr_aktif = true, nomor dari next_certificate_number('free_track')
           QR asli menuju /verify/{public_token}
```

**Server tidak pernah mengirim `public_token` ke klien selama status masih preview.** Bukan dikirim lalu disembunyikan dengan CSS — **tidak dikirim sama sekali.** Blur yang dilakukan di sisi klien bisa dibatalkan siapa pun yang membuka DevTools, dan acceptance criteria BRD menguji tepat hal ini: "tidak dapat diakalkan menjadi aktif dari sisi front-end".

Preview tidak membuat baris di `certificates` karena kalau membuat, halaman `/verify` akan berisi sertifikat yang belum dibayar dan harus disaring di setiap query. Satu query yang lupa menyaring berarti sertifikat gratisan lolos verifikasi. ADR-005.

PDF dihasilkan di server dengan `pdf-lib`, menimpa template PDF di `public/templates/sertifikat.pdf`. Berkas hasil disimpan di bucket **privat** `certificates`, diakses lewat signed URL berumur pendek.

### 8.7 F03.5 / F03.6 — upgrade

Harga tetap, konstanta di `src/lib/constants.ts`. Tidak ada yang menghitungnya, tidak ada diskon, tidak ada kupon. **Sale banner aktif tidak mengubah angka ini** — acceptance criteria menguji itu secara khusus.

| Paket | Nominal | Alamat pengiriman |
|---|---|---|
| `cert_only` | Rp 30.000 | **TIDAK** diminta |
| `cert_merch` | Rp 150.000 | **WAJIB** |
| `merch_addon` | Rp 120.000 | **WAJIB.** Hanya untuk yang `cert_only`-nya sudah disetujui |

Alur bukti transfer:

```
menunggu_bukti → menunggu_verifikasi → disetujui
                                     ↘ ditolak (+ alasan) → kirim ulang → menunggu_verifikasi
```

**Ditolak bukan jalan buntu.** Pengguna melihat alasannya di dashboard dan bisa mengunggah ulang.

Bukti transfer masuk bucket **privat** `payment-proofs`. Tidak pernah tampil di halaman publik mana pun.

### 8.8 F03.8 — aktivasi, satu Server Action satu transaksi

```
1. Pastikan pesanan berstatus menunggu_verifikasi
2. Pastikan pengguna belum punya sertifikat free_track   ← dijaga unique index juga
3. nomor = next_certificate_number('free_track')
4. INSERT certificates (jenis free_track, tanggal_kedaluwarsa NULL, qr_aktif true)
5. Generate PDF final, simpan ke bucket certificates
6. Ubah status pesanan jadi disetujui, isi verified_by dan verified_at
7. Kirim email "sertifikat aktif"
8. Catat ke activity_logs
```

**Kalau langkah mana pun gagal, batalkan semuanya.** Sertifikat setengah jadi lebih buruk daripada tidak ada sertifikat: nomor sudah terpakai, pengguna sudah membayar, dan tidak ada yang bisa diverifikasi.

Aktivasi **hanya** dari tindakan sadar Admin. Tidak ada pengaktifan otomatis berbasis notifikasi bank, mutasi rekening, atau pembacaan bukti transfer.

### 8.9 F03.9 — dashboard pengguna

Isinya **persis lima hal**: sertifikat (unduh), status "Ready to Fly", status pembayaran, status pengiriman, riwayat aktivitas.

Tanpa progres belajar, tanpa riwayat kelas, tanpa pusat notifikasi. Batasnya ada di BRD 13.5.

### 8.10 F03.13 — import bank soal Excel

Satu baris per soal. Admin mengunduh template dulu, mengisi, lalu mengunggah.

```
no | pertanyaan_id | pertanyaan_en | jawaban_benar |
opsi_a_id | opsi_a_en | penjelasan_a_id | penjelasan_a_en |
opsi_b_id | opsi_b_en | penjelasan_b_id | penjelasan_b_en |
opsi_c_id | ... | opsi_d_id | ...
```

`jawaban_benar` diisi `a` / `b` / `c` / `d`. Kolom penjelasan untuk opsi yang **benar** dibiarkan kosong. Kolom `_en` boleh kosong seluruhnya — sistem menampilkan versi Indonesia. Laporan hasil import mengikuti pola F02.8.

### 8.11 Selesai bila

- [ ] Materi dan kuis dapat diakses penuh tanpa login
- [ ] Kuis dikerjakan di dalam sistem — tidak ada pengalihan ke Google Form di bagian mana pun
- [ ] Jawaban salah langsung ditandai saat itu juga, tanpa menunggu kuis selesai
- [ ] Penjelasan sesuai opsi salah yang dipilih, bukan penjelasan umum yang sama
- [ ] Pengguna dapat mengganti jawaban di tempat setelah membaca penjelasan
- [ ] Tidak ada batas percobaan, tidak ada kondisi "gagal"
- [ ] Semua pengguna berakhir di skor 100%
- [ ] Sertifikat tidak mencantumkan angka skor
- [ ] Tidak ada konstanta ambang nilai yang tersisa di kode
- [ ] Registrasi berjalan mandiri tanpa persetujuan Admin, akun belum bisa dipakai sebelum email diverifikasi
- [ ] Reset kata sandi lewat tautan bertoken sementara sekali pakai — tidak pernah kirim kata sandi teks
- [ ] Sertifikat preview tampil dengan QR blur dan badge "Ready To Fly"
- [ ] QR preview **tidak dapat diakalkan** jadi aktif dari front-end — status aktif hanya ditentukan server
- [ ] Checkout Rp 150.000 mewajibkan alamat; Rp 30.000 tidak meminta alamat
- [ ] Pengguna Rp 30.000 dapat menambah merchandise menyusul, alamat diminta pada tahap itu
- [ ] Admin dapat menolak bukti disertai alasan, pengguna dapat mengirim ulang
- [ ] Konfirmasi Admin mengaktifkan QR dan memasukkan sertifikat ke tabel terpadu jenis `free_track`
- [ ] Sertifikat hasil aktivasi langsung dapat diverifikasi di `/verify`
- [ ] Sertifikat free track tersimpan **tanpa** tanggal kedaluwarsa
- [ ] Satu akun hanya satu sertifikat free track — mengulang kuis tidak menerbitkan nomor baru
- [ ] Status pengiriman dapat diperbarui manual oleh Admin
- [ ] Kotak persetujuan **tidak tercentang** saat halaman pertama dibuka

---

## 9. MODUL 4 — KATALOG PRODUK

> BRD Bagian 5.D · Sprint 4 · prompt di `PANDUAN.md` Fase 12

### 9.1 Tujuan

Memindahkan penyajian produk dari percakapan WhatsApp ke halaman yang rapi dan dapat dirujuk, sambil memberi Hexatara kendali penuh atas produk mana yang harganya boleh terlihat publik.

Katalog adalah **etalase dan penangkap lead.** Bukan toko. Tidak ada keranjang belanja, checkout, atau pemrosesan pesanan.

### 9.2 Cerita pengguna

> Sebagai calon pembeli drone untuk keperluan survei lahan, saya membuka katalog Hexatara. Sebagian produk menampilkan harga, sebagian tertulis "Hubungi kami untuk harga" — tapi semuanya menampilkan foto, deskripsi, dan spesifikasi lengkap. Saya isi form permintaan penawaran, dan Admin menghubungi saya.

### 9.3 Daftar fitur

| Kode | Fitur | Prio |
|---|---|---|
| F04.1 | Halaman katalog publik | MUST |
| F04.2 | Halaman detail produk | MUST |
| F04.3 | Tampil/sembunyi harga per produk | MUST |
| F04.4 | Tombol kontak retail | MUST |
| F04.5 | Form permintaan penawaran | MUST |
| F04.6 | Admin: CRUD produk | MUST |

### 9.4 F04.3 — harga tersembunyi

Bagian tersulit di modul ini, dan yang paling mudah dikerjakan asal-asalan.

Produk dengan `tampilkan_harga = false` tetap menampilkan foto, deskripsi, dan spesifikasi lengkap. Yang hilang **hanya angka harganya**, diganti "Hubungi kami untuk harga".

**Angkanya tidak boleh bisa ditemukan lewat inspeksi respons API.** Menyembunyikan di komponen React tidak cukup — angkanya tetap ikut terkirim di payload halaman dan terlihat di tab Network. Karena itu jalur publik **hanya boleh menyentuh view `products_public`**, yang mengembalikan `harga` sebagai NULL di sisi database.

Cara mengujinya: buka detail produk yang harganya disembunyikan → DevTools → Network → cari angkanya di semua respons. **Nol hasil.**

Pengaturan ini **per produk**, bukan per kategori atau per jenis pengguna.

### 9.5 F04.5 — form penawaran

Form biasa: nama, perusahaan, email, WhatsApp, kebutuhan, centang persetujuan.

**Tanpa validasi domain email. Tanpa MX lookup. Tanpa daftar hitam. Tanpa audit log.**

Ini titik scope creep yang secara eksplisit disebut BRD 13.5: AI coding assistant mengenali pola "form email perusahaan" lalu menambahkan pemeriksaan domain karena menganggapnya praktik baik. Di Fase 1 penyaringan calon pembeli dikerjakan Admin secara manual. Seluruh validasi domain adalah **scope Fase 2 yang sudah dianggarkan terpisah.**

Validasi yang boleh ada hanya format email standar (Zod `.email()`).

Setelah tersimpan, kirim email pemberitahuan ke Admin.

### 9.6 Selesai bila

- [ ] Katalog dan detail produk dapat diakses tanpa login
- [ ] Tampil/sembunyi harga berfungsi per produk — produk dengan harga tersembunyi tetap menampilkan foto dan deskripsi lengkap
- [ ] Harga tersembunyi **tidak dapat ditemukan** lewat inspeksi kode halaman atau respons API
- [ ] Tombol kontak retail mengarah ke WhatsApp Admin atau form kontak sederhana
- [ ] Form penawaran menyimpan ke database dan memberi tahu Admin lewat email
- [ ] Tidak ada validasi domain email, MX lookup, maupun audit log di dalam kode
- [ ] Tidak ada keranjang belanja, checkout produk, maupun quotation otomatis
- [ ] Admin dapat menambah, mengubah, menonaktifkan produk tanpa bantuan developer

---

## 9a. MODUL 6 — REDESIGN & UPGRADE SISTEM (FASE 12.5)

> Bukan bagian dari scope asli BRD-HXT-002. Perluasan yang disetujui Alif (pelaksana proyek, InspiraLabs) tanggal 2026-09-09, dikerjakan SEBELUM Sprint 5 (hardening & rilis). Dicatat sebagai ADR-011 s/d ADR-017 di `ENGINEERING.md` Bagian 10, prompt lengkap di `PANDUAN.md` Bagian 12.5. Penomoran "Modul 6" dipakai untuk konsistensi dengan penomoran F0x.x fitur (F06.x) — bukan berarti ada 6 modul resmi di BRD, yang tetap 4 modul utama + 2 modul pendukung sesuai BRD §4.1.

### 9a.1 Tujuan

Dua hal berbeda digabung dalam satu paket kerja karena saling terkait secara visual dan struktural: (1) pengetatan design system jadi "Premium Minimalist" yang konsisten di seluruh halaman publik dan Admin, dan (2) perluasan fungsional pada beberapa titik yang sebelumnya minim (LMS materi freemium, kategori dinamis, navbar Admin, dashboard User). Tidak ada perubahan pada Modul 1–5 yang sudah DONE — ini pendalaman UX dan penyelesaian celah, bukan penulisan ulang dari nol.

### 9a.2 Daftar fitur

| Kode | Fitur | Prio | ADR terkait |
|---|---|---|---|
| F06.1 | Design System v2 — token shadow/transition, komponen reusable (ContentCard, StatusBadge, StarRating, ImageUploadField) | MUST | — |
| F06.2 | LMS materi freemium berbab — kunci progresif, validasi baca, course completion, progress database | MUST | ADR-013, ADR-014 |
| F06.3 | Perbaikan bug alur freemium (user login diminta daftar ulang) | MUST | — |
| F06.4 | Kategori produk & pelatihan dinamis (Admin CRUD) | MUST | ADR-012 |
| F06.5 | Rating bintang manual Admin (opsional, batch & produk) | SHOULD | ADR-011 |
| F06.6 | Hero carousel dari `hero_slides` existing | MUST | ADR-011b |
| F06.7 | Popup berbasis gambar, dua orientasi | MUST | ADR-015 |
| F06.8 | Favicon Hexatara menggantikan indikator loading bawaan browser | SHOULD | — |
| F06.9 | Navbar publik disederhanakan + pemilih bahasa berikon bendera + tombol Masuk | MUST | — |
| F06.10 | Redesign Beranda — urutan section baru, footer lengkap, halaman statis baru | MUST | — |
| F06.11 | Halaman Pelatihan tersendiri — filter, sort, kategori, suggest | MUST | ADR-012 |
| F06.12 | Halaman Produk — galeri multi-gambar, filter, sort, kategori, suggest | MUST | ADR-012 |
| F06.13 | Admin: navbar collapsible dua level menggantikan pola tab | MUST | ADR-017 |
| F06.14 | Admin: DataTable generik (filter, sort, pagination) di semua tabel | MUST | — |
| F06.15 | Admin: ImageUploadField dengan validasi dan crop | MUST | — |
| F06.16 | Admin: sonner toast di semua aksi, ekspor XLSX, reorder soal kuis, Combobox searchable | MUST | ADR-014, ADR-016 |
| F06.17 | Dashboard User — redesign penuh, preview sertifikat, perbaikan bug navigasi transaksi | MUST | — |
| F06.18 | Redesign login/daftar/reset sandi — toggle password, konfirmasi password, validasi inline | MUST | — |
| F06.19 | Audit visual — warna tombol dan UX form publik | SHOULD | — |

Urutan pengerjaan detail (17 blok prompt berurutan, masing-masing dengan rencana-tunggu-persetujuan sebelum kode, uji mandiri, dan commit sendiri) ada di `PANDUAN.md` Bagian 12.5.1 s/d 12.5.17. Urutan blok mengikuti dependency teknis: fondasi design system dulu (12.5.1), lalu perbaikan bug (12.5.2) sebelum restrukturisasi besar LMS (12.5.3) supaya tidak menumpuk bug lama ke struktur baru.

### 9a.3 F06.2 — LMS materi freemium (ringkasan, detail penuh ADR-013)

Materi freemium (F03.1) yang sebelumnya berupa tampilan flat (kemungkinan PDF/PPT) direstrukturisasi jadi pengalaman LMS: materi dipecah jadi banyak bab (`material_chapters`) yang wajib dibaca berurutan, dengan validasi scroll-ke-akhir per bab, course completion, dan progress bar. Bab yang belum terbuka tampil redup di sidebar (bukan disembunyikan). Menu kuis (F03.2, TIDAK berubah sama sekali perilakunya) hanya terbuka setelah 100% bab selesai.

**Batas tegas yang tidak boleh dilanggar:** validasi baca ini HANYA berlaku untuk MATERI, bukan kuis. Kuis (F03.2) tetap 100% correctable, stateless di client, tanpa skor dan tanpa kondisi gagal, persis PRD §8.5 dan larangan §13.3 — blok F06.2 tidak mengubah satu baris pun logic kuis, hanya kapan menu kuis menjadi bisa diklik.

Untuk pengunjung anonim, progress bab disimpan di client (sessionStorage/React state) sampai user mendaftar akun di akhir alur, persis pola kuis F03.2 yang sudah ada — baru ditulis ke `material_progress` setelah pendaftaran. Untuk user yang sudah login, progress langsung tertulis ke database sejak bab pertama.

### 9a.4 F06.3 — perbaikan bug alur freemium

Bug yang dikonfirmasi: user yang sudah login, saat klik "mulai kuis" dari dashboard, diarahkan ke alur kuis anonim (bukan sesi miliknya) — setelah selesai kuis dan klik "dapatkan sertifikat", diminta mengisi form daftar akun lagi, dan setelah login ulang kembali ke kondisi seolah belum pernah mengerjakan apa pun. Akar masalah dikonfirmasi murni soal ALUR/REDIRECT (sistem tidak membedakan pengguna anonim vs yang sudah login saat mengerjakan kuis), bukan progress yang hilang dari database. Perbaikannya: user yang sudah login tidak lagi melalui halaman publik `/kuis` yang sama dengan anonim, dan tombol "dapatkan sertifikat" langsung memproses memakai identitas yang sudah login tanpa form daftar ulang. Alur anonim tidak berubah.

### 9a.5 Batasan yang tetap berlaku penuh

Seluruh 25 larangan di Bagian 13 berlaku tanpa pengecualian untuk Modul 6, dengan catatan eksplisit berikut supaya tidak disalahpahami sebagai pelanggaran:

- Larangan #14 (kuis: tidak ada ambang nilai/kondisi gagal) — F06.2 TIDAK menyentuh kuis, hanya materi. Lihat 9a.3.
- Larangan §13.5/§25 (tidak ada LMS/progres peserta) — larangan ini untuk batch tersertifikasi berbayar (delivery tetap manual WhatsApp Group + Zoom). `material_progress` (ADR-013) khusus materi FREEMIUM, modul yang memang sudah masuk scope BRD sejak awal. Lihat Bagian 5.5.
- Larangan #7 (dependency baru butuh izin eksplisit) — F06.14 (DataTable, kemungkinan TanStack Table) dan F06.15 (crop gambar, kemungkinan react-image-crop) BUTUH konfirmasi eksplisit dari Alif sebelum dipasang. Ini ditandai di blok prompt PANDUAN.md §12.5.11 dan §12.5.12 masing-masing.

### 9a.6 Selesai bila

- [ ] Seluruh F06.1 s/d F06.19 berstatus DONE di `feature-registry.md` dengan bukti uji manual di browser (Definition of Done Bagian 14 berlaku penuh — butir 5 tetap wajib Alif)
- [ ] Kuis (F03.2) tidak mengalami regresi perilaku — tetap correctable, tanpa skor, tanpa kondisi gagal
- [ ] Harga tersembunyi (F04.3) tidak mengalami regresi — diuji ulang lewat Network tab setelah redesign katalog
- [ ] `pnpm knip` bersih, termasuk `papaparse` yang dihapus setelah migrasi XLSX kalau memang sudah tidak dipakai
- [ ] `pnpm build` lolos tanpa error
- [ ] Diuji ulang di 375px untuk seluruh halaman yang tersentuh redesign, termasuk F01–F04 yang sudah DONE sebelumnya (regresi dari komponen bersama seperti ContentCard/DataTable/ImageUploadField)

---

## 10. MODUL PENDUKUNG — ADMIN PANEL

> BRD Bagian 5.E · dikerjakan menyebar di Sprint 1–4

Admin Panel memungkinkan Hexatara mengoperasikan keempat modul utama **secara mandiri tanpa bantuan teknis InspiraLabs.** Itu indikator keberhasilan, bukan fitur tambahan.

| Area | Kemampuan | Sprint |
|---|---|---|
| Batch pelatihan | Tambah, ubah, tutup batch; status Open/Closed/Upcoming; kelola benefit, silabus, FAQ, galeri, jadwal, lokasi, peralatan | 1 |
| Konten landing | Kelola isi & status aktif pop-up, hero, instruktur, company profile, testimoni | 1 |
| Sale banner | Judul, teks penawaran, pesan urgensi, teks & tautan tombol, periode tayang, aktif/nonaktif | 1 |
| Lead | Lihat pendaftaran minat & permintaan penawaran, ekspor XLSX | 1, 4 |
| Sertifikat | Import massal; tambah & ubah satuan; kedaluwarsa bawaan +2 tahun; lihat status | 2 |
| Pembayaran free track | Antrean upgrade; verifikasi/tolak bukti + alasan; aktifkan QR; proses merchandise menyusul; perbarui status pengiriman | 3 |
| Materi & kuis | Kelola materi; kelola bank soal + penjelasan tiap opsi salah | 3 |
| Produk | Tambah, ubah, nonaktifkan; foto, deskripsi, urutan, tampil/sembunyi harga | 4 |
| Pengaturan | Rekening bank, nomor WA, teks global — lewat `site_settings` | 1 |

### 10.1 Batas Admin Panel

**Tidak ada** laporan analitik, grafik penjualan, manajemen peran bertingkat, atau log aktivitas menyeluruh. Batasnya persis daftar di atas. BRD 13.5.

### 10.2 Kenapa Admin butuh editor teks

Silabus adalah daftar bernomor. Deskripsi batch butuh paragraf dan penekanan. Company profile butuh struktur. Dengan `<textarea>` polos, Abi tidak punya cara membuat itu — dan indikator "Kemandirian Admin" gagal sejak hari pertama. Karena itu Tiptap dipasang untuk kolom `deskripsi_*`, `silabus_*`, dan `konten_*`.

---

## 11. MODUL PENDUKUNG — EMAIL TRANSAKSIONAL

> BRD Bagian 5.E

Email dipilih sebagai kanal notifikasi karena lebih stabil dibanding WhatsApp yang berisiko diblokir Komdigi.

| Pemicu | Penerima | Isi |
|---|---|---|
| Registrasi akun | Pengguna | Tautan verifikasi email |
| Permintaan reset kata sandi | Pengguna | Tautan bertoken, sekali pakai |
| Admin menyetujui pembayaran | Pengguna | QR aktif, sertifikat bisa diunduh |
| Admin menolak bukti | Pengguna | Alasan + minta kirim ulang |
| Lead baru masuk | Admin | Ada pendaftaran minat / permintaan penawaran |

**Email keenam adalah pelanggaran scope.** Tanpa email selamat datang, tanpa pengingat berkala, tanpa ringkasan, tanpa kampanye promosi.

Sistem **tidak pernah** mengirim kata sandi dalam bentuk teks, dalam keadaan apa pun.

Pengiriman lewat Resend. Di produksi, Supabase Auth diarahkan ke Custom SMTP Resend — SMTP bawaan Supabase dibatasi beberapa email per jam dan ditujukan untuk testing.

---

## 12. DESAIN

### 12.1 Prinsip yang disepakati

- **Keterbacaan 3 detik** — penawaran inti dipahami tanpa scroll dan tanpa membaca teks panjang
- **Mobile-first mutlak** — tulis untuk 375px dulu, lebarkan dengan `sm:` `md:` `lg:`. Bukan sebaliknya
- **Zero confusion** — navigasi linear, tanpa menu yang tidak relevan
- **Aksesibilitas** — font besar, kontras tinggi. Pengguna sampai usia 70 tahun
- **Minimalis dan modern profesional**

### 12.2 Design token

```css
--warna-utama:     #1E40AF;   /* biru profesional */
--warna-aksen:     #F59E0B;   /* oranye, CTA */
--warna-sukses:    #059669;   /* sertifikat berlaku */
--warna-bahaya:    #DC2626;   /* sertifikat invalid */
--warna-teks:      #111827;
--warna-teks-2:    #4B5563;
--warna-latar:     #FFFFFF;
--warna-latar-2:   #F9FAFB;
```

Font: `Inter` untuk semua. Tanpa font kedua. Tanpa dark mode.

### 12.3 Aturan yang diuji, bukan aspirasi

| Aturan | Nilai | Kenapa |
|---|---|---|
| Font dasar | 16px, jangan lebih kecil | Pengguna sampai usia 70 |
| Teks sekunder | minimum 14px | Sama |
| Area sentuh | minimum 44×44px | Jempol, bukan kursor |
| Kontras | minimum 4.5:1 | WCAG AA |
| Navigasi | header + hamburger di mobile | Situs publik, bukan aplikasi — bukan bottom nav |

**Landing page di 375px wajib menampilkan dua penawaran inti — pelatihan drone dan penjualan drone — tanpa scroll.** Ini acceptance criteria yang diuji. **Ukur dengan DevTools, jangan dikira-kira.**

### 12.4 Referensi desain

| Sumber | Yang diadaptasi | Yang dihindari |
|---|---|---|
| **ASBIM** (asbim.id) | Struktur hero diikuti daftar jadwal; format card batch; susunan halaman detail; company profile di bawah landing | Bug deklarasi ganda `togglePassword`; kehilangan konteks saat diarahkan ke login; layar transisi palsu yang tetap memuat ulang penuh |
| **DroneTrust** (trust.dronetrust.com) | Alur freemium; model kuis correctable; UX dashboard sertifikat; badge status konsisten; pola sale banner | Kotak persetujuan tercentang default; reset kata sandi yang mengirim sandi baru lewat email; hitung mundur berjalan; banner yang menutupi fungsi utama halaman |

---

## 13. ATURAN UNTUK AI

Daftar lengkap 25 larangan ada di bagian ini sendiri (di bawah). Ini yang paling sering dilanggar, dikelompokkan menurut alasannya.

### 13.1 Database & infrastruktur

1. Jangan membuat tabel atau kolom yang tidak ada di Bagian 5
2. Jangan menjalankan SQL migrasi — usulkan, user yang mengeksekusi manual
3. Jangan memakai `SUPABASE_SERVICE_ROLE_KEY` di kode mana pun yang dikirim ke browser
4. Jangan menonaktifkan RLS "sementara supaya jalan dulu"
5. Jangan membuat policy `profiles` yang subquery ke `profiles` — pakai `is_admin()`
6. Jangan memakai API khusus Vercel — sistem pindah ke VPS
7. Jangan memasang dependency baru tanpa izin eksplisit

### 13.2 Pembayaran & sertifikat

8. Jangan memasang payment gateway apa pun, termasuk Midtrans
9. Jangan mengaktifkan QR otomatis dari notifikasi bank, mutasi rekening, atau pembacaan bukti
10. Jangan memberi sertifikat `free_track` tanggal kedaluwarsa, pengingat perpanjangan, atau alur renewal
11. Jangan menyeragamkan masa berlaku semua jenis sertifikat
12. Jangan mengirim token QR asli ke klien sebelum Admin mengaktifkan
13. Jangan memasang tanda tangan digital tersertifikasi atau enkripsi berlapis

### 13.3 Kuis

14. Jangan menambahkan ambang nilai minimum, kondisi gagal, atau batas percobaan
15. Jangan menambahkan timer, papan peringkat, atau penyimpanan riwayat skor
16. Jangan mencantumkan angka skor di sertifikat
17. Jangan memakai satu penjelasan umum untuk semua opsi salah

### 13.4 Konten & katalog

18. Jangan mengubah sale banner jadi mesin promo: kupon, harga coret, diskon bertingkat
19. Jangan menambahkan hitung mundur berjalan di banner
20. Jangan menambahkan validasi domain email, MX lookup, atau audit log di form penawaran
21. Jangan membangun keranjang belanja, checkout produk, atau alur pemesanan
22. Jangan membuat generator quotation atau invoice otomatis

### 13.5 Komunikasi & scope

23. Jangan memasang WhatsApp Gateway, blast, chatbot, atau balasan otomatis
24. Jangan menambahkan email di luar lima pemicu di Bagian 11
25. Jangan menambahkan LMS, manajemen kelas, absensi, progres peserta, dashboard korporat, peran instruktur, atau grafik analitik

### 13.6 Kalau merasa salah satu larangan ini keliru

**Katakan.** Jangan diam-diam melanggarnya, dan jangan juga diam-diam mematuhinya kalau menurutmu ada masalah nyata. Larangan ini keputusan bisnis yang bisa ditinjau ulang — tapi peninjauannya lewat percakapan dan dicatat sebagai ADR baru, bukan lewat kode yang sudah terlanjur ditulis.

---

## 14. DEFINITION OF DONE

Sebuah fitur berstatus `DONE` hanya kalau **kelimanya** terpenuhi. Empat pertama boleh dikerjakan agent, **yang kelima wajib Alif.**

1. `pnpm tsc --noEmit` dan `pnpm lint` bersih
2. Seluruh acceptance criteria fitur ini di PRD sudah dicek satu per satu
3. Diuji di viewport 375px — tanpa scroll horizontal, tanpa elemen terpotong
4. Tidak melanggar satu pun dari 25 larangan di Bagian 13
5. **Alif membuka sendiri di browser, mengklik sendiri, hasilnya sesuai** ← tanpa ini tetap `WIP`

**Agent tidak pernah menandai DONE atas inisiatifnya sendiri.** Ini rem tangannya: tanpa aturan ini, fitur diklaim selesai berdasarkan apakah kodenya masuk akal, bukan apakah ia berjalan.

Kolom **Bukti** di `feature-registry.md` diisi apa yang benar-benar diuji.

Buruk: `sudah dites, jalan`
Baik: `HXT-CERT-000002 (exp 2025-01-20) tampil Invalid merah; HXT-FT-000001 tampil "tanpa masa berlaku" hijau; nomor ngawur tampil "tidak ditemukan" abu-abu`

Enam bulan lagi, saat menyusun manual book atau mengerjakan Fase 2, contoh buruk tidak memberi tahu apa pun. Contoh baik memberi tahu segalanya — dan sudah setengah jadi sebagai isi manual book.

---

## 15. YANG TIDAK TERMASUK FASE 1

Penambahan salah satu butir ini merupakan **perubahan scope yang memerlukan kesepakatan tertulis kedua pihak.**

| Butir | Rencana |
|---|---|
| LMS Advance — materi mitra ("Uncle Sam"/Emergent) | Fase 3, menunggu MOU |
| LMS Basic untuk batch RPC | Fase 2. Delivery tetap manual lewat WhatsApp Group + Zoom |
| Payment gateway otomatis | Fase 2 |
| WhatsApp Gateway / blast otomatis | Tidak direncanakan. Risiko pemblokiran Komdigi |
| Validasi domain email 3 lapis | Fase 2, bersama jalur B2B |
| Otomasi quotation & invoice | Fase 3 |
| Mesin promo/kupon otomatis | Tidak direncanakan |
| Dashboard korporat B2B | Fase 2, perlu klarifikasi model kuota |
| Sinkronisasi Google Workspace / Spreadsheet | Digantikan ekspor XLSX manual |
| Produk counter-UAS | Lini produk masa depan |
| Tanda tangan digital tersertifikasi | Belum tentu diakui regulator |
| Aplikasi mobile native | Web responsif mobile-first dinilai memadai |
| Integrasi Google Meet API | Tidak relevan tanpa LMS berbayar |

> **Catatan soal LMS Basic untuk batch RPC (baris kedua tabel di atas).** Ini TETAP di luar scope Fase 1, tidak berubah. Modul 6/Fase 12.5 (Bagian 9a) yang menambahkan `material_chapters`/`material_progress` adalah LMS untuk MATERI FREEMIUM (Modul 3, yang sejak awal memang bagian resmi BRD) — bukan LMS untuk batch RPC berbayar. Delivery batch RPC tetap manual lewat WhatsApp Group + Zoom, tidak tersentuh oleh Modul 6.

---

## 16. YANG MASIH DITUNGGU DARI PIHAK LAIN

Sebagian menahan go-live modul terkait. Kolom terakhir menentukan apakah pengembangan boleh jalan terus.

| Item | PIC | Menahan? |
|---|---|---|
| Bank soal kuis + **penjelasan tiap opsi salah**, dua bahasa | Hexatara | **Ya — UAT & go-live Modul 3.** Beban konten terbesar di Fase 1. Minta sekarang, jangan tunggu Sprint 3 |
| Template PDF sertifikat | Hexatara | **Ya — F03.4** |
| Materi PPT free track (Bahasa Indonesia) | Hexatara | **Ya — go-live Modul 3** |
| Data katalog produk: daftar, foto, deskripsi, mana yang harganya tampil | Hexatara | **Ya — go-live Modul 4** |
| Konten landing: foto instruktur, dokumentasi, company profile, testimoni | Hexatara | **Ya — go-live Modul 1** |
| Rekening tujuan transfer + alur konfirmasi | Hexatara & InspiraLabs | **Ya — go-live Modul 3** |
| Perpanjangan domain hexatara.com + pengarahan DNS | Abi | **Ya — seluruh go-live** |
| Data sertifikat existing | Abi | Tidak — Modul 2 dibangun penuh dengan data seed |
| Konten Bahasa Inggris | Hexatara | Tidak — fallback ke Indonesia |
| Konfirmasi nominal merchandise menyusul (asumsi Rp 120.000) | Hexatara | Tidak — perlu dikunci sebelum UAT Modul 3 |
| Persetujuan rate limit `/verify` | Hexatara | Tidak — di balik feature flag |
| Persetujuan add-on terjemahan otomatis | Hexatara | Tidak — ADR-007 |
| Format berkas import sertifikat massal | InspiraLabs, dikonfirmasi Hexatara | Perlu disepakati sebelum data existing dikirim |
| Pengalihan kepemilikan akun Hostinger | Abi | Tidak — kerapian administrasi |

---

## 17. UAT BERTAHAP

Diserahkan **per modul** begitu modul itu selesai, tidak menunggu keempatnya rampung (BRD 13.6). Penyimpangan yang ditemukan di minggu kedua jauh lebih murah diperbaiki daripada yang ditemukan di minggu kedelapan.

1. Pengujian internal diselesaikan InspiraLabs dulu, sebelum modul diserahkan
2. Modul diserahkan bersama daftar acceptance criteria di PRD ini sebagai panduan pengecekan
3. Umpan balik **dipilah dulu**: perbaikan dalam scope dikerjakan, permintaan baru dicatat sebagai kandidat Fase 2
4. Serah terima akhir ditandatangani setelah seluruh acceptance criteria terpenuhi dan disepakati per fitur

> Umpan balik yang langsung dikerjakan tanpa dipilah adalah persis bagaimana proyek delapan minggu berubah jadi empat belas minggu tanpa ada yang memutuskannya.

---

*Turunan dari BRD-HXT-002 v1.1. Kalau ada pertentangan, BRD yang menang — dan dokumen ini yang harus diperbaiki.*
