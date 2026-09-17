# Plan Sprint 8 — Modul 9: Gambar Utuh (ADR-022 / ADR-022b)

> **Status sesi:** Perbaikan F09.2 (panah + thumbnail ADR-022b) selesai kode — menunggu uji Alif. Berikutnya F09.3.

| Fitur | Status | Catatan |
|-------|--------|---------|
| F09.1 | DONE | Gambar Detail pelatihan |
| F09.2 | DONE + ADR-022b | Galeri bebas + thumbnail terpisah |
| F09.3 | PENDING | Hero Beranda crop 4:3 |
| F09.4 | PENDING (partial) | Lightbox sudah di hero + galeri |

## Perbaikan uji Alif (setelah F09.2)

| Bagian | Status | Isi |
|--------|--------|-----|
| 1. Panah carousel | DONE | `left-3`/`right-3` di product-gallery |
| 2a–2b. Admin Thumbnail | DONE | form 16:9 + schema/action |
| 2c. Kartu publik | DONE | thumbnail cover; fallback cover contain+bg-white |

## Uji Alif (2c)
1. Isi Thumbnail satu produk → kartu katalog/beranda/suggest object-cover 16:9 rapi
2. Produk tanpa thumbnail → tetap tampil foto galeri pertama, contain + putih
3. Viewport 375px OK
