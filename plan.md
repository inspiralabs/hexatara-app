# Plan — F05.3 + F05.4 (SEO, sitemap, halaman error)

> Acuan: PANDUAN §13.2, PRD §4.1 (`localePrefix: 'as-needed'`), PRD §12.3.
> Ponytail: Metadata API bawaan Next.js saja. OG: `public/og-hexatara.png` (1200×630).
> Kerjakan **satu tahap**, stop untuk review Alif, baru lanjut.

## Status

| Tahap | Isi | Status |
|-------|-----|--------|
| 1 | Helper `pageMetadata` + perkuat `[locale]/layout.tsx` (metadataBase, title.template, OG + Twitter default) | DONE |
| 2 | `src/app/robots.ts` + `src/app/sitemap.ts` (path publik statis × 2 locale) | DONE (fix proxy matcher) |
| 3 | `generateMetadata` via helper di semua `(public)/**/page.tsx` | DONE |
| 4 | `not-found.tsx`, `error.tsx`, `global-error.tsx` + catch-all `[...rest]` | DONE |
| 5 | Smoke test + cara uji (a–g) | **DONE — panduan di bawah** |

## File utama (referensi)

- `src/lib/seo/page-metadata.ts`
- `src/app/[locale]/layout.tsx`
- `src/app/robots.ts`, `src/app/sitemap.ts`
- `src/proxy.ts` (exclude `robots.txt` / `sitemap.xml`)
- `(public)/**/page.tsx` + `messages/*/seo` + `messages/*/errors`
- `src/app/[locale]/not-found.tsx`, `error.tsx`, `[...rest]/page.tsx`
- `src/app/global-error.tsx`
- `public/og-hexatara.png`

## Sengaja ditunda

- Sitemap dinamis slug batch/produk
- Meta khusus `(auth)` / `(user)` (+ noindex opsional)
- Library SEO / API Vercel

---

## TAHAP 5 — Cara uji manual (smoke)

Asumsi: `pnpm dev` jalan di http://localhost:3000.  
`NEXT_PUBLIC_SITE_URL` di `.env.local` = `http://localhost:3000` (untuk URL absolut di meta).

### a) 404 Indonesia

1. Buka http://localhost:3000/halaman-tidak-ada  
2. Harus: halaman custom Hexatara (bukan 404 hitam Next.js)  
3. Ada CTA ke beranda + **Verifikasi sertifikat** (`/verify`)  
4. Bahasa Indonesia

### b) 404 Inggris

1. Buka http://localhost:3000/en/halaman-tidak-ada  
2. Harus: copy Inggris (Page not found / Back to home / Verify certificate)

### c) Sitemap

1. Buka http://localhost:3000/sitemap.xml  
2. Harus **200**, isi XML (bukan 404)  
3. Ada pasangan ID tanpa prefix + EN dengan `/en/`, contoh:  
   - `http://localhost:3000/` dan `http://localhost:3000/en`  
   - `…/pelatihan` dan `…/en/pelatihan`  
   - `…/katalog`, `…/verify`, `…/faq`, legal, dll.  
4. **Tidak** ada slug dinamis batch/produk (sengaja ditunda)

### d) Robots

1. Buka http://localhost:3000/robots.txt  
2. Harus **200**  
3. Ada `Disallow: /admin`, `/dashboard`, `/en/dashboard`  
4. Ada baris `Sitemap: …/sitemap.xml`

### e) Hreflang + OG + Twitter (view-source)

1. Buka beranda → klik kanan → **View page source** (atau DevTools → Elements → `<head>`)  
2. Cari `hreflang`:  
   - `hreflang="id"` → URL **tanpa** `/id/`  
   - `hreflang="en"` → URL dengan `/en`  
   - `hreflang="x-default"` → sama seperti ID (tanpa prefix)  
3. Cari `og:image` dan `twitter:image` → absolut ke  
   `http://localhost:3000/og-hexatara.png` (atau host dari `NEXT_PUBLIC_SITE_URL`)  
4. Opsional: `/pelatihan` → title `Jadwal Pelatihan | Hexatara`

### f) Picu `error.tsx` (sementara, lalu hapus)

`error.tsx` hanya muncul kalau komponen di dalam `[locale]` **throw**. Cara paling aman:

1. Buat file sementara:

```tsx
// src/app/[locale]/(public)/_uji-error/page.tsx
export default function UjiErrorPage() {
  throw new Error("uji error.tsx — hapus route ini setelah tes");
}
```

2. Buka http://localhost:3000/_uji-error  
3. Harus: pesan ramah (“Terjadi kesalahan” / EN), tombol **Coba lagi** + beranda  
4. **Tidak** boleh ada stack trace / teks `uji error.tsx` di UI (hanya di console server/browser via `console.error`)  
5. Hapus folder `_uji-error` setelah OK — **jangan commit** file uji ini  
6. `pnpm tsc --noEmit` + `pnpm lint` lagi setelah hapus

### g) OG di share (produksi / preview deploy)

WhatsApp & Facebook **cache** preview. Dev localhost sering **tidak** di-scrape crawler mereka.

1. Deploy / pakai URL yang bisa diakses publik (Vercel preview atau production)  
2. Buka https://developers.facebook.com/tools/debug/  
3. Tempel URL halaman (mis. beranda production)  
4. Klik **Debug** / **Scrape Again** (paksa refresh cache lama)  
5. Cek: judul, deskripsi, gambar = `og-hexatara.png`  
6. Opsional: tempel URL yang sama ke chat WhatsApp → preview harus cocok

---

## Checklist Uji Sendiri

- [ ] (a) `/halaman-tidak-ada` → 404 custom ID + tautan `/verify`
- [ ] (b) `/en/halaman-tidak-ada` → 404 custom EN
- [ ] (c) `/sitemap.xml` → path statis × 2 locale
- [ ] (d) `/robots.txt` → disallow admin/dashboard + Sitemap
- [ ] (e) View-source: hreflang id/en/x-default + og/twitter → `og-hexatara.png` absolut
- [ ] (f) Picu `error.tsx` via route sementara → hapus lagi
- [ ] (g) FB Sharing Debugger (URL publik) → Scrape Again
- [ ] PANDUAN §6.5.1: tsc, lint, console bersih, 404 di 375px (CTA cukup besar, tanpa scroll samping)

**Setelah OK Alif:** update `feature-registry.md` F05.3 + F05.4 → DONE (prompt terpisah di PANDUAN), lalu commit sesuai PANDUAN §13.2.
