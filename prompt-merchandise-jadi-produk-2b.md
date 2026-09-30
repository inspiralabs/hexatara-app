# Prompt Cursor — Merchandise jadi Produk (2b: Alur Publik)

## Konteks

Lanjutan F13.4 (ADR-026, Sprint 12/Modul 13). Bagian dashboard user + admin (Prompt
2a) sudah **DONE dan dikonfirmasi diuji Alif** — jangan diutak-atik lagi kecuali
memang perlu untuk mengintegrasikan bagian ini. Bagian ini (2b) menyelesaikan
alur PUBLIK: pengunjung `/katalog` yang TIDAK punya akun (bukan lulusan LMS) bisa
beli produk merchandise langsung dari halaman produk.

**Keputusan yang sudah disepakati dengan Alif:**

- Pengunjung publik ikut pola WA yang sudah ada di katalog (bukan checkout/bayar
  online), TAPI sebelum ke WA, isi **form lengkap kebutuhan pengiriman** dulu (nama,
  WhatsApp, alamat pengiriman) — bukan langsung klik link WA kosong seperti produk
  lain.
- Data form ini disimpan ke tabel baru (`merchandise_public_orders`) supaya Admin
  punya daftar pesanan publik yang bisa dipantau, terpisah dari
  `certificate_orders`.
- Edge case user yang sebenarnya sudah login tapi buka dari tab publik: form publik
  TETAP muncul apa adanya untuk siapa saja (tidak ada deteksi sesi/redirect paksa) —
  cukup tambahkan baris kecil di form: "Sudah punya akun? Beli lewat Dashboard biar
  bisa dibundling dengan sertifikat." yang mengarah ke `/dashboard/transaksi`.
- **Asumsi scope yang saya pakai (tolong koreksi ke saya SEBELUM prompt ini
  dijalankan kalau salah):** form publik ini scope-nya PER PRODUK (satu form untuk
  satu produk di halaman detail produk itu, + input qty) — BUKAN keranjang
  multi-produk lintas halaman seperti di dashboard (2a). Alasannya: halaman detail
  katalog memang per-produk, dan Alif tidak secara eksplisit minta keranjang lintas
  produk untuk publik. Kalau pengunjung mau beli 2 produk berbeda, dia isi form dua
  kali (submit dua pesanan terpisah) — sama seperti pola WA-per-produk yang sudah
  ada sekarang.

**JANGAN disentuh** (larangan #3 CLAUDE.md — form penawaran Fase 2):
`quote-dialog.tsx`, `kirimPenawaranAction`, `QuoteRequestFormSchema`, tabel
`quote_requests`. Form merchandise ini adalah komponen, action, dan tabel yang
BERBEDA dan TERPISAH dari sistem "minta penawaran" itu. Produk non-merchandise
(drone dkk) tetap pakai `QuoteDialog` seperti sekarang, tidak berubah.

## Langkah wajib sebelum menulis kode

1. Baca `PRD.md` Bagian 0, `feature-registry.md` (cari F13.4), `ENGINEERING.md`
   entri ADR-026 (termasuk bagian yang diperluas dari Prompt 2a).
2. Baca ulang file yang akan disentuh untuk pastikan asumsi saya masih sesuai kondisi
   kode terkini (2a mungkin sudah mengubah beberapa hal sejak saya terakhir cek):
   `src/lib/merchandise.ts`, `src/app/[locale]/(public)/katalog/[slug]/page.tsx`,
   `src/app/[locale]/(public)/katalog/[slug]/quote-dialog.tsx` (HANYA untuk baca pola,
   JANGAN diubah), `src/app/[locale]/(public)/katalog/[slug]/actions.ts`,
   `src/lib/validations/upgrade.ts` (untuk `AlamatPengirimanSchema` yang mau
   di-reuse bentuk field-nya), `src/lib/public-ui.ts`.
3. Kalau ada perbedaan struktur dari yang saya asumsikan, **berhenti dan laporkan**,
   jangan menebak.
4. Paparkan rencana singkat sebelum menulis kode. Tunggu persetujuan Alif.

## 1. SQL (usulan, JANGAN dieksekusi)

Tulis/pastikan file `usulan-sql-merchandise-publik.sql` di root project sesuai draf
yang saya siapkan (file `usulan-sql-merchandise-publik.sql` sudah ada di root
project — cek isinya). Tabel baru: `merchandise_public_orders` (nama_lengkap,
whatsapp, alamat_pengiriman jsonb, items jsonb, catatan, status pakai enum
`status_lead` yang SUDAH ADA — jangan buat enum baru, RLS nol akses anon). **Jangan
dijalankan** — Alif yang menjalankan manual lalu konfirmasi sebelum dipakai di kode
produksi. Setelah dijalankan, generate ulang `src/types/database.ts`.

## 2. Validasi (`src/lib/validations/` — buat file baru, mis. `merchandise-publik.ts`)

```ts
export const MerchandisePublikSchema = z.object({
  nama_lengkap: z.string().min(1, { error: 'Nama lengkap wajib diisi' }),
  whatsapp: z.string().min(1, { error: 'Nomor WhatsApp wajib diisi' }),
  qty: z.number().int().positive(),
  alamat: AlamatPengirimanSchema, // reuse dari '@/lib/validations/upgrade'
  catatan: z.string().optional(),
});
```

Sesuaikan penamaan dengan konvensi project (cek file validations lain dulu).

## 3. Komponen form (`.../katalog/[slug]/beli-merchandise-dialog.tsx`, komponen BARU — jangan edit quote-dialog.tsx)

- Struktur mirip `QuoteDialog` (Dialog + react-hook-form + zodResolver) tapi field
  dan tujuan BEDA: nama lengkap, WhatsApp, qty, alamat pengiriman (nama penerima,
  telepon, alamat lengkap, kota, kode pos — sama seperti `AlamatPengirimanSchema`),
  catatan opsional.
- Tambahkan baris kecil di bawah judul form: "Sudah punya akun? [Beli lewat
  Dashboard](/dashboard/transaksi) biar bisa dibundling dengan sertifikat." — link
  biasa, bukan redirect paksa, tidak ada deteksi sesi.
- Setelah submit sukses: tampilkan state sukses (pola sama seperti `QuoteDialog`
  `terkirim`), lalu tombol/link untuk lanjut ke WhatsApp dengan pesan pre-filled
  ringkasan pesanan (nama produk, qty, nama pemesan, kota) — reuse pola
  `buildWaProdukLink`/`buildWaKonsultasiLink` yang sudah ada di file terkait, jangan
  bikin helper WA baru kalau yang lama bisa dipakai.

## 4. Server action (`.../katalog/[slug]/actions.ts` — tambah fungsi baru, jangan ubah `kirimPenawaranAction`)

```ts
export async function kirimPesananMerchandisePublikAction(productId: unknown, input: unknown) {
  // 1. Validasi productId + input pakai MerchandisePublikSchema
  // 2. Ambil produk dari `products_public` (nama, harga) berdasar productId —
  //    JANGAN percaya nama/harga dari client
  // 3. supabaseAdmin (createAdminClient(), pola sama kirimPenawaranAction —
  //    tabel ini nol akses anon) insert ke merchandise_public_orders:
  //    items = [{ product_id, nama_produk, qty, harga_satuan: harga produk saat ini }]
  // 4. return { ok: true, waLink } atau { ok: false, pesan }
}
```

## 5. Halaman detail produk (`.../katalog/[slug]/page.tsx`)

- Import `getKategoriMerchandiseId` dari `@/lib/merchandise` (sudah ada dari
  Prompt 2a).
- Kalau `produk.category_id === (await getKategoriMerchandiseId())`: tampilkan
  `<BeliMerchandiseDialog productId={produk.id} namaProduk={nama} harga={produk.harga} />`
  MENGGANTIKAN `<QuoteDialog productId={produk.id} />` di posisi CTA utama.
- Produk NON-merchandise: TIDAK BERUBAH, tetap `<QuoteDialog>` seperti sekarang.
- Tombol WA sekunder yang sudah ada (`waLink`) boleh tetap tampil untuk kedua jenis
  produk (fallback kontak langsung), tidak perlu dihapus.

## 6. Admin: tab/halaman baru "Pesanan Publik" di menu Merchandise

- Tambah item baru di section "Merchandise" (`admin-shell.tsx`):
  `{ href: "/admin/merchandise/pesanan-publik", label: "Pesanan Publik" }`
  (section sudah ada dari Prompt 2a, tinggal tambah item).
- Halaman baru `src/app/admin/(protected)/merchandise/pesanan-publik/page.tsx`:
  tampilkan daftar `merchandise_public_orders` (nama, WA, produk+qty dari kolom
  `items`, alamat, status, tanggal), dengan aksi ubah status
  (`baru` → `dihubungi` → `selesai`) — reuse pola dari
  `src/app/admin/(protected)/leads/penawaran-actions.ts` /
  `penawaran-table.tsx` untuk struktur update-status (tabel BEDA, jangan import
  langsung dari leads, tapi ikuti polanya).
- Tampilkan juga tombol buka WA ke nomor pemesan langsung dari baris tabel (pakai
  `whatsapp` yang tersimpan).

## 7. Testing sequence (untuk Alif, jangan ditandai selesai sebelum diuji manual)

1. Buka `/katalog`, klik produk kategori Merchandise → pastikan tombol CTA utama
   sekarang "Beli" (dialog form), bukan "Minta Penawaran".
2. Buka produk NON-merchandise (drone) → pastikan CTA masih "Minta Penawaran"
   seperti sebelumnya, tidak berubah.
3. Isi form Beli Merchandise (tanpa login) dengan qty dan alamat lengkap → submit →
   cek muncul state sukses + link WA terbuka dengan pesan berisi ringkasan pesanan.
4. Cek di Admin > Merchandise > Pesanan Publik: pesanan muncul dengan data benar,
   coba ubah status ke "dihubungi" lalu "selesai".
5. Klik link "Beli lewat Dashboard" di form publik → pastikan mengarah ke
   `/dashboard/transaksi` (tanpa error walau belum login — akan diminta login dulu
   seperti alur dashboard biasa).
6. Coba submit form tanpa isi alamat/WA → harus muncul error validasi per field,
   bukan crash atau submit kosong.

## 8. Dokumentasi wajib (jangan lewatkan)

1. **`plan.md`**: ringkasan perubahan bagian publik, file yang disentuh, status
   "menunggu uji Alif".
2. **`ENGINEERING.md`** — entri `### ADR-026` yang sudah ada (dan sudah diperluas di
   Prompt 2a). **Perluas lagi** (bukan ADR baru): tambah sub-bagian "**Diperluas
   [tanggal]**" berisi ringkasan alur publik (poin #2 Abi, bagian publik — sebutkan
   eksplisit F13.4 sekarang LENGKAP: dashboard+admin dari 2a, publik dari 2b).
   Update Bagian 11 (RIWAYAT PERUBAHAN STRUKTUR) dengan baris baru.
3. **`feature-registry.md`** — baris `F13.4`: update kolom Berkas (tambah file-file
   baru dari 2b), kolom Status **TETAP TODO** (baru boleh DONE setelah Alif konfirmasi
   uji browser bagian publik ini), kolom Bukti: "Dashboard+admin DONE (dikonfirmasi
   Alif [tanggal 2a]). Bagian publik: kode selesai, menunggu uji Alif."
4. **Jangan pernah menandai DONE atas inisiatif sendiri.**

## 9. Saran pesan commit

```
feat(merchandise): alur pembelian publik untuk produk merchandise (F13.4b)

- Tabel baru merchandise_public_orders (usulan SQL, belum dieksekusi)
- Form "Beli Merchandise" di halaman detail katalog (kategori Merchandise saja),
  terpisah dari form Minta Penawaran (tidak diubah)
- Admin: tab baru "Pesanan Publik" di menu Merchandise
- Dokumentasi: ADR-026 diperluas, feature-registry F13.4 lengkap (dashboard+admin
  DONE, publik menunggu uji Alif)

Ref: ADR-026, F13.4
```
