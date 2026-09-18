# Plan — Admin UX patch (menu Leads + warna tombol + hint silabus)

> **Status sesi:** SELESAI — `tsc` / `lint` / `build` bersih. Menunggu uji Alif.

| Bagian | Status | Isi |
|--------|--------|-----|
| 1. Menu sidebar | DONE | Pendaftaran Batch + Peserta → Leads; Batch tinggal Daftar + Kategori |
| 2. Warna tombol | DONE | `edit` (biru) + `success` (hijau); Hapus/Tolak=`destructive`; Setuju=`success` |
| 3. Hint silabus | DONE | FormDescription H2/H3 → akordion di `silabus_id` / `silabus_en` |

## Keputusan
- **Tolak** = `destructive` (aksi negatif, sejajar Hapus) — bukan outline.
- `childAktif` murni pathname — highlight tetap benar setelah pindah section.
- Dropdown "Ubah" pakai `variant="edit"` (hampir semua edit di Admin lewat dropdown, bukan Button terpisah).
