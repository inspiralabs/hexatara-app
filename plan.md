# Plan Sprint 10 — F11.2b fix

> **Root cause tren "kosong":** data LIVE OK (3 reg + 1 quote → key `2026-09`). Bukan query/RLS/bucket. Chart terlihat kosong karena `--chart-*` di Admin = abu-abu monokrom + recharts SVG sering gagal resolve `var(--chart-*)`. Fix: hex cobalt eksplisit (`#1E40AF` = `--warna-utama`).

| Sumber angka | Tabel |
|---|---|
| Lead baru 7 hari | `batch_registrations` + `quote_requests` (count, 7 hari) |
| Menunggu verifikasi | `certificate_orders` status `menunggu_verifikasi` |
| Sertifikat bulan ini | `certificates.tanggal_terbit` bulan berjalan |
| Batch aktif | `batches` `is_active` |
| Ringkasan Pendaftaran | `batch_registrations` count per status |
| Ringkasan Penawaran | `quote_requests` count per status |
| Tren 2 garis | `created_at` 12 bln → buckets |
| Pie status | sama count status Ringkasan |
| Bar sertifikat | `certificates.tanggal_terbit` 12 bln |
| Aktivitas terbaru | 10 baris terbaru masing-masing tabel |

Tidak ada `batch_leads` / mock / hardcode.

| # | Status |
|---|--------|
| Diagnosis + fix warna + angka lebih besar | DONE |
| tsc/lint/build | PENDING |
| Registry F11.2 — jangan DONE sampai Alif OK | — |
