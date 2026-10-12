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

Status: **dikonfirmasi Alif 3 Okt 2026.** F13.5 DONE. Label menu kemudian “Pendaftaran Kelompok” (F14.2); berkas dan rute di tabel ini tetap. Label menu kemudian “Pendaftaran Kelompok” (F14.2); berkas dan rute di tabel ini tetap.

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

Status: **dikonfirmasi Alif 6 Okt 2026 (riwayat).** Dikoreksi 2026-10-08: status registry F14.1 = TODO, uji ulang.

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

Status: **dikonfirmasi Alif 6 Okt 2026 (riwayat).** Dikoreksi 2026-10-08: status registry F14.2 = TODO, uji ulang.

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

Status: **dikonfirmasi Alif 6 Okt 2026 (riwayat).** Dikoreksi 2026-10-08: status registry F14.3 = TODO, uji ulang.

---

## F14.4 — Partner Kami (6 Oktober 2026)

Tabel `partners` (SQL blok B sudah jalan). Admin Konten → Partner Kami: CRUD logo ke bucket `content/partners/`. Publik: section di bawah Instruktur Kami; kosong = tidak render. `revalidatePath('/')` + `('/en')`.

| File | Perubahan |
|---|---|
| `partner-section.tsx`, `page.tsx` (beranda) | Section publik |
| `messages/{id,en}.json` | `landing.partnersHeading` |
| `admin/konten/partner/*`, `partner-*.tsx`, `partner-actions.ts` | CRUD Admin |
| `admin-shell.tsx` | Menu Partner Kami |
| `image-upload-field.tsx` | preset `logo` (alpha PNG/WebP) |
| `validations/partner-admin.ts`, `types/database.ts` | Schema + tipe |

Status: **dikonfirmasi Alif 6 Okt 2026 (riwayat).** Dikoreksi 2026-10-08: status registry F14.4 = TODO, uji ulang.

---

## F14.5 — Saklar LMS Freemium (6–7 Oktober 2026)

**Status:** dikodekan — **menunggu uji Alif.** Diagnosis disetujui Alif 7 Okt 2026.

### Keputusan implementasi (pasca-persetujuan)

| Topik | Keputusan |
|---|---|
| Banner | = hero freemium di `/pelatihan` (bukan `[slug]`) |
| `/kuis` | digerbang penuh bersama LMS |
| Gerbang | di **page.tsx** tiap rute (`get-free-certificate-rpc`, `/materi/[id]`, `/kuis`) — bukan hanya layout `(kelas)` |
| Hero `/pelatihan` saat tertutup | **Sembunyikan seluruh blok** `PublicHeroMist` freemium (berdiri sendiri di atas judul “Jadwal Pelatihan”). Bukan CTA “Lihat Pelatihan”. |
| `daftarAction` / `kuisSelesai` | **Ya**, klaim klien `kuis_selesai` mengisi `free_track_selesai_at` lewat trigger `handle_new_user`. Saat LMS tertutup (`!allowed`), klaim diabaikan (`kuisSelesaiEfektif = false`). |
| Batas | Bucket `materials` **publik** — URL file langsung tidak ikut saklar. Kuis/tab yang sedang berjalan di tab lama hilang akses setelah refresh saat ditutup. |

### Diagnosis (arsip)

### 1. Rute LMS (publik / kelas)

| Path | File | Catatan |
|---|---|---|
| `/materi/get-free-certificate-rpc` | `src/app/[locale]/(kelas)/materi/get-free-certificate-rpc/page.tsx` | Pintu bernama → redirect ke `/materi/{id}` atau `/pelatihan` |
| `/materi/[id]` | `src/app/[locale]/(kelas)/materi/[id]/page.tsx` | Course reader + tab kuis embedded |
| Layout route group `(kelas)` | `src/app/[locale]/(kelas)/layout.tsx` | Hanya `ForceLightDocument` — **kandidat gerbang layout** |
| `/kuis` | `src/app/[locale]/(public)/kuis/page.tsx` | Mesin kuis publik (F03.2); **bukan** di dalam `(kelas)` |

**Tidak ada** `src/app/api/**` untuk materi/PDF/PPT/video. File dilayani lewat URL publik bucket (lihat batas di bawah). Admin `/admin/materi/**` **bukan** LMS publik — jangan digerbang saklar freemium.

### 2. Server Action LMS vs non-LMS

| Action | Path | Gerbang? |
|---|---|---|
| `selesaikanBabAction` | `(kelas)/materi/[id]/actions.ts` | **Ya** (progres bab) |
| `selesaikanKuisLoginAction` | `(public)/kuis/actions.ts` | **Ya** (tandai `free_track_selesai_at`) |
| Admin materi/bab/soal/lampiran | `admin/(protected)/materi/**/actions.ts` | **Tidak** |
| Sertifikat / upgrade / transaksi / merchandise / daftar batch / perusahaan | dashboard & publik terkait | **Tidak** |
| `daftarAction` (+ klaim `kuisSelesai`) | `(auth)/daftar/actions.ts` | **Tidak** (registrasi akun, bukan LMS) |

Progress anonim: `src/lib/materi/session-progress.ts` (sessionStorage client) — tertutup otomatis jika halaman LMS tidak bisa dibuka.

### 3. Tautan / CTA ke LMS

| Lokasi | Path | Perilaku saat ini |
|---|---|---|
| Hero freemium “Mulai Sekarang” | `pelatihan/page.tsx` via `getMateriHeroHref()` → `MATERI_PATH` | CTA ke pintu LMS |
| Banner LMS di dashboard | `dashboard/pelatihan/page.tsx` | Mode `lms` → `materiHref` |
| Kartu / CTA kursus | `dashboard/kursus/page.tsx` | Link `/materi/get-free-certificate-rpc` |
| Upgrade (belum kuis) | `dashboard/upgrade/page.tsx` | Link ke `/kuis` (tetap perlu digerbang halaman `/kuis`) |
| Sertifikat kosong | `dashboard/sertifikat/page.tsx` | Teks + link `/dashboard/kursus` (bukan langsung LMS) |
| Landing hero (`hero-section.tsx`) | — | **Tidak** ada CTA LMS |
| Navbar / footer publik | — | **Tidak** ada link `/materi` atau `/kuis` |
| `/pelatihan/[slug]` | `pelatihan/[slug]/page.tsx` | **Tidak ada** banner/CTA freemium di kode saat ini (spesifikasi menyebut banner di sini — **tidak ditemukan**; yang ada hero freemium di `/pelatihan` list) |
| Sitemap | `src/app/sitemap.ts` | Memuat `/kuis`; **tidak** memuat `/materi…` |

Helper: `src/lib/materi.ts` — `MATERI_PATH`, `getMateriAktifId()`, `getMateriHeroHref()`.

### 4. Cache / ISR & bucket

- Beranda: `export const dynamic = "force-dynamic"`.
- `/pelatihan`, `/materi/*`, `/kuis`: tidak set `revalidate`/ISR eksplisit; memakai `cookies()` via Supabase → rendering dinamis.
- `revalidatePath('/', 'layout')` tetap berguna agar saklar Admin langsung menyentuh tree layout.
- **Bucket `materials`:** `public: true` (dicek Storage API live). Link file langsung (PDF/PPT/video URL) **tidak** ikut tertutup saklar — batas yang diketahui.

### 5. Cek admin & cookie

- `requireAdmin()` / pola: `profiles.role === 'admin'` (`src/lib/auth/guard.ts`).
- Login Admin (`/admin/login`) memakai `createClient()` yang sama (`@/lib/supabase/server`) → **cookie Supabase sama** di rute publik; `getOptionalUser()` + baca `profiles.role` bisa mendeteksi admin untuk pratinjau.

### Berkas utama

| File | Peran |
|---|---|
| `site-settings.ts` | `isFreemiumLmsOpen` / `getFreemiumLmsAccess` (fail-closed, `cache()`) |
| `lms-closed-page.tsx`, `lms-admin-preview-strip.tsx` | Halaman tutup + strip admin |
| `materi/.../page.tsx`, `get-free-certificate-rpc/page.tsx`, `kuis/page.tsx` | Gerbang server |
| `materi/[id]/actions.ts`, `kuis/actions.ts` | Gerbang action |
| `daftar/actions.ts` | Abaikan `kuisSelesai` saat tertutup |
| `pelatihan/page.tsx`, dashboard pelatihan/kursus/upgrade | UI tanpa CTA LMS |
| `pengaturan/freemium-lms-card.tsx` + action | Saklar Admin |
| `sitemap.ts` | Tanpa `/kuis` saat tertutup |
| `messages/{id,en}.json` | `lmsClosed.*` |

Status: **dikonfirmasi Alif 7 Okt 2026 (riwayat, saklar + pratinjau Admin + tombol Pratinjau Materi).** Dikoreksi 2026-10-08: status registry F14.5 = TODO, uji ulang.

---

## F14.6a — Flag kategori + Lokasi Praktek + filter slug (7 Oktober 2026)

**Status:** dikodekan — **menunggu uji Alif.** SQL Bagian 0 blok C+D sudah dijalankan.

### Keputusan

| Topik | Keputusan |
|---|---|
| Program RPC / Advanced / SiDOPI | REUSE `batch_categories` — tanpa entitas baru; Admin buat 3 kategori lewat UI |
| Perilaku SiDOPI | Flag `butuh_lokasi_praktek` + `butuh_ukuran_baju` di kategori — **bukan** `if slug === 'sidopi'` |
| Slug filter | Tidak ada kolom `slug` di `batch_categories`; diturunkan di kode dari `nama_id` (`slugify`) |
| Kota praktek | Tabel global `practice_locations`; unique `lower(nama_kota)` |
| Filter `/pelatihan` | `?kategori=<slug>` di server `searchParams`; invalid → tampil semua |

### Berkas utama

| File | Peran |
|---|---|
| `kategori-manager.tsx`, `kategori/actions.ts`, `kategori-admin.ts` | Checkbox flag + badge tabel (batch only via `programFlags`) |
| `batch/lokasi-praktek/*`, `practice-location-admin.ts` | CRUD Lokasi Praktek |
| `admin-shell.tsx` | Menu di bawah Kategori Pelatihan |
| `pelatihan/page.tsx`, `dashboard/pelatihan/page.tsx`, `slugify.ts` | Filter `?kategori=slug` |
| `types/database.ts` | Flags, `practice_locations`, FK registration |

**Belum di 6A:** field lokasi/ukuran di form pendaftaran (6B). Agent tidak seed kategori.

Status: **dikonfirmasi Alif 7 Okt 2026** (kategori SiDOPI + flag + kota aktif). 6A selesai.

---

## F14.6b — Form daftar + Admin leads (7 Oktober 2026)

**Status:** dikonfirmasi Alif 8 Oktober 2026.

### Keputusan

| Topik | Keputusan |
|---|---|
| Validasi | Server ambil flag kategori dari DB via `batch_id` → `category_id` → `batch_categories`; jangan percaya klien |
| Non-SiDOPI | Field tidak tampil; nilai klien diabaikan; simpan `practice_location_id` / `ukuran_baju` = null |
| Admin | Kolom Lokasi Praktek + Ukuran Baju di tabel, detail, export (individu) |
| Relasi | `batches.category_id` → `batch_categories.id` |

Status: **dikonfirmasi Alif 8 Okt 2026.** 6B selesai.

---

## F14.6c — Excel kelompok (8 Oktober 2026)

**Status:** dikonfirmasi Alif 8 Oktober 2026. F14.6 selesai (6A+6B+6C).

### Keputusan

| Topik | Keputusan |
|---|---|
| Template | Klien, `xlsx` dynamic import. Sheet Peserta + sheet Daftar Pilihan hanya bila flag aktif |
| Parser | `parsePesertaPerusahaan` di server. Kota aktif diambil action dari DB by `batch_id`, bukan dari klien |
| Flag off | Kolom tambahan diabaikan; `practice_location_id` / `ukuran_baju` = null |
| Admin | Detail peserta kelompok: dua kolom, "—" bila kosong. Tanpa export peserta baru |

Status: **dikonfirmasi Alif 8 Okt 2026 (riwayat).** Dikoreksi 2026-10-08: status registry F14.6 = TODO, uji ulang.

---

## Penutup batch Modul 14 (8 Oktober 2026)

Enam permintaan meeting 4 Oktober 2026 sudah dikodekan (ADR-027). Dikoreksi 2026-10-08: status registry F14.1 sampai F14.6 adalah TODO untuk uji ulang.

Yang berjalan di kode: badge Autel di kartu retail; menu dan salinan “Pendaftaran Kelompok” dengan minimal 3 peserta; foto instruktur 4:5 dan label Catatan (kolom `bio_*` tetap); section Partner Kami; saklar LMS Freemium yang tertutup kecuali nilai `'true'`, dengan pratinjau Admin; program lewat flag kategori (bukan hardcode SiDOPI), kota praktek global, filter `?kategori=`, field lokasi/ukuran di daftar individu dan Excel kelompok.

Yang sengaja tidak diganti: rute `/admin/pendaftaran-perusahaan`, tabel `company_*`, kolom `bio_*`. Email `minat_batch` tetap ditahan Fase 2. Export Excel per peserta kelompok tidak dibuat. Teks 25 larangan PRD §13 tidak diubah.

---

## Audit dokumen inti 2026-10-08

Sumber kebenaran: kode di repo. Tiga dokumen diselaraskan. Kode aplikasi tidak diubah. Status F14.1–F14.6 di registry = TODO (uji ulang). Riwayat uji di bagian plan.md di atas **tidak ditimpa**; yang berlaku untuk serah-terima adalah baris registry.

### 1. Catatan ketidakkonsistenan

| No | Dokumen & bagian | Temuan | Bukti di kode | Tingkat | Tindakan |
|---|---|---|---|---|---|
| 1 | Registry F14.1–F14.6; ADR-027; Bagian 11 | Status tertulis selesai uji, padahal Alif minta uji ulang | Berkas F14 ada di `src/` (badge, saklar, flag, Excel) | Tinggi | Sudah diperbaiki: status aktif TODO. Riwayat uji Bagian 11 diubah jadi “diuji Alif (riwayat)”, tidak dihapus |
| 2 | ENGINEERING §2.1; PRD §2 | Next.js 15 dan next-intl 3.x vs paket terpasang | `package.json`: next 16.3.4, react 19.2.8, next-intl ^4.14.2 | Tinggi | Sudah diperbaiki dengan catatan Dikoreksi. Baris kunci 5 Sep di PRD tetap, ditambah catatan |
| 3 | PRD §15 | Klaim email lead hanya jenis penawaran | `katalog/[slug]/actions.ts` jenis penawaran; `daftar-perusahaan-actions.ts` jenis pendaftaran_perusahaan. `minat_batch` tidak dipanggil | Tinggi | Sudah diperbaiki. Cabang minat_batch tetap ditahan |
| 4 | PRD §5 pembuka vs `database.ts` | “24 tabel” bukan inventaris sekarang. Lima tabel tidak disebut sebagai tabel di §5.1–5.1g | `material_chapter_files`, `certificate_order_items`, `merchandise_public_orders`, `company_registrations`, `company_registration_participants` ada di `database.ts` | Tinggi | Sudah diperbaiki: catatan Dikoreksi di §5.1h. Subbab lama tidak dihapus |
| 5 | Registry Berkas Sprint 0–1 | Path `src/app/(public)`, `admin-sidebar.tsx`, `src/app/layout.tsx` tidak ada | Layout hidup: `src/app/[locale]/(public)/layout.tsx`, shell `src/components/shell/admin-shell.tsx` | Sedang | Sudah diperbaiki sebagai peta path di kepala registry. Status DONE baris itu tidak diturunkan. Sel F14 diganti path penuh yang ada |
| 6 | ENGINEERING §2.2 vs kode | Larangan “tanpa chart” dan “tanpa next-themes” | `recharts` hanya di `src/app/admin/(protected)/overview/` (3 berkas). `next-themes` di `theme-provider.tsx` | Sedang | Ditutup 8 Okt 2026, opsi 2. Teks larangan tetap. Kalimat pengecualian di bawah tabel §2.2 |
| 7 | PRD §13 butir 25 vs Overview | Larangan grafik analitik vs chart Admin yang sudah dikodekan | Tiga impor `recharts`, semuanya di Overview Admin | Sedang | Ditutup 8 Okt 2026. Butir 25 tidak diubah. Kalimat pengecualian di §13.6 |
| 8 | Registry F08.1–F08.4, F09.1, F09.3, F09.4, F10.3–F10.6, F11.1–F11.3, F05.5, F00.9 | Status TODO/WIP, bukti kosong atau hanya prompt, sementara ADR dan kode sudah jalan | Contoh: `peserta-pendaftaran/`, `@sentry/nextjs`, `src/lib/email/` | Tinggi | F08.1–F08.4 DONE (24 Sep 2026). Ditutup 9 Okt 2026: F00.9, F05.5, F09.1–F09.4 (termasuk F09.2 yang sempat WIP), F10.3–F10.6, F11.1–F11.3 DONE. F10.2 tidak diubah |
| 9 | ENGINEERING §3.6 vs Functions di `database.ts` | Tujuh fungsi generated tidak masuk tabel §3.6 | `aktivasi_sertifikat_free_track`, `profil_identitas_lengkap`, lima `reorder_*` | Rendah | Sudah dicatat di §3.7 |
| 10 | Trigger cegah eskalasi role | Tidak ada di tiga dokumen maupun `database.ts` | Hanya di `backup-hexatara-2026-09-23.sql` (`prevent_role_self_escalation`). Guard aplikasi: `profiles.role === 'admin'` di `guard.ts` | Sedang | Ditutup 8 Okt 2026. Terverifikasi di database oleh Alif. Tercatat ENGINEERING §4.4. Tidak ada baris F05.9 di registry |
| 11 | PRD rujukan “ENGINEERING Bagian 12” untuk ADR | Bagian ADR sekarang Bagian 10 | Tabel pengalihan di awal ENGINEERING | Rendah | Sudah diperbaiki di dua kalimat PRD |

### 2. Dokumen yang diubah

| Dokumen | Bagian | Perubahan |
|---|---|---|
| feature-registry.md | Kepala, Modul 14, log | F14.1–F14.6 TODO, bukti uji ulang, path penuh. Peta path usang. Log koreksi |
| ENGINEERING.md | §2.1, §2.2, §3.7, ADR-027, Bagian 11 | Versi paket, catatan chart/themes, fungsi generated, status F14 jadi TODO uji ulang, riwayat tidak dihapus |
| PRD.md | §0, §2, §5.1h, §13.6, §15 | Rujukan ADR ke Bagian 10, versi terpasang, lima tabel, tegangan larangan 25, email kelompok |
| plan.md | Bagian ini | Laporan audit |

### 3. Klaim yang tidak bisa diverifikasi di kode

- Banyak bukti DONE Sprint 0–2 berupa kalimat uji browser. Audit ini tidak mengulang uji browser itu.
- Default SQL `butuh_lokasi_praktek` / `butuh_ukuran_baju` tidak terlihat di `database.ts` (tipe boolean saja). Perilaku kode: flag mati menyimpan null.
- Trigger `prevent_role_self_escalation`: **terverifikasi di database oleh Alif 8 Okt 2026** (bukan dari `database.ts`). Generator tipe tidak memuat fungsi trigger. Detail di ENGINEERING §4.4.

### 4. Perlu keputusan Alif

Butir A, B, dan C ditutup 8 Oktober 2026. Yang masih terbuka:

- **Status baris F10.2.** Sel statusnya `SKIP (bukan bug)/PERLU DICEK ALIF`, bukan token baku `SKIP`. Usulan: samakan menjadi `SKIP` dan pindahkan “perlu dicek Alif” ke kolom Bukti, atau Alif mengunci `DONE` jika cek Vercel sudah selesai. Jangan diubah sebelum keputusan itu.

### 5. Checklist uji ulang Alif

Saat lolos, ubah baris itu di `feature-registry.md` (Status DONE, tanggal, bukti uji) dan tambah satu baris Bagian 11. Jangan menghapus baris riwayat.

| Fitur | Langkah singkat | Dokumen saat menandai DONE |
|---|---|---|
| F14.1 | Beranda: lencana “Autel Robotics Authorized Dealer” di kartu jual drone, ID dan EN | feature-registry.md baris F14.1; ENGINEERING Bagian 11 satu baris |
| F14.2 | Excel kelompok 2 peserta ditolak; 3 peserta diterima. Menu Admin bertuliskan Pendaftaran Kelompok | sama, baris F14.2 |
| F14.3 | Foto instruktur tegak 4:5 di beranda. Form Admin label Catatan, tidak tampil di situs | sama, baris F14.3 |
| F14.4 | Tambah partner di Admin Konten → Partner Kami; logo tampil di bawah instruktur. Kosongkan: bagian hilang | sama, baris F14.4 |
| F14.5 | Matikan Akses LMS Freemium: pengunjung tidak masuk materi. Admin tetap bisa pratinjau. Nyalakan lagi | sama, baris F14.5 |
| F14.6 | Kategori dengan dua centang: lokasi dan ukuran di form individu dan Excel. Kategori tanpa centang: field tidak ada. Filter `/pelatihan?kategori=` nama program | sama, baris F14.6 |

### 6. Statistik

- Baris registry diperiksa: 114. Setelah uji Alif 9 Okt 2026: DONE 97, TODO 14, WIP 1, SKIP 1, status lain 1. Angka sebelumnya (8 Okt malam): DONE 84, TODO 26, WIP 2, SKIP 1, status lain 1. Nomor F tidak ganda.
- Masalah pada baris: 6 baris F14 status+path; puluhan path historis Sprint 0–1 (satu peta, bukan edit sel per sel); 20-an baris TODO bukti kosong yang kodenya mungkin sudah ada (tidak diubah).
- ADR diperiksa: ADR-001 s.d. ADR-027, plus ADR-011b, ADR-020r, ADR-022b. Tidak ada nomor ganda. Tidak ada lompatan 001–027.
- Tabel di `database.ts`: 37. View: 2. Inventaris PRD setelah koreksi menyebut kelimanya yang sebelumnya hilang dari daftar tabel. Fungsi generated: 10; §3.6 menyebut 3; selisih dicatat di §3.7.

### 7. Tindak lanjut keputusan Alif 8 Oktober 2026

Nama bagian tetap untuk rujukan silang: **Audit dokumen inti 2026-10-08**.

#### (a) Ringkasan

- **A.** Satu kalimat pengecualian ditambahkan di PRD §13.6 dan di bawah tabel ENGINEERING §2.2. Teks larangan asli (butir 25 dan dua baris §2.2) tidak diubah.
- **B.** Hanya F08.1–F08.4 naik DONE, bukti tanggal 24 September 2026, selaras ADR-021. Satu baris gabungan di ENGINEERING Bagian 11. F14.1–F14.6 tetap TODO. Sisanya tetap TODO/WIP; checklist di (d).
- **C.** Trigger role dicatat di ENGINEERING §4.4. Tidak ada baris registry F05.9, jadi tidak ada kolom Bukti yang ditambah. Bagian 11 dapat satu baris verifikasi. Kredensial akun uji tidak ditulis.

#### (b) Dokumen yang diubah pada tindak lanjut ini

| Dokumen | Bagian | Perubahan |
|---|---|---|
| PRD.md | §13.6 | Kalimat pengecualian chart Overview dan next-themes. Butir 25 tidak diubah |
| ENGINEERING.md | §2.2 | Baris larangan chart dan next-themes dikembalikan ke teks asli; kalimat pengecualian di bawah tabel |
| ENGINEERING.md | §3.7, §4.4, Bagian 11 | Trigger dijelaskan; ketiadaan di database.ts bukan bukti hilang; baris F08 dan baris verifikasi trigger |
| feature-registry.md | F08.1–F08.4, log | Status DONE, bukti 24 Sep 2026, berkas yang ada di repo |
| plan.md | Bagian «Audit dokumen inti 2026-10-08» | Butir A/B/C ditutup, checklist, status lain |

#### (c) Hasil grep butir A

Perintah: cari `from 'recharts'` di `src/`.

Tiga berkas, semuanya di Admin Overview:

- `src/app/admin/(protected)/overview/certificates-bar-chart.tsx`
- `src/app/admin/(protected)/overview/leads-status-pie.tsx`
- `src/app/admin/(protected)/overview/leads-trend-chart.tsx`

Tidak ada impor recharts di rute publik atau dashboard user. Pengecualian ditulis.

#### (d) Checklist uji Alif

Ditutup 9 Okt 2026. Alif menguji sendiri di browser. Tiga belas baris di bawah bertanda DONE (judul permintaan menulis «14»; daftar kode yang dikonfirmasi berisi 13). F14 tidak termasuk di sini. F10.2 tidak termasuk.

| Kode | Nama | Langkah klik | Dokumen saat DONE |
|---|---|---|---|
| F00.9 | Helper email | UAT A4.6: katalog, Minta penawaran, isi nama dan email. Email masuk ke alamat Pengaturan, bukan footer. UAT B1.1: selesai kuis, daftar, email verifikasi terkirim | DONE 9 Okt 2026 |
| F05.5 | Sentry | Tidak ada tombol di situs. Picu satu error di lingkungan yang DSN-nya terisi, lalu cek event di Sentry: tanpa cookie, badan form, atau email (kebijakan ENGINEERING §2.4) | DONE 9 Okt 2026 |
| F09.1 | Gambar detail pelatihan | Admin → Batch → ubah: unggah «Gambar Detail (ditampilkan utuh di halaman pelatihan)». Buka detail pelatihan publik: gambar utuh, tidak terpotong paksa | DONE 9 Okt 2026 |
| F09.2 | Galeri produk + thumbnail | Admin → Produk: isi Thumbnail (kartu katalog) dan galeri. Kartu katalog memakai thumbnail. Detail: panah carousel di dalam bingkai. Klik foto: membesar | DONE 9 Okt 2026 |
| F09.3 | Rasio hero 4:3 | Admin → Konten → Hero: unggah slide. Dialog crop memakai rasio 4:3. Slide tampil di beranda | DONE 9 Okt 2026 |
| F09.4 | Lightbox publik | UAT A4.4: buka detail produk, klik foto galeri, gambar membesar, tutup. Ulangi pada gambar hero di detail pelatihan | DONE 9 Okt 2026 |
| F10.3 | Kuis LMS | Di materi, jawab salah: tidak langsung lolos. Setelah selesai, tombol «Ulangi Ujian» mengulang kuis, bab yang sudah dibaca tidak terkunci ulang | DONE 9 Okt 2026 |
| F10.4 | Bukti bayar pendaftaran | Admin → Pendaftaran Batch: unggah «Bukti pembayaran» sebelum setuju. Admin → Peserta Pendaftaran: detail menampilkan bukti itu | DONE 9 Okt 2026 |
| F10.5 | Email verifikasi Resend | UAT B1.1–B1.2: daftar akun baru, email verifikasi masuk (bukan email bawaan polos Supabase), klik tautan, akun terverifikasi | DONE 9 Okt 2026 |
| F10.6 | Verifikasi lintas perangkat | Mulai daftar di perangkat asal sampai halaman menunggu. Buka tautan email di perangkat lain. Perangkat asal pindah ke dashboard, atau ke halaman login bertanda sudah terverifikasi bila sesi tidak terbentuk | DONE 9 Okt 2026 |
| F11.1 | Kategori produk | Admin → Produk → tambah/ubah: hanya combobox «Cari kategori produk…», tidak ada kotak teks kategori bebas. Badge di katalog mengikuti kategori itu | DONE 9 Okt 2026 |
| F11.2 | Ringkasan Leads | Admin → Overview: angka pendaftaran dan penawaran terpisah, grafik tren dua garis, pie status, batang sertifikat | DONE 9 Okt 2026 |
| F11.3 | Login Admin | Buka `/admin/login` (belum masuk): logo merek tampil di halaman, bukan form polos | DONE 9 Okt 2026 |

#### (e) Status lain: 1

Baris **F10.2**, status tertulis `SKIP (bukan bug)/PERLU DICEK ALIF`. Bukan `DONE`, `TODO`, `WIP`, atau `SKIP` polos, karena sel itu menggabungkan dua label. Isi: cek `NEXT_PUBLIC_SITE_URL` di Vercel dan urutan produk/pelatihan yang sudah dinilai bukan bug. Usulan penyeragaman ada di §4 bagian ini. Tidak diubah.

---

## Modul 15 — F15.1

Teks saja. Tanpa SQL. Status registry TODO.

### Audit (tidak diubah dulu)

Pencarian case-insensitive di `messages/*.json` dan `src/`.

| Temuan | Pemakaian | Keputusan |
|---|---|---|
| `pelatihan.pageTitle` / `pageSubtitle` | Heading `/pelatihan` (`pelatihan/page.tsx` ~125–126, namespace `pelatihan`) | Diubah (Tahap 2A) |
| `seo.pelatihanTitle` / `pelatihanDescription` | Metadata `/pelatihan` (`generateMetadata`, namespace `seo`) | Diubah (Tahap 2A) |
| `catalog.pageTitle` / `pageSubtitle` | Heading `/katalog` (`katalog/page.tsx` ~128–129, namespace `catalog`) | Diubah (Tahap 2B) |
| `seo.katalogTitle` / `katalogDescription` | Metadata `/katalog` | Diubah (Tahap 2B) |
| `nav.katalog` | Tidak ada pemanggil di `src/` | Diubah sesuai prompt, tidak tampil |
| `landing.scheduleHeading` | Heading section beranda, bukan judul halaman | Sengaja tidak diubah |
| `pelatihan.kosong`, `lmsClosed.description`, `legal.syaratKetentuan` | Kalimat isi, bukan judul halaman | Sengaja tidak diubah |
| `catalog.backToCatalog` ("Kembali ke Katalog" / "Back to Catalog") | Key ada, tidak dipakai di `src/`. Bukan frasa "Katalog Produk" / "Product Catalog" | Sengaja tidak diubah |
| Navbar + footer tautan `/katalog` | `layout.tsx` memakai `nav.produk`, bukan `nav.katalog` | Sengaja tidak diubah (`nav.produk` dilarang diubah) |
| Komentar `pelatihan/page.tsx` ~102 | Komentar kode, bukan UI | Sengaja tidak diubah |
| Email, breadcrumb | Tidak ada frasa judul itu | Tidak ada yang disamakan |

### Key yang diubah (lama → baru)

| Key | id lama → baru | en lama → baru |
|---|---|---|
| `pelatihan.pageTitle` | Jadwal Pelatihan → Direktori Pelatihan & Sertifikasi | Training Schedule → Training & Certification Directory |
| `pelatihan.pageSubtitle` | Pelatihan pilot drone bersertifikat (Remote Pilot Certificate) bersama instruktur berpengalaman. → Jelajahi berbagai pilihan program pelatihan drone, mulai dari tingkat dasar hingga spesialisasi industri | Certified drone pilot training (Remote Pilot Certificate) with experienced instructors. → Discover our comprehensive drone training programs, ranging from beginner courses to advanced industry specializations |
| `seo.pelatihanTitle` | sama dengan pageTitle | sama dengan pageTitle |
| `seo.pelatihanDescription` | deskripsi SEO lama → subtitle baru | deskripsi SEO lama → subtitle baru |
| `catalog.pageTitle` | Katalog Produk → Hexatara Marketplace | Product Catalog → Hexatara Marketplace |
| `catalog.pageSubtitle` | Drone profesional Autel untuk kebutuhan survei, pemetaan, dan industri. → Jelajahi pilihan drone, suku cadang, flight gear & aksesori, serta merchandise eksklusif Hexatara. | Professional Autel drones for survey, mapping, and industrial needs. → Explore our diverse selection of drones, spare parts, flight gears & accessories, and exclusive Hexatara merchandise. |
| `seo.katalogTitle` | Katalog Produk → Hexatara Marketplace | Product Catalog → Hexatara Marketplace |
| `seo.katalogDescription` | deskripsi SEO lama → subtitle baru | deskripsi SEO lama → subtitle baru |
| `nav.katalog` | Katalog Produk → Marketplace | Product Catalog → Marketplace |

`pnpm tsc --noEmit`, `pnpm lint`, `pnpm test`: lolos (2026-10-11). Tes: 14 lulus. F15.1 DONE 12 Okt 2026 (konfirmasi Alif).

---

## Modul 15 — F15.2

Teks label saja. Tanpa SQL. Status registry TODO.

### Audit

| Tempat | Teks lama | Keputusan |
|---|---|---|
| `batch.register.pasFotoLabel` | Pas foto / Passport photo | Diubah |
| `batch.register.errPasFoto` | Pas foto wajib diunggah. / Passport photo is required. | Diubah |
| `daftar-batch-dialog.tsx` FotoPicker | hint format bersama KTP | Hint pas foto ditambah kalimat latar merah |
| `daftar-batch-actions.ts` | Foto KTP dan pas foto wajib diunggah … | Diubah, tetap hardcode Indonesia |
| `identitas-form.tsx` | Pas Foto | Diubah + hint |
| `identitas-foto-field.tsx` toast | Pas foto berhasil diunggah. | Diubah |
| Admin `pendaftaran-batch-detail.tsx`, `peserta-pendaftaran-detail.tsx` | Pas foto | Diubah |
| `pendaftaran-batch/page.tsx` | catatan signed URL 5 menit | Tidak diubah (bukan label field) |
| Pendaftaran kelompok / Excel | tidak ada unggah foto | Tidak berlaku |
| Kolom `pas_foto_url`, field `pas_foto` | — | Tidak diubah |

### Lama → baru

| File | Lama | Baru |
|---|---|---|
| `messages` `pasFotoLabel` | Pas foto / Passport photo | Pas Foto (Background Merah) / Passport Photo (Red Background) |
| `messages` `pasFotoHelper` (baru) | — | Gunakan pas foto dengan latar belakang merah. / Use a passport photo with a red background. |
| `messages` `errPasFoto` | Pas foto wajib diunggah. / Passport photo is required. | Pas foto (background merah) wajib diunggah. / Passport photo (red background) is required. |
| `daftar-batch-actions.ts` | Foto KTP dan pas foto wajib diunggah (JPG/PNG/WebP, maks. 5 MB). | Foto KTP dan pas foto (background merah) wajib diunggah (JPG/PNG/WebP, maks. 5 MB). |
| `identitas-form.tsx` | Pas Foto | Pas Foto (Background Merah) + hint latar merah |
| `identitas-foto-field.tsx` | Pas foto berhasil diunggah. | Pas foto (background merah) berhasil diunggah. |
| dua detail Admin | Pas foto | Pas Foto (Background Merah) |

`pnpm tsc --noEmit`, `pnpm lint`, `pnpm test`: lolos. Tes: 14 lulus. F15.2 DONE 12 Okt 2026 (konfirmasi Alif).

---

## Modul 15 — F15.3

Tanpa SQL. Status registry TODO.

### Audit

15 pemanggilan `<DataTable` di 14 berkas. Tidak satu pun mengirim `enableRowSelection`, `rowSelection`, `onSelectionChange`, atau `getSelectedRowModel`. Tidak ada aksi massal yang membaca baris terpilih. Tidak ada tabel yang dikecualikan.

| Berkas | Pemakaian pilihan baris |
|---|---|
| `batch/batch-table.tsx` | tidak |
| `konten/instructor-list.tsx` | tidak |
| `konten/partner-list.tsx` | tidak |
| `konten/popup-list.tsx` | tidak |
| `konten/sale-banner-list.tsx` | tidak |
| `konten/testimonial-list.tsx` | tidak |
| `leads/penawaran-table.tsx` | tidak |
| `merchandise/pesanan/pesanan-merchandise-table.tsx` | tidak |
| `merchandise/pesanan-publik/pesanan-publik-table.tsx` | tidak |
| `pendaftaran-batch/pendaftaran-batch-table.tsx` | tidak |
| `pendaftaran-perusahaan/pendaftaran-perusahaan-table.tsx` | tidak |
| `peserta-pendaftaran/peserta-pendaftaran-table.tsx` | tidak |
| `sertifikat/sertifikat-table.tsx` | tidak |
| `upgrade/upgrade-tables.tsx` (2 tabel) | tidak |

Footer DataTable tidak punya teks "N dari M baris dipilih". `colSpan` baris kosong memakai `columnsWithSelect.length`, jadi ikut menyusut saat kolom `_select` tidak ditambah. Lebar `w-10` hanya untuk header `_select`.

### Perubahan

`src/components/data-table.tsx`: `enableRowSelection` default `true` → `false`. Prop tidak dihapus. `ProdukTable` dan `BabList` tidak disentuh.

`pnpm tsc --noEmit`, `pnpm lint`, `pnpm test`: lolos (14 tes). `pnpm knip` gagal pada temuan lama (field.tsx, skeleton.tsx, shadcn, tw-animate-css, tailwindcss, puluhan export UI). Tidak ada temuan baru di `data-table.tsx`. F15.3 DONE 12 Okt 2026 (konfirmasi Alif).

---

## Modul 15 — F15.4

Tanpa SQL. FK tidak diubah. Status registry TODO.

### Verifikasi

`hapusBatchAction` dipanggil hanya dari `batch-row-actions.tsx`, yang dipasang di `batch-table.tsx`. Toggle Aktif tetap di `batch-active-switch.tsx` / `toggleAktifBatchAction` dan tidak disentuh.

FK ke `batches` di `database.ts` dan SQL usulan/backup:

| Tabel | ON DELETE |
|---|---|
| `batch_benefits`, `batch_equipment`, `batch_faqs`, `batch_gallery`, `batch_requirements` | CASCADE (backup 2026-09-23) |
| `batch_leads` | SET NULL |
| `batch_registrations` | CASCADE |
| `company_registrations` | NO ACTION (`references batches(id)` tanpa ON DELETE) |
| `company_registration_participants` | CASCADE dari `company_registrations`, bukan dari `batches` |

Tidak ada FK `batch_id` di sertifikat, upgrade, atau tabel lain di `database.ts`.

### Perubahan

Sebelum delete, hitung `batch_registrations` dan `company_registrations`. Total > 0: tidak delete, pesan menyebut jumlah yang bukan nol plus saran Nonaktifkan. Error `23503` memakai pesan sejenis. Error lain tetap "Coba lagi", dengan `console.error` berisi `code`, `message`, `details`. Dialog hapus menjelaskan aturan itu. Toast error 10 detik.

### Uji manual Alif

- (a) Batch baru tanpa pendaftar bisa dihapus.
- (b) Batch dengan pendaftar perorangan ditolak; baris pendaftar tetap ada.
- (c) Batch dengan pendaftaran kelompok ditolak; baris kelompok tetap ada.
- (d) Toggle Aktif tetap menyembunyikan atau menampilkan batch di publik.

`pnpm tsc --noEmit`, `pnpm lint`, `pnpm test`: lolos. Tes: 18 lulus (4 baru untuk pesan hapus). F15.4 DONE 12 Okt 2026 (konfirmasi Alif).

---

## Modul 15 — F15.5

Ditahan dulu karena `database.ts` belum memuat kolom. Setelah regenerate, kedua kolom ada: `batch_categories.butuh_kategori_peserta` dan `batch_registrations.kategori_peserta` nullable. Enum tidak berubah. Kolom `butuh_metode_kelas_teori` ada di tipe dan tidak disentuh.

Tanpa SQL baru. Pendaftaran kelompok tidak diubah. Status registry TODO.

### Perubahan

Checkbox Admin "Butuh kategori peserta (Penerbitan Baru / Renewal)" mengikuti flag lokasi dan ukuran baju. Form publik merender dan mengirim pilihan itu hanya jika flag true. Server membaca flag dari database: flag hidup mewajibkan enum; flag mati mengabaikan kiriman klien dan menyimpan NULL. Tabel, detail, dan Excel Admin memakai label yang aman untuk null ("—"). Baris pendaftar lama tidak di-update.

Flag yang sudah tersimpan tetap false sampai Admin mencentangnya. Kategori SiDOPI belum otomatis menampilkan field.

### Uji manual Alif

- (a) Kategori tanpa flag (misalnya Advanced): dialog tidak menampilkan Baru/Renewal; pendaftaran baru tersimpan null; Admin menampilkan "—".
- (b) Centang flag pada SiDOPI: field tampil dan wajib.
- (c) Pendaftar lama tetap menyimpan nilai lama.
- (d) Export Excel Admin tidak error pada baris null.

`pnpm tsc --noEmit`, `pnpm lint`, `pnpm test`: lolos. Tes: 22 lulus (4 baru untuk resolver dan label). F15.5 DONE 12 Okt 2026 (konfirmasi Alif: checkbox kategori benar; publik menyembunyikan Baru/Renewal bila flag tidak dicentang).

---

## Modul 15 — F15.6

Tanpa SQL baru. Kolom `alamat` tidak dihapus dan tidak diganti nama. Status registry TODO.

### Audit

`batches.alamat` dipakai form Admin, simpan, salin batch, dan halaman detail publik. Label "Waktu" / "Alamat" hanya di detail publik (`timeLabel`, `addressLabel`). Kartu jadwal, direktori, dashboard pelatihan, dan kursus menampilkan tanggal serta lokasi tanpa label itu. Email tidak menyebut jadwal atau alamat batch. Tempat itu tidak diubah.

### Perubahan

Checkbox kategori "Butuh metode kelas teori". Form batch membaca flag dari daftar kategori yang sudah dimuat. Flag hidup: label bagian tanggal "Jadwal Kelas Teori", select metode, textarea alamat hanya untuk Hybrid dan Full Tatap Muka. Virtual menyimpan alamat null. Server membaca flag dari database; flag mati menyimpan metode null dan mempertahankan alamat. Salin batch ikut menyalin metode. Publik memakai key i18n baru. Batch berflag tetapi metode kosong tetap tampilan lama.

### Uji manual Alif

- (1) Centang flag pada kategori RPC.
- (2) Buat atau ubah batch RPC: label jadwal dan dropdown metode muncul; alamat hanya untuk Hybrid dan Full Tatap Muka.
- (3) Halaman publik RPC: Jadwal Kelas Teori + Metode. Virtual tanpa alamat. Hybrid atau Tatap Muka dengan Alamat Kelas Teori.
- (4) Batch kategori lain tidak berubah.
- (5) Batch RPC lama tanpa metode tampil seperti dulu.

`pnpm tsc --noEmit`, `pnpm lint`, `pnpm test`: lolos. Tes: 25 lulus (3 baru untuk label dan resolver metode). F15.6 DONE 12 Okt 2026 (konfirmasi Alif).

---

## Modul 15 — F15.7

Tanpa SQL. Audit Tahap 1 membuktikan tidak ada constraint UNIQUE pada kolom `urutan` di `products`, `hero_slides`, `instructors`, `partners`, `testimonials`, maupun `practice_locations` — hanya `material_chapters`/`material_chapter_files` yang UNIQUE (sudah dipakai RPC dua-fase sebelumnya, tidak disentuh). Status registry TODO.

### Audit Tahap 1 — menu dengan kolom `urutan`

| Menu | Status sebelum | Keterangan |
|---|---|---|
| Produk (termasuk Merchandise, tabel yang sama) | Sudah panah (tabel) + **input angka ganda di form** | `produk-table.tsx` sudah `ReorderButtons`; `produk-form.tsx` masih punya field "Urutan" yang ikut terkirim saat edit |
| Hero Beranda | Sudah panah (tabel) + **input angka ganda di form** | `hero-slide-list.tsx` sudah arrow lokal (dipindah ke hook); `hero-slide-form-dialog.tsx` masih punya field "Urutan" |
| Bab Materi, Lampiran File, Bank Soal | Sudah panah | `ReorderButtons` + `reorder_*_action`/RPC, tanpa input angka di form — tidak disentuh |
| Kategori Produk, Kategori Batch | Sudah panah | RPC `reorder_batch_categories` lewat `kategori-manager.tsx` — tidak disentuh |
| Lokasi Praktek | **Masih angka** | Kolom tabel polos + input "Urutan" di dialog, tanpa arrow sama sekali |
| Instruktur | **Masih angka** | Kolom sortable di `DataTable` (pagination 10/klik header) + input "Urutan" di dialog + baris "Urutan" di Detail |
| Partner Kami | **Masih angka** | Sama pola Instruktur |
| Testimoni | **Masih angka** | Sama pola Instruktur |
| Batch: Fasilitas/Syarat/Peralatan/FAQ/Galeri | Tidak relevan | `batches/actions.ts` menulis `urutan: index` dari posisi array form (replace-all saat simpan) — tidak ada baris independen untuk di-reorder, pola sama `product_images` |
| Popup, Sale Banner, Company Profile, Tentang Kami | Tidak relevan | Tidak ada kolom `urutan` sama sekali |

Konfirmasi ordering publik: `/pelatihan`, `/pelatihan/[slug]` (lokasi praktek), Beranda (hero, instruktur, partner, testimoni), `/katalog` — semua sudah `order('urutan')` di query, tidak diubah.

### Perubahan

- Hook bersama `src/components/admin/use-reorder-list.ts` (`daftar`, `setDaftar`, `pending`, `pindah`) — pola persis `ProdukTable` sebelumnya (reorder selalu terhadap daftar penuh, rollback + toast saat Server Action gagal). `ProdukTable` dan `HeroSlideList` direfaktor memakainya tanpa mengubah perilaku/tampilan.
- Helper murni baru `nextUrutan()` di `src/lib/reorder.ts` — `max(urutan) + 1`, dipakai Server Action insert untuk Hero, Lokasi Praktek, Instruktur, Partner, Testimoni (item baru selalu di baris paling bawah). **Produk/Merchandise SENGAJA tidak dipasangi `nextUrutan()`** — grouped per kategori, ditahan untuk Prompt 8 sesuai arahan; insert tetap memakai default kolom (0) seperti sebelumnya, hanya input manualnya yang dihapus.
- Lokasi Praktek, Instruktur, Partner, Testimoni: kolom/baris "Urutan" dan input angkanya dihapus dari tabel, dialog, dan (Instruktur) Detail; diganti `<ReorderButtons>` + Server Action baru (`reorderLokasiPraktekAction`, `reorderInstructorAction`, `reorderPartnerAction`, `reorderTestimonialAction`) yang meng-update `urutan = index` per baris (pola sama `reorderProdukAction`, kolom tidak UNIQUE).
- Instruktur, Partner, Testimoni: list diganti dari `DataTable` (pagination) ke tabel polos + pencarian + filter status `Select`, karena reorder arrow harus bekerja di atas daftar penuh, bukan satu halaman pagination. Switch aktif, aksi baris (ubah/hapus), dan dialog Detail (Instruktur) dipertahankan apa adanya.
- Field zod `urutan` dihapus dari enam schema admin (`produk-admin`, `hero-slide-admin`, `practice-location-admin`, `instructor-admin`, `partner-admin`, `testimonial-admin`); Server Action `simpan*Action` untuk keenamnya tidak lagi menulis `urutan` saat update (kolom tidak tersentuh, tidak ada lagi dua cara mengubah urutan).

### Uji manual Alif

Untuk tiap menu (Produk, Hero, Lokasi Praktek, Instruktur, Partner, Testimoni):
- (a) Tambah item baru → muncul paling bawah (Produk/Merchandise: tetap di urutan 0/teratas seperti sebelumnya, belum ikut diseragamkan — ditahan ke Prompt 8).
- (b) Klik panah naik/turun → urutan berubah dan tetap setelah refresh halaman.
- (c) Halaman publik (Beranda, `/katalog`, `/pelatihan/[slug]` lokasi praktek) mengikuti urutan baru.
- (d) Tidak ada lagi input atau kolom angka "Urutan" di form maupun tabel manapun.
- (e) Mengubah (edit) item tidak memindahkan posisinya.
- (f) Panah atas pada item pertama dan panah bawah pada item terakhir nonaktif (abu-abu, tidak bisa diklik); panah nonaktif juga saat pencarian/filter aktif.

`pnpm tsc --noEmit`, `pnpm lint`, `pnpm build`: bersih. `pnpm test`: 29 lulus (4 baru untuk `moveItem`/`nextUrutan`). `pnpm knip`: tidak ada temuan baru (seluruh temuan yang muncul sudah ada sebelum F15.7, komponen shadcn/dependency yang sudah diketahui). F15.7 DONE 12 Okt 2026 (konfirmasi Alif).

---

## Modul 15 — F15.8

Tanpa SQL. Prasyarat F15.7 (`useReorderList`) terpenuhi. Status registry TODO.

### Audit Tahap 1

**1. Query yang menampilkan daftar produk / memakai `urutan`:**

| Lokasi | Termasuk merchandise? | Keterangan |
|---|---|---|
| `src/components/produk-section.tsx` (landing "Produk") | **Ya (bug)** | `products_public` tanpa filter kategori, `order('urutan').limit(6)` — diperbaiki |
| `src/app/[locale]/(public)/katalog/page.tsx` (`/katalog`) | Ya, memang disengaja | Etalase gabungan; default sebelumnya `created_at desc`, sekarang `urutan` (grouped) |
| `src/app/[locale]/(public)/katalog/[slug]/page.tsx` ("Produk Lain") | Tidak relevan | Suggestion sudah `.eq('category_id', produk.category_id)` — satu produk hanya menyarankan produk SATU kategori yang sama, tidak pernah mencampur merch dengan non-merch. Tidak diubah |
| `src/lib/merchandise.ts getProdukMerchandiseAktif` (dashboard user) | Hanya merchandise | Sudah `.ilike('category_nama_id','merchandise')`, tidak diubah |
| `src/app/admin/(protected)/produk/page.tsx` | **Ya (bug)** | Semua `products` tanpa filter, `ProdukTable` + `reorderProdukAction` menulis `urutan=index` untuk SELURUH baris yang dikirim arrow — reorder di sini dulu ikut menimpa urutan merchandise. Diperbaiki (exclude Merchandise, NULL-safe) |
| `src/app/admin/(protected)/merchandise/page.tsx` | Hanya merchandise | Sudah `.eq('category_id', kategoriId)`, reorder-nya sendiri sudah aman (hanya mengirim id merchandise) — tapi memakai Server Action yang sama (`reorderProdukAction`) tanpa validasi kelompok. Diberi action & validasi terpisah |
| `src/app/sitemap.ts` | Tidak relevan | Path statis saja, tidak query `products` |

**2. Sort `/katalog`:** `SORT_VALUES = ["terbaru","hargaAsc","hargaDesc"]`, default `"terbaru"` (`created_at desc`). **Tanpa pagination** — seluruh hasil query dirender sekaligus (tidak ada `.range()`/halaman) — jadi sort kelompok untuk opsi baru aman dikerjakan di JS setelah fetch, sesuai arahan kalau tidak ada pagination.

**3. Pindah kategori produk/merchandise:** `ProdukForm`/`KategoriCombobox` menampilkan SEMUA `product_categories` (termasuk "Merchandise") baik dibuka dari `/admin/produk` maupun `/admin/merchandise` — Admin bisa memindahkan produk masuk/keluar kelompok Merchandise lewat kedua halaman edit yang sama. Logika "urutan ke akhir kelompok tujuan saat pindah kelompok" karena itu ditaruh di satu tempat (`simpanProdukAction`), bukan dua.

### Perubahan

- `src/lib/produk-sort.ts` (baru) — tiga fungsi murni dipakai bersama Server Action dan halaman publik:
  - `masukKelompokMerch(categoryId, kategoriMerchId)` — satu definisi kelompok dipakai di semua tempat.
  - `urutanBerikutnyaUntukKelompok(items, kategoriMerchId, isMerch)` — `max(urutan)+1` **hanya dari baris di kelompok yang sama** (membungkus `nextUrutan()` dari F15.7).
  - `compareKatalogUrutan(a, b, kategoriMerchId)` — komparator sort `/katalog`: kelompok produk dulu lalu merchandise, dalam kelompok `urutan` naik, dasi `created_at` terbaru dulu.
- `src/app/admin/(protected)/produk/actions.ts`:
  - `simpanProdukAction` sekarang menghitung kelompok (produk/merchandise) dari `category_id` yang disimpan. **Tambah baru** → `urutan` = akhir kelompok tujuan (bukan default 0 lagi — inilah Prompt 8 yang ditahan di F15.7). **Ubah, kelompok tetap sama** → `urutan` tidak disentuh (perilaku F15.7 dipertahankan). **Ubah, pindah kelompok** (lewat ganti kategori ke/dari Merchandise) → `urutan` diset ke akhir kelompok TUJUAN.
  - `reorderProdukAction` (kelompok produk) dan `reorderMerchandiseAction` (kelompok merchandise, baru) — keduanya memanggil `reorderKelompok()` bersama, yang memvalidasi di server bahwa SEMUA id yang dikirim benar-benar anggota kelompok yang diklaim (query ulang `category_id` tiap id) sebelum menulis `urutan=index` — reorder di satu menu tidak bisa lagi menimpa baris kelompok lain, bahkan kalau client mengirim id yang salah.
- `src/app/admin/(protected)/produk/produk-table.tsx` — `ProdukTable` menerima `reorderAction` sebagai prop opsional (default `reorderProdukAction`, perilaku lama tetap jika tidak diisi).
- `src/app/admin/(protected)/produk/page.tsx` (Admin Produk) — query `products` dikecualikan dari kategori Merchandise lewat `.or('category_id.is.null,category_id.neq.<id merch>')` (NULL-safe: produk tanpa kategori tetap tampil). Kalau kategori Merchandise belum pernah dibuat, tidak ada filter sama sekali (tampil semua, seperti sebelumnya).
- `src/app/admin/(protected)/merchandise/page.tsx` (Admin Merchandise) — `ProdukTable` dipanggil dengan `reorderAction={reorderMerchandiseAction}`. Query & pesan kosong tidak diubah (sudah benar).
- `src/components/produk-section.tsx` (landing) — query `products_public` ditambah `.or('category_id.is.null,category_id.neq.<id merch>')` (NULL-safe), `order('urutan').limit(6)` dipertahankan.
- `src/app/[locale]/(public)/katalog/sort-options.ts` — `SORT_VALUES` tambah `"urutan"` di depan; `src/app/[locale]/(public)/katalog/page.tsx` — default sort jadi `"urutan"` (bukan `"terbaru"`), opsi `"terbaru"`/`"hargaAsc"`/`"hargaDesc"` tetap ada dan tetap di-query di DB seperti sebelumnya. Untuk `"urutan"`: tanpa `ORDER BY` di query, hasil disortir di JS dengan `compareKatalogUrutan()` (kolom `urutan` ditambahkan ke `select()`). Filter kategori yang sudah ada tidak diubah, tetap bekerja untuk semua opsi sort.
- `messages/id.json`/`en.json` — `catalog.sort.urutan`: "Urutan Pilihan" / "Featured Order".
- Data lama: `urutan` existing mungkin tumpang-tindih antar kelompok (semua pernah di-reorder lewat `reorderProdukAction` sebelum F15.8 saat Produk dan Merchandise masih satu daftar tercampur). **Tanpa SQL** — begitu Admin melakukan reorder pertama kali di salah satu menu setelah F15.8, kelompok itu langsung ternormalisasi `0..n`; kelompok yang belum pernah di-reorder ulang bisa saja masih punya nilai `urutan` yang tumpang-tindih dengan kelompok lain, tapi karena `compareKatalogUrutan()` dan kedua `reorderKelompok()` SELALU memfilter per kelompok dulu sebelum membandingkan/menulis angka, tumpang-tindih angka mentah TIDAK menyebabkan interleaving yang salah di tampilan manapun.

### Uji manual Alif

- (a) Di Admin Produk, geser urutan satu produk naik/turun → cek di Admin Merchandise, urutan merchandise tidak berubah.
- (b) Di Admin Merchandise, geser urutan satu merchandise → cek di Admin Produk, urutan produk tidak berubah.
- (c) Landing (Beranda) section "Produk" menampilkan 6 produk NON-merchandise sesuai urutan Admin — tidak ada merchandise yang muncul di situ.
- (d) `/katalog` tanpa parameter sort (default) menampilkan produk dulu (urutan Admin) lalu merchandise (urutan Admin) — klik opsi "Harga Terendah ke Tertinggi"/"Harga Tertinggi ke Terendah" tetap berfungsi seperti sebelumnya.
- (e) Tambah merchandise baru dari Admin Merchandise → muncul paling akhir di antara merchandise lain (tidak ikut urutan produk). Tambah produk baru dari Admin Produk → muncul paling akhir di antara produk lain.
- (f) Pindahkan satu produk ke kategori "Merchandise" lewat form edit → produk itu hilang dari Admin Produk, muncul di akhir daftar Admin Merchandise.
- (g) Dashboard Merchandise user (`/dashboard/merchandise`) tetap berurutan seperti sebelumnya (tidak terpengaruh).

`pnpm tsc --noEmit`, `pnpm lint`, `pnpm build`: bersih. `pnpm test`: 38 lulus (9 baru: `masukKelompokMerch`, `compareKatalogUrutan`, `urutanBerikutnyaUntukKelompok`). `pnpm knip`: tidak ada temuan baru. F15.8 DONE 12 Okt 2026 (konfirmasi Alif).


