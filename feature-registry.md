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
| F00.5 | Layout publik + pemilih bahasa + floating WA | DONE | `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/components/public-nav-mobile.tsx`, `src/components/floating-whatsapp.tsx` | 2026-09-06 | Alif menguji sendiri, hasil sesuai; sudah berganti font dan sudah berubah menjadi hamburger ketika resize |
| F00.6 | Auth: daftar, login, verifikasi email, reset sandi | TODO | `src/app/[locale]/(auth)/` |  | |
| F00.7 | Login Admin terpisah + `requireAdmin()` | TODO | `src/lib/auth/guard.ts` |  | |
| F00.8 | Kerangka Admin Panel | DONE | `src/app/admin/(protected)/layout.tsx`, `src/components/admin/admin-sidebar.tsx`, `src/components/admin/admin-stub-page.tsx`, `src/app/admin/(protected)/{batch,konten,leads,sertifikat,upgrade,materi,produk,pengaturan}/page.tsx` | 2026-09-06 | Alif menguji sendiri, hasil sesuai; sudah berganti font dan sudah berubah menjadi hamburger ketika resize |
| F00.9 | Helper Resend + template email | TODO | `src/lib/email/` |  | |
| F00.10 | Design tokens | DONE | `src/app/globals.css`, `src/app/layout.tsx` | 2026-09-06 | Alif menguji sendiri, hasil sesuai; sudah berganti font dan sudah berubah menjadi hamburger ketika resize |

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
| Akses DNS hexatara.com | Abi | Menghambat deploy produksi + verifikasi domain Resend. **Yang diminta dari Abi: BUKAN login/kredensial Hostinger — cukup Abi bersedia menambahkan record DNS yang kita kirimkan ke panel Hostinger miliknya.** Alurnya: (1) kita generate record dari Resend → Domains → Add Domain → `hexatara.com` (Resend menampilkan ~3 record: SPF/TXT, DKIM/CNAME, opsional DMARC); (2) kita generate record juga dari Vercel → Settings → Domains → Add `hexatara.com` (biasanya A/CNAME) saat masuk Fase 14.1; (3) kedua batch record itu dikirim ke Abi sekaligus atau berdekatan waktu, minta dipasang di Hostinger; (4) setelah Abi konfirmasi terpasang, cek status di Resend → Domains (Pending → Verified, propagasi bisa beberapa menit–jam). | |
| Verifikasi domain Resend (`hexatara.com`) — akun Resend baru dibuat InspiraLabs, sandbox `onboarding@resend.dev` dipakai untuk dev F00.9. **Terkonfirmasi via tes API langsung (2026-09-06): sandbox HANYA bisa kirim ke alamat persis pemilik akun Resend (`hexatara.inspiralabs@gmail.com`) — alias Gmail dari akun lain seperti `inspiradrive9+test1@gmail.com` DITOLAK (403 validation_error: "You can only send testing emails to your own email address"). Untuk testing F00.9/auth pakai `hexatara.inspiralabs@gmail.com` atau alias di domain yang sama (`hexatara.inspiralabs+test1@gmail.com` dst — belum dicoba, kemungkinan besar diterima karena base address sama).** | Akses DNS hexatara.com (baris di atas) | Tidak menghambat F00.9 (dev jalan pakai sandbox, asal kirim ke alamat pemilik akun). Menghambat Fase 14.3 (Custom SMTP produksi + kirim ke alamat selain milik sendiri) | 2026-09-06 |
| Data sertifikat existing | Abi | Tidak menghambat — Modul 2 dibangun penuh dengan data seed | |
| Konten Bahasa Inggris | Hexatara | Tidak menghambat — fallback ke Indonesia | |
| Persetujuan rate limit /verify | Hexatara | Tidak menghambat — di balik feature flag | |
| Persetujuan add-on terjemahan otomatis | Hexatara | Tidak menghambat — ADR-007 | |
| Rate limit email bawaan Supabase (429 pada /auth/v1/recover) | Waktu (jendela rate limit direset otomatis) | Menghambat pengujian reset sandi F00.6 sampai tuntas — bukan bug kode, terkonfirmasi via Auth Logs Supabase | 2026-09-06 |

---

## Log verifikasi

> Ditambah tiap kali Alif menguji sesuatu. Ini bahan mentah manual book sekaligus bukti serah terima.
> Satu baris per pengujian. Cukup satu kalimat, tapi kalimat yang berisi.

```
2026-XX-XX  F0X.Y  apa yang diuji, dengan data apa, hasilnya apa
2026-09-06  F00.2/F00.3  Alif menguji sendiri hasil sesuai; verifikasi tambahan: client.ts & admin.ts konek ke project Supabase live, admin client sukses panggil rpc is_admin() (200 OK), nama tabel/kolom di database.ts cocok skema live (site_settings/profiles ada, hanya permission denied 42501 karena GRANT anon/service_role belum diberikan)
2026-09-06  F00.6  Claude menguji via browser otomatis (sebagai bantuan, BUKAN pengganti verifikasi Alif): daftar akun baru (+test2) -> login sebelum verifikasi email diklik ditolak dengan pesan "Email belum diverifikasi" -> klik link verifikasi dari email asli -> login berhasil. Masih perlu Alif klik sendiri untuk memenuhi Definition of Done butir 5.
2026-09-06  F00.6  Reset sandi BELUM bisa diuji tuntas — permintaan ke /auth/v1/recover kena 429 (rate limit email bawaan Supabase, bukan custom SMTP/Resend). Terkonfirmasi lewat Authentication > Logs. Ulangi setelah jendela rate limit reset, atau pasang SMTP kustom (Resend, F00.9) untuk hilangkan batasan ini.
2026-09-06  F00.7  requireAdmin() terverifikasi lewat tinjauan kode dipanggil eksplisit di actions.ts (bukan cuma layout.tsx), sesuai batasan PANDUAN.md 7.3. Pembuktian black-box (coba Server Action langsung sebagai non-admin) tertunda: satu-satunya admin action saat ini (logoutAdminAction) tidak bisa dibedakan hasilnya secara visual (requireAdmin gagal ATAU signOut sukses sama-sama redirect ke /admin/login). Uji black-box definitif ditunda ke Sprint 1 saat ada admin action dengan efek data nyata (mis. CRUD batch F01.12).
2026-09-06  (observasi, bukan blocker) Beberapa request dev server (POST /admin/login, GET /admin?_rsc=, prefetch /lupa-sandi) sesekali mengembalikan 503 lalu berhasil di percobaan berikutnya. Diamati 3x selama sesi pengujian F00.6/F00.7. Belum jelas penyebabnya (dugaan: Turbopack recompile saat dev). Tidak menghambat fungsi, tapi layak dipantau — kalau pola berulang di Sprint 1, cek log `pnpm dev` saat momen itu terjadi.
2026-09-06  F00.5/F00.10  `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` bersih. Claude menguji via browser otomatis (sebagai bantuan, BUKAN pengganti verifikasi Alif) di viewport 375px pada `/`: tidak ada scroll horizontal (scrollWidth == clientWidth == 360px), header + hamburger + footer + tombol WA mengambang tampil benar, hamburger membuka drawer berisi 4 link nav (Beranda/Verifikasi Sertifikat/Materi & Kuis/Katalog Produk) dan menutup lagi saat link diklik. Kode tombol WA hanya `<a href="wa.me/...">`, tidak ada `fetch`/API. Masih perlu Alif buka sendiri untuk memenuhi Definition of Done butir 5.
2026-09-06  (setup Resend, bukan fitur berkode) Alif mendaftarkan akun Resend baru atas nama InspiraLabs (hexatara.inspiralabs@gmail.com). Dites kirim via API langsung (PowerShell Invoke-RestMethod) ke inspiradrive9+test1@gmail.com -> ditolak 403 ("You can only send testing emails to your own email address"). Terkonfirmasi: sandbox onboarding@resend.dev cuma bisa kirim ke hexatara.inspiralabs@gmail.com persis. Berlaku untuk testing F00.9 dan seluruh alur email/auth sampai domain hexatara.com terverifikasi (Fase 14.3).
2026-09-06  F00.9  Verifikasi kode terpenuhi: `src/lib/email/templates.ts` berisi tepat LIMA fungsi template (templateVerifikasiEmail, templateResetSandi, templatePembayaranDisetujui, templatePembayaranDitolak, templateLeadBaru), `send.ts` punya lima fungsi pengirim sepadan — sesuai batasan lima pemicu di PANDUAN.md 7.5. Uji daftar akun di /daftar: email verifikasi masuk, tapi TERKONFIRMASI lewat Supabase (SMTP bawaan), BUKAN lewat Resend (tidak ada jejak di Resend Logs) — ini benar sesuai desain, karena Custom SMTP baru diarahkan ke Resend di Fase 14.3. Uji "matikan RESEND_API_KEY -> kirim form -> data tetap tersimpan, aplikasi tidak error" BELUM BISA dilakukan: dicek `grep` di src/app, belum ada satu pun pemanggil kirimEmailLeadBaru/Verifikasi/ResetSandi/PembayaranDisetujui/PembayaranDitolak — sesuai scope 7.5 ("pemanggilnya menyusul di sprint yang membutuhkan"). F01.6 (form lead, TODO) adalah pemanggil pertama yang akan tersedia. Ditunda: uji ulang saat F01.6 atau fitur pembayaran dibangun, lewat form sungguhan seperti pola F01.6 di PANDUAN.md (matikan RESEND_API_KEY -> kirim form -> data tetap tersimpan).
2026-09-06  F00.8  Claude menguji via browser otomatis: `/admin` tanpa sesi tetap redirect ke `/admin/login` (requireAdmin() di layout tidak rusak oleh perubahan sidebar). Sembilan halaman menu (`/admin/batch`, `konten`, `leads`, `sertifikat`, `upgrade`, `materi`, `produk`, `pengaturan`, + beranda) berhasil di-build sebagai rute dinamis (lihat output `pnpm build`). Tampilan sidebar saat login BELUM diverifikasi visual — tidak ada kredensial admin di sesi ini. Alif perlu login sendiri dan cek: sidebar penuh di desktop, drawer hamburger di 375px, seluruh 9 menu di PRD §4 muncul, untuk memenuhi Definition of Done butir 5.
2026-09-06  F00.5/F00.8/F00.10  Alif menguji sendiri di browser, hasil sesuai: font sudah berganti (Inter) dan nav publik/sidebar admin sudah berubah menjadi hamburger saat viewport di-resize ke ukuran mobile. Ketiganya DONE.
```

---

## Saat modul selesai

1. Semua barisnya `DONE` dengan kolom Bukti terisi
2. Salin `docs/AS_BUILT/_TEMPLATE.md` jadi `docs/AS_BUILT/M[n]-[nama].md`, isi dari yang
   **benar-benar dibangun** — bukan dari rencana
3. Serahkan ke Hexatara untuk UAT bersama daftar acceptance criteria Bagian 10
4. Isi baris modul itu di tabel UAT di atas
