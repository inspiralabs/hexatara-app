# Plan §12.6.9 — Redesign visual halaman publik (Cobalt Mist)

> **Status:** SELESAI (Tahap 0–4 diuji Alif OK 2026-09-17). Registry F06.8–F06.12 diperbarui.  
> **Blok:** §12.6.9. **Scope:** `(public)` saja.

---

## Keputusan Alif (2026-09-16) — final

1. **Scoping warna: 1A** — `[data-surface="public"]` override; `:root` Neutral.
2. **Shared: 2A** — `ContentCard variant="public"`; badge status publik di `publicStatusBatchClass` (bukan ubah `STATUS_BATCH_LABEL` admin).
3. **Font:** Fraunces → `font-heading` di heading section publik.
4. **CTA:** `publicCtaPrimary` / `publicCtaSecondary` di `src/lib/public-ui.ts` (`rounded-md`, bukan pill penuh).
5. **Hero background:** snow `--background` + mist blob (`PublicHeroMist`).

---

## Urutan

| Tahap | Isi | Status |
|-------|-----|--------|
| 0 | Fondasi token + Fraunces + data-surface | SELESAI |
| 1 | Beranda + nav/footer/WA | SELESAI |
| 2 | Pelatihan listing + detail | SELESAI |
| 3 | Katalog + detail + F04.3 | SELESAI |
| 4 | Halaman statis | SELESAI |

---

## Progress log

| Tanggal | Section | Status | Catatan |
|---------|---------|--------|---------|
| 2026-09-16 | Rencana | DISETUJUI | 1A · 2A · Fraunces · CTA publik-only |
| 2026-09-16 | Tahap 0 | SELESAI | Cobalt scoped; Fraunces; ForceLight surface |
| 2026-09-16 | Tahap 1 | SELESAI | Hero/cards/CTA/nav/WA/FAQ + polish |
| 2026-09-16 | Logo | SELESAI | default/mono + alpha punch; BrandLogo unoptimized |
| 2026-09-16 | Tahap 2–3 | SELESAI | Pelatihan + Katalog Cobalt Mist |
| 2026-09-17 | Tahap 2 fix | SELESAI | Suggest A+B; Jadwal; silabus accordion; testimoni/instruktur |
| 2026-09-17 | Tahap 4 | SELESAI | Static + verify |
| 2026-09-17 | Registry | SELESAI | F06.8–12 + F06.16 + catatan §12.6.9/10 |
