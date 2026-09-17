# Prompt Cursor — F07.1 + F07.2: Perluasan `profiles` + Halaman Pengaturan Identitas

## Konteks (baca dulu sebelum eksekusi)

Ini LANJUTAN dari Modul 7 (Pendaftaran Pelatihan Lengkap RPC), bukan fitur baru
yang berdiri sendiri. Dokumen resmi sudah ditulis dan jadi rujukan wajib:

- `PRD.md` Bagian 5.1c (skema tabel/kolom baru) dan Bagian 9b — MODUL 7 (tujuan,
  cerita pengguna, daftar fitur F07.1–F07.5, alur, batasan).
- `ENGINEERING.md` ADR-020 (keputusan: field identitas permanen di `profiles`,
  tabel baru `batch_registrations`, bucket privat `identity-documents`).
- `feature-registry.md` Sprint 6 (F07.1–F07.5, semua status TODO).

**SQL untuk ADR-020 (`usulan-sql-pendaftaran-lengkap.sql` Bagian 1–5) SUDAH
dijalankan manual oleh Alif di Supabase dan dikonfirmasi berhasil.** Skema di
bawah ini SUDAH ADA di database live:

- `profiles` punya 6 kolom baru: `nomor_ktp`, `tempat_lahir`, `tanggal_lahir`,
  `alamat_lengkap`, `foto_ktp_url`, `pas_foto_url`.
- Fungsi `public.profil_identitas_lengkap(p_user_id uuid) returns boolean`.
- Enum `public.kategori_peserta_rpc`, `public.status_registrasi_batch`.
- Tabel `public.batch_registrations` (lengkap dengan RLS).
- Bucket privat `identity-documents` (dengan policy storage).

**PENTING — `src/types/database.ts` BELUM di-regenerate**, jadi masih tidak
mengenal skema baru di atas (dicek: tidak ada `batch_registrations`,
`nomor_ktp`, dst di file itu). Langkah pertama WAJIB: jalankan generator tipe
Supabase (`supabase gen types typescript ...` — pakai command persis yang
sudah dipakai proyek ini di `package.json`/dokumentasi, jangan tulis ulang
manual) SEBELUM menulis kode apa pun yang menyentuh kolom/tabel baru. Kalau
command generator butuh kredensial yang tidak tersedia di lingkungan Cursor,
STOP dan laporkan ke saya — jangan menulis tipe manual sebagai pengganti hasil
generator (rawan drift dari skema asli).

Cakupan prompt ini HANYA **F07.1** (fondasi tipe + util validasi identitas)
dan **F07.2** (halaman Pengaturan User untuk melengkapi data identitas +
upload dokumen). **F07.3 (form pendaftaran batch), F07.4 (gate data belum
lengkap), F07.5 (panel admin verifikasi) BELUM dikerjakan di prompt ini** —
menyusul di prompt terpisah setelah F07.1/F07.2 ini selesai, diuji, dan
disetujui. Jangan kerjakan bagian F07.3–F07.5 sekarang meskipun terlihat
terkait.

Ikuti aturan baku proyek ini (`CLAUDE.md` / `PRD.md` Bagian 13): jangan
menambah tabel/kolom di luar yang sudah didokumentasikan, jangan menjalankan
DDL apa pun sendiri (skema sudah ada, tidak perlu SQL baru di langkah ini),
jangan menambah dependency baru tanpa izin eksplisit, jangan sentuh API
spesifik Vercel, RLS pada `profiles` tidak boleh subquery ke `profiles`
sendiri (pakai `is_admin()` kalau perlu cek role). Kerjakan satu langkah,
laporkan hasil (tsc/lint/build + screenshot mobile 375px), tunggu saya
konfirmasi sebelum lanjut ke prompt F07.3 berikutnya.

## F07.1 — Fondasi tipe + validasi identitas

1. Regenerate `src/types/database.ts` (lihat catatan di atas). Verifikasi
   `batch_registrations`, `profiles.nomor_ktp` dkk, dan kedua enum baru sudah
   muncul di file hasil generate.
2. Buat skema validasi Zod baru `src/lib/validations/identitas-profil.ts`
   (ikuti pola file validasi lain di folder yang sama, misal
   `pengaturan-admin.ts`/`upgrade.ts` — cek konvensi pesan error Bahasa
   Indonesia yang sudah dipakai di situ, jangan bikin gaya baru):
   - `nomor_ktp`: string, wajib 16 digit angka (NIK Indonesia standar).
   - `tempat_lahir`: string, wajib diisi.
   - `tanggal_lahir`: date, wajib diisi, tidak boleh di masa depan.
   - `alamat_lengkap`: string, wajib diisi, minimal panjang wajar (misal 10
     karakter) supaya bukan input asal.
   - Untuk file upload (`foto_ktp_url`, `pas_foto_url`): validasi terpisah di
     level komponen upload (tipe file image, ukuran maksimal — tentukan batas
     wajar misal 5MB, cek pola validasi upload yang sudah ada di proyek ini
     kalau ada, misal untuk `bukti_url` di form upgrade, biar konsisten).
3. Buat util server-side kecil (misal `src/lib/identitas.ts` atau taruh di
   tempat yang konsisten dengan struktur `src/lib` yang sudah ada) yang
   memanggil RPC `profil_identitas_lengkap(p_user_id)` — dipakai nanti oleh
   F07.4 (gate) dan F07.2 (menampilkan status lengkap/belum di halaman
   Pengaturan). Jangan duplikasi logika "cek 6 field" secara manual di
   TypeScript — pakai fungsi database yang sudah ada.

## F07.2 — Halaman Pengaturan: lengkapi data identitas

1. Buat route baru di dalam route group `(user)` yang sudah ada (sejajar
   dengan `dashboard/upgrade`, `dashboard/merchandise` — ikuti pola URL dan
   struktur folder yang sama persis), misal
   `src/app/[locale]/(user)/dashboard/pengaturan/page.tsx`. Sesuaikan nama
   segment URL dengan konvensi i18n proyek ini (cek apakah folder lain pakai
   nama Indonesia langsung seperti `upgrade`/`merchandise` atau ada mapping
   locale terpisah — ikuti pola yang sudah ada, jangan menebak).
2. Tambahkan link ke halaman ini di navigasi dashboard user (`DashboardUserShell`
   atau komponen shell yang setara — cek dulu di mana daftar menu dashboard
   didefinisikan, tambahkan item baru "Pengaturan" / "Data Diri" konsisten
   dengan label dan ikon menu lain yang sudah ada).
3. Halaman ini menampilkan form untuk mengisi/mengubah field identitas:
   Nomor KTP, Tempat Lahir, Tanggal Lahir, Alamat Lengkap, upload Foto KTP,
   upload Pas Foto. Prefill dari `profiles` kalau sudah pernah diisi.
   - Reuse komponen form (`Input`, `Label`, `Alert`) dan pola `react-hook-form`
     + `zodResolver` seperti di `daftar-minat-dialog.tsx` — jangan bikin pola
     form baru.
   - Untuk kedua upload foto: cek dulu apakah proyek ini sudah punya komponen
     upload reusable (misal dipakai di form bukti pembayaran upgrade) — kalau
     ada, reuse; kalau belum ada, buat komponen upload sederhana yang upload
     ke bucket privat `identity-documents` dengan path `${userId}/ktp.<ext>`
     dan `${userId}/pas-foto.<ext>` (path harus diawali `userId` sesuai policy
     storage yang sudah dibuat — cek ulang policy di
     `usulan-sql-pendaftaran-lengkap.sql` Bagian 5 kalau perlu).
   - Setelah upload berhasil, simpan PATH (bukan URL publik) ke kolom
     `foto_ktp_url`/`pas_foto_url` — ini bucket privat, jangan pernah
     generate/simpan URL publik.
   - Untuk MENAMPILKAN preview foto yang sudah diupload di halaman ini
     (kalau user buka lagi setelah pernah isi), generate signed URL di
     server (server action atau Server Component), pola persis seperti
     `supabaseAdmin.storage.from('payment-proofs').createSignedUrl(path, 300)`
     di `admin/(protected)/upgrade/page.tsx` — TTL pendek (300 detik cukup),
     jangan expose service role key ke client.
4. Server action untuk submit form: update baris `profiles` milik user yang
   sedang login (`user_id = auth.uid()` — RLS sudah menangani ini, tapi tetap
   filter eksplisit di query by `claims.sub`/`user.id` seperti pola yang
   sudah ada di action lain).
5. Tampilkan indikator status "data identitas lengkap / belum lengkap" di
   halaman ini (panggil util `profil_identitas_lengkap` dari F07.1 langkah 3).
   Ini murni informasi untuk user sekarang — belum ada logika gate di prompt
   ini (itu F07.4, menyusul).
6. Pastikan halaman ini hanya bisa diakses setelah login (route sudah di
   dalam `(user)` group yang sudah pakai `requireUser()` di layout-nya —
   verifikasi saja, jangan tambah guard baru yang redundan).

## Batasan tegas untuk prompt ini

- JANGAN sentuh `daftar-minat-dialog.tsx` / `actions.ts` di
  `pelatihan/[slug]/` — itu bagian F07.3, belum dikerjakan sekarang.
  `batch_leads` dan alur "daftar minat" lama TETAP jalan seperti biasa sampai
  F07.3 selesai dan saya konfirmasi siap ganti.
- JANGAN buat halaman/panel admin apa pun untuk `batch_registrations` — itu
  F07.5, belum dikerjakan sekarang.
- JANGAN tambah dependency baru (termasuk untuk komponen upload file) tanpa
  bertanya dulu — cek dulu apakah `shadcn`/Base UI yang sudah terpasang bisa
  dipakai untuk file input sederhana.
- Field foto KTP/pas foto WAJIB lewat bucket privat + signed URL, tidak
  pernah URL publik langsung — ini bukan opsional, ini konsekuensi ADR-020.
- Light theme saja, mobile-first, ikuti token warna & spacing yang sudah ada
  di dashboard user (jangan pakai warna/gaya dari luar sistem token proyek).

## Yang saya butuhkan sebagai laporan

1. Konfirmasi `src/types/database.ts` sudah ter-regenerate dan mengenali
   skema baru (tempel potongan tipe `batch_registrations` dan kolom baru
   `profiles` sebagai bukti).
2. Hasil `tsc` / lint / build — harus hijau.
3. Screenshot halaman Pengaturan di 375px (mobile) dan desktop, kondisi
   kosong (belum pernah isi) dan kondisi terisi (preview foto muncul lewat
   signed URL).
4. Daftar file baru/diubah.

Setelah ini saya cek dan uji sendiri di browser sesuai Definition of Done
(`PRD.md` Bagian 14) — status F07.1/F07.2 di `feature-registry.md` baru saya
update ke DONE setelah saya konfirmasi sendiri, bukan otomatis dari laporan
Cursor. Setelah disetujui, saya siapkan prompt lanjutan untuk F07.3 (form
pendaftaran batch menggantikan "daftar minat") + F07.4 (gate).
