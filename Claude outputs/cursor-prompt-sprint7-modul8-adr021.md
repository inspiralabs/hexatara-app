# Prompt Cursor — Sprint 7 / Modul 8 (ADR-021): F08.1–F08.4

## Konteks wajib dibaca dulu

Sprint 6/Modul 7 (F07.1–F07.5) sudah selesai dan diuji Alif sepenuhnya —
ini kelanjutan, bukan revisi Sprint 6. Dokumen resmi rujukan:

- `PRD.md` Bagian 5.1d (skema tabel baru) dan Bagian 9c — MODUL 8 (tujuan,
  daftar fitur F08.1–F08.4, detail masing-masing, batasan).
- `ENGINEERING.md` ADR-021 (keputusan lengkap, termasuk catatan riset kode
  yang mengubah rancangan awal — baca bagian "Riset kode sebelum menulis
  keputusan" di situ, penting untuk paham KENAPA fasilitas reuse
  `batch_benefits` alih-alih kolom baru).
- `feature-registry.md` Sprint 7 (F08.1–F08.4, status TODO).

**SQL berikut SUDAH dijalankan manual oleh Alif di Supabase dan dikonfirmasi
berhasil:** `usulan-sql-modul8-adr021.sql` — tabel baru `batch_requirements`
(pola identik `batch_benefits`: bigserial, `batch_id` FK, `teks_id`/`teks_en`
dwibahasa, `ikon` opsional, `urutan` reorder), RLS (baca publik, tulis
admin). **`site_settings` TIDAK ada migrasi** — key baru `kontak_pelatihan`
dibuat otomatis lewat kode (`upsertSiteSetting`), bukan SQL.

**`src/types/database.ts` PERLU di-regenerate ulang** sebagai langkah
pertama F08.1, supaya `batch_requirements` terbaca. Kalau command generator
butuh kredensial yang tidak tersedia, STOP dan laporkan — jangan menulis
tipe manual sebagai pengganti.

Aturan baku proyek ini tetap berlaku penuh (`CLAUDE.md`/`PRD.md` Bagian 13):
jangan menambah tabel/kolom di luar yang sudah didokumentasikan, jangan
menjalankan DDL sendiri, jangan menambah dependency baru tanpa izin
eksplisit (export XLSX pakai package `xlsx` yang SUDAH terpasang, ADR-010 —
cek pola `leads-export.ts` yang sudah ada, JANGAN install ulang/versi lain),
RLS tidak boleh subquery ke tabel dirinya sendiri.

## Cara mengerjakan — tetap bertahap

Satu bagian per giliran, laporkan hasil, tunggu konfirmasi. Urutan: **F08.1
→ F08.2 → F08.3 → F08.4** (F08.3 butuh `batch_requirements` dari SQL yang
sudah jalan; F08.4 butuh F08.3 selesai karena menyalin `batch_requirements`
juga).

---

## F08.1 — Halaman Admin "Peserta Pendaftaran"

1. Regenerate `src/types/database.ts`, verifikasi `batch_requirements`
   muncul.
2. Route baru `src/app/admin/(protected)/peserta-pendaftaran/page.tsx`
   (sejajar `pendaftaran-batch/`, `upgrade/`, `produk/`). Tambahkan item
   menu baru di `admin-shell.tsx` (cek dulu di mana daftar menu
   didefinisikan, tambahkan konsisten dengan item lain — beri label yang
   jelas beda dari "Pendaftaran Batch" yang sudah ada, misal "Peserta
   Pendaftaran" atau "Peserta Terdaftar", supaya Admin tidak bingung dua
   menu yang mirip).
3. `requireAdmin()` dipanggil eksplisit di page ini.
4. Query `batch_registrations` dengan `status = 'disetujui'`, kolom:
   `nama_lengkap`, `email`, `whatsapp`, `kategori_peserta`, `batch_id`,
   `verified_at` — join ke `batches` (select `judul_id`) untuk nama batch
   di tampilan. TIDAK perlu join `profiles` (identitas sudah mandiri di
   `batch_registrations` sejak ADR-020r). TIDAK query `certificate_orders`
   sama sekali.
5. Dropdown filter batch di atas tabel ("Semua Batch" + daftar batch dari
   `batches`) — pola sama `FilterBar` yang sudah ada di halaman publik
   `pelatihan`. Filter ini mengubah query `batch_id` di server (bukan
   filter client-side saja), supaya konsisten dengan tombol export di
   langkah berikut.
6. Reuse `DataTable` generik (TanStack Table) yang sudah dipakai di seluruh
   tabel admin Gelombang 1, kalau cocok untuk tampilan daftar ini.
7. Tombol export XLSX: reuse pola `leads-export.ts` yang sudah ada (dynamic
   import `xlsx`, `json_to_sheet`, `writeFile` dengan nama file
   `peserta-pendaftaran-<tanggal>.xlsx`). **WAJIB mengikuti filter batch
   yang aktif di tabel saat tombol diklik** — kalau filter "Semua Batch",
   export semua baris hasil query saat itu; kalau filter satu batch,
   export cuma baris batch itu. Kolom export: Nama, Email, WhatsApp, Batch,
   Kategori Peserta, Tanggal Disetujui.

## F08.2 — Filter batch di panel verifikasi (F07.5)

1. Di `admin/pendaftaran-batch/page.tsx` yang sudah ada, tambahkan dropdown
   filter batch di atas tabel (pola sama langkah F08.1 di atas — reuse
   komponen filter yang sama kalau memungkinkan, jangan duplikasi kode
   dropdown filter batch dua kali di dua halaman berbeda; ekstrak jadi
   komponen kecil bersama kalau masuk akal).
2. Filter ini HANYA menambah kondisi `eq('batch_id', ...)` ke query yang
   sudah ada — TIDAK mengubah logika `setujuiPendaftaranBatchAction`/
   `tolakPendaftaranBatchAction` di `actions.ts` sama sekali.

## F08.3 — Card syarat peserta + fasilitas + kontak di halaman publik

1. Di `pelatihan/[slug]/page.tsx`, tambahkan query `batch_requirements`
   (select `id, ikon, teks_id, teks_en`, filter `batch_id`, order
   `urutan`) — pola query PERSIS sama seperti query `benefits` yang sudah
   ada di file yang sama (baris ~72).
2. Card baru ditempatkan setelah card "Jadwal & Investasi" (`scheduleInvestmentHeading`),
   SEBELUM card "Peralatan Belajar" (`equipmentHeading`) — perhatikan grid
   yang sudah ada di situ (`grid grid-cols-1 gap-4 pt-8 sm:grid-cols-2`,
   Jadwal & Investasi `sm:col-span-2`), sisipkan card baru ini sebagai
   elemen baru dalam grid yang sama atau blok terpisah sebelum grid
   tersebut — putuskan sendiri sesuai kerapian layout, jangan pecah grid
   yang sudah rapi tanpa alasan kuat.
3. Isi card: dua bagian — "Syarat Peserta" (list dari `batch_requirements`,
   tampilan checklist dengan ikon centang, atau pakai `ikon` kalau diisi)
   dan "Fasilitas" (list dari `batch_benefits` yang SUDAH di-query di
   halaman ini — JANGAN query dua kali, reuse variabel `benefits` yang
   sudah ada). **Fasilitas TIDAK dihapus dari badge pills di atas hero
   yang sudah ada** — card baru ini adalah TAMPILAN TAMBAHAN yang lebih
   detail/lengkap (dengan heading section jelas), badge pills di atas
   tetap sebagai ringkasan cepat. Kalau setelah dikerjakan terasa
   redundan (fasilitas tampil dua kali di halaman yang sama), laporkan ke
   saya untuk didiskusikan — jangan hapus salah satunya sendiri.
4. Di bagian bawah card, dua tombol/link WhatsApp: baca dari
   `site_settings` key `kontak_pelatihan` (`{wa_reguler, wa_private}`) —
   buat fungsi baru `getKontakPelatihan()` di `src/lib/site-settings.ts`,
   pola PERSIS `getKontak()` yang sudah ada di file yang sama. Kalau key
   belum pernah diisi Admin (baris belum ada), tampilkan fallback yang
   aman (misal tombol tidak tampil sama sekali, atau fallback ke
   `getKontak()` WA umum) — JANGAN crash kalau data kosong.
5. Label tombol: "Tanya Batch Reguler (Admin)" → `wa_reguler`, "Private &
   Inhouse Training (Abiyyi)" → `wa_private`. Format link `wa.me` pola
   sama `buildWaTanyaLink` yang sudah ada di file yang sama.
6. Di `admin/pengaturan`, tambahkan section baru "Kontak Pelatihan" (form
   dua input WA reguler & WA private), pola PERSIS section "Kontak
   Publik" yang sudah ada di halaman yang sama (`simpanKontakAction` →
   buat `simpanKontakPelatihanAction` baru, skema validasi baru di
   `src/lib/validations/pengaturan-admin.ts` mengikuti pola
   `KontakPublikSchema` yang sudah ada).
7. Di form Admin Batch (`batch-form.tsx`), tambahkan section "Syarat
   Peserta" — pola PERSIS section "Benefit" yang sudah ada di file yang
   sama (`useFieldArray` dengan `name: 'requirements'`, tombol
   tambah/hapus baris, field `teks_id`/`teks_en`). Update skema validasi
   `BatchFormInput` (`src/lib/validations/batch-admin.ts`) menambah field
   `requirements` array, dan `simpanBatchAction` (`batch/actions.ts`) untuk
   insert/update/delete baris `batch_requirements` — pola PERSIS bagaimana
   `benefits` sudah ditangani di action yang sama sekarang, jangan bikin
   pola berbeda.

## F08.4 — Salin dari Batch Lain

1. Di halaman Tambah Batch (`batch/baru/page.tsx`) SAJA — TIDAK di halaman
   edit batch (`batch/[id]/page.tsx`) — tambahkan dropdown/tombol "Salin
   dari Batch Lain" di atas form, berisi daftar batch yang sudah ada
   (label `judul_id` + tanggal biar mudah dikenali).
2. Saat dipilih, panggil server action baru `salinDariBatchAction(batchIdSumber)`
   di `batch/actions.ts` yang:
   - Query batch sumber lengkap (`batches` + `batch_benefits` +
     `batch_equipment` + `batch_gallery` + `batch_faqs` +
     `batch_requirements`, semua filter `batch_id`).
   - Kembalikan datanya ke client (BUKAN langsung insert ke database) —
     dipakai untuk mengisi form yang sedang dibuka (`reset()`/`setValue()`
     react-hook-form) supaya Abi masih bisa lihat & edit sebelum submit,
     BUKAN langsung membuat baris baru di database tanpa peninjauan.
   - Field yang IKUT diisi ke form: deskripsi, silabus, lokasi, alamat,
     harga, rating, kategori, PLUS seluruh baris benefits/equipment/
     gallery/faqs/requirements (isi field array form dengan data hasil
     salinan, id baris LAMA tidak ikut — ini draft baris BARU).
   - Field yang SENGAJA TIDAK diisi/dikosongkan: `slug`, `judul_id`,
     `judul_en`, `tanggal_mulai`, `tanggal_selesai`, `status`,
     `hero_gambar_url` — biarkan form tetap kosong di field ini supaya
     Abi mengisi manual.
3. Submit form Tambah Batch (setelah Abi mengisi field yang kosong dan
   meninjau hasil salinan) tetap lewat `simpanBatchAction` yang SUDAH ADA
   — TIDAK ada jalur submit terpisah, "salin" hanya PRE-FILL form, bukan
   proses simpan sendiri.
4. `batch_leads`/`batch_registrations` TIDAK pernah disentuh oleh fitur
   ini — pastikan query `salinDariBatchAction` tidak menyertakan tabel
   itu sama sekali.

---

## Batasan tegas untuk seluruh Sprint 7 ini

- `admin/pendaftaran-batch` (F07.5) dan `admin/peserta-pendaftaran` (F08.1)
  tetap dua halaman terpisah — JANGAN digabung jadi satu halaman.
- F08.1 TIDAK query/join `certificate_orders` sama sekali.
- F08.3 TIDAK mengubah tombol "Daftar Sekarang" (F07.3) atau card lain
  yang sudah ada dari Fase 12.6 — murni sisipan card baru.
- `batch_benefits` TIDAK diduplikasi jadi tabel baru — direuse apa adanya.
- F08.4 hanya di form Tambah, TIDAK di form Edit.
- F08.4 adalah PRE-FILL form, BUKAN insert langsung ke database — Abi
  tetap harus submit form seperti biasa setelah meninjau hasil salinan.
- Jangan tambah dependency baru — `xlsx` sudah terpasang (ADR-010), reuse.
- Light theme saja, mobile-first di semua halaman baru/berubah.

## Laporan yang saya butuhkan di SETIAP bagian

1. Konfirmasi tsc/lint/build hijau.
2. Screenshot 375px dan desktop untuk halaman/komponen baru/berubah.
3. Daftar file baru/diubah.
4. Untuk F08.1: konfirmasi file XLSX hasil export dibuka dan isinya sesuai
   filter yang aktif saat diklik (uji filter "Semua" vs satu batch).
5. Untuk F08.3: screenshot card baru DAN badge pills fasilitas yang sudah
   ada di atas hero (untuk saya nilai apakah tampilannya redundan atau
   tidak, sesuai catatan di langkah 3).
6. Untuk F08.4: screenshot form Tambah Batch SEBELUM dan SESUDAH klik
   "Salin dari Batch Lain" — tunjukkan field yang terisi vs yang sengaja
   kosong.

Saya uji sendiri di browser sesuai Definition of Done (`PRD.md` Bagian 14)
untuk tiap bagian sebelum bagian berikutnya dikerjakan. Status F08.1–F08.4
di `feature-registry.md` saya update ke DONE satu per satu setelah saya
konfirmasi sendiri — bukan otomatis dari laporan Cursor.
