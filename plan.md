# Plan Sprint 9 — F10.5 Email branded via Resend (ADR-023)

> **Status sesi:** F10.4 DONE. F10.5 kode selesai, menunggu uji email nyata Alif. Tidak ada SQL/DDL. Tidak ada dep baru.

## Tujuan
Ganti email bawaan Supabase (signup + lupa sandi) dengan `generateLink()` + Resend. Template/send/client **tidak diubah**.

## Keputusan teknis (deviasi kecil dari prompt)
Prompt menyebut `action_link`. Di SSR Next.js, `action_link` GoTrue (`/auth/v1/verify`) tidak set cookie sesi App Router dengan andal. Dipakai `hashed_token` → `/auth/confirm?token_hash=&type=signup|recovery&next=` (pola resmi Supabase SSR). `signOut()` tetap ada (bersihkan sesi lama sebelum daftar).

## Urutan kerja
| # | Langkah | Status |
|---|---------|--------|
| 0 | F10.4 registry DONE + log | DONE |
| 1 | Baca send.ts, daftar/lupa-sandi, confirm | DONE |
| 2 | `daftar/actions.ts` → generateLink signup + Resend | DONE |
| 3 | `lupa-sandi/actions.ts` → generateLink recovery + Resend | DONE |
| 4 | `auth/confirm` — terima type `signup` | DONE |
| 5 | tsc / lint / build | DONE |
| 6 | Laporan Alif (F10.5 tetap TODO sampai OK) | PENDING |

## File disentuh
- `daftar/actions.ts`, `lupa-sandi/actions.ts`, `auth/confirm/route.ts`
- `feature-registry.md`, `plan.md`

## Uji Alif (wajib sebelum DONE)
- Daftar email asli → inbox Resend, branded Cobalt Mist
- Klik verifikasi → akun aktif / login
- Lupa sandi → Resend branded → ganti sandi OK
- Email sudah terdaftar → "sudah terdaftar"
- Lupa sandi email tidak ada → pesan generik sama
