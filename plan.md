# Plan Sprint 7 — Modul 8: Operasional Pendaftaran (ADR-021)

> **Status sesi:** F08.4 kode selesai — tunggu uji Alif. Sprint 7 lengkap di kode.  
> **Blok:** F08.1 → F08.2 → F08.3 → F08.4.  
> **Acuan:** PRD §5.1d + §9c, ENGINEERING ADR-021. Registry DONE hanya setelah Alif uji.

---

## Progress

| Fitur | Isi | Status |
|-------|-----|--------|
| F08.1 | Admin Peserta Pendaftaran + filter + export detail | KODE SELESAI — tunggu uji |
| F08.2 | Filter batch di `pendaftaran-batch` | SELESAI (uji Alif OK) |
| F08.3 | Card syarat/fasilitas/WA + admin | SELESAI (uji Alif OK) |
| F08.4 | Salin dari Batch Lain (form Tambah saja) | KODE SELESAI — tunggu uji |

---

## F08.4 — Salin dari Batch Lain

- [x] Hanya di `/admin/batch/baru` (bukan edit)
- [x] `salinDariBatchAction` — return draft, **tidak** insert DB
- [x] Isi: deskripsi, silabus, lokasi, alamat, harga, rating, kategori + benefits/equipment/faqs/gallery/requirements
- [x] Kosong: slug, judul, tanggal, status (default upcoming), hero
- [x] Submit tetap `simpanBatchAction`
- [x] Tidak sentuh `batch_leads` / `batch_registrations`
- [x] Export peserta: kolom detail penuh (tanpa foto)
- [x] `tsc` hijau

### File
| Aksi | Path |
|------|------|
| diubah | `peserta-pendaftaran/peserta-export.ts` |
| diubah | `batch/actions.ts` (`salinDariBatchAction`) |
| diubah | `batch/batch-form.tsx`, `batch/baru/page.tsx` |
| diubah | `plan.md` |

---

## Progress log

| Tanggal | Bagian | Status | Catatan |
|---------|--------|--------|---------|
| 2026-09-17 | F08.1 | KODE SELESAI | + polish detail/hapus/export |
| 2026-09-17 | F08.2–F08.3 | DIUJI ALIF | OK |
| 2026-09-17 | F08.4 | KODE SELESAI | pre-fill form Tambah |
