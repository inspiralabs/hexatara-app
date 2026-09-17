# Plan Sprint 6 — Modul 7: Pendaftaran Pelatihan Lengkap (RPC)

> **Status sesi:** F07.2 kode selesai — tunggu uji Alif.  
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
| F07.2 | Section identitas di `/dashboard/profil` + upload + action | KODE SELESAI — tunggu uji |
| F07.3 | Form daftar batch (dialog baru berdampingan minat) + `daftarBatchAction` | BELUM |
| F07.4 | Card pengingat di `/dashboard` | BELUM |
| F07.5 | Admin `pendaftaran-batch` setujui/tolak + signed URL | BELUM |

---

## F07.1 — Fondasi tipe + validasi

### Checklist

- [x] **1.** Regenerasi `src/types/database.ts` (`supabase gen types --project-id ojltfmvmbolalhtzrhva`)
  - `profiles`: 6 kolom identitas ✓
  - `batch_registrations.user_id: string | null` + 9 kolom identitas ✓
  - RPC `profil_identitas_lengkap` ✓
  - Enums `kategori_peserta_rpc` / `status_registrasi_batch` ✓
- [x] **2.** `src/lib/validations/identitas-profil.ts`
- [x] **3.** `src/lib/validations/pendaftaran-batch.ts`
- [x] **4.** `src/lib/identitas.ts` → RPC
- [x] `tsc` + eslint hijau

### File

| Aksi | Path |
|------|------|
| diubah | `src/types/database.ts` |
| baru | `src/lib/validations/identitas-profil.ts` |
| baru | `src/lib/validations/pendaftaran-batch.ts` |
| baru | `src/lib/identitas.ts` |
| diubah | `plan.md` |

---

## F07.2 — Section identitas di Profil (setelah Alif OK F07.1)

**Target:** `dashboard/profil/` (bukan route baru).

| Langkah | Rencana |
|---------|---------|
| Page | Section card “Data Identitas (untuk Sertifikasi RPC)” + indikator via util F07.1 |
| Form | `identitas-form.tsx` — RHF + `IdentitasProfilSchema`; reuse date picker admin |
| Upload | Bucket `identity-documents`; path `${userId}/ktp.<ext>` & `pas-foto.<ext>`; simpan path; preview signed URL 300s |
| Action | `dashboard/profil/actions.ts` — update 6 kolom `profiles` |

---

## F07.3 — Form pendaftaran batch (setelah Alif OK F07.2)

**Jangan hapus** `daftar-minat-dialog` / `daftarMinatAction` sampai Alif bilang.

| Langkah | Rencana |
|---------|---------|
| UI | `daftar-batch-dialog.tsx` baru; anon → pilihan Login vs Tanpa akun; login → form ± prefill |
| Action | insert tanpa foto → upload → update path; login sync best-effort ke `profiles`; tangani `uq_batch_user_aktif` |
| Upload gagal | Hapus baris registrasi + object parsial; error jelas (detail di laporan F07.3) |
| Sukses | Pesan dari hasil insert (jangan SELECT ulang untuk anon) |

---

## F07.4 — Card pengingat (setelah Alif OK F07.3)

- Render di `/dashboard` hanya jika RPC false → link `/dashboard/profil`
- Bukan gate

---

## F07.5 — Admin verifikasi (setelah Alif OK F07.4)

- Route `admin/(protected)/pendaftaran-batch/` + menu
- Select dari `batch_registrations` (+ join `batches`); signed URL 300s; Setujui/Tolak
- Riwayat filter = opsional (tanya dulu)

---

## Progress log

| Tanggal | Bagian | Status | Catatan |
|---------|--------|--------|---------|
| 2026-09-17 | Rencana | DISETUJUI | ADR-020r; urutan F07.1→5 |
| 2026-09-17 | F07.1 | KODE SELESAI | gen types + Zod + `identitas.ts`; tsc/eslint OK |
| 2026-09-17 | F07.1 | DIUJI ALIF | OK — lanjut F07.2 |
| 2026-09-17 | F07.2 | KODE SELESAI | section Profil + form + upload `identity-documents` + signed URL 300s |
