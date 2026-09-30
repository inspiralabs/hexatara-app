# Prompt Cursor — Perbaikan Grup 3: Dashboard User (gambar produk, status kirim, beli ulang)

## Konteks

Temuan uji Alif setelah F13.4. Tidak ada perubahan skema/SQL — semua perbaikan ini
murni query + UI. Tiga temuan digabung jadi satu prompt karena akar masalahnya SAMA:
query merchandise di dashboard pakai `.maybeSingle()` pada
`certificate_orders` where `paket = 'merch_addon'`, artinya sistem SEKARANG
mengasumsikan user cuma boleh pesan merchandise SEKALI SEUMUR HIDUP. Ini menyebabkan
#9 (tidak bisa pesan lagi) dan berimbas ke bagaimana #3 (gambar) dan #8 (status
stepper) perlu ditampilkan.

**Skema baru yang disepakati dengan Alif (F13.4 lanjutan):**

- User boleh buat pesanan `merch_addon` BARU begitu pesanan TERAKHIRnya berstatus
  `disetujui` (pembayaran sudah diverifikasi admin — TIDAK perlu menunggu
  `status_pengiriman = 'diterima'`).
- Untuk pesanan terakhir yang `ditolak`: user diberi DUA pilihan sekaligus — (a)
  unggah ulang bukti untuk pesanan yang sama (perilaku existing, tetap ada), ATAU (b)
  langsung buat pesanan baru dari awal (anggap yang ditolak ditutup/dibatalkan).
- Pesanan yang masih `menunggu_bukti` atau `menunggu_verifikasi` TETAP memblokir
  (user harus selesaikan dulu sebelum bisa buat pesanan baru — sama seperti sekarang).
- Riwayat semua pesanan merchandise lama TETAP tersimpan dan bisa dilihat user
  (jangan hilang/tertimpa).
- Status pengiriman (`status_pengiriman`: belum_diproses/diproses/dikirim/diterima)
  ditampilkan sebagai **stepper horizontal 4 langkah** (bukan teks biasa), di
  `/dashboard/transaksi` DAN `/dashboard/merchandise`, untuk order yang paketnya
  `cert_merch` atau `merch_addon` dan sudah `disetujui`.
- Daftar produk merchandise (di form pemilihan produk) perlu tampilkan **gambar**
  produk, tidak cuma nama+harga.

## Langkah wajib sebelum menulis kode

1. Baca ulang file-file berikut untuk pastikan kondisi masih sama seperti saat saya
   cek — kalau beda, berhenti dan laporkan, jangan menebak:
   `src/lib/merchandise.ts`, `src/app/[locale]/(user)/dashboard/merchandise/page.tsx`,
   `src/app/[locale]/(user)/dashboard/transaksi/page.tsx`,
   `src/app/[locale]/(user)/pesanan-status-section.tsx`,
   `src/app/[locale]/(user)/pesanan-upgrade-form.tsx`.
2. Paparkan rencana singkat sebelum menulis kode, terutama untuk bagian query
   "order aktif vs riwayat" di langkah 2 — tunggu persetujuan Alif kalau ada hal yang
   tidak jelas.

## 1. `src/lib/merchandise.ts` — tambah gambar produk

- `getProdukMerchandiseAktif()`: tambah field gambar ke return type
  `ProdukMerchandise` (mis. `thumbnail_url: string | null`), select dari
  `products_public` (kolom `thumbnail_url` sudah ada di tabel `products`/view
  publiknya — cek dulu nama kolom persis di view `products_public`).

## 2. Query "order aktif vs riwayat" (dashboard/merchandise, dashboard/transaksi)

Ganti pola `.maybeSingle()` pada `paket = 'merch_addon'` dengan logic baru:

```ts
// Ambil SEMUA order merch_addon user, terbaru dulu.
const { data: semuaOrderMerch } = await supabase
  .from('certificate_orders')
  .select('id, status, alasan_tolak, status_pengiriman, created_at')
  .eq('user_id', claims.sub)
  .eq('paket', 'merch_addon')
  .order('created_at', { ascending: false });

const orderTerbaru = semuaOrderMerch?.[0] ?? null;
const orderMemblokir =
  orderTerbaru && (orderTerbaru.status === 'menunggu_bukti' || orderTerbaru.status === 'menunggu_verifikasi')
    ? orderTerbaru
    : null;
// riwayat = semuaOrderMerch tanpa order yang sedang aktif ditampilkan sebagai form/status utama
```

- Kalau `orderMemblokir` ada → tampilkan `PesananStatusSection` seperti sekarang
  (status menunggu_bukti/menunggu_verifikasi, tidak ada opsi pesan baru).
- Kalau order terbaru `disetujui` → tampilkan RINGKASAN status order itu (termasuk
  stepper `status_pengiriman`, lihat bagian 4) DAN tombol "Pesan Merchandise Lagi"
  yang membuka form `PesananUpgradeForm` baru (order baru, bukan edit yang lama).
- Kalau order terbaru `ditolak` → tampilkan banner ditolak (alasan_tolak) DENGAN DUA
  tombol: "Unggah Ulang Bukti" (perilaku existing, `BuktiTransferUpload` untuk order
  itu) DAN "Buat Pesanan Baru" (buka form baru, order terpisah).
- Kalau belum pernah order sama sekali → langsung tampilkan form (perilaku sekarang).
- Terapkan pola yang SAMA di `dashboard/transaksi/page.tsx` untuk bagian merch_addon
  (paket cert_only/cert_merch di transaksi TIDAK berubah — itu tetap satu order
  seumur hidup per definisi produk, cuma merch_addon yang berulang).
- Tampilkan juga daftar ringkas "Riwayat Pesanan Merchandise" (tanggal, status,
  ringkasan produk) di bawah status/form utama, supaya order lama tidak hilang dari
  pandangan user.

## 3. Form pemilihan produk (`pesanan-upgrade-form.tsx`)

- Saat checklist produk merchandise, tampilkan thumbnail kecil di samping/atas nama
  produk (pakai `thumbnail_url` dari langkah 1). Kalau produk tidak punya gambar,
  tampilkan placeholder yang konsisten dengan pola gambar produk lain di project
  (cek `ProdukCard` katalog publik untuk pola fallback gambar).

## 4. Stepper status pengiriman (komponen baru, dipakai di `pesanan-status-section.tsx`)

- Buat komponen `StatusPengirimanStepper` (`.../status-pengiriman-stepper.tsx`):
  4 langkah horizontal — Belum Diproses → Diproses → Dikirim → Diterima — langkah
  yang sudah lewat/aktif ditandai jelas (warna/ikon centang), sisanya abu-abu.
  Responsive: di layar kecil boleh jadi vertikal atau scroll horizontal, sesuaikan
  dengan pola komponen UI lain di project (cek `components/ui/` yang tersedia,
  jangan install library stepper baru — larangan #7 CLAUDE.md, tidak boleh nambah
  dependency tanpa izin).
- Pakai komponen ini di `PesananStatusSection` untuk order `disetujui` dengan
  `paket` `cert_merch`/`merch_addon` DAN `status_pengiriman !== 'tidak_ada'`,
  menggantikan teks `LABEL_STATUS_KIRIM[...]` yang sekarang cuma kalimat inline.
- Pastikan dipakai konsisten di `/dashboard/transaksi` maupun `/dashboard/merchandise`
  (keduanya sudah pakai `PesananStatusSection` yang sama, jadi seharusnya otomatis
  konsisten kalau diubah di satu tempat itu).

## Testing sequence

1. User baru (belum pernah order merch): buka `/dashboard/merchandise` → cek gambar
   produk tampil di form.
2. Submit order merch_addon → status menunggu_bukti/menunggu_verifikasi → cek TIDAK
   ada opsi "pesan lagi" (masih diblokir, sesuai desain).
3. Admin approve order itu → user refresh `/dashboard/merchandise` → cek stepper
   status pengiriman muncul (mulai "Belum Diproses"), DAN ada tombol "Pesan
   Merchandise Lagi".
4. Klik "Pesan Merchandise Lagi" → isi form baru → submit → cek order lama TETAP
   muncul di "Riwayat Pesanan Merchandise", order baru jadi status utama.
5. Admin ubah status_pengiriman order pertama jadi "diproses" lalu "dikirim" →
   user refresh → cek stepper update sesuai.
6. Skenario ditolak: admin tolak sebuah order merch_addon → user buka
   `/dashboard/merchandise` → cek muncul DUA tombol ("Unggah Ulang Bukti" dan "Buat
   Pesanan Baru"), coba masing-masing berfungsi benar.
7. Cek `/dashboard/transaksi` menunjukkan perilaku yang sama untuk bagian
   merch_addon, dan TIDAK ada perubahan perilaku untuk cert_only/cert_merch (tetap
   satu order seumur hidup).

## Dokumentasi

1. **`plan.md`**: ringkas skema baru "beli ulang merchandise" + file yang disentuh,
   status "menunggu uji Alif".
2. **`ENGINEERING.md`** — perluas `### ADR-026` (bukan ADR baru): sub-bagian
   "Diperluas [tanggal]" jelaskan perubahan model dari "satu order merch_addon
   seumur hidup" jadi "boleh berulang setelah order sebelumnya disetujui/ditolak"
   — ini keputusan desain penting, dokumentasikan alasannya (permintaan Abi/Alif
   dari UAT, merchandise sekarang produk sungguhan jadi wajar dibeli berkali-kali).
   Update Bagian 11.
3. **`feature-registry.md`** — baris F13.4: catat perubahan ini di kolom Bukti,
   status TETAP seperti sebelumnya sampai Alif konfirmasi uji.
4. **Jangan pernah menandai DONE atas inisiatif sendiri.**

## Saran pesan commit

```
fix(dashboard-merchandise): boleh pesan ulang, gambar produk, stepper status kirim

- Order merch_addon tidak lagi dibatasi satu seumur hidup: boleh order baru setelah
  order sebelumnya disetujui atau ditolak (riwayat tetap tersimpan)
- Form pemilihan produk tampilkan gambar (thumbnail_url)
- Status pengiriman (belum diproses/diproses/dikirim/diterima) jadi stepper visual
  di /dashboard/transaksi & /dashboard/merchandise

Ref: ADR-026, F13.4 (temuan UAT)
```
