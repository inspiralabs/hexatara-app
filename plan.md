# Plan §12.6.9 — Redesign visual halaman publik (Cobalt Mist)

> **Status:** Tahap 3 selesai kode — menunggu uji Alif (Pelatihan fix + Katalog).  
> **Blok:** §12.6.9. **Scope:** `(public)` saja.

---

## Keputusan Alif (2026-09-16) — final

1. **Scoping warna: 1A** — `[data-surface="public"]` override; `:root` Neutral.
2. **Shared: 2A** — `ContentCard variant="public"`; badge status publik di `publicStatusBatchClass` (bukan ubah `STATUS_BATCH_LABEL` admin).
3. **Font:** Fraunces → `font-heading` di heading section publik.
4. **CTA pill:** `publicCtaPrimary` / `publicCtaSecondary` di `src/lib/public-ui.ts`.
5. **Hero background:** snow `--background`; section `bg-background` eksplisit.

---

## Urutan

| Tahap | Isi | Status |
|-------|-----|--------|
| 0 | Fondasi token + Fraunces + data-surface | SELESAI (uji OK) |
| 1 | Beranda + nav/footer/WA | SELESAI (uji OK + logo) |
| 2 | Pelatihan listing + detail | KODE — fix hero/stars; suggest = data |
| 3 | Katalog + detail + F04.3 | KODE — tunggu uji |
| 4 | Halaman statis | BELUM |

---

## Progress log

| Tanggal | Section | Status | Catatan |
|---------|---------|--------|---------|
| 2026-09-16 | Rencana | DISETUJUI | 1A · 2A · Fraunces · pill publik-only |
| 2026-09-16 | Tahap 0 | SELESAI | Cobalt scoped; Fraunces; ForceLight surface |
| 2026-09-16 | Tahap 1 | KODE | Hero/cards/CTA pill/nav scroll shadow/WA monokrom/FAQ; tsc/lint/build OK |
| 2026-09-16 | Tahap 1 fix | KODE | Hero mist+blob; CTA in-card; limit 6; instruktur/testimoni card polish |
| 2026-09-16 | Logo | SELESAI | default/mono + alpha punch; BrandLogo unoptimized |
| 2026-09-16 | Tahap 2 | KODE | Pelatihan listing+detail: public-ui CTA/heading/badge, ContentCard public |
| 2026-09-16 | Tahap 2 fix | KODE | PublicHeroMist; stars amber; suggest = data gap (2/3 tanpa category_id) |
| 2026-09-16 | Tahap 3 | KODE | Katalog listing+detail Cobalt Mist; query products_public tetap |
