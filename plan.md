# Plan Sprint 8 — Modul 9: Gambar Utuh (ADR-022)

> **Status sesi:** F09.2 selesai kode + tsc/lint — menunggu konfirmasi Alif sebelum F09.3.
> SQL sudah dijalankan Alif. Tidak ada DDL dari agent.

| Fitur | Status | Catatan |
|-------|--------|---------|
| F09.1 | DONE (Alif OK) | Gambar Detail + lightbox hero |
| F09.2 | MENUNGGU ALIF | Crop bebas produk + contain kartu/carousel + lightbox slide utama |
| F09.3 | PENDING | Hero Beranda crop 4:3 |
| F09.4 | PENDING (partial) | Komponen + blur sudah ada; sudah terpasang hero + galeri produk. F09.3/4 sisa form hero 4:3 + checklist akhir |

## F09.2 — yang diubah
- `produk-form.tsx` — hapus `aspectRatio={1}`; teks saran latar putih
- `content-card.tsx` — prop opsional `imageFit` / `imageBg` (default cover, kartu pelatihan tidak berubah)
- `produk-card.tsx` — `imageFit="contain"` + `imageBg="bg-white"`
- `product-gallery.tsx` — contain + bg-white + lightbox klik slide utama

## Uji manual Alif (F09.2)
1. Admin Produk → upload foto landscape → crop dialog **bebas** (tidak terkunci 1:1)
2. Kartu katalog + carousel detail → foto utuh di atas putih, tidak terpotong
3. Klik slide utama carousel → lightbox; thumbnail hanya ganti slide
