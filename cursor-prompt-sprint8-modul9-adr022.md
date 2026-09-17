# Prompt Cursor — Sprint 8 / Modul 9: Gambar Detail Tanpa Crop, Hero Beranda Diselaraskan, Lightbox Publik (F09.1–F09.4)

> Acuan: `ENGINEERING.md` ADR-022 (Bagian 10), `PRD.md` §5.1e dan §9d, `feature-registry.md` Sprint 8.
> **SQL WAJIB dijalankan lebih dulu oleh Alif di Supabase** (`usulan-sql-modul9-adr022.sql`, satu kolom baru `batches.gambar_detail_url`) — konfirmasi ke Alif dulu kalau belum yakin SQL sudah jalan, JANGAN mulai coding sebelum itu.
>
> Governance yang tetap berlaku penuh (CLAUDE.md/PRD.md §13.1): JANGAN menambah tabel/kolom di luar yang sudah didefinisikan di PRD.md §5.1e (hanya `batches.gambar_detail_url`). JANGAN menjalankan DDL apa pun sendiri — SQL sudah dijalankan manual oleh Alif sebelum prompt ini dieksekusi. JANGAN menambah dependency baru tanpa izin eksplisit — semua kebutuhan di sprint ini bisa dipenuhi dengan package yang SUDAH terpasang (`browser-image-compression`, `react-image-crop`, lucide-react).

Kerjakan berurutan: F09.1 → F09.2 → F09.3 → F09.4. Setiap tahap, laporkan hasil dan tunggu konfirmasi Alif sebelum lanjut kalau ada keraguan — terutama soal posisi/penempatan visual yang tidak dijelaskan detail di prompt ini.

---

## 0. Konteks yang WAJIB dipahami dulu sebelum mengubah kode

Baca dulu file-file ini secara utuh sebelum menyentuh kode apa pun:

- `src/components/image-upload-field.tsx` — komponen upload gambar bersama, dipakai di banyak form Admin (batch, produk, hero slide, popup, material chapter, dst). Perubahan di file ini HARUS backward-compatible — semua pemanggil lain yang TIDAK diubah harus tetap berperilaku identik seperti sekarang.
- `src/app/admin/(protected)/batch/batch-form.tsx` — form Admin Batch, field `hero_gambar_url` (baris ~397) dan galeri (baris ~716).
- `src/app/admin/(protected)/produk/produk-form.tsx` — form Admin Produk, galeri foto (baris ~287, section "Foto Produk").
- `src/app/admin/(protected)/konten/hero-slide-form-dialog.tsx` — form Admin Hero Beranda, field gambar (baris ~220).
- `src/app/[locale]/(public)/pelatihan/[slug]/page.tsx` — halaman detail batch publik, render hero (baris ~158-168).
- `src/app/[locale]/(public)/pelatihan/pelatihan-card.tsx` — kartu daftar pelatihan (dipakai di `pelatihan/page.tsx`).
- `src/app/[locale]/(public)/katalog/[slug]/product-gallery.tsx` — carousel galeri produk di halaman detail produk.
- `src/app/[locale]/(public)/katalog/produk-card.tsx` dan `src/app/[locale]/(public)/katalog/page.tsx` (baris ~80-82, variabel `coverByProductId`) — kartu katalog produk, logika "cover = foto pertama galeri".
- `src/components/hero-carousel.tsx` — carousel hero beranda.
- `src/app/admin/(protected)/pendaftaran-batch/pendaftaran-batch-detail.tsx` — CONTOH POLA lightbox yang SUDAH ADA dan sudah lolos `jsx-a11y` (backdrop `<button>`, `useEffect` + `window.addEventListener` untuk Escape). **Tiru pola ini persis** untuk F09.4, jangan reinvent.
- `src/types/database.ts` — cek ulang setelah SQL dijalankan Alif, pastikan `batches.gambar_detail_url` sudah muncul di tipe `Row`/`Insert`/`Update`. Kalau proyek pakai `supabase gen types` otomatis, jalankan ulang generate-nya; kalau manual, tambahkan field itu ke tipe sesuai pola kolom nullable lain di tabel yang sama.

---

## F09.1 — Field "Gambar Detail" pelatihan (tanpa crop)

### 1a. `ImageUploadField` — dua prop baru, backward-compatible

Edit `src/components/image-upload-field.tsx`:

- Tambah prop opsional `skipCrop?: boolean` (default `false`). Kalau `true`: setelah file dipilih dan lolos validasi (`handleFile`), LEWATI seluruh alur `pending`/dialog `ReactCrop` — langsung jalankan kompresi (`imageCompression`, opsi yang SAMA seperti yang sudah dipakai di `konfirmasiCrop`: `{ maxSizeMB: 0.5, maxWidthOrHeight: 1920 }`) atas file asli, lalu panggil `onUpload` dan `onChange` seperti alur normal setelah crop selesai. Tampilkan indikator "Mengunggah…" yang sama (state `uploading`) selama proses ini. TIDAK perlu membuka `Dialog`/`ReactCrop` sama sekali kalau `skipCrop` true.
- Tambah prop opsional `previewFit?: 'cover' | 'contain'` (default `'cover''` — SAMA seperti perilaku sekarang, supaya semua pemanggil lain tidak berubah). Dipakai di preview gambar yang sudah ter-upload (blok `value ? (...) : (...)`, baris ~115): kalau `previewFit === 'contain'`, ganti `object-cover` jadi `object-contain` DAN ganti kelas container dari `aspect-video` (rasio tetap) jadi sesuatu yang membiarkan tinggi menyesuaikan gambar secara wajar — gunakan `max-h-64 w-full` dengan `Image` memakai `width`/`height` otomatis dari properti natural (BUKAN `fill` dengan `aspect-video` yang memaksa rasio) supaya preview di form Admin tidak ikut-ikutan memotong gambar yang justru dirancang tanpa crop. Sesuaikan implementasi teknisnya secukupnya asal hasil akhirnya: gambar preview `contain` tidak terlihat terpotong di form.
- Update teks bantuan di bawah tombol upload: kalau `skipCrop` true, jangan tampilkan kalimat yang menyinggung "crop"/"area" — cukup info format & ukuran maksimal seperti biasa.
- **JANGAN ubah default behavior sama sekali** untuk pemanggil yang tidak mengoper `skipCrop`/`previewFit` — cek ulang setelah selesai bahwa field `hero_gambar_url` (batch), galeri batch, popup (ADR-015), material chapter (ADR-018) semuanya tetap identik seperti sebelum perubahan ini.

### 1b. Skema, tipe form, dan server action

- `src/lib/validations/batch-admin.ts` — tambah field `gambar_detail_url: teksOpsional` ke `BatchFormSchema` (pola sama persis `hero_gambar_url`).
- Server action simpan batch (cek nama file/fungsi persisnya, kemungkinan `simpanBatchAction` di `src/app/admin/(protected)/batch/actions.ts` atau `[id]/actions.ts`) — pastikan `gambar_detail_url` ikut di-insert/update sama seperti `hero_gambar_url` (lewat helper `teks()` untuk normalisasi string kosong → null, sudah ada di `batch-admin.ts`).

### 1c. Form Admin Batch

Edit `src/app/admin/(protected)/batch/batch-form.tsx`. Tambahkan `FormField` baru untuk `gambar_detail_url`, diletakkan TEPAT SETELAH field `hero_gambar_url` yang sudah ada (baris ~397-415), dengan label yang jelas membedakan keduanya:

```tsx
<FormField
  control={control}
  name="gambar_detail_url"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Gambar Detail (ditampilkan utuh di halaman pelatihan)</FormLabel>
      <FormControl>
        <ImageUploadField
          label="Gambar Detail"
          skipCrop
          previewFit="contain"
          value={field.value ?? null}
          onChange={field.onChange}
          onUpload={async (file) => {
            const fd = new FormData();
            fd.append('file', file);
            return uploadGambarAdminAction(fd);
          }}
        />
      </FormControl>
      <FormDescription>
        Gambar ini TIDAK dipotong otomatis — cocok untuk poster/infografis yang bentuknya
        memanjang. Gambar Hero di atas tetap dipakai untuk kartu daftar pelatihan.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

Sesuaikan penulisan JSX-nya dengan konvensi form yang sudah ada di file itu (pola `FormField`/`FormItem` lain di sekitarnya) — contoh di atas hanya ilustrasi struktur, bukan untuk disalin literal kalau ada perbedaan pola.

Perjelas juga label field `hero_gambar_url` yang sudah ada (baris ~402) dari "Gambar Hero" jadi sesuatu seperti **"Thumbnail (kartu daftar pelatihan)"** supaya Abi paham perbedaan kedua field sejak dari form — tambahkan `FormDescription` singkat kalau field itu belum punya.

### 1d. Halaman detail publik

Edit `src/app/[locale]/(public)/pelatihan/[slug]/page.tsx`:

- Query yang mengambil `batch` (baris ~42 dan ~70) — tambahkan `gambar_detail_url` ke daftar kolom yang di-select.
- Render hero (baris ~158-168) — ganti sumber gambar:

```tsx
{(batch.gambar_detail_url || batch.hero_gambar_url) && (
  <button
    type="button"
    onClick={() => setLightboxSrc(batch.gambar_detail_url || batch.hero_gambar_url!)}
    className="relative mt-6 block w-full overflow-hidden rounded-xl"
    aria-label="Perbesar gambar pelatihan"
  >
    <Image
      src={batch.gambar_detail_url || batch.hero_gambar_url!}
      alt=""
      width={1200}
      height={800}
      priority
      className={
        batch.gambar_detail_url
          ? 'h-auto w-full object-contain'
          : 'aspect-video w-full object-cover'
      }
      sizes="(max-width: 768px) 100vw, 768px"
    />
  </button>
)}
```

Catatan penting: ini komponen Server Component saat ini (tidak ada `'use client'` di file) — state lightbox (`setLightboxSrc`) TIDAK bisa langsung di file ini. Extract bagian hero+lightbox jadi komponen client terpisah (lihat F09.4 di bawah untuk komponen lightbox bersama) yang menerima `gambarDetailUrl`/`heroGambarUrl` sebagai props, dipanggil dari halaman Server Component ini. Sesuaikan struktur `fallback` (`batch.gambar_detail_url || batch.hero_gambar_url`) — kalau `gambar_detail_url` kosong, tetap tampilkan `hero_gambar_url` seperti sekarang (`object-cover`, `aspect-video`) supaya batch lama tidak mendadak kosong.

`PelatihanCard` (`pelatihan-card.tsx`) dan query di `pelatihan/page.tsx` (baris ~56) **TIDAK berubah** — tetap pakai `hero_gambar_url` sebagai thumbnail kartu, seperti sekarang.

---

## F09.2 — Galeri foto produk (crop bebas, tampil utuh)

### 2a. Form Admin Produk

Edit `src/app/admin/(protected)/produk/produk-form.tsx`, baris ~304-307 — hapus prop `aspectRatio={1}` dari pemanggilan `ImageUploadField` di section "Foto Produk" (baris ~287 dst), supaya crop jadi bebas (tidak terkunci rasio). Tambahkan `FormDescription` atau `<p>` kecil di bawah tombol "Tambah" (section header, baris ~289) dengan teks: "Gunakan foto dengan latar belakang putih/polos untuk hasil terbaik."

### 2b. Tampilan publik — kartu katalog

Edit `src/app/[locale]/(public)/katalog/produk-card.tsx` dan komponen `ContentCard` (`src/components/content-card.tsx`, baris ~40-46):

- `ContentCard` dipakai bersama oleh kartu produk DAN kartu pelatihan (`PelatihanCard`) — **JANGAN ubah perilaku default `ContentCard`** (supaya kartu pelatihan tetap `object-cover` seperti sebelumnya, thumbnail-nya memang sudah dikunci rasio 16:9 jadi aman di-crop). Tambahkan prop baru opsional di `ContentCard`, misalnya `imageFit?: 'cover' | 'contain'` (default `'cover'`) dan `imageBg?: string` (default kosong/transparent) — kalau `imageFit === 'contain'`, ganti `className="object-cover"` jadi `className="object-contain"` pada `<Image>` (baris ~43-46), dan tambahkan `imageBg` sebagai kelas latar pada div container gambar (baris ~41).
- Di `produk-card.tsx`, oper `imageFit="contain"` dan `imageBg="bg-white"` (atau token warna latar putih yang sesuai konvensi Tailwind proyek ini — cek `tailwind.config`/token warna yang sudah dipakai di tempat lain untuk "putih polos", pakai token itu kalau ada) saat memanggil `ContentCard`.
- Di `pelatihan-card.tsx` — **JANGAN diubah**, biarkan default `cover` (thumbnail pelatihan tetap dikunci rasio, aman di-crop seperti sekarang).

### 2c. Tampilan publik — carousel detail produk

Edit `src/app/[locale]/(public)/katalog/[slug]/product-gallery.tsx`:

- Ganti `className="object-cover"` (dua tempat: slide utama baris ~35 area, dan thumbnail chip baris ~63) jadi `object-contain`.
- Ganti kelas latar `bg-muted` (baris ~30, ~50, ~58) jadi warna putih polos yang konsisten dengan keputusan 2b di atas (token yang sama).
- Bungkus slide utama dengan tombol yang memicu lightbox (lihat F09.4) — klik gambar besar di carousel membuka lightbox dengan gambar yang sama.

---

## F09.3 — Rasio Hero Beranda diselaraskan

Edit `src/app/admin/(protected)/konten/hero-slide-form-dialog.tsx`, baris ~222 — ganti `aspectRatio={16 / 9}` jadi `aspectRatio={4 / 3}`, dan `suggestedPx="1920×1080px"` jadi sesuatu yang proporsional 4:3, misalnya `suggestedPx="1600×1200px"`.

Tambahkan `FormDescription`/teks keterangan singkat di dekat field gambar itu: "Gambar ini juga tampil di halaman Masuk, Daftar, dan Lupa Sandi."

`src/components/hero-carousel.tsx` dan `src/components/auth/auth-shell.tsx` **TIDAK diubah** — kotak tampilan (aspect-square mobile / aspect-4/3 desktop di `hero-carousel.tsx`, dan container di `auth-shell.tsx`) sudah dianggap pas, murni rasio kunci upload yang diselaraskan.

---

## F09.4 — Lightbox klik-untuk-perbesar (komponen bersama)

Buat komponen client baru, misalnya `src/components/public-image-lightbox.tsx`, dengan pola PERSIS meniru `src/app/admin/(protected)/pendaftaran-batch/pendaftaran-batch-detail.tsx` (bagian `zoomSrc`/overlay, baris ~58-69 dan ~117-144 di file itu):

- State `lightboxSrc: string | null` dikelola oleh komponen yang memanggil (hero pelatihan di F09.1, galeri produk di F09.2) — atau, kalau lebih praktis, buat komponen ini "self-contained" menerima `children` sebagai trigger (render prop/slot pattern) supaya bisa dipakai ulang tanpa menduplikasi state management di setiap pemanggil. Pilih pendekatan yang paling konsisten dengan pola komponen lain di `src/components/` — cek dulu apakah ada pola serupa (compound component/context) yang sudah dipakai di proyek ini sebelum memutuskan.
- Overlay: backdrop `<button>` transparan `absolute inset-0` (BUKAN `div` dengan `onClick`) untuk klik-luar-untuk-tutup, `useEffect` + `window.addEventListener('keydown', ...)` untuk Escape (BUKAN `onKeyDown` di elemen non-interaktif), tombol "Tutup" eksplisit di pojok — identik pola `pendaftaran-batch-detail.tsx`. Tambahkan kelas blur pada backdrop, misalnya `backdrop-blur-sm` di atas `bg-black/80` yang sudah ada di pola aslinya (blur ini baru di F09.4, tidak ada di pola admin — tambahkan secukupnya, jangan berlebihan sampai gambar besar ikut buram, blur HANYA di layer backdrop di belakang gambar).
- Gambar di lightbox: `object-contain`, `max-h-[90vh] max-w-[95vw]`, sama seperti pola admin.
- Pastikan lolos `pnpm lint` tanpa error `jsx-a11y` — jalankan `pnpm lint` setelah selesai, SEBELUM melapor selesai ke Alif (pelajaran dari error sebelumnya di `pendaftaran-batch-detail.tsx`, jangan sampai terulang).

Pasang komponen ini di:
- Hero pelatihan (F09.1, halaman `pelatihan/[slug]`) — trigger klik pada gambar `gambar_detail_url`/`hero_gambar_url`.
- Galeri produk (F09.2, `product-gallery.tsx`) — trigger klik pada slide utama carousel (thumbnail kecil di bawah TIDAK perlu trigger lightbox sendiri, cukup pindah slide seperti sekarang).

**TIDAK dipasang** di `hero-carousel.tsx` (beranda) — sesuai keputusan ADR-022, slide beranda tetap murni navigasi/dekoratif.

---

## Sebelum melapor selesai — checklist wajib

1. `pnpm tsc --noEmit` bersih.
2. `pnpm lint` bersih — TIDAK ADA error `jsx-a11y` atau lainnya, terutama di komponen lightbox baru.
3. `pnpm build` sukses penuh, semua route ter-generate tanpa error.
4. Uji manual di browser (BUKAN cuma percaya laporan ini ke Alif — Alif akan menguji sendiri sebelum menandai DONE, sesuai Definition of Done proyek):
   - Upload poster pelatihan yang bentuknya memanjang ke field "Gambar Detail" baru — pastikan TIDAK ada dialog crop yang muncul, dan hasil di halaman detail publik menampilkan poster utuh.
   - Upload foto produk landscape (drone dengan baling-baling terbentang) — pastikan dialog crop muncul TAPI tanpa rasio terkunci (bisa digeser bebas), dan hasil akhir di kartu katalog + carousel detail tampil utuh, tidak terpotong.
   - Upload slide Hero Beranda baru — pastikan dialog crop sekarang rasio 4:3, dan tampilan di beranda + halaman Masuk masih terlihat wajar.
   - Klik gambar hero pelatihan dan galeri produk — pastikan lightbox muncul dengan backdrop blur, bisa ditutup lewat X, klik luar, dan tombol Escape.
   - Uji di viewport 375px (mobile) untuk semua perubahan di atas.
5. Laporkan ke Alif per fitur (F09.1, F09.2, F09.3, F09.4) — bukan satu laporan besar di akhir — supaya kalau ada yang perlu dikoreksi, ketahuan lebih awal.
