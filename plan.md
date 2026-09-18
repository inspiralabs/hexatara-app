# Plan Sprint 9 — F10.4 Bukti pembayaran Admin (ADR-023)

> **Status sesi:** F10.3 registry DONE. F10.4 kode selesai, menunggu uji Alif. SQL `bukti_url` sudah dijalankan Alif. Tidak ada DDL dari agent.

| Langkah | Status |
|---------|--------|
| F10.3 registry DONE (+ catatan lanjutan skor) | DONE |
| Regen `database.ts` (`bukti_url`) | DONE |
| `setujuiPendaftaranBatchAction` + FormData upload | DONE |
| UI popup Setuju + file wajib | DONE |
| Signed URL + tampil di peserta detail | DONE |
| tsc / lint / build | DONE |
| Laporan Alif (registry F10.4 TODO sampai OK) | PENDING |

## Pola reuse
- Bucket `payment-proofs`, path `batch-${registrasiId}.${ext}`
- Signed URL 300s seperti `upgrade/page.tsx`
- Actor = Admin (bukan user)
