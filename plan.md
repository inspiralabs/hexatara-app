# Plan Sprint 10 — F11.5 Kategori Batch (teks → relasi)

> **Status:** TAHAP 1 DIAGNOSIS. Jangan ubah kode sampai Alif konfirmasi aman / pilih alternatif.
> Tidak ada DDL. Kolom `kategori_id`/`kategori_en` di DB tidak dihapus.

| # | Langkah | Status |
|---|---------|--------|
| 1 | Query: count batch aktif tanpa `category_id` | PENDING |
| 2 | Query: daftar batch aktif `category_id` null (+ teks) | PENDING |
| 3 | Laporkan Alif — STOP jika count > 0 | PENDING |
| 4 | Tahap 2 (hapus field teks + badge + suggestions) | BLOCKED sampai aman |
| 5 | tsc/lint/build + uji | — |
| 6 | Registry F11.5 DONE setelah Alif OK | — |

## Gate
- count = 0 → lanjut Tahap 2
- count > 0 → STOP, sarankan label "cadangan", tunggu Alif
