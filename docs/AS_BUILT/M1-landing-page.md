# MODUL 1 — LANDING PAGE · AS BUILT

> Diisi dari apa yang **benar-benar dibangun** (kode + kolom Bukti `feature-registry.md`),
> bukan dari rencana PRD semata. Perubahan setelah Sprint 1 (redesign, ADR-020r, F10.1)
> dicatat apa adanya supaya tidak dikira Modul 1 masih persis seperti uji 2026-09-07.

**Selesai (uji internal Sprint 1):** 2026-09-07 · **UAT Hexatara:** belum diisi di tabel UAT registry · **Fitur:** F01.1 – F01.14 (semua DONE di registry; beberapa jalur publik diganti modul berikutnya — lihat Keputusan)

---

## Apa yang dilakukan modul ini

Halaman depan Hexatara memperkenalkan dua penawaran sekaligus: pelatihan pilot drone dan penjualan drone, lalu mengarahkan pengunjung ke jadwal pelatihan, konten perusahaan, dan kontak WhatsApp Admin. Admin mengatur isi pop-up, banner, hero, jadwal batch, instruktur, profil perusahaan, dan testimoni tanpa mengubah kode. Pendaftaran resmi ke batch sekarang memakai form lengkap di halaman pelatihan (bukan lagi form “minat” singkat Sprint 1).

## Alur pengguna

Seperti yang berjalan di sistem final (setelah redesign F06.10/F06.11 dan penggantian F01.6):

```
1. Pengunjung membuka / (landing).
2. Pop-up aktif (jika ada baris popups yang cocok) muncul sekali per sesi browser; bisa ditutup.
3. Sale banner aktif tampil di atas; hilang saat Admin menonaktifkan / tidak ada baris aktif.
4. Hero: dua kartu penawaran (pelatihan + jual drone) + carousel hero_slides bila ada.
5. Section jadwal batch (dari tabel batches) — status closed tanpa tombol daftar.
6. Section produk ringkas, CTA verifikasi sertifikat, company profile, instruktur, testimoni, FAQ.
7. Floating WhatsApp → wa.me ke nomor Admin (hanya tautan).
8. Pemilih bahasa ID/EN di halaman publik.
9. Dari jadwal / “Lihat Jadwal” → listing /pelatihan atau detail /pelatihan/[slug]
   (URL lama /batch/[slug] hanya redirect).
10. Di detail pelatihan: tujuh elemen konten batch + form pendaftaran lengkap
    (batch_registrations, ADR-020r) — menggantikan dialog minat → batch_leads (F01.6).
11. Simpan pendaftaran dulu, lalu alur WA/Admin sesuai modul pendaftaran (bukan alur
    F01.6 yang sudah dihapus dari UI).
```

**Berbeda dari cerita PRD §6.2 / F01.6 asli:** form “minat” singkat ke `batch_leads` + WA otomatis setelah simpan **sudah tidak ada di UI publik** sejak F07.3 + pembersihan F10.1. Tabel `batch_leads` tetap di database sebagai riwayat.

## Yang bisa dilakukan Admin

| Tindakan | Halaman | Catatan (dari Bukti / kode) |
|---|---|---|
| CRUD batch + isi detail (benefit, silabus, peralatan, FAQ, galeri, gambar) | `/admin/batch`, `/admin/batch/baru`, `/admin/batch/[id]` | F01.12 Bukti 2026-09-07: tambah/ubah/hapus + konfirmasi, toggle aktif, unggah gambar |
| CRUD kategori batch | `/admin/batch/kategori` | Ditambah belakangan (ADR-012 / F06); bukan baris F01 asli |
| CRUD pop-up, banner, hero, instruktur, company profile, testimoni | `/admin/konten/*` | F01.13 Bukti: CRUD keenam area + toggle; langsung terlihat di publik |
| Lihat / ekspor permintaan penawaran produk | `/admin/leads/penawaran` | Bukan lead minat batch. Index `/admin/leads` redirect ke penawaran (F10.1) |
| Verifikasi pendaftaran batch resmi | `/admin/pendaftaran-batch` (dll.) | Modul 7 — bukan F01.14 |

## Tabel yang disentuh

| Tabel / view | Baca | Tulis | Catatan |
|---|---|---|---|
| `popups` | Publik + Admin | Admin | F01.1 |
| `sale_banners` | Publik + Admin | Admin | F01.2 — tanpa `setInterval` di komponen banner |
| `hero_slides` | Publik + Admin | Admin | F01.3 |
| `batches` | Publik + Admin | Admin | F01.4/F01.5/F01.12 |
| `batch_benefits`, `batch_equipment`, `batch_faqs`, `batch_gallery` | Publik + Admin | Admin | Anak detail batch |
| `batch_requirements` | Publik + Admin | Admin | Ditambah ADR-021 / modul belakangan; dipakai di detail `/pelatihan/[slug]` |
| `batch_categories` | Publik + Admin | Admin | Kategori dinamis (pasca Sprint 1) |
| `instructors` | Publik + Admin | Admin | F01.7 |
| `company_profile` | Publik + Admin | Admin | F01.8 |
| `testimonials` | Publik + Admin | Admin | F01.10 |
| `batch_leads` | — (UI Admin minat dihapus) | — (form publik dihapus) | F01.6/F01.14 historis; tabel **tidak dihapus** (F10.1 / PRD §9b) |
| `batch_registrations` | Admin pendaftaran | Form publik `/pelatihan/[slug]` | Pengganti alur minat (F07.3) |
| `quote_requests` | Admin leads penawaran | Form katalog (Modul 4) | Perluasan F01.14 2026-09-09; ekspor XLSX di `penawaran-export.ts` |

## Berkas utama

Jalur yang **ada di repo sekarang** (path registry F01 sering masih menyebut `src/app/(public)/…` tanpa `[locale]` — sudah pindah):

| Berkas | Isi |
|---|---|
| `src/app/[locale]/(public)/page.tsx` | Landing: susunan section + `dynamic = force-dynamic` |
| `src/components/popup-pembuka.tsx`, `popup-dialog-client.tsx` | Pop-up sesi |
| `src/components/sale-banner.tsx` | Banner teks Admin |
| `src/components/hero-section.tsx`, `hero-carousel.tsx` | Hero + carousel |
| `src/components/jadwal-batch-section.tsx` | Kartu jadwal di landing |
| `src/components/produk-section.tsx`, `verify-cta-section.tsx`, `faq-section.tsx` | Section tambahan redesign |
| `src/components/instruktur-section.tsx`, `company-profile-section.tsx`, `testimoni-section.tsx` | Konten bawah landing |
| `src/components/floating-whatsapp.tsx` | Tombol WA melayang |
| `src/app/[locale]/(public)/pelatihan/page.tsx`, `pelatihan/[slug]/page.tsx` | Listing + detail batch (pengganti `/batch`) |
| `src/app/[locale]/(public)/batch/[slug]/page.tsx` | Redirect ke `/pelatihan/[slug]` |
| `src/app/[locale]/(public)/pelatihan/[slug]/daftar-batch-dialog.tsx`, `daftar-batch-actions.ts` | Pendaftaran resmi (bukan F01.6) |
| `src/app/admin/(protected)/batch/**` | CRUD batch + anak |
| `src/app/admin/(protected)/konten/**` | CRUD konten landing |
| `src/app/admin/(protected)/leads/penawaran*.tsx`, `penawaran-export.ts` | Lead penawaran + XLSX |
| `src/i18n/`, `messages/`, `src/proxy.ts`, `src/lib/i18n/pick.ts` | Dwibahasa publik |

## Keputusan saat implementasi

1. **Dwibahasa kolom ganda + `localePrefix: as-needed` (ADR-002/003).** Landing dan seluruh publik memakai `pick()` / next-intl; URL Indonesia tanpa prefix supaya konsisten dengan QR verifikasi di kemudian hari.
2. **Sale banner = teks Admin, bukan mesin promo.** Tidak ada kupon, harga coret, atau hitung mundur (`setInterval` tidak ada di `sale-banner.tsx`). Sesuai larangan PRD §13.18–19 dan Bukti F01.2.
3. **Pop-up pakai sesi browser (`sessionStorage` pola F01.1).** Bukti: muncul sekali, hilang setelah tutup sampai sesi baru.
4. **Detail batch: tujuh elemen; bagian kosong disembunyikan.** Diuji F01.5 pada slug contoh; path publik sekarang `/pelatihan/[slug]` (F06.11), dengan redirect dari `/batch/[slug]`.
5. **Form minat F01.6 diganti form pendaftaran lengkap (F07.3 / ADR-020r).** Alasan produk: data KTP/identitas yang sebelumnya dikumpulkan Google Form manual. UI minat + Admin “Pendaftaran Minat” dihapus F10.1 karena orphan; `batch_leads` tetap di DB sebagai arsip.
6. **Ekspor lead.** Bukti F01.14 awal: CSV `batch_leads` + perluasan tab penawaran. ADR-016 / F06.16 menggeser ekspor ke XLSX. Setelah F10.1, UI ekspor minat hilang; yang tersisa di kode leads: ekspor **penawaran** XLSX (`penawaran-export.ts`). Klaim “ekspor lead minat XLSX” di PRD §6.5 **tidak lagi punya UI** untuk `batch_leads`.
7. **Floating WA hanya `wa.me`.** Bukti F01.9: tanpa API gateway.
8. **Email notifikasi Admin.** Jalur minat F01.6 publik sudah tidak ada (F10.1). Jalur hidup: permintaan penawaran (F04.5) → `kirimEmailLeadBaru({ jenis: 'penawaran' })` → `getAdminNotifyEmail()` (**DB-first** `site_settings.admin_notify_email`, fallback env). **Bukti e2e 2026-09-24:** submit ~15:05 WIB di `/katalog/evo-ii-pro-enterprise-v3`; email masuk ke alamat Pengaturan; latensi minim. Catatan terbuka F01.6 ditutup.
9. **Redesign beranda (F06.10).** Urutan section dan footer/halaman statis berubah dari layout Sprint 1; Bukti F06.10: tampilan sesuai list uji Alif (kurang detail per section dibanding F01.x).
10. **Cabang email `minat_batch` ditahan (2026-09-24).** Bukan dead code untuk dibersihkan knip; menunggu Fase 2 email notifikasi pendaftaran batch. Lihat PRD.md §15.

## Yang sengaja TIDAK dibangun

(Merujuk larangan PRD §13 yang relevan Modul 1 / konten publik, plus keputusan produk Fase 1.)

- Sale banner sebagai mesin kupon / harga coret / diskon bertingkat / hitung mundur (§13.18–19).
- Payment gateway, keranjang, checkout batch di landing (§13.8, §13.21).
- WhatsApp Gateway, blast, chatbot (§13.23) — hanya tautan `wa.me`.
- Validasi MX / blacklist domain pada form kontak/penawaran (§13.20) — relevan form katalog; form minat lama juga tanpa itu.
- Generator quotation/invoice otomatis (§13.22).
- LMS / absensi / progres kelas berbayar di landing (§13.25) — materi freemium adalah modul terpisah.
- Menghapus tabel `batch_leads` meski UI-nya orphan — sengaja dipertahankan sebagai riwayat (PRD §9b / F10.1).

## Diketahui belum sempurna

| Hal | Dampak | Rencana |
|---|---|---|
| Bukti F01.14 = CSV + tab minat; kode kini hanya penawaran XLSX, minat UI hilang | Dokumen PRD §6.5 “ekspor lead XLSX” untuk minat **perlu klarifikasi** vs keadaan repo | Jangan mengklaim ekspor `batch_leads` masih ada di Admin; update PRD/registry di sesi terpisah bila perlu |
| UAT Hexatara Modul 1 (tabel UAT registry) masih kosong | Belum ada tanda tangan klien | Isi saat diserahkan UAT |
| Warning console `next-themes` / Server Action ID di dev | Bukan bug Modul 1 | Lihat `docs/AS_BUILT/00-KNOWN-WARNINGS.md` — jangan dicatat ulang sebagai temuan baru |

**Ditutup 2026-09-24 (serah-terima):** email e2e F04.5 (DB-first Pengaturan) LOLOS; catatan email F01.6 ditutup; AC banner ≠ harga upgrade (F01.2, uji 2026-09-23) LOLOS; AC script auth sekali (F00.6, uji 2026-09-23) LOLOS.

## Untuk manual book Hexatara

- Halaman depan menampilkan pelatihan dan penjualan drone. Isi yang berubah-ubah (pengumuman, banner, foto hero, jadwal, instruktur, cerita perusahaan, testimoni) diganti dari menu Admin Konten / Batch — tidak perlu programmer.
- Banner promo bisa dimatikan kapan saja dari Admin; perubahan langsung terlihat di situs.
- Jadwal yang statusnya ditutup tidak menampilkan tombol daftar.
- Pendaftaran ke pelatihan sekarang lewat formulir lengkap di halaman detail pelatihan (identitas, dokumen). Itu bukan “sekadar minat” singkat seperti dulu.
- Tombol WhatsApp melayang hanya membuka percakapan ke nomor Admin yang sudah diatur — bukan robot balasan otomatis.
- Bahasa Indonesia dan Inggris bisa diganti dari pemilih bahasa di situs.
- Daftar orang yang minta penawaran produk ada di Admin bagian Leads → Penawaran, dan bisa diunduh ke Excel. Data minat lama (jika ada di database) tidak lagi punya menu khusus di Admin; pendaftaran baru masuk menu pendaftaran batch.
