# Plan Sprint 6 — Modul 7: Pendaftaran Pelatihan Lengkap (RPC)

> **Status sesi:** F07.3 kode selesai — tunggu uji Alif.  
> **Blok:** F07.1 → F07.2 → F07.3 → F07.4 → F07.5 (satu bagian per giliran).  
> **Acuan:** PRD §5.1c + §9b (ADR-020r), ENGINEERING ADR-020r, `feature-registry.md` Sprint 6.  
> **SQL live:** ADR-020 + ADR-020r sudah dijalankan Alif. Registry DONE hanya setelah Alif uji.

---

## Keputusan kunci (ADR-020r)

| # | Keputusan |
|---|-----------|
| 1 | Login **tidak wajib** daftar batch |
| 2 | `batch_registrations` mandiri (9 kolom identitas + `email`; `user_id` nullable) |
| 3 | `profiles` tetap 6 kolom identitas untuk reuse/prefill login |
| 4 | Path foto: `${userId}/…` (login) vs `registrasi/<id>/…` (anon) |
| 5 | F07.4 = card pengingat **non-blokir**, bukan gate |
| 6 | Duplikat anon dibiarkan; `uq_batch_user_aktif` hanya untuk login |

---

## Progress

| Fitur | Isi | Status |
|-------|-----|--------|
| F07.1 | Regenerasi `database.ts` + Zod identitas/pendaftaran + `lib/identitas.ts` | SELESAI (uji Alif OK) |
| F07.2 | Section identitas di `/dashboard/profil` + upload + action | SELESAI (uji Alif OK) |
| F07.3 | Form daftar batch (dialog baru) + `daftarBatchAction` | KODE SELESAI — tunggu uji |
| F07.4 | Card pengingat di `/dashboard` | BELUM |
| F07.5 | Admin `pendaftaran-batch` setujui/tolak + signed URL | BELUM |

---

## F07.3 — Form pendaftaran batch

### Checklist

- [x] `daftar-batch-dialog.tsx` — pilihan Login vs Tanpa akun (anon); form tunggal ± prefill
- [x] `daftar-batch-actions.ts` — insert → upload → update path; sync profiles best-effort
- [x] Rollback: hapus baris + object storage kalau upload gagal
- [x] CTA halaman detail pakai dialog baru; `daftar-minat-dialog` **tetap ada** (belum dihapus)
- [x] Login `?next=/pelatihan/[slug]` redirect balik aman
- [x] `tsc` hijau

### Upload gagal (pendekatan)

1. Insert baris tanpa path foto → dapat `id`  
2. Upload KTP + pas foto  
3. Update path  
4. **Kalau 2/3 gagal:** hapus object yang sudah terunggah + **hapus baris** `batch_registrations` → return pesan jelas (tidak ada baris menggantung tanpa foto)

### File

| Aksi | Path |
|------|------|
| baru | `pelatihan/[slug]/daftar-batch-dialog.tsx` |
| baru | `pelatihan/[slug]/daftar-batch-actions.ts` |
| diubah | `pelatihan/[slug]/page.tsx` |
| diubah | `login/login-form.tsx`, `login/page.tsx` |
| diubah | `plan.md` |
| tidak dihapus | `daftar-minat-dialog.tsx` + `daftarMinatAction` |

---

## F07.4 — Card pengingat (setelah Alif OK F07.3)

- Render di `/dashboard` hanya jika RPC false → link `/dashboard/profil`
- Bukan gate

---

## F07.5 — Admin verifikasi (setelah Alif OK F07.4)

- Route `admin/(protected)/pendaftaran-batch/` + menu
- Select dari `batch_registrations` (+ join `batches`); signed URL 300s; Setujui/Tolak

---

## Progress log

| Tanggal | Bagian | Status | Catatan |
|---------|--------|--------|---------|
| 2026-09-17 | Rencana | DISETUJUI | ADR-020r; urutan F07.1→5 |
| 2026-09-17 | F07.1 | SELESAI | gen types + Zod + util |
| 2026-09-17 | F07.2 | SELESAI | section Profil + upload |
| 2026-09-17 | F07.3 | KODE SELESAI | dialog daftar batch + rollback upload |
