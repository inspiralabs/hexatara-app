# Plan — F05.5 / F05.6 / F05.7 (kesiapan produksi)

> Status: **DONE** (verifikasi Alif 2026-09-23). Domain/DNS/SSL/Auth/SMTP/seed → Fase 14.

## Status

| Item | Status |
|------|--------|
| F05.5 Sentry | DONE — error di Issues; cookie/body/email bersih; geo kota = acceptable risk |
| F05.6 Backup | DONE — pg_dump + restore project kosong (Session Pooler) |
| F05.7 Env + audit Vercel | DONE — Production+Preview + Redeploy; domain/SSL = Fase 14 |
| Route `uji-sentry-sementara` | **DIHAPUS** |
| Grep API khusus Vercel | Nol hasil |

## Keputusan final geo/IP (F05.5)

Tiga lapis sudah dicoba: (1) Prevent Storing of IP Addresses (org dashboard), (2) `beforeSend` hapus user/geo, (3) `setUser({ ip_address: null })`. Geography kota+negara tetap dari geo enrichment backend atas peer IP HTTPS ke ingest — di luar kendali app. **Diterima** sebagai batas wajar. Tidak lanjut Advanced Data Scrubbing / proxy. Wajib (data kritis bersih) sudah tercapai. Tercatat di `ENGINEERING.md` §2.4.

## Env produksi (ringkas)

Beda/baru vs local: `NEXT_PUBLIC_SITE_URL`, `EMAIL_FROM`, `NEXT_PUBLIC_SENTRY_DSN` (Config, bukan Secret).

## Backup (ringkas)

`pg_dump` / restore lewat **Session Pooler** jika Direct Connection gagal (IPv4-only client vs IPv6). Dump: `backup-hexatara-*.sql` di `.gitignore`.
