# Plan Sprint 10 — F11.1 Kategori produk (ADR-024)

> **Status sesi:** Gate types OK (`category_nama_id`/`en` ada). Kode F11.1 selesai, menunggu uji Alif. Tidak ada DDL dari agent.

## Keputusan
- Field teks `kategori` dihapus dari form/Zod/actions (kolom DB `products.kategori` dibiarkan).
- Badge publik → `pick(category_nama_id, category_nama_en)`.
- Filter `category_id` tidak disentuh.
- Admin table masih tampilkan kolom teks lama (out of scope).

## Urutan kerja
| # | Langkah | Status |
|---|---------|--------|
| 0 | Gate types + baca file | DONE |
| 1 | Hapus field teks form + Zod/actions/defaults | DONE |
| 2 | Badge publik (card, detail, beranda) | DONE |
| 3 | Update `.select` products_public | DONE |
| 4 | Filter category_id — tidak disentuh | DONE |
| 5 | tsc / lint / build | DONE |
| 6 | Laporan Alif (F11.1 TODO sampai OK) | PENDING |

## Uji Alif
- Form: satu field Kategori (combobox)
- `/katalog` + detail: badge = nama dari `product_categories`
- Tanpa `category_id`: badge kosong, tidak crash
- SQL: `select harga from products_public where tampilkan_harga = false;` → semua NULL
- 375px: badge tidak overflow
