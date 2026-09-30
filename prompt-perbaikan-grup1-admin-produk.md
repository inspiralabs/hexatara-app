# Prompt Cursor — Perbaikan Grup 1: Admin Produk/Merchandise (redirect + kategori)

## Konteks

Temuan uji Alif setelah F13.4 (Prompt 2a/2b) dijalankan. Dua bug murni, tidak ada
perubahan skema/SQL, tidak ada keputusan desain baru — langsung perbaiki.

**Bug 1 — Simpan produk Merchandise nyasar ke menu Produk.**
Akar masalah: `ProdukRowActions` (`src/app/admin/(protected)/produk/produk-row-actions.tsx`)
hardcode link "Ubah" ke `/admin/produk/${id}`, dipakai bersama oleh `ProdukTable` yang
di-reuse di `/admin/produk` MAUPUN `/admin/merchandise`. Karena tidak ada route
`/admin/merchandise/[id]/page.tsx`, klik "Ubah" pada baris merchandise selalu jatuh ke
halaman edit produk biasa (`afterSaveHref` default `/admin/produk`) — makanya setelah
save balik ke Produk, bukan Merchandise. Tombol "Batal" di `ProdukForm`
(`produk-form.tsx` baris ~360) juga hardcode `/admin/produk`.

**Bug 2 — Kategori tampil "-" di kedua tabel.**
`ProdukTable` (`produk-table.tsx`) menampilkan `row.kategori` — kolom TEXT lama yang
sudah tidak diisi lagi sejak admin pakai combobox `category_id` (relasi ke
`product_categories`). Perlu tampilkan nama kategori dari relasi, bukan kolom lama.

## Langkah

1. Baca ulang file-file di bawah untuk pastikan kondisi masih sama seperti saat saya
   cek. Kalau beda, berhenti dan laporkan.
2. `ProdukTable` (`produk-table.tsx`): tambah prop `basePath?: string` (default
   `/admin/produk`). Ganti kolom `kategori` (`row.kategori`) jadi kolom nama kategori
   yang diambil dari join `category_id → product_categories.nama_id` (query pemanggil
   di `/admin/produk/page.tsx` dan `/admin/merchandise/page.tsx` perlu di-update untuk
   select nama kategori itu — pakai pola yang sama seperti `products_public` view kalau
   memungkinkan, atau join manual `product_categories`). Update type `ProdukRow` untuk
   field kategori baru ini.
3. `ProdukRowActions`: tambah prop `basePath?: string` (default `/admin/produk`),
   pakai untuk link "Ubah" (`${basePath}/${id}`). Teruskan `basePath` dari
   `ProdukTable` ke `ProdukRowActions`.
4. `/admin/produk/page.tsx`: pass `basePath="/admin/produk"` (eksplisit, walau sama
   dengan default, untuk kejelasan).
5. `/admin/merchandise/page.tsx`: pass `basePath="/admin/merchandise"`.
6. Buat `src/app/admin/(protected)/merchandise/[id]/page.tsx` — salin struktur dari
   `src/app/admin/(protected)/produk/[id]/page.tsx` PERSIS, tapi:
   - Render `<ProdukForm ... afterSaveHref="/admin/merchandise" />`.
   - Tombol "Batal" di `ProdukForm` perlu bisa dikustomisasi juga — ubah `produk-form.tsx`
     supaya tombol Batal pakai `afterSaveHref` (bukan hardcode `/admin/produk`), ATAU
     tambah prop terpisah `cancelHref` yang default ke `afterSaveHref` kalau lebih rapi
     secara semantik — pilih yang lebih konsisten dengan pola project ini.
7. Pastikan halaman `/admin/merchandise/[id]` juga mem-filter/validasi produk yang
   diedit memang berkategori Merchandise (opsional tapi lebih aman — kalau admin
   akses `/admin/merchandise/99` untuk id produk drone lewat URL manual, tampilkan
   pesan/redirect yang jelas, jangan biarkan campur aduk kategori).

## Testing sequence

1. Admin > Merchandise > Daftar Produk: cek kolom Kategori sekarang menampilkan
   "Merchandise", bukan "-".
2. Admin > Produk (drone dkk): cek kolom Kategori menampilkan nama kategori yang
   benar juga (bukan "-").
3. Klik "Ubah" pada produk Merchandise → pastikan URL jadi `/admin/merchandise/[id]`
   (bukan `/admin/produk/[id]`), edit sesuatu, klik Simpan → pastikan kembali ke
   `/admin/merchandise`, bukan `/admin/produk`.
4. Klik "Batal" di halaman edit itu → pastikan juga kembali ke `/admin/merchandise`.
5. Ulangi langkah 3-4 untuk produk di `/admin/produk` → pastikan tetap kembali ke
   `/admin/produk` (tidak regresi).

## Dokumentasi

1. **`plan.md`**: catat ringkas 2 bug ini + file yang disentuh, status "menunggu uji Alif".
2. **`ENGINEERING.md`** — perluas entri `### ADR-026` yang sudah ada (bukan ADR baru):
   tambah sub-bagian "**Diperluas [tanggal]**" ringkas: perbaikan bug F13.4 (redirect
   edit produk merchandise, kolom kategori). Update Bagian 11 (RIWAYAT PERUBAHAN
   STRUKTUR) dengan baris baru.
3. **`feature-registry.md`** — baris F13.4: status TETAP seperti sebelumnya (jangan
   ubah ke DONE), tambahkan catatan di kolom Bukti bahwa 2 bug hasil UAT sudah
   diperbaiki, menunggu konfirmasi Alif.
4. **Jangan pernah menandai DONE atas inisiatif sendiri.**

## Saran pesan commit

```
fix(admin-produk): perbaiki redirect edit merchandise & kolom kategori kosong

- ProdukTable/ProdukRowActions terima basePath, supaya link edit & redirect
  after-save konsisten per section (Produk vs Merchandise)
- Halaman baru /admin/merchandise/[id] (afterSaveHref ke Merchandise)
- Kolom Kategori pakai nama dari relasi category_id, bukan kolom teks lama

Ref: ADR-026, F13.4 (temuan UAT)
```
