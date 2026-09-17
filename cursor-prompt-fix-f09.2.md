# Prompt Cursor — Perbaikan F09.2: Panah Carousel Keluar Bingkai + Thumbnail Produk (ADR-022b)

> Ditemukan Alif saat menguji F09.2 di browser. Dua perbaikan terpisah — kerjakan berurutan, laporkan masing-masing.
> **SQL WAJIB dijalankan lebih dulu oleh Alif** (`usulan-sql-modul9-adr022b.sql`, satu kolom baru `products.thumbnail_url`) sebelum bagian 2 di bawah dikerjakan. Bagian 1 (bug carousel) bisa dikerjakan duluan, tidak perlu SQL.

---

## Bagian 1 — Panah carousel galeri produk keluar bingkai

**Masalah:** di halaman detail produk publik (`katalog/[slug]`), panah kiri/kanan pada `ProductGallery` menyentuh elemen di luar kotak galeri — panah kanan menyentuh angka harga produk di kolom sebelah.

**Penyebab:** komponen `CarouselPrevious`/`CarouselNext` di `src/components/ui/carousel.tsx` (shadcn bawaan) diposisikan `absolute` dengan offset KELUAR dari kotak carousel (`-left-12`/`-right-12`, sekitar 48px di luar tepi) — didesain dengan asumsi ada ruang kosong di sekitar carousel. Di `katalog/[slug]/page.tsx`, layout `grid grid-cols-1 lg:grid-cols-2` menaruh galeri bersebelahan LANGSUNG dengan kolom info produk (harga dst) tanpa ruang ekstra, jadi panah yang keluar 48px itu menabrak kolom sebelah.

**Perbaikan (JANGAN ubah `src/components/ui/carousel.tsx` — komponen shared, dipakai di tempat lain juga, misal `HeroCarousel` mungkin tidak pakai ini tapi cek dulu pemakai lain sebelum menyentuhnya):**

Di `src/app/[locale]/(public)/katalog/[slug]/product-gallery.tsx`, ubah posisi panah supaya masuk KE DALAM kotak galeri (overlay di atas gambar, bukan di luar kotak) — pola umum untuk galeri produk e-commerce. Override posisi lewat prop `className` yang sudah didukung `CarouselPrevious`/`CarouselNext` (cek signature komponennya di `carousel.tsx`, keduanya menerima `className` dan menggabungkannya lewat `cn()` dengan kelas default):

```tsx
<CarouselPrevious className="left-3 hidden sm:flex" />
<CarouselNext className="right-3 hidden sm:flex" />
```

Sesuaikan nilai `left-3`/`right-3` secukupnya (boleh `left-2`/`right-2` kalau kurang pas) supaya panah terlihat jelas sebagai overlay DI DALAM kotak galeri (mungkin perlu tambahan `bg-background/80` atau semacamnya kalau kontrasnya kurang terlihat di atas foto — cek dulu tampilan defaultnya, `carousel.tsx` kemungkinan sudah punya latar bulat bawaan yang cukup, tinggal posisinya yang perlu diperbaiki).

**Uji:** buka halaman detail produk manapun yang punya lebih dari satu foto galeri, di desktop dan tablet — pastikan panah kiri/kanan terlihat jelas TANPA menyentuh/tumpang tindih dengan kolom info produk atau elemen lain di luar kotak galeri. Uji juga di viewport 375px (panah memang disembunyikan di mobile lewat `hidden sm:flex` yang sudah ada — pastikan itu tidak berubah).

---

## Bagian 2 — Thumbnail produk terpisah (revisi F09.2, ADR-022b)

**Masalah:** setelah field galeri produk (`product_images`) dibuat tanpa rasio terkunci (ADR-022 F09.2), Alif kesulitan menentukan foto mana dan ukuran berapa yang pas untuk jadi thumbnail kartu katalog — karena kartu katalog (`ProdukCard`) memakai kotak `aspect-video` (16:9) + `object-contain`, sedangkan foto pertama galeri bisa berbentuk apa saja.

**Keputusan (ADR-022b, revisi ADR-022):** produk sekarang mengikuti pola SAMA PERSIS dengan pelatihan (F09.1) — field **Thumbnail** terpisah, rasio terkunci saat upload, khusus untuk kartu katalog. Galeri (`product_images`) TETAP seperti sekarang (F09.2, rasio bebas, dipakai carousel detail) — TIDAK diubah/dihapus.

### 2a. Skema, tipe, dan server action

- `src/types/database.ts` — regenerate ulang setelah SQL `usulan-sql-modul9-adr022b.sql` dijalankan Alif, pastikan `products.thumbnail_url` muncul di tipe `Row`/`Insert`/`Update`.
- `src/lib/validations/produk-admin.ts` — tambah `thumbnail_url: teksOpsional` ke `ProductFormSchema`.
- `src/app/admin/(protected)/produk/actions.ts`, fungsi `simpanProdukAction` — tambahkan `thumbnail_url: teks(rest.thumbnail_url)` ke object `produk` yang di-insert/update (pola sama persis field teks opsional lain di situ, misal `kategori`).

### 2b. Form Admin Produk

Edit `src/app/admin/(protected)/produk/produk-form.tsx`. Tambahkan field baru "Thumbnail" DI ATAS section "Foto Produk" yang sudah ada (sebelum baris ~289 `<h2>Foto Produk</h2>`), dengan rasio terkunci 16:9 (SAMA seperti `hero_gambar_url` di form Batch):

```tsx
<FormField
  control={control}
  name="thumbnail_url"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Thumbnail (kartu katalog)</FormLabel>
      <FormControl>
        <ImageUploadField
          label="Thumbnail"
          aspectRatio={16 / 9}
          suggestedPx="1200×675px"
          value={field.value ?? null}
          onChange={field.onChange}
          onUpload={async (file) => {
            const fd = new FormData();
            fd.append('file', file);
            return uploadGambarProdukAction(fd);
          }}
        />
      </FormControl>
      <FormDescription>
        Ditampilkan di kartu katalog dan hasil pencarian. Foto di bagian &quot;Foto Produk&quot;
        di bawah ini khusus untuk galeri halaman detail, tidak dipakai sebagai thumbnail.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

Sesuaikan struktur JSX dengan konvensi form yang sudah ada di file itu (section wrapper, dsb) — contoh di atas ilustrasi struktur, bukan untuk disalin literal kalau berbeda pola.

Perjelas juga judul section "Foto Produk" yang sudah ada (baris ~290) — tambahkan keterangan singkat kalau perlu, supaya jelas section itu untuk galeri detail, bukan thumbnail.

### 2c. Kartu katalog publik

Edit query yang mengambil data produk untuk kartu (`src/app/[locale]/(public)/katalog/page.tsx`, dan bagian suggestion di `katalog/[slug]/page.tsx`) — tambahkan `thumbnail_url` ke kolom yang di-select dari `products_public`. Cek juga `products_public` VIEW itu sendiri (definisi ada di SQL migrasi lama, kemungkinan besar `select *` atau daftar kolom eksplisit) — kalau kolom eksplisit, **beri tahu Alif dulu** kalau `thumbnail_url` ternyata belum ikut ter-expose di view itu (butuh migrasi SQL tambahan untuk update definisi view, JANGAN dijalankan sendiri).

Edit `src/app/[locale]/(public)/katalog/produk-card.tsx` — ganti sumber `cover`:

```tsx
image={
  produk.thumbnail_url
    ? { src: produk.thumbnail_url, alt: nama }
    : produk.cover
      ? { src: produk.cover, alt: nama }
      : null
}
imageFit={produk.thumbnail_url ? 'cover' : 'contain'}
imageBg={produk.thumbnail_url ? undefined : 'bg-white'}
```

Logikanya: kalau `thumbnail_url` sudah diisi Admin, pakai itu dengan `object-cover` (rasio sudah terkunci 16:9 saat upload, aman di-crop-tampilkan penuh seperti kartu pelatihan). Kalau BELUM diisi (produk lama, atau Admin belum sempat isi), fallback ke `cover` (foto pertama galeri) dengan `object-contain` + latar putih SEPERTI SEKARANG (F09.2) — supaya produk lama tidak mendadak tampil kosong atau terpotong sebelum Admin sempat mengisi thumbnail satu per satu.

Update juga tipe `ProdukCardProduk` di file yang sama — tambahkan `thumbnail_url?: string | null` ke definisinya.

### Sebelum melapor selesai

1. `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` bersih.
2. Uji manual: buka form Admin Produk — field Thumbnail baru muncul di atas "Foto Produk", crop dialog-nya terkunci 16:9. Isi thumbnail untuk satu produk uji, cek kartu katalog produk itu tampil rapi (tidak terpotong aneh, `object-cover` di kotak 16:9 seperti kartu pelatihan). Cek produk LAIN yang BELUM diisi thumbnail — pastikan kartunya tetap tampil (fallback ke foto pertama galeri, `object-contain` + latar putih, seperti sebelum perbaikan ini).
3. Uji Bagian 1 dan Bagian 2 sama-sama di viewport 375px.
4. Laporkan ke Alif per bagian (Bagian 1 dulu, lalu Bagian 2) — jangan digabung jadi satu laporan.
