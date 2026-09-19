# Prompt Cursor — F11.1: Hapus field kategori teks ganda di form Produk

> Acuan: `ENGINEERING.md` ADR-024, `PRD.md` §5.1g dan §9f (khusus 9f.3), `feature-registry.md` Sprint 10.
> Sprint 10 / Modul 11 (ADR-024). **BERGANTUNG SQL** — jangan mulai sebelum Alif konfirmasi SQL `usulan-sql-modul11-adr024.sql` sudah dijalankan di Supabase DAN `src/types/database.ts` sudah di-regenerate (kolom `category_nama_id`/`category_nama_en` harus sudah muncul di tipe `products_public.Row`). Kalau belum, STOP dan laporkan ke Alif, jangan menebak-nebak kolomnya.
>
> Governance yang tetap berlaku penuh (CLAUDE.md/PRD.md §13.1): larangan #1 (jangan tambah tabel/kolom di luar PRD §5) — perubahan ini HANYA menyentuh VIEW (`products_public`, kolom turunan hasil JOIN), BUKAN kolom fisik baru di tabel `products`, dan sudah dicatat di PRD.md §5.1g. JANGAN eksekusi DDL apa pun sendiri — SQL sudah/sedang dijalankan Alif secara manual. JANGAN tambah dependency baru.

## 0. Konteks yang WAJIB dipahami dulu sebelum mengubah kode

Baca dulu file-file ini secara utuh:

- `src/app/admin/(protected)/produk/produk-form.tsx` — dua field kategori ada di sini (sekitar baris 123–152): field `kategori` (Input teks bebas, DIHAPUS) dan field `category_id` (`KategoriCombobox`, DIPERTAHANKAN).
- `src/app/[locale]/(public)/katalog/produk-card.tsx` — badge kategori publik (`produk.kategori`), akan diganti sumbernya.
- `src/app/[locale]/(public)/katalog/[slug]/page.tsx` — badge kategori di detail produk publik, pola sama.
- `src/app/[locale]/(public)/katalog/page.tsx` — query yang mengambil data dari `products_public`, cek kolom apa saja yang di-`select` sekarang (baris ~52), harus ditambah `category_nama_id, category_nama_en`.
- `src/lib/i18n/pick.ts` — fungsi `pick()` yang sudah dipakai untuk memilih `nama_id`/`nama_en` sesuai locale, dipakai POLA YANG SAMA untuk `category_nama_id`/`category_nama_en`.
- `src/types/database.ts` (bagian `products_public.Row`) — WAJIB dicek dulu apakah `category_nama_id`/`category_nama_en` sudah ada di tipe ini sebelum mulai coding. Kalau belum ada, STOP — berarti regenerate types belum dilakukan Alif.
- `usulan-sql-modul11-adr024.sql` — baca catatan soal `security_invoker` di file ini, PENTING untuk poin verifikasi di bagian "Sebelum melapor selesai".

---

## Konteks — SUDAH DITELUSURI, jangan diasumsikan ulang

Form Produk saat ini punya DUA field kategori berbeda:

1. `kategori` — Input teks bebas, tanpa validasi/relasi apa pun, placeholder "Contoh: Drone Survei". Dipakai HANYA sebagai badge tampilan di halaman publik (`produk-card.tsx` baris ~37, `katalog/[slug]/page.tsx` baris ~94). TIDAK pernah dipakai untuk filter/query.
2. `category_id` — `KategoriCombobox`, relasi ke tabel `product_categories` (dikelola di menu Produk → Kategori Produk). Dipakai untuk FILTER dropdown kategori di `/katalog` (`katalog/page.tsx`, `.eq("category_id", kategoriId)`). TIDAK pernah dipakai untuk menampilkan nama kategori ke publik — sampai sekarang.

Dua field ini SUDAH dikonfirmasi Alif membingungkan karena tampil berdampingan tanpa penjelasan perannya berbeda. Solusi: field teks (1) DIHAPUS dari form, badge publik pindah membaca nama kategori dari relasi (2) lewat kolom baru di view `products_public`.

---

## Perbaikan

### 1. Hapus field teks "Kategori" dari form Produk

Di `produk-form.tsx`, hapus SELURUH `FormField` dengan `name="kategori"` (sekitar baris 123–133 — field `Input` dengan placeholder "Contoh: Drone Survei"). JANGAN hapus `FormField` dengan `name="category_id"` (combobox) — itu tetap dipakai.

Cek juga `actions.ts` (`src/app/admin/(protected)/produk/actions.ts`) dan skema validasi Zod terkait — kalau ada field `kategori` di schema submit/insert/update produk, hapus dari sana juga supaya tidak ada field mati yang tetap dikirim ke server. **Kolom `products.kategori` di database TIDAK dihapus** — hanya berhenti diisi dari form baru. Produk lama yang masih punya nilai `kategori` lama TETAP ada di database, tidak perlu dibersihkan/di-migrasi (di luar scope ini).

### 2. Ganti sumber badge kategori publik dari teks ke relasi

Di `produk-card.tsx`:

```tsx
export type ProdukCardProduk = Pick<
  Database["public"]["Views"]["products_public"]["Row"],
  "id" | "slug" | "nama_id" | "nama_en" | "kategori" | "harga" | "rating"
> & {
  cover?: string | null;
  thumbnail_url?: string | null;
};
```

Ganti `"kategori"` di `Pick<...>` menjadi `"category_nama_id" | "category_nama_en"`. Lalu di JSX badge:

```tsx
badges={
  produk.kategori ? <span className={publicBadgeKategori}>{produk.kategori}</span> : undefined
}
```

Ganti jadi memakai `pick()` (pola sama seperti `nama`, lihat baris `const nama = pick(produk.nama_id, produk.nama_en, locale) ?? produk.nama_id ?? "";` di atasnya):

```tsx
const namaKategori = pick(produk.category_nama_id, produk.category_nama_en, locale);
// ...
badges={
  namaKategori ? <span className={publicBadgeKategori}>{namaKategori}</span> : undefined
}
```

Terapkan perubahan yang SAMA persis di `katalog/[slug]/page.tsx` (badge kategori detail produk, sekitar baris 94) — cek dulu apakah halaman ini sudah punya akses ke `locale` dan `pick()` di scope yang sama, ikuti pola yang sudah ada di file itu.

### 3. Update query yang mengambil data produk dari products_public

Cek SEMUA titik yang melakukan `.select(...)` dari `products_public` atau tipe `ProdukCardProduk` (grep `products_public` dan `ProdukCardProduk` di seluruh `src/app/[locale]/(public)/katalog/` dan tempat lain yang menampilkan kartu produk, misal Beranda kalau ada produk unggulan) — tambahkan `category_nama_id, category_nama_en` ke daftar kolom yang di-`select`, menggantikan `kategori` yang mungkin masih ada di situ.

### 4. Jangan sentuh filter kategori (category_id)

Filter dropdown kategori di `katalog/page.tsx` (`FilterBar`, `.eq("category_id", kategoriId)`) SUDAH BENAR dan TIDAK perlu diubah — filter ini sudah memakai relasi `category_id`, bukan field teks yang dihapus.

---

## Sebelum melapor selesai

1. `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` bersih.
2. Uji manual Admin: buka Tambah/Ubah Produk, pastikan HANYA ADA SATU field kategori (combobox "Kategori (dari daftar kategori)"), field teks lama sudah tidak ada sama sekali.
3. Uji manual publik: buka `/katalog`, pastikan badge kategori TETAP tampil untuk produk yang sudah punya `category_id` terisi (nilai harus sama dengan nama kategori yang dipilih Admin di combobox, bukan teks bebas lama). Buka juga detail salah satu produk (`/katalog/[slug]`), cek badge kategori di sana juga benar.
4. Uji produk yang BELUM punya `category_id` terisi (kalau ada data lama seperti itu) — badge kategori seharusnya tidak tampil sama sekali (bukan error/crash), sama seperti perilaku lama saat `kategori` kosong.
5. **Uji keamanan WAJIB** (lihat catatan di `usulan-sql-modul11-adr024.sql`): jalankan `select harga from products_public where tampilkan_harga = false;` di Supabase SQL editor — semua baris HARUS NULL. Kalau ada baris yang menampilkan angka, STOP, jangan lanjut, laporkan ke Alif segera — ini indikasi properti keamanan view rusak.
6. Diuji di viewport 375px — badge kategori tidak boleh membuat card produk terpotong/overflow.
7. Laporkan ke Alif hasil uji poin 2–5 secara spesifik (produk mana yang diuji, badge apa yang tampil).
8. Sesuai `CLAUDE.md` (Urutan kerja wajib, butir 6): **JANGAN tandai F11.1 DONE di `feature-registry.md` sampai Alif eksplisit mengonfirmasi sudah menguji sendiri di browser.** Begitu dikonfirmasi, update baris F11.1 — status DONE, kolom Berkas diisi file yang benar-benar diubah, kolom Diuji/Bukti diisi ringkasan hasil uji Alif (termasuk hasil uji keamanan poin 5).
