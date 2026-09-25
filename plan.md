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
