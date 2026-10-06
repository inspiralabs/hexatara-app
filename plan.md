# Plan — Temuan UAT Internal #1 (24 September 2026)

> Status: **SIAP DIUJI ALIF DI BROWSER.** Tiga temuan dikerjakan Cursor 25 Sep 2026 (~01:00 WIB).
> Referensi lengkap ada di prompt asli (Cowork). **JANGAN tandai DONE di feature-registry** sampai Alif konfirmasi browser.

## Ringkasan tiga temuan

| # | Temuan | Status |
|---|---|---|
| 1 | Dashboard belum ada kartu ajakan upgrade + kartu merchandise di menu Sertifikat | **KODE SELESAI** — siap uji |
| 2 | Tombol WA di detail pelatihan terlalu banyak & ambigu | **KODE SELESAI** — siap uji |
| 3 | Nomor WA default sebagian masih baca langsung dari env, bukan Pengaturan | **KODE SELESAI** — siap uji |

---

## Temuan 1 — Detail

### Keputusan kondisi tampil kartu upgrade (dashboard utama)

| Kondisi user | Kartu ajakan? | Alasan |
|---|---|---|
| Belum selesai kuis (`free_track_selesai_at` null) | Tidak | Belum relevan |
| Kuis selesai, **belum pernah** ajukan upgrade | **Ya** — teks “Upgrade untuk aktifkan QR” | Masalah utama Alif |
| Status `menunggu_bukti` | **Ya** — teks “Lanjutkan upgrade…” | Masih perlu aksi unggah bukti |
| Status `menunggu_verifikasi` | **Tidak** | StatTile “Diperiksa Admin” sudah cukup; CTA “upgrade” menyesatkan |
| Status `ditolak` | **Ya** — teks “Pengajuan upgrade ditolak” | Perlu ajukan ulang / unggah ulang |
| Status `disetujui` | **Tidak** | StatTile “Sertifikat: Aktif” cukup |

CTA selalu ke `/dashboard/transaksi` (bukan `/dashboard/upgrade`).

### Kartu merchandise di `/dashboard/sertifikat`

**Hasil cek git:** ini **fitur BARU**, bukan mengembalikan yang hilang.
- Folder `sertifikat/` sejak F06.17 hanya punya kartu Lihat Sertifikat / preview.
- Alur merchandise sudah ada di `/dashboard/merchandise` + section di Transaksi — tapi **tidak pernah** ada kartu informatif di halaman Sertifikat.

**Kondisi tampil:**
- Ada pesanan `cert_only` berstatus `disetujui`, DAN
- Belum ada `merch_addon` berstatus `disetujui`
- Diletakkan **di bawah** grid kartu sertifikat
- CTA → `/dashboard/merchandise`

### File diubah

| File | Perubahan |
|---|---|
| `src/app/[locale]/(user)/dashboard/page.tsx` | Kartu ajakan upgrade (pola sama identitas) + logika teks per status |
| `src/app/[locale]/(user)/dashboard/sertifikat/page.tsx` | Kartu ajakan merchandise (fitur baru) |

### Cara uji Temuan 1 (Alif)

1. **User kuis selesai, belum upgrade** → buka `/dashboard` → harus ada kartu “Upgrade untuk aktifkan QR” → klik → `/dashboard/transaksi`.
2. **User menunggu verifikasi** → kartu ajakan **tidak** muncul; StatTile pembayaran = “Diperiksa Admin”.
3. **User ditolak** → kartu “Pengajuan upgrade ditolak” muncul.
4. **User sudah disetujui** → kartu ajakan hilang.
5. **User cert_only disetujui** → buka `/dashboard/sertifikat` → di bawah kartu sertifikat ada kartu “Tambah merchandise” → CTA ke merchandise.
6. **User cert_merch / merch sudah disetujui** → kartu merchandise **tidak** muncul.

---

## Temuan 2 — Detail

### Hasil akhir penempatan WA di `/pelatihan/[slug]`

| Area | Sebelum | Sesudah |
|---|---|---|
| Card Syarat & Fasilitas | 2 tombol WA (reguler + private) | **Tanpa tombol WA** (hanya daftar) |
| Card Dukungan Peserta | `waTanyaLink` (env langsung) “Hubungi Admin” | **1 tombol** → `waRegulerLink` (Admin / batch reguler) |
| CTA akhir halaman | `waTanyaLink` generik | **1 tombol** → `waPrivateLink` (Abiyyi / private-inhouse) |

### `waTanyaLink` / `nomorWa`

**Sudah dihapus** dari `pelatihan/[slug]/page.tsx`. Tidak ada referensi tersisa ke `buildWaTanyaLink` / `process.env.NEXT_PUBLIC_WA_ADMIN` di file ini. Baca nomor default (fallback reguler) tetap lewat `getWhatsappAdmin()` → `waUmum`.

### i18n (teks saja, key tetap)

Namespace `batch` di `messages/id.json` + `en.json`:

| Key | ID (baru) |
|---|---|
| `supportDescription` | Pertanyaan seputar batch reguler? Hubungi Admin lewat WhatsApp. |
| `finalCtaHeading` | Butuh Private atau Inhouse Training? |
| `finalCtaDesc` | Untuk pelatihan private & inhouse, hubungi langsung Abiyyi lewat WhatsApp. |
| `finalCtaButton` | Private & Inhouse (Abiyyi) |

Key `waRegulerLabel` / `waPrivateLabel` / `waAskBatchNamed` dipakai ulang (sudah benar). Key `contactAdmin` & `waAskBatch` **tidak dipakai lagi** di halaman detail (dibiarkan di JSON supaya tidak pecah i18n lain).

### File diubah

| File | Perubahan |
|---|---|
| `src/app/[locale]/(public)/pelatihan/[slug]/page.tsx` | Restruktur tombol WA; hapus env/`waTanyaLink` |
| `messages/id.json` | Teks support + final CTA |
| `messages/en.json` | Idem EN |

### Cara uji Temuan 2

1. Buka salah satu `/pelatihan/[slug]` yang punya syarat/fasilitas.
2. Card Syarat & Fasilitas: **tidak ada** tombol WA.
3. Card Dukungan: satu tombol “Tanya Batch Reguler (Admin)” → WA ke nomor reguler (atau fallback WA umum).
4. CTA bawah: heading private/inhouse + tombol Abiyyi → WA private.
5. Pastikan pesan prefill WA mengandung nama “Admin” / “Abiyyi” + judul batch.

---

## Temuan 3 — Detail

### Root cause (terkonfirmasi di kode)

`katalog/[slug]/page.tsx` (dan 3 titik lain) membaca `process.env.NEXT_PUBLIC_WA_ADMIN` langsung → perubahan di Admin → Pengaturan → Kontak Publik **tidak pernah** terbaca.

### Perbaikan sumber baca → `getWhatsappAdmin()`

| File | Sebelum | Sesudah |
|---|---|---|
| `katalog/page.tsx` | env langsung | `await getWhatsappAdmin()` |
| `katalog/[slug]/page.tsx` | env langsung | `await getWhatsappAdmin()` |
| `pelatihan/page.tsx` | env langsung | `await getWhatsappAdmin()` |
| `pelatihan/[slug]/page.tsx` | sudah bersih (Temuan 2) | — |
| `pelatihan/[slug]/daftar-batch-actions.ts` | env langsung (bonus, pola sama) | `await getWhatsappAdmin()` |

`NEXT_PUBLIC_WA_ADMIN` **tetap** di `.env` sebagai fallback di dalam `getWhatsappAdmin()` (DB-first).

### `revalidatePath` di `simpanKontakAction`

Sekarang:
- `/admin/pengaturan`
- `/`
- `/katalog`
- `/pelatihan`

Pola sama dengan `simpanKontakPelatihanAction` (revalidate listing terkait). Tidak memakai `revalidateTag` (proyek belum pakai tag caching untuk ini).

### UX form Kontak Publik

- Deskripsi card diperjelas: WA = default/umum (floating, katalog, listing, footer) — bukan “cuma footer”.
- Label field: **“WhatsApp (default/umum)”** + subteks penjelasan.
- Email & Instagram tetap murni footer.
- **Tidak** dipindah ke card Email notifikasi Admin (beda kategori).

### File diubah

| File | Perubahan |
|---|---|
| `katalog/page.tsx` | `getWhatsappAdmin()` |
| `katalog/[slug]/page.tsx` | `getWhatsappAdmin()` |
| `pelatihan/page.tsx` | `getWhatsappAdmin()` |
| `pelatihan/[slug]/daftar-batch-actions.ts` | `getWhatsappAdmin()` |
| `pengaturan/actions.ts` | revalidate `/katalog` + `/pelatihan` |
| `pengaturan/pengaturan-forms.tsx` | deskripsi + label WA |

### Cara uji Temuan 3 (5+ titik — wajib Alif klik sendiri)

1. Login Admin → `/admin/pengaturan` → Kontak Publik → ubah **WhatsApp (default/umum)** ke nomor uji → Simpan.
2. Hard refresh / buka tab baru (tanpa redeploy):
   1. **Floating WA** di halaman publik mana saja → nomor baru
   2. **Hubungi via WhatsApp** di `/katalog/[slug]` → nomor baru
   3. Tombol WA di listing `/katalog` (hero konsultasi / bulk) → nomor baru
   4. Tombol WA custom di listing `/pelatihan` (jika tampil) → nomor baru
   5. **Dukungan Peserta** di `/pelatihan/[slug]` → hanya ikut berubah jika `wa_reguler` di Kontak Pelatihan **kosong** (karena fallback ke `getWhatsappAdmin()`)
3. Kembalikan nomor ke nilai produksi setelah uji.

---

## Verifikasi

| Cek | Hasil |
|---|---|
| `pnpm tsc --noEmit` | Lolos (exit 0) |
| `pnpm lint` | Lolos (exit 0) |
| Siap diuji Alif di browser? | **Ya — ketiga temuan** |

---

## Catatan untuk Alif (non-teknis)

1. **Dashboard:** kalau sudah lulus kuis tapi belum upgrade (atau ditolak / belum unggah bukti), muncul kartu ajakan ke Transaksi. Kalau sedang menunggu Admin cek, kartu itu disembunyikan supaya tidak bingung.
2. **Sertifikat Saya:** kalau paketmu “Sertifikat Saja” sudah disetujui, muncul kartu ajakan tambah merchandise di bawah.
3. **Detail pelatihan:** tombol WhatsApp dirapikan — Syarat/Fasilitas tanpa WA; Dukungan = batch reguler (Admin); bawah halaman = private/inhouse (Abiyyi).
4. **Pengaturan → Kontak Publik:** field WhatsApp sekarang jelas sebagai nomor default situs. Setelah disimpan, tombol WA di floating/katalog/listing ikut nomor itu (tanpa redeploy).

---

## Pengingat setelah Alif konfirmasi semua beres

☐ Update `feature-registry.md` (baris log kronologis baru + kolom Bukti fitur terkait bila relevan, mis. F01.9 floating WA, F04.4 WA katalog, F03.9/F06.17 dashboard) — **HANYA setelah konfirmasi eksplisit Alif**, bukan inisiatif Cursor.

☐ Sesi yang menerima konfirmasi Alif (bisa sesi berbeda dari sesi perbaikan ini) wajib menjalankan checklist di atas sebelum menutup pekerjaan.

---

## Bug Tambahan — Approval merch_addon (25 September 2026)

> Laporan **terpisah** dari Temuan 1/2/3 di atas. Bug baru UAT internal.
> Status: **kode TypeScript selesai. SQL BELUM dijalankan.** Uji e2e baru valid setelah Alif menjalankan SQL manual.

### Ringkasan

Admin gagal menyetujui pesanan `merch_addon` dengan error Postgres P0001: “Pengguna sudah punya sertifikat free_track”. Fungsi `aktivasi_sertifikat_free_track()` meng-insert sertifikat baru untuk semua paket, termasuk addon yang seharusnya hanya menambah pengiriman merchandise.

**SQL (Alif, manual — Cursor tidak mengeksekusi):** `usulan-sql-fix-aktivasi-merch-addon.sql` di root project. Untuk `merch_addon` fungsi tidak insert `certificates` baru; mengembalikan id/nomor sertifikat yang sudah ada; `status_pengiriman` jadi `belum_diproses`. Jalur `cert_only` / `cert_merch` tidak berubah.

**TypeScript (sudah di kode):** setelah RPC, jika paket `merch_addon`: lewati generate/upload PDF; kirim email merchandise (bukan “sertifikat sudah aktif”). Paket lain tetap seperti semula.

**Pilihan activity_logs:** aksi `Pesanan merchandise disetujui` (teks bebas). `LABEL_AKSI` di dashboard **tidak diubah** (di luar file yang diizinkan). Riwayat user menampilkan kalimat itu apa adanya lewat fallback `?? log.aksi`. `sertifikat_aktif` tidak dipakai lagi untuk addon supaya tidak tertulis “Sertifikat diaktifkan”.

### File yang diubah

| File | Perubahan |
|---|---|
| `src/app/admin/(protected)/upgrade/actions.ts` | Cabang merch: skip PDF, email berbeda, aksi log berbeda |
| `src/lib/email/templates.ts` | `templateMerchDisetujui` |
| `src/lib/email/send.ts` | `kirimEmailMerchDisetujui` |
| `usulan-sql-fix-aktivasi-merch-addon.sql` | **Tidak diubah Cursor** — menunggu Alif |

### Status SQL

**Menunggu Alif jalankan manual di Supabase SQL Editor.** Setelah itu baru TypeScript ini bisa diuji end-to-end. Sebelum SQL dijalankan, Setujui `merch_addon` masih gagal di database.

### Hasil cek

| Cek | Hasil |
|---|---|
| `pnpm tsc --noEmit` | Lolos (exit 0) |
| `pnpm lint` | Lolos (exit 0) |

### Cara uji Alif (setelah SQL dijalankan)

1. Pakai akun yang **sudah** punya `cert_only` disetujui.
2. Kalau belum ada `merch_addon` menunggu verifikasi, ajukan dulu dari `/dashboard/merchandise` (unggah bukti).
3. Admin → Upgrade → Setujui pesanan merchandise itu.
4. Harapan: berhasil (tidak ada error “sudah punya sertifikat free_track”); status pengiriman “Belum Diproses”; **tidak** ada sertifikat baru (jumlah tetap 1).
5. Email user: subjek **“Pesanan merchandise Anda sudah disetujui”** — bukan “Sertifikat Anda sudah aktif”. Tombol ke `/dashboard/merchandise`.
6. Riwayat aktivitas dashboard user: baris “Pesanan merchandise disetujui”.
7. Regresi: akun lain yang belum upgrade, ajukan `cert_only`/`cert_merch` → Setujui tetap menerbitkan sertifikat + email “Sertifikat Anda sudah aktif” + PDF seperti sebelumnya.

### Pengingat registry

☐ Jangan tandai DONE di `feature-registry.md` sampai Alif konfirmasi di browser **setelah SQL dijalankan**. Sama seperti Temuan 1/2/3: log kronologis + kolom Bukti hanya setelah konfirmasi eksplisit.

---

## Temuan Baru — Routing /materi/[id] Membingungkan (25 September 2026)

> Laporan terpisah dari dashboard/WA dan dari bug approval merch_addon.
> Status: **DIKONFIRMASI ALIF 2026-09-25.** SQL sudah dijalankan. `/materi/1` dan `/materi/2` = 404. `/materi/3` jalan.

### Ringkasan

- `/materi` (tanpa id) 404 karena memang tidak ada halaman daftar. Sengaja, sejak komentar di `src/lib/materi.ts`.
- `/materi/3` adalah course resmi. Tombol Mulai Sekarang memilih course aktif pertama yang punya bab, bukan angka yang di-hardcode.
- `/materi/1` dan `/materi/2` adalah sisa uji coba pra-LMS (`uji_materi_ppt`, `uji_materi_pdf`), masih `is_active = true`. Admin Materi hanya menampilkan satu course, jadi tidak ada tombol di UI untuk mematikannya.
- Siapa pun yang mengubah angka di URL bisa melihat halaman uji itu dan mengiranya kerusakan course yang sedang dipakai.

### Yang dikerjakan

Pintu dari dalam aplikasi sekarang `/materi/get-free-certificate-rpc`. Fungsi itu mengalihkan ke `/materi/{id}` course resmi (URL akhir di browser tetap angka — itu memang batas redirect Next.js). Kalau belum ada course berbab, diarahkan ke `/pelatihan`.

`getMateriHeroHref()` tidak lagi mengembalikan `/materi/{id}`. Ia tetap meng-query database hanya untuk tahu ada course atau tidak, lalu mengembalikan path bernama atau `null` (tombol tetap disembunyikan).

Halaman `/materi/[id]` tetap ada. Kalau id yang dibuka **bukan** course resmi, pengguna diarahkan ke pintu bernama (lalu ke course resmi). Dipilih **redirect**, bukan `notFound()`, supaya pola sama dengan `/batch/[slug]` → `/pelatihan`: pengunjung tidak melihat data uji.

`getMateriId()` (Admin) tidak diubah.

### File

| File | Perubahan |
|---|---|
| `src/lib/materi.ts` | `getMateriAktifId()` + `getMateriHeroHref()` → path bernama |
| `src/app/[locale]/(kelas)/materi/get-free-certificate-rpc/page.tsx` | Redirect ke `/materi/{id}` atau `/pelatihan` |
| `src/app/[locale]/(kelas)/materi/[id]/page.tsx` | Id bukan course resmi → redirect ke pintu bernama |
| `src/app/[locale]/(user)/dashboard/kursus/page.tsx` | Link belajar memakai pintu bernama |
| `usulan-sql-nonaktifkan-materi-lama.sql` | Sudah dijalankan Alif 2026-09-25 |

`/pelatihan` dan `/dashboard/pelatihan` sudah memakai `getMateriHeroHref()`, jadi ikut path baru tanpa edit terpisah.

### SQL

**Sudah dijalankan Alif di Supabase 2026-09-25.** Hasil uji: `/materi/1` dan `/materi/2` 404; `/materi/3` tetap jalan. Baris uji `is_active = false`, tidak dihapus.

### Hasil cek

| Cek | Hasil |
|---|---|
| `pnpm tsc --noEmit` | Lolos |
| `pnpm lint` | Lolos |

### Cara uji Alif

1. Buka `/materi/get-free-certificate-rpc` — alamat di browser berubah ke course resmi (sekarang `/materi/3`), isi halaman benar.
2. Mulai Sekarang di `/pelatihan` — tautan awalnya pintu bernama, hasil akhirnya course yang sama.
3. `/dashboard/kursus` — tombol Mulai/Lanjutkan Belajar juga pintu bernama.
4. `/materi/1` dan `/materi/2` — tidak menampilkan data uji, diarahkan ke course resmi (ini dari kode, belum perlu SQL).
5. Jalankan `usulan-sql-nonaktifkan-materi-lama.sql` setelah SELECT-nya cocok.
6. Ulangi `/materi/1` dan `/materi/2` — tetap tidak menampilkan data uji.
7. `/materi/3` langsung tetap normal.

### Usulan belum dikerjakan

Daftar semua baris `materials` di Admin Materi plus saklar aktif/nonaktif **tidak** dibuat sekarang. Itu mengubah UI Admin yang saat ini singleton. Diskusikan terpisah kalau Alif mau membereskan data uji berikutnya tanpa SQL.

Catatan tambahan dari Alif (25 Sep 2026): URL `/materi/get-free-certificate-rpc` untuk sekarang cukup sebagai solusi sementara — akan diuji dulu bersama Abi. Kemungkinan akan diubah lagi nanti (nama path lain, dan/atau pendekatan slug dari database kalau kebutuhan multi-course jadi nyata). Tidak perlu dikerjakan sekarang, cukup jadi catatan supaya tidak dianggap keputusan final.

### Pengingat registry

☑ Registry sudah diupdate 2026-09-25 (log + Bukti F06.2 dan F06.11). Status kedua baris tetap DONE.

### Pesan commit yang disarankan

```
fix(public): pintu materi bernama, jangan tampilkan sisa uji coba
```

---

## Dokumentasi Susulan — ADR-025 & ADR-026 (30 September 2026)

Murni dokumen. Tidak ada perubahan kode di tugas ini.

| ADR | Registry | Status yang dipilih | Alasan |
|---|---|---|---|
| ADR-025 | F12.1 | **DONE** | Alif konfirmasi 30 Sep 2026. |
| ADR-025 | F12.2 | **DONE** | Alif konfirmasi 30 Sep 2026. SQL merch sudah dijalankan, uji normal. |
| ADR-025 | F12.3 | **DONE** | `plan.md`: “DIKONFIRMASI ALIF 2026-09-25”, `/materi/1`–`/2` 404, `/materi/3` jalan. |
| ADR-026 | F13.1 navbar | **TODO** | Kode `text-2xl` sudah masuk. Menunggu uji browser Alif. |
| ADR-026 | F13.2 kartu belum-pernah-order | **TODO** | Kartu sudah masuk. Menunggu uji browser Alif. |
| ADR-026 | F13.3 timeout Admin | **TODO** | Ada prompt, tidak ada laporan hasil di `plan.md`. Tidak ada timer idle di kode. |
| ADR-026 | F13.4 merchandise jadi produk | **TODO** | Belum ada prompt dan belum ada kode. |
| ADR-026 | F13.5 pendaftaran perusahaan | **TODO** | Belum ada prompt dan belum ada kode. |

**Dikunci Alif 30 Sep 2026:** F12.1 dan F12.2 DONE. F13.x tetap TODO.

**Pesan commit yang disarankan**

```
docs: catat ADR-025 dan ADR-026 untuk UAT internal dan permintaan Abi
```

---

## Permintaan Abi (30 September 2026) — Navbar & Kartu Ajakan Upgrade

Dua bagian terpisah. Keduanya tetap TODO di registry sampai Alif uji sendiri.

### Bagian A — Navbar

Teks “Hexatara” di navbar publik naik dari `text-lg` ke `text-2xl leading-none`, sejajar logo 32px. Footer di file yang sama **sengaja tidak diubah** (`text-base font-bold`).

| File | Perubahan |
|---|---|
| `src/app/[locale]/(public)/layout.tsx` | Kelas teks navbar saja |

Cara uji: buka beranda dan satu halaman publik lain (misalnya `/katalog`). Teks navbar lebih besar, sejajar logo, tidak memakan menu. Ulangi di lebar HP di bawah 768px.

### Bagian B — Kartu Sertifikat

Kartu “Dapatkan Sertifikat & QR Resmi” muncul hanya jika sertifikat masih pratinjau dan user belum pernah punya baris `certificate_orders`. Tombol ke `/dashboard/transaksi`. Kartu merchandise yang sudah ada tidak diubah. Halaman Transaksi tidak diubah.

| File | Perubahan |
|---|---|
| `src/app/[locale]/(user)/dashboard/sertifikat/page.tsx` | Query `limit(1)` seluruh pesanan + kartu baru |

Cara uji: akun yang baru selesai kuis dan belum pernah ajukan pesanan → `/dashboard/sertifikat` menampilkan kartu itu. Akun yang sudah pernah ajukan pesanan (status apa pun) → kartu ini tidak muncul.

### Verifikasi

| Cek | Hasil |
|---|---|
| `pnpm tsc --noEmit` | Lolos |
| `pnpm lint` | Lolos |
| Navbar desktop + lebar 390px | Teks lebih besar, sejajar logo, menu tidak pecah |

☑ F13.1 dan F13.2 DONE di registry (konfirmasi Alif 30 Sep 2026).

**Pesan commit yang disarankan**

```
fix(public): perbesar nama Hexatara di navbar dan ajakan upgrade di sertifikat
```

---

## Permintaan Abi (30 September 2026) — Session Timeout Admin

Hanya area Admin yang sudah login. `/admin/login` tidak kena karena layoutnya terpisah: timer dipasang di `AdminShell`, dan shell itu hanya dirender dari `src/app/admin/(protected)/layout.tsx`.

Tidak ada throttle helper di proyek ini. Gerakan mouse diabaikan jika belum lewat 1 detik. Klik, tombol, scroll, dan sentuh langsung mereset. Peringatan memakai Dialog yang sudah ada. Logout memakai `logoutAdminAction()` yang sudah ada.

| File | Perubahan |
|---|---|
| `src/components/shell/admin-idle-timeout.tsx` | Baru |
| `src/components/shell/admin-shell.tsx` | Pasang komponen di dalam shell |

Angka uji ada di bagian atas `admin-idle-timeout.tsx`: `ADMIN_IDLE_MS` (30 menit) dan `ADMIN_IDLE_WARN_MS` (28 menit). Untuk uji cepat, ganti sementara jadi `60_000` dan `30_000`, lalu **kembalikan** sebelum push.

Cara uji: login Admin, ubah dua konstanta itu, jangan gerakkan mouse. Sekitar 30 detik modal muncul. Klik “Tetap login” lalu diam lagi: modal muncul lagi. Biarkan sampai 1 menit: harus pindah ke `/admin/login`. Pindah menu Admin di tengah jalan harus mengulang hitungan. Halaman publik dan dashboard user tidak boleh logout sendiri.

☑ F13.3 DONE di registry (uji Alif 30 Sep 2026, hasil OKE).

**Pesan commit yang disarankan**

```
feat(admin): logout otomatis setelah 30 menit tanpa aktivitas
```

---

## Permintaan Abi (30 September 2026) — F13.4 Merchandise jadi produk

Bagian dashboard dan Admin saja. Pembelian dari katalog publik menyusul.

Jalankan dulu `usulan-sql-merchandise-jadi-produk.sql` di Supabase sebelum uji. Agent tidak mengeksekusinya.

| File | Perubahan |
|---|---|
| `src/lib/validations/upgrade.ts` | Wajib pilih produk jika bukan sertifikat saja |
| `src/app/[locale]/(user)/actions.ts` | Harga dari produk, snapshot ke `certificate_order_items` |
| `pesanan-upgrade-form.tsx` + Transaksi + Merchandise user | Checklist + qty |
| `pengaturan-forms.tsx` | Hanya harga QR |
| `admin/merchandise/**` | Daftar produk dan pesanan yang sudah disetujui |
| `upgrade/page.tsx` | Nama produk di antrean verifikasi |

Status: **menunggu uji Alif**. F13.4 tetap TODO. F13.3 sudah DONE.

Cara uji: ikuti tujuh langkah di prompt (buat kategori Merchandise, tambah produk, cert_merch, merch_addon, approve, pengaturan, validasi tanpa produk).

**Pesan commit yang disarankan**

```
feat(merchandise): jadikan merchandise produk sungguhan + keranjang multi-produk (F13.4a)
```

---

## Permintaan Abi (30 September 2026) — F13.4b Beli merchandise dari katalog

Uji dashboard (2a) **lolos 30 Sep 2026**: kategori, produk tampil di katalog, `cert_merch` (biaya sertifikat + produk), `merch_addon` (harga produk saja), approve muncul di Pesanan dengan alamat, pengaturan hanya harga QR, dan submit tanpa produk ditolak.

Publik: satu form per produk di halaman detail Merchandise, bukan keranjang lintas halaman. Form Minta Penawaran tidak diubah.

Jalankan `usulan-sql-merchandise-publik.sql` sebelum uji. Agent tidak menjalankannya.

Status: **menunggu uji Alif**. F13.4 tetap TODO sampai uji publik ini.

**Pesan commit yang disarankan**

```
feat(merchandise): alur pembelian publik untuk produk merchandise (F13.4b)
```

---

## Bug F13.4 — redirect edit dan kolom kategori (30 September 2026)

Klik Ubah di Merchandise kembali ke `/admin/merchandise` setelah simpan atau batal. Kolom Kategori menampilkan nama dari relasi, bukan tanda hubung.

File: `produk-table.tsx`, `produk-row-actions.tsx`, `produk-form.tsx`, `produk/page.tsx`, `merchandise/page.tsx`, `merchandise/[id]/page.tsx`.

Status: **dikonfirmasi Alif 30 Sep 2026.** F13.4 tetap TODO.

**Pesan commit yang disarankan**

```
fix(admin-produk): perbaiki redirect edit merchandise & kolom kategori kosong
```

---

## Bug F13.4 — tabel pesanan dan sertifikat ditolak (30 September 2026)

Pesanan Merchandise dan Pesanan Publik memakai tabel yang bisa dicari, plus unduh Excel. Bagian Pengiriman Merchandise di Sertifikat → Upgrade dihapus karena sama dengan menu Merchandise. Gantinya daftar Sertifikat Ditolak, dengan tautan WhatsApp dari nomor di profil.

Status: **menunggu uji Alif**. F13.4 tetap TODO.

**Pesan commit yang disarankan**

```
fix(admin-merchandise): pesanan jadi tabel + export Excel, rapikan menu Sertifikat
```

---

## Bug F13.4 — detail pesanan dan baris toolbar (1 Oktober 2026)

Popup Detail di Pesanan Merchandise dan Pesanan Publik. Nomor WhatsApp tidak di tabel; muncul di popup. Tombol Konfirmasi pesanan membuka WhatsApp pemilik. Judul, filter, dan Ekspor Excel satu baris.

Status: **dikonfirmasi Alif 1 Okt 2026.** F13.4 tetap TODO.

---

## F13.4 — pesan ulang merchandise, gambar, stepper (1 Oktober 2026)

`merch_addon` boleh dipesan lagi setelah pesanan terakhir disetujui (tidak perlu menunggu diterima) atau ditolak (unggah ulang bukti, atau pesanan baru). Pesanan menunggu bukti atau verifikasi tetap mengunci. Riwayat tidak dihapus. `cert_only` dan `cert_merch` tetap satu pesanan. Tidak ada SQL.

| File | Perubahan |
|---|---|
| `src/lib/merchandise.ts` | `thumbnail_url`, pecah order aktif vs riwayat |
| `src/app/[locale]/(user)/actions.ts` | Izinkan insert `merch_addon` baru kalau yang terakhir sudah disetujui atau ditolak |
| `dashboard/merchandise/page.tsx`, `dashboard/transaksi/page.tsx` | Status utama + riwayat |
| `pesanan-upgrade-form.tsx` | Thumbnail produk |
| `status-pengiriman-stepper.tsx`, `pesanan-status-section.tsx` | Stepper kirim untuk `cert_merch` dan `merch_addon` yang disetujui |

Status: **menunggu uji Alif**. F13.4 tetap TODO.

**Pesan commit yang disarankan**

```
fix(dashboard-merchandise): boleh pesan ulang, gambar produk, stepper status kirim

- Order merch_addon tidak lagi dibatasi satu seumur hidup: boleh order baru setelah
  order sebelumnya disetujui atau ditolak (riwayat tetap tersimpan)
- Form pemilihan produk tampilkan gambar (thumbnail_url)
- Status pengiriman (belum diproses/diproses/dikirim/diterima) jadi stepper visual
  di /dashboard/transaksi & /dashboard/merchandise

Ref: ADR-026, F13.4 (temuan UAT)
```

---

## F13.4 — satu nomor telepon (WhatsApp) dan judul pesanan (1 Oktober 2026)

Satu nomor untuk chat dan kurir. Label di form dashboard, form beli publik, dan Pengaturan user: **Nomor telepon (WhatsApp)**. Admin membaca nomor itu dari alamat pengiriman, bukan dari WhatsApp di profil. Kolom `profiles.whatsapp` dan `merchandise_public_orders.whatsapp` tidak diubah skemanya; pesanan publik menyalin nomor alamat ke kolom yang sudah ada. Form pendaftaran pelatihan tidak diubah.

Judul Pesanan Merchandise dan Pesanan Publik berada di atas kotak cari. Filter dan Ekspor tetap sebaris dengan pencarian.

Status: **menunggu uji Alif**. F13.4 tetap TODO. Registry belum diperbarui.

---

## F13.4 — banner pelatihan dan toast pesanan (1 Oktober 2026)

`/dashboard/pelatihan`: belum lulus tetap ajakan kursus. Sudah lulus tapi sertifikat belum disetujui tetap “Upgrade sekarang” ke Transaksi. Sertifikat disetujui tanpa merchandise disetujui menjadi “Dapatkan Merchandise” ke `/dashboard/merchandise`. Banner hilang jika paket `cert_merch` disetujui, atau ada minimal satu `merch_addon` disetujui. Toast submit: sertifikat saja, sertifikat + merchandise, atau merchandise saja (sertifikat tidak berubah).

Tidak ada SQL. Status: **menunggu uji Alif**. F13.4 tetap TODO.

Uji:

1. Belum pernah order → banner “Upgrade sekarang”.
2. `cert_only` disetujui, merchandise belum → banner “Dapatkan Merchandise”, tombol ke `/dashboard/merchandise`.
3. `cert_only` dan `merch_addon` keduanya disetujui → banner hilang.
4. `cert_merch` disetujui → banner hilang.
5. Submit `cert_only` → toast sertifikat.
6. Submit `merch_addon` → toast merchandise, sertifikat tidak berubah.
7. Submit `cert_merch` → toast sertifikat + merchandise.

**Pesan commit yang disarankan**

```
fix(dashboard-user): banner pelatihan 3-kondisi + toast pesan sesuai paket

- /dashboard/pelatihan: banner upgrade sekarang tidak lagi nyangkut setelah
  sertifikat disetujui — sekarang ganti ajakan "Dapatkan Merchandise" kalau
  merchandise belum diambil
- Toast sukses submit pesanan dibedakan teksnya per paket (cert_only/cert_merch/
  merch_addon), tidak generik lagi

Ref: ADR-026, F13.4 (temuan UAT)
```

---

## F13.4 — antrean merchandise dan kartu yang masih berjalan (1 Oktober 2026)

Merchandise tambahan diverifikasi di menu Merchandise, bukan di Sertifikat. Sertifikat hanya mengantre paket sertifikat. Bukti transfer dibuka di popup. Di dashboard, pesanan yang belum diterima tetap kartu sendiri, dengan tombol Detail (barang, qty, harga, stepper). “Pesanan selesai” hanya untuk yang sudah diterima, atau ditolak yang sudah diganti pesanan baru.

Tidak ada SQL. Status: **dikonfirmasi Alif 3 Okt 2026.** F13.4 DONE.

---

## F13.4 — tab admin pesanan + tombol header (3 Oktober 2026)

`/admin/merchandise/pesanan` memakai tab Menunggu verifikasi / Ditolak / Sudah disetujui. Di dashboard user, tombol “Pesan Merchandise Lagi” sejajar judul kartu; teks Diajukan/Diperbarui dihapus dari kartu merchandise.

Status: **dikonfirmasi Alif 3 Okt 2026.** F13.4 DONE.

---

## F13.5a — Form publik pendaftaran perusahaan/komunitas (3 Oktober 2026)

**Keputusan UI:** Dialog (bukan halaman terpisah) — sejajar `DaftarBatchDialog`, form panjang sudah terbukti nyaman di dialog yang sama. `daftar-batch-dialog.tsx` tidak diubah.

**Di luar cakupan:** menu Admin approve/isi nominal (Prompt 3b).

SQL: `usulan-sql-pendaftaran-perusahaan.sql` sudah dijalankan Alif. Types `company_registrations` / `company_registration_participants` ditambah di `database.ts`.

| File | Perubahan |
|---|---|
| `src/lib/validations/company-registration.ts` | Skema PIC + baris Excel |
| `src/lib/company-registration/import.ts` | `parsePesertaPerusahaan` (all-or-nothing) |
| `pelatihan/[slug]/daftar-perusahaan-dialog.tsx` | Form publik + unduh template client-side |
| `pelatihan/[slug]/daftar-perusahaan-actions.ts` | Upload + insert + email + WA link |
| `pelatihan/[slug]/page.tsx` | Tombol perusahaan di samping individu |
| `src/lib/email/send.ts` + `templates.ts` | Jenis `pendaftaran_perusahaan` |

Status: **dikonfirmasi Alif OK** (uji form publik). F13.5 DONE bersama 3b (lihat bawah).

**Pesan commit yang disarankan**

```
feat(pendaftaran-perusahaan): form publik daftar grup via Excel (F13.5a)

- Tabel baru company_registrations + company_registration_participants
  (usulan SQL, sudah dijalankan Alif), bucket privat company-registrations
- Form publik di /pelatihan/[slug]: PIC tanpa login, upload Excel peserta
  (nama/WA/email), validasi all-or-nothing, template Excel diunduh di browser
- Email notifikasi Admin + WA klik-to-chat setelah submit

Ref: ADR-026, F13.5
```

---

## F13.5b — Admin pendaftaran perusahaan (3 Oktober 2026)

**F13.5 SELESAI DIKODEKAN SELURUHNYA (3a+3b).**

Menu Leads → Pendaftaran Perusahaan. DataTable + filter status + export Excel. Detail: PIC, peserta, signed URL Excel (`company-registrations`), form status (+ alasan wajib jika ditolak), nominal total, catatan Admin. Polish UI: tombol unduh Excel, badge Disetujui hijau; init form detail via `onOpenChange` (bukan `useEffect`).

| File | Perubahan |
|---|---|
| `src/components/shell/admin-shell.tsx` | Item menu Leads |
| `admin/pendaftaran-perusahaan/page.tsx` | Query + signed URL |
| `admin/pendaftaran-perusahaan/pendaftaran-perusahaan-table.tsx` | Tabel + dialog detail/aksi |
| `admin/pendaftaran-perusahaan/pendaftaran-perusahaan-export.ts` | Export xlsx |
| `admin/pendaftaran-perusahaan/actions.ts` | Update status/nominal/catatan |

Status: **dikonfirmasi Alif 3 Okt 2026.** F13.5 DONE.

**Pesan commit yang disarankan**

```
feat(admin-pendaftaran-perusahaan): menu lihat/verifikasi/export (F13.5b)

- Menu baru di section Leads: tabel pendaftaran perusahaan + export Excel
- Detail: daftar peserta, link unduh Excel asli, ubah status, isi nominal
  (satu angka total), catatan Admin

Ref: ADR-026, F13.5 (lengkap — 3a publik + 3b admin)
```

---

## F14.1 — Badge Autel Authorized Dealer di hero (6 Oktober 2026)

Pill di bawah judul kartu retail hero (`offerRetailTitle`): ikon `BadgeCheck` + teks resmi “Autel Robotics Authorized Dealer” (ID = EN lewat next-intl). Gaya reuse badge publik existing. Tanpa SQL. Elemen hero lain tidak diubah.

| File | Perubahan |
|---|---|
| `src/components/hero-section.tsx` | Pill di bawah judul retail |
| `messages/id.json` / `messages/en.json` | `landing.offerRetailAuthorizedDealer` |

Status: **dikonfirmasi Alif 6 Okt 2026.** F14.1 DONE.

**Pesan commit yang disarankan**

```
feat(hero): badge Autel Robotics Authorized Dealer di kartu retail (F14.1)

Ref: ADR-027
```

---

## F14.2 — Pendaftaran Kelompok + minimal 3 peserta (6 Oktober 2026)

Label tampil “Perusahaan/Komunitas” → “Kelompok” (ID+EN). Rute `/admin/pendaftaran-perusahaan`, tabel `company_*`, jenis email `pendaftaran_perusahaan` **tidak diubah**. `MIN_PESERTA_KELOMPOK = 3` di validations; cek di server action setelah Excel all-or-nothing lolos. Template unduhan: header saja.

| File | Perubahan |
|---|---|
| `messages/{id,en}.json` | Copy `registerCompany` |
| `daftar-perusahaan-dialog.tsx` | Label, template header-only, error minimal |
| `daftar-perusahaan-actions.ts` | Guard minimal 3 + WA “kelompok” |
| `validations/company-registration.ts` | Konstanta + pesan error nama kelompok |
| `admin/pendaftaran-perusahaan/*`, `admin-shell.tsx` | Label Admin/export |
| `email/templates.ts` | Judul “Pendaftaran kelompok baru” |

Status: **dikonfirmasi Alif 6 Okt 2026.** F14.2 DONE.

---

## F14.3 — Instruktur portrait + Catatan + Detail (6 Oktober 2026)

Publik & Admin foto `aspect-[4/5]` + `object-top`. Form: label “Catatan” (internal, `bio_id`); `bio_en` tidak di form/update. Detail dialog Admin. Badge “Perlu foto portrait” untuk foto non-portrait. Kolom DB `bio_*` **tidak** diubah/dihapus. Tanpa SQL.

| File | Perubahan |
|---|---|
| `instruktur-section.tsx` | Kontainer foto 4:5 |
| `image-upload-field.tsx` | previewAspectClass, suggestedNote, preset `portrait` |
| `instructor-form-dialog.tsx` | Catatan, crop 4:5 |
| `instructor-list.tsx` + `instructor-detail-dialog.tsx` + `instructor-portrait-badge.tsx` | Tabel + Detail + badge |
| `instructor-actions.ts` / `instructor-admin.ts` | Tanpa bio_en di payload |

Status: **menunggu uji Alif.** F14.3 tetap TODO.
