# Prompt Cursor — Sprint 6 / Modul 7 LENGKAP: F07.1–F07.5 (Pendaftaran Pelatihan Lengkap RPC)

## Konteks wajib dibaca dulu

Dokumen resmi rujukan (sudah ditulis, bukan usulan lagi):

- `PRD.md` Bagian 5.1c (skema tabel/kolom baru) dan Bagian 9b — MODUL 7
  (tujuan, cerita pengguna, daftar fitur F07.1–F07.5, alur, batasan).
- `ENGINEERING.md` ADR-020 (keputusan: field identitas permanen di
  `profiles`, tabel baru `batch_registrations`, bucket privat
  `identity-documents`).
- `feature-registry.md` Sprint 6 (F07.1–F07.5, semua status TODO).

**SQL ADR-020 (`usulan-sql-pendaftaran-lengkap.sql` Bagian 1–5) SUDAH
dijalankan manual oleh Alif di Supabase dan dikonfirmasi berhasil.** Skema
berikut SUDAH ADA di database live:

- `profiles` +6 kolom: `nomor_ktp`, `tempat_lahir`, `tanggal_lahir`,
  `alamat_lengkap`, `foto_ktp_url`, `pas_foto_url`.
- Fungsi `public.profil_identitas_lengkap(p_user_id uuid) returns boolean`.
- Enum `public.kategori_peserta_rpc` ('penerbitan_baru', 'perpanjangan_renewal'),
  `public.status_registrasi_batch` ('menunggu_verifikasi', 'disetujui', 'ditolak').
- Tabel `public.batch_registrations` (bigserial, FK ke `batches(id)` dan
  `auth.users(id)`, RLS aktif — user baca/buat milik sendiri, admin baca/ubah
  semua lewat `is_admin()`).
- Bucket privat `identity-documents` (policy: user upload/baca file sendiri
  berdasarkan prefix path `userId/...`, admin baca semua).

**`src/types/database.ts` BELUM di-regenerate** — dicek langsung, tidak
mengenali skema baru di atas sama sekali. **Ini WAJIB jadi langkah pertama**
sebelum baris kode apa pun ditulis: jalankan generator tipe Supabase yang
sudah biasa dipakai di proyek ini. Kalau command generator butuh kredensial
yang tidak tersedia di lingkungan Cursor, STOP dan laporkan ke saya — jangan
menulis tipe manual sebagai pengganti (rawan drift dari skema asli).

Aturan baku proyek ini tetap berlaku penuh (`CLAUDE.md` / `PRD.md` Bagian 13):
jangan menambah tabel/kolom di luar yang sudah didokumentasikan (skema sudah
lengkap, tidak ada DDL baru di langkah manapun di bawah), jangan menjalankan
DDL apa pun sendiri, jangan menambah dependency baru tanpa izin eksplisit,
jangan sentuh API spesifik Vercel, RLS `profiles`/`batch_registrations` tidak
boleh subquery ke tabel dirinya sendiri untuk cek role (pakai `is_admin()`
yang sudah ada). Registrasi ini BUKAN sistem manajemen kelas/LMS — pengiriman
materi tetap manual via WhatsApp/Zoom seperti sekarang, jangan tambah fitur
di luar 5 baris F07.1–F07.5 di bawah.

## Cara mengerjakan — WAJIB bertahap, bukan sekaligus

File ini sengaja digabung jadi SATU dokumen supaya seluruh konteks
F07.1–F07.5 bisa dibaca utuh sekali jalan, TAPI eksekusinya tetap **satu
bagian per giliran, laporkan hasil, tunggu saya konfirmasi**, baru lanjut ke
bagian berikutnya — persis pola yang sudah dipakai sepanjang proyek ini
(`PANDUAN.md` / `CLAUDE.md`: "Paparkan rencana, tunggu persetujuan → code →
Alif tes → update registry"). Urutan wajib: **F07.1 → F07.2 → F07.3 → F07.4
→ F07.5**, karena masing-masing bergantung pada bagian sebelumnya (form
pendaftaran F07.3 butuh gate F07.4 yang butuh util dari F07.1; panel admin
F07.5 butuh tabel yang datanya baru terisi setelah F07.3 jalan). Jangan
loncat bagian, jangan gabung beberapa bagian jadi satu commit besar tanpa
saya lihat progresnya dulu.

---

## F07.1 — Fondasi tipe + validasi identitas

1. Regenerate `src/types/database.ts` (lihat catatan di atas). Verifikasi
   `batch_registrations`, kolom baru `profiles`, dan kedua enum baru sudah
   muncul di file hasil generate.
2. Buat skema validasi Zod baru `src/lib/validations/identitas-profil.ts`
   (ikuti pola & gaya pesan error Bahasa Indonesia yang sudah dipakai di
   `src/lib/validations/profil.ts` dan `pengaturan-admin.ts` — jangan bikin
   gaya baru):
   - `nomor_ktp`: string, wajib 16 digit angka (NIK Indonesia standar).
   - `tempat_lahir`: string, wajib diisi.
   - `tanggal_lahir`: date, wajib diisi, tidak boleh di masa depan.
   - `alamat_lengkap`: string, wajib diisi, minimal panjang wajar (misal 10
     karakter) supaya bukan input asal.
   - Untuk upload (`foto_ktp_url`, `pas_foto_url`): validasi tipe file image
     dan ukuran maksimal (misal 5MB) di level komponen upload, bukan di
     skema Zod field text ini.
3. Buat util server-side kecil, misal `src/lib/identitas.ts`, yang memanggil
   RPC `profil_identitas_lengkap(p_user_id)` lewat Supabase client — dipakai
   nanti oleh F07.2 (indikator status), F07.4 (gate). Jangan duplikasi logika
   "cek 6 field satu-satu" di TypeScript, pakai fungsi database yang sudah
   ada.

## F07.2 — Halaman lengkapi data identitas

Proyek ini SUDAH punya halaman `/dashboard/profil` (nama tampilan) dan
`/dashboard/setting` (WhatsApp + kata sandi) — jangan bikin route baru yang
tumpang tindih dengan keduanya. Field identitas RPC (KTP, tempat/tanggal
lahir, alamat, upload dokumen) ditambahkan sebagai **section baru di halaman
`/dashboard/profil`** yang sudah ada (`src/app/[locale]/(user)/dashboard/profil/page.tsx`),
karena ini tetap data "siapa saya", bukan pengaturan akun (WhatsApp/password).

1. Di `profil/page.tsx`, tambahkan `<section>` kedua (pola card yang sama
   persis dengan section Email/ProfilForm yang sudah ada:
   `max-w-md rounded-xl border border-border bg-card p-5`) berjudul misalnya
   "Data Identitas (untuk Sertifikasi RPC)". Query tambahan: ambil 6 kolom
   identitas dari `profiles` untuk user yang login (`claims.sub`).
2. Buat komponen form baru `identitas-form.tsx` di folder yang sama
   (`dashboard/profil/`), pola persis `ProfilForm` yang sudah ada:
   `react-hook-form` + `zodResolver(IdentitasProfilSchema)`, `Input`/`Label`
   dari komponen UI yang sama, alert error/sukses dengan pola yang sama.
   - Field: Nomor KTP, Tempat Lahir, Tanggal Lahir (date picker — cek
     apakah proyek sudah punya komponen date picker, misal dipakai di form
     Batch admin untuk `tanggal_mulai`/`tanggal_selesai`; kalau ada, reuse,
     jangan bikin baru), Alamat Lengkap (textarea).
   - Prefill dari data yang sudah diquery di langkah 1 kalau sudah pernah
     diisi.
3. Buat komponen upload untuk Foto KTP dan Pas Foto:
   - Cek dulu apakah proyek sudah punya komponen upload reusable (dipakai di
     form bukti pembayaran upgrade `pesanan-upgrade-form.tsx` di
     `(user)/actions.ts`/folder terkait) — reuse kalau ada, jangan bikin
     komponen upload baru dari nol kalau polanya sudah tersedia.
   - Upload ke bucket privat `identity-documents`, path WAJIB diawali
     `${userId}/...` (misal `${userId}/ktp.jpg`, `${userId}/pas-foto.jpg`)
     — ini syarat policy storage yang sudah dibuat, path yang salah akan
     ditolak RLS storage.
   - Simpan PATH (bukan URL publik) ke kolom `foto_ktp_url`/`pas_foto_url`.
     Bucket ini privat, tidak pernah ada URL publik untuk file ini.
   - Untuk preview foto yang sudah pernah diupload: generate signed URL di
     server (Server Component/server action), pola PERSIS seperti
     `supabaseAdmin.storage.from('payment-proofs').createSignedUrl(path, 300)`
     di `admin/(protected)/upgrade/page.tsx` — TTL pendek (300 detik cukup).
     Jangan pernah expose service role key ke client.
4. Server action baru di `dashboard/profil/actions.ts` (file baru, jangan
   campur ke `setting/actions.ts` yang sudah ada): update 6 kolom identitas
   di baris `profiles` milik user yang login (`eq('id', claims.sub)`, sama
   persis pola `simpanProfilAction` yang sudah ada).
5. Tampilkan indikator status "Data identitas lengkap ✓" / "Data identitas
   belum lengkap — lengkapi dulu untuk bisa daftar pelatihan" di section ini,
   pakai util `profil_identitas_lengkap` dari F07.1 langkah 3. Ini baru
   informasi, belum ada logika blokir apa pun di langkah ini (itu F07.4).

## F07.3 — Form pendaftaran batch lengkap (ganti "daftar minat")

Target ganti: `src/app/[locale]/(public)/pelatihan/[slug]/daftar-minat-dialog.tsx`
dan `actions.ts` di folder yang sama (`daftarMinatAction` → insert ke
`batch_leads`). **JANGAN hapus `batch_leads` atau kode lama sampai form baru
ini selesai, diuji, dan saya konfirmasi siap ganti** — kalau perlu, buat
dulu berdampingan (misal file baru `daftar-batch-dialog.tsx`) baru saya
putuskan kapan `DaftarMinatDialog` yang lama dicabut dari halaman.

1. Login WAJIB sebelum bisa mengisi form ini (keputusan yang sudah
   dikonfirmasi sebelumnya — bukan alur gabungan signup+form). Kalau user
   belum login saat klik tombol daftar di halaman publik `pelatihan/[slug]`,
   arahkan ke `/login` dengan redirect balik ke halaman batch ini setelah
   berhasil login (cek pola redirect-after-login yang sudah ada di proyek,
   ikuti pola yang sama, jangan bikin mekanisme baru).
2. Setelah login, tombol daftar pada batch tertentu membuka dialog/form baru
   berisi:
   - Kategori Peserta: radio "Penerbitan RPC Baru" / "Perpanjangan/Renewal
     RPC" (map ke enum `kategori_peserta_rpc`).
   - Darimana mengetahui pelatihan ini: dropdown/radio (opsi bebas tentukan
     sesuai referensi Google Form: Instagram, WhatsApp, Teman, dll +
     "Lainnya"). Simpan ke `sumber_info`.
   - Kode Referral: text, opsional. Simpan ke `kode_referral`.
   - Field identitas (KTP, tempat/tanggal lahir, alamat, foto KTP, pas foto)
     **TIDAK diulang di form ini** — itu sudah diisi permanen di
     `/dashboard/profil` (F07.2). Form ini hanya field yang spesifik per
     pendaftaran (kategori peserta, sumber info, kode referral).
   - Sebelum submit, form ini WAJIB cek status `profil_identitas_lengkap`
     (lihat F07.4 — gate). Kalau belum lengkap, form ini tidak submit,
     lempar ke alur F07.4.
3. Server action baru (misal `daftarBatchAction` di file actions baru,
   jangan timpa `daftarMinatAction` lama): insert ke `batch_registrations`
   dengan `batch_id`, `user_id` (dari sesi login, bukan dari input client),
   `kategori_peserta`, `sumber_info`, `kode_referral`. `status` default
   `menunggu_verifikasi` (biarkan default database, tidak perlu di-set
   eksplisit dari kode).
   - Tangani constraint `uq_batch_user_aktif` (unique batch_id+user_id) —
     kalau user sudah pernah daftar batch yang sama dan masih
     menunggu/disetujui, tampilkan pesan yang jelas ("Kamu sudah terdaftar
     di batch ini"), bukan error mentah dari database.
4. Setelah submit berhasil: tampilkan konfirmasi sukses (pola mirip dialog
   lama — sukses + info langkah selanjutnya). Karena verifikasi sekarang
   manual oleh Admin (F07.5), pesan sukses cukup menjelaskan "pendaftaran
   diterima, menunggu verifikasi Admin" — tidak perlu tombol WhatsApp
   otomatis seperti alur lama (opsional: boleh tetap disediakan link
   WhatsApp Admin sebagai kontak cepat kalau ada pertanyaan, tapi bukan
   bagian wajib alur).

## F07.4 — Gate "data belum lengkap"

1. Saat user mengklik tombol daftar pada batch (pengganti tombol
   `DaftarMinatDialog`) dan `profil_identitas_lengkap` mengembalikan
   `false`, JANGAN buka form pendaftaran batch (F07.3). Sebagai gantinya
   tampilkan dialog/alert yang menjelaskan data identitas belum lengkap,
   dengan tombol yang mengarahkan ke `/dashboard/profil` (section identitas
   dari F07.2) untuk melengkapi dulu.
2. Setelah user melengkapi data di `/dashboard/profil` dan kembali ke
   halaman batch, form pendaftaran (F07.3) baru bisa dibuka normal — tidak
   perlu mekanisme redirect-balik otomatis yang rumit, cukup pastikan
   pengecekan `profil_identitas_lengkap` dipanggil ulang tiap kali dialog
   pendaftaran akan dibuka (server-side, bukan di-cache di client).
3. Validasi ini WAJIB dicek ulang juga di server action `daftarBatchAction`
   (F07.3 langkah 3) sebagai pertahanan kedua — jangan hanya andalkan gate
   di client/UI, karena action bisa dipanggil langsung.

## F07.5 — Panel Admin: verifikasi pendaftaran batch

Pola rujukan: `src/app/admin/(protected)/upgrade/page.tsx` (antrean
verifikasi pembayaran) — ikuti struktur yang sama persis: query antrean,
join manual ke `profiles` untuk nama (karena `user_id` menunjuk
`auth.users`, tidak bisa di-embed lewat relasi Supabase otomatis), signed
URL untuk dokumen privat.

1. Buat route baru di admin, misal
   `src/app/admin/(protected)/pendaftaran-batch/page.tsx` (sejajar dengan
   `upgrade/`, `produk/`, `konten/` yang sudah ada — ikuti struktur folder
   yang sama). Tambahkan item menu baru di `admin-shell.tsx` (cek dulu di
   mana daftar menu admin didefinisikan, tambahkan konsisten dengan item
   menu lain yang sudah ada, ikon dari `lucide-react` yang relevan).
2. `requireAdmin()` dipanggil eksplisit di page ini (bukan cuma andalkan
   layout), sama seperti catatan di `upgrade/page.tsx`.
3. Query `batch_registrations` dengan status `menunggu_verifikasi`, join
   manual ke `profiles` (ambil `nama_lengkap`, `nomor_ktp`, `tempat_lahir`,
   `tanggal_lahir`, `alamat_lengkap`, `whatsapp` — semua field identitas
   yang dibutuhkan Admin untuk verifikasi) dan ke `batches` (judul batch).
4. Untuk `foto_ktp_url`/`pas_foto_url`: generate signed URL server-side
   dengan `createAdminClient()`, TTL pendek (300 detik), pola identik
   `admin/upgrade/page.tsx` langkah signed URL. Tampilkan sebagai gambar
   yang bisa diklik/diperbesar (lightbox sederhana — cek apakah proyek
   sudah punya pola ini, misal untuk preview gambar konten/produk di admin;
   reuse kalau ada).
5. Tabel/daftar pendaftaran menunggu verifikasi menampilkan: nama peserta,
   batch yang didaftar, kategori peserta, tanggal daftar, tombol untuk buka
   detail (semua field identitas + preview KTP/pas foto).
6. Aksi Admin: "Setujui" dan "Tolak" (dengan field `alasan_tolak` wajib diisi
   kalau Tolak). Server action update `batch_registrations`: set `status`,
   `verified_by` (id admin yang login), `verified_at` (`now()`), dan
   `alasan_tolak` kalau ditolak.
   - Reuse pola `DataTable` generik (TanStack Table) yang sudah dipakai di
     seluruh tabel admin Gelombang 1 (Batch, Sertifikat, Upgrade, dst) kalau
     cocok untuk tampilan daftar ini — jangan bikin komponen tabel baru dari
     nol kalau `DataTable` generik bisa dipakai.
7. (Opsional, tanyakan ke saya dulu sebelum dikerjakan kalau ragu) Tab/filter
   kedua untuk melihat riwayat pendaftaran yang sudah diverifikasi
   (disetujui/ditolak) — bukan wajib di iterasi pertama, boleh menyusul
   kalau Alif minta setelah melihat versi dasar.

---

## Batasan tegas untuk seluruh Sprint 6 ini

- Field foto KTP/pas foto WAJIB lewat bucket privat + signed URL, tidak
  pernah URL publik langsung — konsekuensi ADR-020, bukan opsional.
- `batch_leads` dan alur "daftar minat" lama TIDAK dihapus sampai saya
  konfirmasi form baru (F07.3) sudah diuji dan siap menggantikan — data
  lama tetap dipertahankan sebagai riwayat (lihat catatan di SQL Bagian 3).
  Baris F01.6 di `feature-registry.md` yang sudah DONE juga TIDAK diubah.
  `daftar-minat-dialog.tsx` lama dicabut dari halaman publik HANYA setelah
  saya beri instruksi eksplisit, bukan otomatis begitu form baru selesai.
- Ini BUKAN sistem manajemen kelas/LMS/absensi — jangan tambah fitur
  progres peserta, jadwal sesi otomatis, atau apa pun di luar 5 baris
  F07.1–F07.5 di atas, sesuai batasan yang sudah ditulis di PRD.md Bagian
  9b.5.
- Jangan tambah dependency baru (termasuk untuk date picker/komponen upload)
  tanpa bertanya dulu — cek dulu apakah komponen yang sudah terpasang bisa
  dipakai.
- Light theme saja, mobile-first di semua halaman baru (publik maupun
  admin), ikuti token warna & spacing yang sudah ada, jangan pakai gaya di
  luar sistem token proyek.
- RLS `profiles`/`batch_registrations` tidak boleh subquery ke tabel dirinya
  sendiri untuk cek role admin — RLS sudah dibuat pakai `is_admin()` di SQL,
  jangan diubah.

## Laporan yang saya butuhkan di SETIAP bagian (F07.1 s/d F07.5)

1. Konfirmasi tsc/lint/build hijau untuk bagian itu.
2. Screenshot 375px (mobile) dan desktop untuk setiap halaman/komponen baru
   atau berubah di bagian itu.
3. Daftar file baru/diubah di bagian itu.
4. Untuk F07.1: tempel potongan tipe `batch_registrations` dan kolom baru
   `profiles` hasil regenerate sebagai bukti.

Saya uji sendiri di browser sesuai Definition of Done (`PRD.md` Bagian 14)
untuk tiap bagian sebelum bagian berikutnya dikerjakan. Status F07.1–F07.5 di
`feature-registry.md` baru saya update ke DONE satu per satu setelah saya
konfirmasi sendiri di browser — bukan otomatis dari laporan Cursor, dan bukan
sekaligus lima baris di akhir.
