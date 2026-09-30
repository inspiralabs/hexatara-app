# Prompt Cursor — Merchandise jadi Produk (2a: Dashboard User + Admin)

## Konteks

Ini bagian F13.4 dari ADR-026 (Sprint 12/Modul 13), permintaan Abi (klien) saat UAT
30 September 2026. Rangkuman lengkap 5 permintaan Abi ada di ADR-026 (ENGINEERING.md)
dan `rencana-permintaan-abi-uat.md`. F13.1–F13.3 sudah DONE (navbar, kartu ajakan
upgrade, session timeout admin).

**Poin #2 Abi**: merchandise saat ini BUKAN entri produk sungguhan — harganya flat
(`site_settings.harga_upgrade`), tidak terhubung ke tabel `products`, dan Admin belum
bisa memisahkan menu Sertifikat vs Merchandise. Setelah didiskusikan dengan Alif,
disepakati alur berikut:

- Merchandise jadi produk sungguhan di tabel `products` (kategori baru "Merchandise",
  dibuat manual oleh Admin lewat Admin > Produk > Kategori Produk — **bukan** lewat SQL).
- User bisa pilih **lebih dari satu** produk merchandise sekaligus dalam satu pesanan
  (keranjang kecil), masing-masing dengan qty.
- Harga paket `cert_merch` = harga fee sertifikat (`harga_upgrade.cert_only`, TETAP
  flat, tidak berubah) + total harga produk merchandise yang dipilih.
- Harga paket `merch_addon` = total harga produk merchandise yang dipilih saja (tanpa
  fee sertifikat, karena user sudah bayar cert_only sebelumnya).
- Field alamat pengiriman yang SUDAH ADA di form upgrade (`AlamatPengirimanSchema`)
  **TETAP DIPAKAI, tidak dihapus** — karena tetap dibutuhkan untuk kirim merchandise
  hasil bundling ini. Yang berubah hanya: sebelum isi alamat, user sekarang checklist
  produk merchandise + qty dulu.
- Karena harga `cert_merch`/`merch_addon` sekarang dihitung otomatis (bukan angka
  tetap lagi), input harga untuk dua paket itu di halaman Admin > Pengaturan
  **dihapus dari form** (`cert_only` saja yang tetap bisa diedit Admin). Struktur data
  `site_settings.harga_upgrade` di database TIDAK perlu diubah — cukup berhenti dibaca
  untuk dua paket itu di kalkulasi harga baru.
- Verifikasi bukti bayar/approve-reject TETAP satu proses di menu Sertifikat yang
  sudah ada (satu pembayaran = satu order, tidak dipecah dua transaksi). Menu Admin
  **Merchandise** yang baru adalah tampilan "barang apa harus dikirim ke siapa" untuk
  order yang sudah disetujui dan punya item merchandise — BUKAN proses verifikasi baru.

**Di luar cakupan prompt ini (menyusul di Prompt 2b, setelah 2a diuji Alif)**: alur
pembelian merchandise dari halaman publik `/katalog` (form + WA handoff untuk
pengunjung tanpa akun) dan tab "Pesanan Publik" di menu Admin Merchandise. Jangan
kerjakan bagian itu sekarang.

## Langkah wajib sebelum menulis kode

1. Baca `PRD.md` Bagian 0, `feature-registry.md` (cari F13.4), `PRD.md` Bagian 6–11
   relevan produk/sertifikat, `ENGINEERING.md` Bagian 10 + entri ADR-025 dan ADR-026
   yang sudah ada.
2. Baca file-file yang akan disentuh (lihat daftar di bawah) untuk pastikan konvensi
   yang saya gambarkan masih sesuai kondisi kode terbaru — kalau ada perbedaan
   struktur dari yang saya asumsikan di sini, **berhenti dan laporkan ke saya**,
   jangan menebak.
3. Paparkan rencana singkat sebelum menulis kode. Tunggu persetujuan Alif.

## 1. SQL (usulan, JANGAN dieksekusi)

Tulis/perbarui file `usulan-sql-merchandise-jadi-produk.sql` di root project persis
seperti draf yang saya siapkan (saya lampirkan terpisah — cek file
`usulan-sql-merchandise-jadi-produk.sql` yang sudah ada di root project kalau sudah
ada, atau minta saya kirim isinya). Tabel baru: `certificate_order_items` (order_id,
product_id, qty, harga_satuan, created_at) + RLS. **Jangan dijalankan** — Alif yang
menjalankan manual di Supabase SQL editor lalu mengonfirmasi ke saya sebelum kolom ini
dipakai di kode produksi.

Setelah SQL dijalankan Alif, generate ulang types (`src/types/database.ts`) sesuai
cara yang biasa dipakai di project ini (cek `package.json` / dokumentasi Supabase CLI
yang sudah ada, jangan menebak perintahnya).

## 2. Validasi (`src/lib/validations/upgrade.ts`)

Tambahkan skema item produk dan gabungkan ke `PesananSchema`:

```ts
export const ProdukDipilihSchema = z.object({
  product_id: z.number().int().positive(),
  qty: z.number().int().positive(),
});

export const PesananSchema = z
  .object({
    paket: z.enum(['cert_only', 'cert_merch', 'merch_addon']),
    produk: z.array(ProdukDipilihSchema).optional(),
    alamat: AlamatPengirimanSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.paket !== 'cert_only' && !val.alamat) {
      ctx.addIssue({ code: 'custom', path: ['alamat'], message: 'Alamat pengiriman wajib diisi untuk paket ini' });
    }
    if (val.paket !== 'cert_only' && (!val.produk || val.produk.length === 0)) {
      ctx.addIssue({ code: 'custom', path: ['produk'], message: 'Pilih minimal satu produk merchandise' });
    }
  });
```

Sesuaikan penamaan field dengan konvensi yang sudah ada di file itu (cek dulu,
jangan asal timpa).

## 3. Form pemilihan produk (`src/app/[locale]/(user)/pesanan-upgrade-form.tsx`)

- Saat `paketDipilih !== 'cert_only'`, tampilkan daftar produk merchandise aktif
  (query `products` where `category_id` = id kategori "Merchandise" dan
  `is_active = true`) sebagai checklist + input qty per item, DI ATAS field alamat
  yang sudah ada.
- Tampilkan subtotal berjalan (harga per produk × qty, dijumlah) supaya user tahu
  totalnya sebelum submit.
- Ambil daftar produk & kategori dari Server Component pemanggil (`dashboard/transaksi/page.tsx`
  atau `dashboard/merchandise/page.tsx` — cek siapa yang render komponen ini) dan
  teruskan sebagai props, jangan fetch di client kalau pola project ini
  Server-Component-first (cek dulu).
- Kalau kategori "Merchandise" belum dibuat Admin saat form ini pertama kali
  dijalankan, tampilkan pesan kosong yang jelas ("Belum ada produk merchandise
  tersedia, hubungi Admin") — jangan crash.

## 4. Perhitungan harga & server action (cari file action yang menangani submit pesanan upgrade — grep untuk `PesananSchema` dipakai di mana)

- `cert_only`: nominal = `harga_upgrade.cert_only` (TIDAK BERUBAH).
- `cert_merch`: nominal = `harga_upgrade.cert_only` + Σ(harga_satuan_snapshot × qty)
  dari produk dipilih.
- `merch_addon`: nominal = Σ(harga_satuan_snapshot × qty) dari produk dipilih.
- `harga_satuan_snapshot` diambil dari `products.harga` PADA SAAT submit (jangan
  percaya harga dari client), disimpan sebagai `harga_satuan` di
  `certificate_order_items` supaya riwayat tidak berubah kalau admin ubah harga
  produk belakangan.
- Insert ke `certificate_orders` lalu insert baris-baris ke
  `certificate_order_items` dalam satu transaksi/RPC kalau project ini biasa pakai
  pola itu (cek pola existing, mis. RPC pendaftaran batch), atau sequential insert
  dengan penanganan galat yang jelas kalau tidak ada pola RPC untuk ini.

## 5. Halaman Admin > Pengaturan (`src/app/admin/(protected)/pengaturan/pengaturan-forms.tsx` + `src/lib/validations/pengaturan-admin.ts`)

- Di `HargaUpgradeSchema`, hapus field `cert_merch` dan `merch_addon` dari skema form
  (schema untuk INPUT admin saja — bukan mengubah struktur `site_settings` di DB).
- Di form, hapus dua blok input `cert_merch` dan `merch_addon` (baris ~354–365 di
  `pengaturan-forms.tsx`), sisakan `cert_only` saja dengan label yang jelas
  ("Harga Upgrade Sertifikat (QR)").
- Di `src/lib/site-settings.ts`, `getHargaUpgrade()` boleh tetap mengembalikan value
  lama untuk `cert_merch`/`merch_addon` (backward-compat, tidak perlu dihapus dari
  type) — tapi kode baru di langkah 4 TIDAK BOLEH membaca dua field itu lagi untuk
  hitung nominal.

## 6. Menu Admin baru: "Merchandise" (`src/components/shell/admin-shell.tsx`)

Tambah section baru terpisah dari "Produk" dan "Sertifikat" yang sudah ada:

```ts
{
  section: "Merchandise",
  icon: <ikon yang sesuai, cek import yang sudah ada, mis. ShoppingBagIcon>,
  items: [
    { href: "/admin/merchandise", label: "Daftar Produk" },
    { href: "/admin/merchandise/pesanan", label: "Pesanan" },
  ],
},
```

### 6a. `/admin/merchandise` (Daftar Produk)

- Sama seperti `/admin/produk` (CRUD produk yang sudah ada) TAPI di-filter hanya
  `category_id` = kategori "Merchandise" (query kategori dulu, kalau tidak ketemu
  tampilkan pesan "Buat kategori Merchandise dulu di Kategori Produk").
- Rekomendasi implementasi: reuse komponen/pola `ProdukTable` dan form
  create/edit yang sudah ada di `src/app/admin/(protected)/produk/`, jangan
  duplikasi logic dari nol — cek apakah bisa dibuat sebagai varian dengan filter
  kategori terkunci ke "Merchandise" (produk baru yang dibuat dari sini otomatis
  ke-assign kategori Merchandise).

### 6b. `/admin/merchandise/pesanan` (Pesanan)

- Tampilkan daftar `certificate_orders` yang paketnya `cert_merch` atau
  `merch_addon` DAN sudah berstatus `disetujui`, di-join dengan
  `certificate_order_items` + `products` (nama produk) — fokus ke: nama pembeli,
  daftar produk + qty, alamat pengiriman, `status_pengiriman` (kolom yang sudah
  ada), dan tombol untuk update status pengiriman (reuse
  `StatusPengirimanSelect` dari `src/app/admin/(protected)/upgrade/`).
- Ini VIEW untuk fulfilment, BUKAN untuk approve/reject bukti bayar — itu tetap di
  menu Sertifikat yang sudah ada. Jangan duplikasi tombol approve/reject di sini.

### 6c. Menu Sertifikat existing (`src/app/admin/(protected)/upgrade/upgrade-tables.tsx`)

- Tambahkan indikasi ringkas produk merchandise pada baris `cert_merch`/`merch_addon`
  (mis. "2 produk" dengan tooltip/expand daftar nama produk) supaya Admin masih bisa
  lihat konteks saat approve — tapi jangan pindahkan proses approve/reject.

## 7. Testing sequence (untuk Alif, jangan ditandai selesai sebelum ini diuji manual)

1. Admin buat kategori "Merchandise" di Admin > Produk > Kategori Produk.
2. Admin tambah 2–3 produk lewat menu baru Admin > Merchandise > Daftar Produk,
   pastikan otomatis masuk kategori Merchandise dan juga muncul di `/katalog` dengan
   filter kategori Merchandise (tanpa kode tambahan, sudah otomatis lewat FilterBar
   yang ada).
3. Sebagai user (belum cert_only): coba ajukan `cert_merch`, pilih 2 produk berbeda
   dengan qty berbeda, isi alamat, submit. Cek nominal di Admin > Sertifikat >
   Antrean sesuai hitungan (fee cert_only + total produk).
4. Sebagai user (sudah cert_only disetujui): coba ajukan `merch_addon`, pilih 1
   produk, cek nominal = harga produk × qty saja (tanpa fee sertifikat).
5. Admin approve salah satu order di menu Sertifikat seperti biasa → cek muncul di
   Admin > Merchandise > Pesanan dengan detail produk + alamat benar, lalu coba ubah
   status pengiriman.
6. Admin > Pengaturan: pastikan hanya field "Harga Upgrade Sertifikat (QR)" yang
   tersisa dan bisa disimpan normal.
7. Coba submit `cert_merch`/`merch_addon` TANPA pilih produk → harus muncul error
   validasi "Pilih minimal satu produk merchandise", bukan crash.

## 8. Dokumentasi wajib (jangan lewatkan)

Setelah kode selesai (SEBELUM menunggu hasil uji Alif — dokumentasi teknis boleh
ditulis duluan, tapi status DONE di feature-registry menunggu konfirmasi Alif):

1. **Tulis di `plan.md`**: ringkasan perubahan, file yang disentuh, dan status
   "menunggu uji Alif" untuk F13.4 bagian dashboard.
2. **`ENGINEERING.md`** — cari entri `### ADR-026` yang sudah ada (dibuat dari
   prompt navbar/kartu & session-timeout sebelumnya). JANGAN buat ADR baru.
   **Perluas** entri itu: tambah sub-bagian baru di bawah **Keputusan** existing,
   ikuti pola "**Diperluas [tanggal]**" yang sudah dipakai di ADR-024, isinya
   ringkasan poin #2 (merchandise jadi produk, cakupan dashboard+admin — sebutkan
   eksplisit bahwa alur publik menyusul di F13.4 bagian 2/Prompt 2b). Update juga
   baris status ADR-026 di Bagian 11 (RIWAYAT PERUBAHAN STRUKTUR) — tambah baris
   baru, jangan timpa baris lama.
3. **`feature-registry.md`** — cari baris `F13.4` di section `## Sprint 12 — Modul
   13` yang sudah ada. Update kolom Berkas dengan daftar file yang disentuh, kolom
   Status **TETAP TODO** (jangan DONE — itu hanya boleh diisi setelah Alif konfirmasi
   sudah uji browser sendiri), kolom Bukti isi catatan singkat "kode selesai, menunggu
   uji Alif; alur publik menyusul (Prompt 2b)".
4. **Jangan pernah menandai DONE atas inisiatif sendiri** — ini aturan mutlak di
   CLAUDE.md.

## 9. Saran pesan commit

```
feat(merchandise): jadikan merchandise produk sungguhan + keranjang multi-produk (F13.4a)

- Tabel baru certificate_order_items (usulan SQL, belum dieksekusi)
- Form upgrade: pilih produk merchandise + qty, harga otomatis dari produk
- Admin: menu Merchandise baru (Daftar Produk + Pesanan), field harga
  cert_merch/merch_addon dihapus dari Pengaturan (dihitung otomatis)
- Dokumentasi: ADR-026 diperluas, feature-registry F13.4 (masih TODO — menunggu
  uji Alif), alur publik menyusul di Prompt 2b

Ref: ADR-026, F13.4
```
