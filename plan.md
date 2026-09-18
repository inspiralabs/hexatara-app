# Plan — Hapus Pendaftaran Minat (alur lama)

> **Status sesi:** SELESAI — minat tidak lagi menerima data baru; menu + page + kode mati dihapus.

## Temuan
- Publik sekarang: `DaftarBatchDialog` → `batch_registrations` (bukan `batch_leads`)
- `DaftarMinatDialog` + `daftarMinatAction` sudah orphan (tidak di-import page)
- Masih baca `batch_leads`: Admin overview, Kursus Saya, `/admin/leads/minat`
- Tabel DB `batch_leads` **tidak** di-drop (PRD: riwayat lama)

## Yang dihapus
- Menu navbar "Pendaftaran Minat"
- `/admin/leads/minat` + `leads-table` / export / actions minat
- `daftar-minat-dialog.tsx`, `pelatihan/.../actions.ts`, `batch-lead.ts`
- Redirect `/admin/leads` → penawaran

## Yang dialihkan
- Overview Admin: hitung/chart/recent dari `batch_registrations` (+ penawaran)
- Dashboard Kursus Saya: section "Pendaftaran Pelatihan" dari `batch_registrations`
