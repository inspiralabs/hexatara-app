# Plan Sprint 6 — Modul 7: Pendaftaran Pelatihan Lengkap (RPC)

> **Status sesi:** F07.5 kode selesai — tunggu uji Alif.  
> **Blok:** F07.1 → F07.2 → F07.3 → F07.4 → F07.5 (satu bagian per giliran).

---

## Progress

| Fitur | Isi | Status |
|-------|-----|--------|
| F07.1 | Regenerasi `database.ts` + Zod + `lib/identitas.ts` | SELESAI |
| F07.2 | Section identitas di `/dashboard/profil` | SELESAI |
| F07.3 | Form daftar batch + `daftarBatchAction` | SELESAI (uji Alif OK) |
| F07.4 | Card pengingat non-blokir di `/dashboard` | SELESAI (uji Alif OK) |
| F07.5 | Admin `pendaftaran-batch` setujui/tolak | KODE SELESAI — tunggu uji |

---

## F07.5 — Admin verifikasi

- [x] Route `/admin/pendaftaran-batch` + menu sidebar Batch
- [x] Select `batch_registrations` status `menunggu_verifikasi` + join `batches`
- [x] Signed URL 300s untuk foto KTP & pas foto (`identity-documents`)
- [x] Detail sheet (identitas lengkap) + Setujui / Tolak (guard status)
- [x] `verified_by` / `verified_at` diisi; Tolak wajib alasan
- [x] `tsc` hijau

### File
| Aksi | Path |
|------|------|
| baru | `admin/(protected)/pendaftaran-batch/page.tsx` |
| baru | `admin/(protected)/pendaftaran-batch/actions.ts` |
| baru | `admin/(protected)/pendaftaran-batch/pendaftaran-batch-table.tsx` |
| baru | `admin/(protected)/pendaftaran-batch/pendaftaran-batch-row-actions.tsx` |
| baru | `admin/(protected)/pendaftaran-batch/pendaftaran-batch-detail.tsx` |
| diubah | `components/shell/admin-shell.tsx` |
| diubah | `plan.md` |

---

## Progress log

| Tanggal | Bagian | Status | Catatan |
|---------|--------|--------|---------|
| 2026-09-17 | F07.1–F07.3 | SELESAI | |
| 2026-09-17 | F07.3 | DIUJI ALIF | OK — lanjut F07.4 |
| 2026-09-17 | F07.4 | DIUJI ALIF | OK — lanjut F07.5 |
| 2026-09-17 | F07.5 | KODE SELESAI | antrean verifikasi + signed URL |
