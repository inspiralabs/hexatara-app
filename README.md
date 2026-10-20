# Hexatara

Platform web Hexatara Indonesia: pelatihan pilot drone bersertifikat (RPC), verifikasi sertifikat, materi gratis (LMS Freemium), dan Hexatara Marketplace (drone, suku cadang, aksesori, merchandise). Dikembangkan oleh InspiraLabs.

Production: https://hexatara-app.vercel.app

## Teknologi

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS 4, shadcn/ui (Base UI), TanStack Table, Recharts, Tiptap
- Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- next-intl (Indonesia dan Inggris)
- Resend (email), Upstash Redis (rate limit), Sentry (monitoring)
- Vitest, ESLint, Husky, Knip
- pnpm, deploy di Vercel

## Menjalankan di lokal

Prasyarat: Node.js 20+ dan pnpm.

```bash
pnpm install
cp .env.example .env.local   # lalu isi nilainya
pnpm dev
```

Buka http://localhost:3000. Panel Admin ada di `/admin`.

## Variabel lingkungan

Simpan di `.env.local` (tidak boleh di-commit). Nilai diminta dari pemilik proyek.

| Variabel                                             | Fungsi                                                          |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                           | URL project Supabase                                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                      | Kunci publik Supabase                                           |
| `SUPABASE_SERVICE_ROLE_KEY`                          | Kunci server (rahasia, jangan ke browser)                       |
| `NEXT_PUBLIC_SITE_URL`                               | URL situs (dipakai SEO dan email)                               |
| `NEXT_PUBLIC_CANONICAL_URL`                          | Opsional. Origin canonical untuk SEO (canonical, hreflang, OG, sitemap, JSON-LD) dan penentu host yang boleh di-index. Dipakai selama transisi, saat build VPS masih memakai host `hexatara.inspiralabs.id` (isi `https://hexatara.com`). Setelah cutover (`NEXT_PUBLIC_SITE_URL` = `https://hexatara.com`) variabel ini boleh dihapus karena fallback-nya sama. |
| `NEXT_PUBLIC_WA_ADMIN`                               | Nomor WhatsApp bawaan                                           |
| `RESEND_API_KEY`, `EMAIL_FROM`                       | Pengiriman email                                                |
| `ADMIN_NOTIFY_EMAIL`                                 | Email penerima notifikasi (cadangan jika belum diatur di Admin) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limit                                                      |
| `RATE_LIMIT_VERIFY_ENABLED`                          | Saklar rate limit verifikasi sertifikat                         |
| `NEXT_PUBLIC_SENTRY_DSN`                             | Monitoring error                                                |

## Perintah

| Perintah            | Fungsi                        |
| ------------------- | ----------------------------- |
| `pnpm dev`          | Server pengembangan           |
| `pnpm build`        | Build production              |
| `pnpm start`        | Jalankan hasil build          |
| `pnpm lint`         | ESLint                        |
| `pnpm test`         | Unit test (Vitest)            |
| `pnpm tsc --noEmit` | Cek tipe                      |
| `pnpm knip`         | Cari kode yang tidak terpakai |

Hook pre-commit (Husky) menjalankan `tsc` dan `lint` otomatis.

## Struktur singkat

```
src/app/[locale]/   halaman publik, auth, kelas, dashboard pengguna
src/app/admin/      panel Admin
src/components/     komponen UI
src/lib/            logika bisnis, validasi, Supabase, email
src/types/          tipe database hasil generate Supabase
messages/           teks Indonesia dan Inggris (id.json, en.json)
public/             aset statis dan template impor
scripts/            skrip pendukung
```

## Catatan

- Perubahan skema database ditulis sebagai file SQL dan dijalankan manual di Supabase SQL Editor, lalu `src/types/database.ts` di-generate ulang.
- Dokumen internal (spesifikasi, keputusan teknis, panduan) disimpan di luar repo ini.
