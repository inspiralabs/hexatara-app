# Prompt Cursor — Fix lint `react-hooks/set-state-in-effect` (pendaftaran-perusahaan-table.tsx)

## Konteks

ESLint menandai pola `setState` di dalam `useEffect` sebagai anti-pattern
(bukan bug fungsional — kode tetap berjalan benar). Ditemukan di
`pendaftaran-perusahaan-table.tsx` baris 89-94, pola reset form detail setiap
dialog detail dibuka:

```tsx
useEffect(() => {
  if (!open) return;
  setStatus(row.status);
  setAlasan(row.alasan_tolak ?? '');
  setNominal(row.nominal != null ? String(row.nominal) : '');
  setCatatanAdmin(row.catatan_admin ?? '');
}, [open, ...]);
```

## Langkah wajib sebelum mengubah kode

1. Baca ulang file `pendaftaran-perusahaan-table.tsx` secara penuh untuk
   memastikan konteks lengkap (state apa saja yang dipakai, bagaimana dialog
   dirender, apa isi `...` di dependency array).
2. Cek apakah pola `setState` di dalam `useEffect` yang serupa (reaksi
   terhadap `open` untuk reset form dialog) ada juga di file lain hasil
   Prompt 3a/3b (`daftar-perusahaan-dialog.tsx` dan sejenisnya) — kalau ada,
   perbaiki sekalian dengan pola yang sama supaya konsisten. Laporkan file
   mana saja yang disentuh.

## Perbaikan

Pindahkan inisialisasi state dari `useEffect` ke handler `onOpenChange` pada
komponen `Dialog`, supaya state di-set langsung saat dialog dibuka (bukan
React render dulu → effect jalan → setState → render lagi):

```tsx
<Dialog
  open={open}
  onOpenChange={(next) => {
    setOpen(next);
    if (next) {
      setStatus(row.status);
      setAlasan(row.alasan_tolak ?? '');
      setNominal(row.nominal != null ? String(row.nominal) : '');
      setCatatanAdmin(row.catatan_admin ?? '');
    }
  }}
>
```

Hapus `useEffect` yang lama sepenuhnya (termasuk import `useEffect` kalau jadi
tidak terpakai lagi di file itu).

## Testing sequence

1. Jalankan lint (`eslint` / `pnpm lint` sesuai setup project) — pastikan
   warning `react-hooks/set-state-in-effect` di file ini (dan file lain yang
   ikut diperbaiki) sudah hilang, dan tidak ada warning/error baru muncul.
2. Buka Admin > Leads > Pendaftaran Perusahaan → klik salah satu baris → cek
   form detail terisi benar sesuai data baris (status, alasan tolak, nominal,
   catatan admin).
3. Klik baris lain (tanpa menutup dulu, kalau dialog mendukung ganti baris
   langsung) atau tutup-buka lagi dengan baris berbeda → pastikan form selalu
   menampilkan data baris yang baru diklik, tidak ada data "nyangkut" dari
   baris sebelumnya.
4. Ubah salah satu field di form, lalu tutup dialog TANPA simpan, buka lagi →
   pastikan form kembali ke data asli baris (bukan data yang belum disimpan
   tadi) — perilaku ini harus identik dengan sebelum perbaikan.
5. Pastikan tidak ada regresi pada fungsi ubah status/isi nominal/catatan
   admin yang sudah ada (simpan masih berfungsi normal).

## Dokumentasi

Tidak perlu update `plan.md`/`ENGINEERING.md`/`feature-registry.md` — ini
perbaikan lint murni, bukan perubahan fitur/ADR baru. Cukup sebutkan di
commit message file apa saja yang disentuh.

## Saran pesan commit

```
fix(admin-pendaftaran-perusahaan): pindah init state form detail dari useEffect ke onOpenChange

- Hilangkan warning lint react-hooks/set-state-in-effect
- State form detail (status/alasan/nominal/catatan admin) di-set langsung
  saat dialog dibuka lewat onOpenChange, bukan lewat useEffect yang react
  terhadap `open`
```
