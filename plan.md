# Plan §12.6.10 — Polish Admin: toast, XLSX, reorder soal, Combobox

> **Status sesi:** Lanjutan Fase 12.6.  
> **Blok ini:** §12.6.10 (F06.16 polish).  
> **Warna:** Neutral. **Dep baru:** tidak. **SQL:** tidak.  
> **Kode:** selesai (tsc/lint/build OK). Menunggu uji Alif.

---

## Keputusan Alif (2026-09-15)

1. Reorder soal: **A — tetap ReorderButtons** (bukan DnD) → 0 kode.
2. Feedback: **A — toast saja**; hapus Alert/pesanError duplikat (FormMessage field tetap; login admin Alert tetap).
3. **§12.6.9:** belum ditutup. Alif masih evaluasi; halaman depan **akan dibuat tidak setema** dengan dashboard admin/user atau auth (login/daftar/lupa sandi). Commit/registry §12.6.9 ditunda.

---

## Checklist

### A — Toast
- [x] Hapus duplikasi toast + Alert/`pesanError` di ~29 file Admin
- [x] Login admin Alert tetap
- [x] FormMessage field tetap

### B — Ekspor XLSX
- [x] Tombol Ekspor Excel → `Button` Neutral (`leads-table`, `penawaran-table`)
- [x] Heading/warna sisa di leads + beberapa page admin → Neutral

### C — Reorder soal
- [x] Tetap ReorderButtons (tidak diubah)

### D — Combobox
- [x] Audit: kategori sudah Combobox; enum pendek tetap Select

### E — Verifikasi
- [x] tsc · lint · build
- [ ] Uji Alif di browser
- [ ] Registry F06.16 + commit (setelah OK)

---

## Progress log

| Tanggal | Section | Status | Catatan |
|---------|---------|--------|---------|
| 2026-09-15 | Rencana | DISETUJUI | 1A · 2A · catatan §12.6.9 |
| 2026-09-15 | A–E kode | SELESAI | Toast-only + ekspor Neutral; tunggu uji Alif |
