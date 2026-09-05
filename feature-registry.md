# HEXATARA — FEATURE REGISTRY

> Checklist hidup. Satu baris per sub-fitur. Dimuat otomatis tiap sesi Claude Code.
>
> **Status hanya boleh berubah jadi DONE setelah Alif mengetes sendiri dan mengonfirmasi.**
> AI agent tidak pernah menandai DONE atas inisiatifnya sendiri. Ini rem tangannya: tanpa aturan ini,
> fitur diklaim selesai berdasarkan apakah kodenya masuk akal, bukan apakah ia berjalan.

---

## DEFINITION OF DONE

Sebuah fitur berstatus `DONE` hanya kalau kelimanya terpenuhi.
Empat pertama boleh dikerjakan agent, **yang kelima wajib Alif.**

1. `pnpm tsc --noEmit` dan `pnpm lint` bersih
2. Seluruh acceptance criteria fitur ini di `ENGINEERING.md` Bagian 10 sudah dicek satu per satu
3. Diuji di viewport 375px — tanpa scroll horizontal, tanpa elemen terpotong
4. Tidak melanggar satu pun dari 25 larangan di Bagian 9
5. **Alif membuka sendiri di browser, mengklik sendiri, hasilnya sesuai** ← tanpa ini tetap `WIP`

Kolom **Bukti** diisi apa yang benar-benar diuji, bukan kata "sudah dites".

Contoh buruk: `sudah dites, jalan`
Contoh baik: `HXT-CERT-000002 (exp 2025-01-20) tampil Invalid merah; HXT-FT-000001 tampil "tanpa masa berlaku" hijau; nomor ngawur tampil "tidak ditemukan" abu-abu`

Enam bulan lagi, saat menyusun manual book atau mengerjakan Fase 2, contoh buruk tidak memberi tahu
apa pun. Contoh baik memberi tahu segalanya — dan sudah setengah jadi sebagai isi manual book.

**Status:** `TODO` · `WIP` · `DONE` · `SKIP` · `BLOCKED`

---

## Sprint 0 — Fondasi

| Kode | Fitur | Status | Berkas | Diuji | Bukti |
|---|---|---|---|---|---|
| F00.1 | Project Next.js + TS + Tailwind + shadcn | TODO | |  | |
| F00.2 | Supabase client (client/server/admin) | DONE | `src/lib/supabase/` | 2026-09-06 | Alif menguji sendiri, hasil sesuai; diverifikasi tambahan: client.ts & admin.ts terhubung ke project Supabase live (ojltfmvmbolalhtzrhva), admin client sukses memanggil rpc `is_admin()` (200 OK) |
| F00.3 | Tipe database generated | DONE | `src/types/database.ts` | 2026-09-06 | Alif menguji sendiri, hasil sesuai; diverifikasi tambahan: nama tabel/kolom di database.ts cocok dengan skema live (query ke `site_settings`/`profiles` tidak error nama relasi/kolom, hanya permission denied 42501 karena GRANT belum diberikan ke anon/service_role) |
| F00.4 | next-intl + middleware + messages | TODO | `src/i18n/`, `messages/` |  | |
| F00.5 | Layout publik + pemilih bahasa + floating WA | TODO | `src/app/[locale]/layout.tsx` |  | |
| F00.6 | Auth: daftar, login, verifikasi email, reset sandi | TODO | `src/app/[locale]/(auth)/` |  | |
| F00.7 | Login Admin terpisah + `requireAdmin()` | TODO | `src/lib/auth/guard.ts` |  | |
| F00.8 | Kerangka Admin Panel | TODO | `src/app/admin/` |  | |
| F00.9 | Helper Resend + template email | TODO | `src/lib/email/` |  | |
| F00.10 | Design tokens | TODO | `src/app/globals.css` |  | |

## Sprint 1 — Modul 1: Landing Page

| Kode | Fitur | Status | Berkas | Diuji | Bukti |
|---|---|---|---|---|---|
| F01.1 | Pop-up pembuka | TODO | |  | |
| F01.2 | Sale banner | TODO | |  | |
| F01.3 | Hero produk unggulan | TODO | |  | |
| F01.4 | Section jadwal pelatihan | TODO | |  | |
| F01.5 | Halaman detail batch | TODO | |  | |
| F01.6 | Form pendaftaran minat → DB + WA | TODO | |  | |
| F01.7 | Galeri instruktur | TODO | |  | |
| F01.8 | Company profile | TODO | |  | |
| F01.9 | Floating WhatsApp button | TODO | |  | |
| F01.10 | Testimoni | TODO | |  | |
| F01.11 | Pemilih bahasa di semua halaman publik | TODO | |  | |
| F01.12 | Admin: CRUD batch + isi halaman detail | TODO | |  | |
| F01.13 | Admin: CRUD konten landing | TODO | |  | |
| F01.14 | Admin: daftar lead + ekspor CSV | TODO | |  | |

## Sprint 2 — Modul 2: Verifikasi Sertifikat

| Kode | Fitur | Status | Berkas | Diuji | Bukti |
|---|---|---|---|---|---|
| F02.1 | `/verify` form pencarian | TODO | |  | |
| F02.2 | `/verify/[token]` hasil QR | TODO | |  | |
| F02.3 | Tampilan hasil (5 kolom saja) | TODO | |  | |
| F02.4 | Status kedaluwarsa otomatis | TODO | |  | |
| F02.5 | Sertifikat tanpa masa berlaku | TODO | |  | |
| F02.6 | Pesan tidak ditemukan | TODO | |  | |
| F02.7 | Admin: CRUD sertifikat satuan | TODO | |  | |
| F02.8 | Admin: import massal + laporan per baris | TODO | |  | |
| F02.9 | Rate limit (feature flag) | TODO | |  | |

## Sprint 3 — Modul 3: Sertifikat Gratis

| Kode | Fitur | Status | Berkas | Diuji | Bukti |
|---|---|---|---|---|---|
| F03.1 | Halaman materi tanpa login | TODO | |  | |
| F03.2 | Mesin kuis correctable | TODO | |  | |
| F03.3 | Registrasi + verifikasi email | SKIP | — | Sudah tercakup F00.6, tidak dikerjakan dua kali  | |
| F03.4 | Sertifikat preview (QR blur + badge) | TODO | |  | |
| F03.5 | Pilih paket upgrade | TODO | |  | |
| F03.6 | Unggah bukti transfer | TODO | |  | |
| F03.7 | Admin: verifikasi / tolak pembayaran | TODO | |  | |
| F03.8 | Aktivasi QR + terbitkan sertifikat | TODO | |  | |
| F03.9 | Dashboard pengguna | TODO | |  | |
| F03.10 | Tambah merchandise menyusul | TODO | |  | |
| F03.11 | Admin: status pengiriman | TODO | |  | |
| F03.12 | Admin: CRUD materi | TODO | |  | |
| F03.13 | Admin: CRUD bank soal + import Excel | TODO | |  | |

## Sprint 4 — Modul 4: Katalog Produk

| Kode | Fitur | Status | Berkas | Diuji | Bukti |
|---|---|---|---|---|---|
| F04.1 | Halaman katalog | TODO | |  | |
| F04.2 | Halaman detail produk | TODO | |  | |
| F04.3 | Tampil/sembunyi harga per produk | TODO | |  | |
| F04.4 | Tombol kontak retail | TODO | |  | |
| F04.5 | Form permintaan penawaran | TODO | |  | |
| F04.6 | Admin: CRUD produk | TODO | |  | |

## Sprint 5 — Hardening & Deploy

| Kode | Fitur | Status | Berkas | Diuji | Bukti |
|---|---|---|---|---|---|
| F05.1 | Audit aksesibilitas | TODO | |  | |
| F05.2 | Lighthouse mobile ≥ 90 | TODO | |  | |
| F05.3 | Halaman 404 & 500 dwibahasa | TODO | |  | |
| F05.4 | SEO + sitemap + hreflang | TODO | |  | |
| F05.5 | Sentry | TODO | |  | |
| F05.6 | Verifikasi backup Supabase | TODO | |  | |
| F05.7 | Deploy + domain + SSL | TODO | |  | |
| F05.8 | Isi `AS_BUILT/` keempat modul | TODO | |  | |

---

---

## UAT bersama Hexatara

Diserahkan per modul begitu modul itu selesai, tidak menunggu keempatnya rampung (BRD §13.6).
Penyimpangan yang ditemukan di minggu kedua jauh lebih murah diperbaiki daripada yang ditemukan
di minggu kedelapan.

| Modul | Uji internal | Diserahkan | Umpan balik | Disetujui |
|---|---|---|---|---|
| 1 — Landing | | | | |
| 2 — Verifikasi | | | | |
| 3 — Sertifikat Gratis | | | | |
| 4 — Katalog | | | | |

Umpan balik yang masuk **dipilah dulu**: perbaikan dalam scope dikerjakan, permintaan baru dicatat
di tabel bawah sebagai kandidat Fase 2. Jangan langsung dikerjakan — itu persis bagaimana proyek
delapan minggu berubah jadi empat belas minggu tanpa ada yang memutuskannya.

### Permintaan di luar scope (kandidat Fase 2)

| Tanggal | Dari | Permintaan | Kenapa ditunda |
|---|---|---|---|
| | | | |

---

## Diblokir / menunggu pihak lain

| Hal | Menunggu | Dampak | Diminta sejak |
|---|---|---|---|
| Soal kuis + penjelasan tiap opsi salah | Hexatara | **Menghambat UAT Modul 3.** Minta sekarang, jangan tunggu Sprint 3 tiba | |
| Template PDF sertifikat | Hexatara | Menghambat F03.4 | |
| Akses DNS hexatara.com | Abi | Menghambat deploy produksi + verifikasi domain Resend | |
| Data sertifikat existing | Abi | Tidak menghambat — Modul 2 dibangun penuh dengan data seed | |
| Konten Bahasa Inggris | Hexatara | Tidak menghambat — fallback ke Indonesia | |
| Persetujuan rate limit /verify | Hexatara | Tidak menghambat — di balik feature flag | |
| Persetujuan add-on terjemahan otomatis | Hexatara | Tidak menghambat — ADR-007 | |

---

## Log verifikasi

> Ditambah tiap kali Alif menguji sesuatu. Ini bahan mentah manual book sekaligus bukti serah terima.
> Satu baris per pengujian. Cukup satu kalimat, tapi kalimat yang berisi.

```
2026-XX-XX  F0X.Y  apa yang diuji, dengan data apa, hasilnya apa
2026-09-06  F00.2/F00.3  Alif menguji sendiri hasil sesuai; verifikasi tambahan: client.ts & admin.ts konek ke project Supabase live, admin client sukses panggil rpc is_admin() (200 OK), nama tabel/kolom di database.ts cocok skema live (site_settings/profiles ada, hanya permission denied 42501 karena GRANT anon/service_role belum diberikan)
```

---

## Saat modul selesai

1. Semua barisnya `DONE` dengan kolom Bukti terisi
2. Salin `docs/AS_BUILT/_TEMPLATE.md` jadi `docs/AS_BUILT/M[n]-[nama].md`, isi dari yang
   **benar-benar dibangun** — bukan dari rencana
3. Serahkan ke Hexatara untuk UAT bersama daftar acceptance criteria Bagian 10
4. Isi baris modul itu di tabel UAT di atas
