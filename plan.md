# Plan Sprint 6 — Modul 7: Pendaftaran Pelatihan Lengkap (RPC)

> **Status sesi:** F07.4 kode selesai — tunggu uji Alif.  
> **Blok:** F07.1 → F07.2 → F07.3 → F07.4 → F07.5 (satu bagian per giliran).

---

## Progress

| Fitur | Isi | Status |
|-------|-----|--------|
| F07.1 | Regenerasi `database.ts` + Zod + `lib/identitas.ts` | SELESAI |
| F07.2 | Section identitas di `/dashboard/profil` | SELESAI |
| F07.3 | Form daftar batch + `daftarBatchAction` | SELESAI (uji Alif OK) |
| F07.4 | Card pengingat non-blokir di `/dashboard` | KODE SELESAI — tunggu uji |
| F07.5 | Admin `pendaftaran-batch` setujui/tolak | BELUM |

---

## F07.4 — Card pengingat

- [x] Tampil **hanya** jika `profil_identitas_lengkap` = false (tidak di-render sama sekali kalau true)
- [x] CTA → `/dashboard/profil`
- [x] Bukan gate — copy menekankan pendaftaran tetap bisa tanpa ini
- [x] `tsc` hijau

### File
| Aksi | Path |
|------|------|
| diubah | `dashboard/page.tsx` |
| diubah | `plan.md` |

---

## F07.5 — Admin verifikasi (setelah Alif OK F07.4)

- Route `admin/(protected)/pendaftaran-batch/` + menu
- Select dari `batch_registrations` (+ join `batches`); signed URL 300s; Setujui/Tolak

---

## Progress log

| Tanggal | Bagian | Status | Catatan |
|---------|--------|--------|---------|
| 2026-09-17 | F07.1–F07.3 | SELESAI | |
| 2026-09-17 | F07.3 | DIUJI ALIF | OK — lanjut F07.4 |
| 2026-09-17 | F07.4 | KODE SELESAI | banner non-blokir di dashboard |
