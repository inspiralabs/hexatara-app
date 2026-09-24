# Known console warnings — serah-terima Fase 1

> Dicatat 2026-09-24 saat audit serah-terima. **Bukan bug fungsional Hexatara.**
> Jangan dibuka ulang sebagai “temuan baru” di UAT / Fase 14 kecuali perilaku
> production berbeda dari deskripsi di bawah.
>
> Salin baris relevan ke kolom **Diketahui belum sempurna** di tiap
> `docs/AS_BUILT/M*.md` bila modul terkait disentuh.

| Warning / error di console | Lingkungan | Penyebab | Keputusan |
|---|---|---|---|
| `Failed to find Server Action` / `UnrecognizedActionError` | **Dev** (`pnpm dev` + Turbopack) | Tab lama / `VerifikasiPoller` masih POST action ID dari compile sebelumnya setelah hot-reload | Abaikan di lokal. Refresh tab. |
| Sama (jarang) | **Production** setelah redeploy | Version skew: client bundle deploy N memanggil action ID yang sudah diganti di deploy N+1 | **Fase 14:** aktifkan **Vercel → Settings → Skew Protection** (checklist PANDUAN §14.6). Tidak perlu mitigasi kode di Fase 1. |
| `Encountered a script tag while rendering React component` | Dev & prod (soft nav ke `/dashboard` atau `/admin`) | Inline anti-FOUC script dari **`next-themes`** (`ThemeProvider` di layout user/admin). React 19 memperingatkan `<script>` sebagai children. | **Biarkan.** Tema tetap jalan lewat JS `next-themes` setelah mount. Bukan fitur Hexatara yang mati. Upgrade/nonce ditunda. |

**Sudah diperbaiki (bukan known-warning):** Base UI `nativeButton` di `/verifikasi-email` — `Button` + `Link` memakai `nativeButton={false}` (2026-09-24).
