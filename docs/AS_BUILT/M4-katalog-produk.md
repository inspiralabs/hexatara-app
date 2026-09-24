# MODUL 4 — KATALOG PRODUK · AS BUILT

> Diisi dari apa yang **benar-benar dibangun** (kode + kolom Bukti `feature-registry.md`),
> bukan dari rencana PRD semata. Redesign F06.12 dan e2e email F04.5 (2026-09-24) dicatat apa adanya.

**Selesai (uji internal Sprint 4):** 2026-09-09 · **Redesign katalog:** 2026-09-12 (F06.12) · **E2e email penawaran:** 2026-09-24 · **UAT Hexatara:** belum diisi · **Fitur:** F04.1 – F04.6 (+ F06.12 UX publik)

---

## Apa yang dilakukan modul ini

Katalog Hexatara menampilkan drone Autel sebagai etalase dan penangkap minat pembeli — bukan toko online. Pengunjung bisa melihat detail produk (harga tampil atau disembunyikan), menghubungi Admin lewat WhatsApp, atau mengisi form permintaan penawaran. Admin mengelola produk dan membaca daftar penawaran, termasuk unduhan Excel.

## Alur pengguna

```
1. Pengunjung membuka /katalog (hero + filter kategori + sort).
2. Kartu: rating, harga, atau teks "Hubungi kami untuk harga" jika harga NULL dari view.
3. Detail /katalog/[slug]: galeri (carousel + lightbox), deskripsi/spesifikasi, suggest kategori sama.
4a. "Hubungi via WhatsApp" → wa.me ke nomor Admin + pesan berisi nama produk (tanpa API).
4b. "Minta penawaran" → dialog (nama*, email*, opsional perusahaan/WA/kebutuhan, centang persetujuan default OFF).
5. Submit → simpan quote_requests dulu → email Admin jenis penawaran.
6. Sukses: konfirmasi di dialog — TIDAK redirect WhatsApp.
```

## Yang bisa dilakukan Admin

| Tindakan | Halaman | Catatan |
|---|---|---|
| CRUD produk (harga, aktif, urutan, rating, thumbnail, galeri) | `/admin/produk` | F04.6 Bukti 2026-09-09 |
| CRUD kategori produk | `/admin/produk/kategori` | Form pakai `category_id` (relasi) |
| Lihat / status / hapus / ekspor penawaran | `/admin/leads/penawaran` | Ekspor **XLSX** (F06.16); F04.6 Bukti historis menyebut CSV |
| Email notifikasi lead | `/admin/pengaturan` | `admin_notify_email` DB-first |

## Tabel yang disentuh

| Tabel / view | Baca | Tulis | Catatan |
|---|---|---|---|
| `products_public` | Publik katalog + landing | — | **ADR-004:** `harga` NULL bila `tampilkan_harga = false` |
| `products` | Admin | Admin | Anon tidak boleh query langsung |
| `product_images` | Publik + Admin | Admin | Galeri detail |
| `product_categories` | Publik filter + Admin | Admin | |
| `quote_requests` | Admin | Service role di Server Action | Anon tidak insert langsung |
| `site_settings` (`admin_notify_email`) | `getAdminNotifyEmail()` | Pengaturan | Fallback env |
| Storage `products` | URL publik | Admin upload | Kompresi F04.6 |

## Berkas utama

| Berkas | Isi |
|---|---|
| `src/app/[locale]/(public)/katalog/page.tsx` | Listing, filter/sort, CTA WA |
| `src/app/[locale]/(public)/katalog/[slug]/page.tsx` | Detail + WA + QuoteDialog |
| `src/app/[locale]/(public)/katalog/[slug]/actions.ts` | Simpan penawaran + email |
| `src/app/[locale]/(public)/katalog/[slug]/quote-dialog.tsx` | Form klien |
| `src/lib/validations/quote-request.ts` | Zod (tanpa MX/domain) |
| `src/lib/site-settings.ts`, `src/lib/email/send.ts` | Penerima + kirim lead |
| `src/app/admin/(protected)/produk/**` | CRUD |
| `src/app/admin/(protected)/leads/penawaran*.tsx`, `penawaran-export.ts` | Leads + XLSX |
| `src/components/produk-section.tsx` | Teaser beranda |
| `messages/id.json`, `messages/en.json` | Namespace `catalog` |

## Keputusan saat implementasi

1. **`products_public` + NULL harga (ADR-004)** — keamanan di DB, bukan hide di React. Diuji 2026-09-09 + regresi Network F06.12 2026-09-12.
2. **Insert penawaran lewat service role** — tabel lead nol akses anon.
3. **Email DB-first** — `getAdminNotifyEmail()`; kegagalan kirim tidak batalkan simpan. **E2e 2026-09-24:** submit ~15:05 WIB di `/katalog/evo-ii-pro-enterprise-v3`; email masuk ke alamat Pengaturan; latensi minim.
4. **Tanpa validasi domain/MX** pada email penawaran (PRD §13 / Fase 2).
5. **WA retail = tautan saja** (`NEXT_PUBLIC_WA_ADMIN`) — F04.4.
6. **F06.12 redesign** — hero, filter/sort, suggest, galeri multi-gambar.
7. **Cabang `minat_batch` di template email ditahan** untuk Fase 2 (bukan jalur katalog); jalur hidup = `penawaran` saja.

## Yang sengaja TIDAK dibangun

- Keranjang, checkout, pemesanan produk.
- Generator quotation / invoice otomatis.
- Validasi domain email / blacklist (Fase 2).
- WhatsApp Gateway / blast / chatbot.

## Diketahui belum sempurna

| Hal | Dampak | Rencana |
|---|---|---|
| UAT Hexatara Modul 4 kosong | Belum tanda tangan klien | Isi saat UAT |
| Bukti F04.6 “CSV” vs kode XLSX | Format unduhan = Excel | Manual book: Excel |
| F11.1 (dual kategori) masih TODO di registry | Form sudah satu field relasi | Selesaikan F11.1 / SQL view bila masih terbuka |
| Hydration mismatch `/katalog/[slug]` (2026-09-09) | Investigasi = HMR basi, bukan bug prod | Jangan buka ulang tanpa bukti baru |
| Warning console Server Action / next-themes | Bukan bug Modul 4 | `00-KNOWN-WARNINGS.md` |

**Ditutup 2026-09-24:** e2e email F04.5 vs Pengaturan LOLOS.

## Untuk manual book Hexatara

- Katalog di menu publik; tiap produk bisa tampil harga atau “Hubungi kami untuk harga” — diatur switch di form Produk.
- Calon pembeli bisa WhatsApp langsung atau isi Minta Penawaran; Admin dapat email ke alamat di Pengaturan → Email notifikasi Admin.
- Permintaan penawaran ada di Admin → Leads → Permintaan Penawaran; bisa diunduh Excel dan statusnya diubah.
- Produk nonaktif tidak muncul di situs; urutan diatur di form Produk.
- Kategori dikelola di Produk → Kategori; dipilih di form produk untuk filter/badge.
- Thumbnail untuk kartu katalog; galeri untuk halaman detail.
