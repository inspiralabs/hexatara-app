# Prompt Cursor — Sprint 6 / Modul 7 REVISI (ADR-020r): F07.1–F07.5, Login TIDAK Wajib

> **Prompt ini MENGGANTIKAN dua prompt sebelumnya**
> (`cursor-prompt-f07.1-f07.2-identitas-pengaturan.md` dan
> `cursor-prompt-sprint6-f07.1-f07.5-lengkap.md`) — keduanya berasumsi wajib
> login dulu sebelum bisa daftar batch. Asumsi itu SUDAH DIBATALKAN (lihat
> ADR-020r). Kalau Cursor sudah sempat mengerjakan sebagian dari prompt lama
> berdasarkan asumsi wajib-login, laporkan dulu ke saya sebelum lanjut —
> jangan asumsikan kode lama otomatis kompatibel.

## Konteks wajib dibaca dulu

Dokumen resmi rujukan:

- `PRD.md` Bagian 5.1c (skema tabel/kolom, sudah direvisi) dan Bagian 9b —
  MODUL 7 (tujuan, cerita pengguna, daftar fitur F07.1–F07.5, alur 4 cabang,
  batasan — SUDAH DIREVISI ADR-020r, baca versi TERBARU, jangan pakai
  ingatan dari sesi sebelumnya).
- `ENGINEERING.md` ADR-020 (keputusan awal) DAN **ADR-020r** (revisi yang
  berlaku — login tidak wajib, `batch_registrations` mandiri).
- `feature-registry.md` Sprint 6 (F07.1–F07.5, status TODO, deskripsi sudah
  direvisi mengikuti ADR-020r).

**SQL berikut SUDAH dijalankan manual oleh Alif di Supabase dan dikonfirmasi
berhasil, urut sesuai kapan ditulis:**

1. `usulan-sql-pendaftaran-lengkap.sql` (Bagian 1–5, ADR-020 awal): 6 kolom
   identitas di `profiles`, fungsi `profil_identitas_lengkap()`, enum
   `kategori_peserta_rpc`/`status_registrasi_batch`, tabel
   `batch_registrations` (waktu itu `user_id NOT NULL`), RLS awal, bucket
   privat `identity-documents`.
2. `usulan-sql-pendaftaran-tanpa-akun-adr020r.sql` (ADR-020r, migrasi ALTER
   tambahan): `batch_registrations.user_id` diubah jadi **nullable**, 9
   kolom identitas mandiri ditambahkan ke `batch_registrations` sendiri
   (`nama_lengkap`, `email`, `whatsapp`, `nomor_ktp`, `tempat_lahir`,
   `tanggal_lahir`, `alamat_lengkap`, `foto_ktp_url`, `pas_foto_url`),
   constraint `chk_email_wajib_jika_anon`, policy RLS INSERT baru untuk
   peran `anon` di `batch_registrations` DAN di `storage.objects` (prefix
   path `registrasi/`).

Skema live SEKARANG (setelah kedua SQL di atas):

- `profiles`: 6 kolom identitas (dipakai untuk reuse/prefill pendaftar
  login).
- `batch_registrations`: `user_id` nullable, PLUS 9 kolom identitas mandiri
  sendiri (snapshot per-pendaftaran, tidak bergantung `profiles`), kolom
  lama (`kategori_peserta`, `sumber_info`, `kode_referral`, `status`, dst)
  tidak berubah.
- Bucket `identity-documents`: dua skema path — `${userId}/...` (pendaftar
  login) dan `registrasi/<id batch_registrations>/...` (pendaftar tanpa
  akun).

**`src/types/database.ts` PERLU di-regenerate ulang** (kalau sudah pernah
di-regenerate untuk SQL nomor 1 di atas, regenerate LAGI supaya kolom-kolom
baru dari SQL nomor 2 ikut masuk). Ini WAJIB jadi langkah pertama sebelum
kode apa pun ditulis/direvisi. Kalau command generator butuh kredensial yang
tidak tersedia di lingkungan Cursor, STOP dan laporkan — jangan menulis tipe
manual sebagai pengganti.

Aturan baku proyek ini tetap berlaku penuh (`CLAUDE.md` / `PRD.md` Bagian
13): jangan menambah tabel/kolom di luar yang sudah didokumentasikan (skema
sudah lengkap, tidak ada DDL baru di langkah manapun di bawah), jangan
menjalankan DDL apa pun sendiri, jangan menambah dependency baru tanpa izin
eksplisit, jangan sentuh API spesifik Vercel, RLS tidak boleh subquery ke
tabel dirinya sendiri untuk cek role (pakai `is_admin()`). Kode referral
tetap teks bebas TANPA validasi/reward otomatis — jangan bangun sistem
referral resmi, itu di luar scope Sprint 6 ini.

## Cara mengerjakan — tetap bertahap

Satu bagian per giliran, laporkan hasil, tunggu konfirmasi sebelum lanjut —
pola yang sudah dipakai di proyek ini. Urutan wajib: **F07.1 → F07.2 →
F07.3 → F07.4 → F07.5** (masing-masing bergantung bagian sebelumnya).

---

## F07.1 — Fondasi tipe + validasi identitas

1. Regenerate `src/types/database.ts`. Verifikasi `batch_registrations`
   punya `user_id` nullable dan 9 kolom identitas baru, `profiles` punya 6
   kolom identitas — semua harus muncul di hasil generate.
2. Buat skema validasi Zod baru `src/lib/validations/identitas-profil.ts`
   (ikuti pola & gaya pesan error Bahasa Indonesia di
   `src/lib/validations/profil.ts`/`pengaturan-admin.ts`):
   - `nomor_ktp`: string, wajib 16 digit angka.
   - `tempat_lahir`: string, wajib diisi.
   - `tanggal_lahir`: date, wajib diisi, tidak boleh di masa depan.
   - `alamat_lengkap`: string, wajib diisi, minimal panjang wajar (misal 10
     karakter).
   - Field upload (`foto_ktp_url`, `pas_foto_url`): validasi tipe file
     image + ukuran maksimal (misal 5MB) di level komponen upload, bukan
     field text Zod ini.
3. Buat skema validasi TERPISAH `src/lib/validations/pendaftaran-batch.ts`
   untuk form pendaftaran (F07.3) — field yang sama dengan #2 di atas
   DITAMBAH `nama_lengkap`, `email` (format email valid, wajib), `whatsapp`
   (wajib, minimal 8 digit — sama pola `BatchLeadFormSchema` yang sudah
   ada), `kategori_peserta` (enum `'penerbitan_baru' | 'perpanjangan_renewal'`),
   `sumber_info` (opsional), `kode_referral` (opsional, teks bebas).
   Skema ini dipakai baik oleh pendaftar login maupun tanpa akun — sama
   persis, tidak ada dua versi form berbeda.
4. Buat util server-side `src/lib/identitas.ts`: fungsi yang memanggil RPC
   `profil_identitas_lengkap(p_user_id)` — dipakai F07.2 (indikator status)
   dan F07.4 (card pengingat). Jangan duplikasi logika cek-6-field manual di
   TypeScript.

## F07.2 — Section lengkapi data identitas di halaman Profil

Proyek ini SUDAH punya `/dashboard/setting` (WhatsApp+password) dan
`/dashboard/profil` (nama tampilan) — field identitas RPC ditambahkan
sebagai **section baru di `/dashboard/profil`** yang sudah ada
(`src/app/[locale]/(user)/dashboard/profil/page.tsx`), bukan route baru.

1. Tambahkan `<section>` kedua di `profil/page.tsx` (pola card yang sama
   persis dengan section Email yang sudah ada:
   `max-w-md rounded-xl border border-border bg-card p-5`), judul misalnya
   "Data Identitas (untuk Sertifikasi RPC)". Query tambahan: 6 kolom
   identitas dari `profiles` untuk user login.
2. Komponen form baru `identitas-form.tsx` di folder yang sama, pola persis
   `ProfilForm` (`react-hook-form` + `zodResolver(IdentitasProfilSchema)`
   dari F07.1). Field: Nomor KTP, Tempat Lahir, Tanggal Lahir (cek dulu
   apakah proyek punya komponen date picker yang bisa direuse, misal dari
   form Batch admin), Alamat Lengkap (textarea). Prefill dari data yang
   sudah diquery.
3. Komponen upload Foto KTP dan Pas Foto:
   - Cek dulu komponen upload reusable yang sudah ada (dipakai form bukti
     pembayaran upgrade) — reuse kalau ada.
   - Upload ke bucket `identity-documents`, path `${userId}/ktp.<ext>` dan
     `${userId}/pas-foto.<ext>` (WAJIB diawali `userId` sesuai policy user
     login yang sudah ada sejak SQL nomor 1).
   - Simpan PATH (bukan URL publik) ke `foto_ktp_url`/`pas_foto_url` di
     `profiles`.
   - Preview foto yang sudah pernah diupload: signed URL server-side
     (`createSignedUrl(path, 300)`), pola identik
     `admin/(protected)/upgrade/page.tsx`.
4. Server action baru `dashboard/profil/actions.ts` (file baru, jangan
   campur `setting/actions.ts`): update 6 kolom identitas di `profiles`
   milik user login.
5. Indikator status "Data identitas lengkap ✓" / "belum lengkap" di section
   ini, pakai util F07.1 langkah 4. Murni informasi.

## F07.3 — Form pendaftaran batch (login opsional)

Target ganti: `src/app/[locale]/(public)/pelatihan/[slug]/daftar-minat-dialog.tsx`
dan `actions.ts` (`daftarMinatAction` → `batch_leads`). **JANGAN hapus
`batch_leads`/kode lama sampai saya konfirmasi form baru siap menggantikan**
— buat berdampingan dulu (misal `daftar-batch-dialog.tsx` baru).

1. Tombol "Daftar Sekarang" di halaman batch memicu SALAH SATU dari 3
   perilaku tergantung status sesi:
   - **Tidak ada sesi login sama sekali dan tidak terdeteksi pernah
     login sebelumnya di device ini** → langsung buka dialog form
     pendaftaran lengkap (lihat langkah 2).
   - **Ada sesi login aktif** → langsung buka dialog form pendaftaran,
     PRA-TERISI dari `profiles` kalau `profil_identitas_lengkap` true,
     kosong (isi manual) kalau false — dua-duanya tetap dialog yang SAMA,
     bedanya cuma prefill atau tidak.
   - **Tidak ada sesi login TAPI proyek bisa mendeteksi kemungkinan user
     ini pernah punya akun** (dalam praktiknya: kita TIDAK bisa tahu ini
     tanpa dia bilang sendiri) → tampilkan dulu pilihan eksplisit "Sudah
     punya akun? Login dulu" vs "Daftar tanpa akun sekarang" SEBELUM dialog
     form dibuka. Implementasi paling sederhana: tampilkan pilihan ini
     SELALU saat tidak ada sesi aktif (bukan cuma untuk yang "terdeteksi
     pernah akun", karena deteksi itu sendiri tidak mungkin akurat) — user
     yang menentukan sendiri mana yang berlaku untuknya. Pilihan "Login
     dulu" mengarah ke `/login` dengan redirect balik ke halaman batch ini
     (cek pola redirect-after-login yang sudah ada). Pilihan "Daftar tanpa
     akun" langsung membuka dialog form pendaftaran (langkah 2), kosong.
2. Dialog/form pendaftaran (dipakai baik untuk login maupun tanpa akun,
   SATU komponen, bukan dua versi terpisah) — field sesuai
   `PendaftaranBatchSchema` dari F07.1 langkah 3: Nama Lengkap, Email,
   WhatsApp, Nomor KTP, Tempat Lahir, Tanggal Lahir, Alamat Lengkap, upload
   Foto KTP, upload Pas Foto, Kategori Peserta (radio), Darimana mengetahui
   pelatihan ini (dropdown/radio + "Lainnya"), Kode Referral (opsional).
   - Kalau login & prefill tersedia: field identitas terisi otomatis dari
     `profiles`, tetap bisa diedit manual di form ini kalau user mau
     koreksi (perubahan di form TIDAK otomatis menyimpan balik ke
     `profiles` — itu domain F07.2, form ini cuma pakai datanya).
3. Server action baru `daftarBatchAction` (file baru, jangan timpa
   `daftarMinatAction` lama):
   - Ambil sesi login KALAU ADA (`getOptionalUser()` — cek pola yang sudah
     ada di `lib/auth/guard.ts`, kalau belum ada fungsi ini buat yang setara:
     dapat user tanpa redirect kalau tidak ada sesi, beda dengan
     `requireUser()`).
   - **Alur upload foto — WAJIB dua langkah:**
     1. Insert dulu baris ke `batch_registrations` TANPA path foto (semua
        field lain terisi, `user_id` = id user kalau login / `null` kalau
        tidak, `foto_ktp_url`/`pas_foto_url` = null sementara). Dari sini
        dapat `id` baris.
     2. Upload kedua file: kalau login, path `${userId}/ktp.<ext>` dst
        (bucket sama, policy lama); kalau tanpa akun, path
        `registrasi/<id dari langkah 1>/ktp.<ext>` dan
        `registrasi/<id>/pas-foto.<ext>` (policy anon baru dari SQL nomor
        2 — cek prefix `registrasi/` harus persis).
     3. Update baris `batch_registrations` dari langkah 1 dengan kedua path
        foto.
     - Kalau langkah 2/3 gagal setelah langkah 1 berhasil, tangani dengan
       baik (jangan biarkan baris "menggantung" tanpa foto tanpa
       pemberitahuan — beri pesan error yang jelas, pertimbangkan hapus
       baris kalau upload gagal total supaya tidak ada sampah data,
       putuskan sendiri pendekatan paling aman, laporkan pendekatan yang
       dipilih di laporan hasil).
   - Kalau login: SETELAH insert sukses, salin juga field identitas yang
     dipakai (kalau user isi/edit manual di form ini) balik ke `profiles`
     milik user tsb — supaya pendaftaran berikutnya tetap bisa prefill dari
     data terbaru. Ini best-effort (kalau gagal, jangan gagalkan seluruh
     submit pendaftaran, cukup log error).
   - Tangani constraint `uq_batch_user_aktif` (untuk pendaftar login) dengan
     pesan jelas ("Kamu sudah terdaftar di batch ini"). TIDAK ada
     constraint serupa untuk pendaftar tanpa akun (disengaja, lihat batasan
     di bawah) — duplikat dibiarkan.
4. Setelah submit berhasil: tampilkan konfirmasi sukses langsung dari hasil
   insert (JANGAN query ulang data yang baru diinsert — pendaftar tanpa
   akun tidak punya akses SELECT lewat RLS). Pesan: pendaftaran diterima,
   menunggu verifikasi Admin. Boleh sediakan link WhatsApp Admin sebagai
   kontak, tidak wajib.

## F07.4 — Card pengingat non-blokir di dashboard

1. Di halaman dashboard user (cek halaman utama `/dashboard` yang sudah
   ada), tambahkan card/banner yang MUNCUL HANYA KALAU
   `profil_identitas_lengkap` mengembalikan `false` untuk user yang login.
   Card berisi ajakan singkat melengkapi data identitas + tombol yang
   mengarah ke `/dashboard/profil` (section F07.2).
2. Kalau `profil_identitas_lengkap` true, card ini TIDAK tampil sama sekali
   — bukan disembunyikan lewat CSS, jangan render elemennya di server.
3. **PENTING — ini BUKAN gate.** Card ini murni informasi/pengingat, TIDAK
   memblokir apa pun. F07.3 (form pendaftaran) tetap bisa dibuka dan
   disubmit oleh user login walau card ini masih tampil (profil belum
   lengkap) — user cukup isi manual di form pendaftaran seperti pendaftar
   tanpa akun.

## F07.5 — Panel Admin: verifikasi pendaftaran batch

Pola rujukan: `src/app/admin/(protected)/upgrade/page.tsx`.

1. Route baru `src/app/admin/(protected)/pendaftaran-batch/page.tsx`
   (sejajar `upgrade/`, `produk/`, `konten/`). Tambahkan item menu baru di
   `admin-shell.tsx` konsisten dengan item lain.
2. `requireAdmin()` dipanggil eksplisit di page ini.
3. Query `batch_registrations` status `menunggu_verifikasi`. KARENA
   identitas sekarang sudah mandiri di tabel ini sendiri (kolom
   `nama_lengkap`, `email`, `nomor_ktp`, dst dari SQL nomor 2), **TIDAK
   PERLU join manual ke `profiles` lagi untuk data identitas** — cukup
   select langsung dari `batch_registrations`. Untuk baris yang punya
   `user_id` (pendaftar login), boleh opsional tampilkan juga status akun
   (misal badge "Terdaftar via akun") tapi datanya tetap dari kolom
   `batch_registrations` sendiri, bukan dari join `profiles`. Join ke
   `batches` tetap perlu untuk judul batch.
4. Signed URL untuk `foto_ktp_url`/`pas_foto_url`: `createAdminClient()`,
   TTL 300 detik, pola identik `admin/upgrade/page.tsx`. Path bisa
   `${userId}/...` atau `registrasi/<id>/...` tergantung baris — kode
   generate signed URL tidak perlu peduli bedanya, keduanya path valid di
   bucket yang sama.
5. Tampilkan sebagai gambar yang bisa diperbesar (lightbox — reuse pola
   yang sudah ada kalau tersedia).
6. Tabel/daftar: nama peserta, email, batch, kategori peserta, status akun
   (opsional), tanggal daftar, tombol detail (semua field identitas +
   preview KTP/pas foto).
7. Aksi Admin: "Setujui"/"Tolak" (`alasan_tolak` wajib kalau Tolak). Server
   action update `status`, `verified_by`, `verified_at`, `alasan_tolak`.
   Reuse `DataTable` generik (TanStack Table) kalau cocok.
8. (Opsional, tanya dulu kalau ragu) Tab/filter riwayat pendaftaran yang
   sudah diverifikasi — boleh menyusul, bukan wajib di iterasi pertama.

---

## Batasan tegas untuk seluruh Sprint 6 ini

- Foto KTP/pas foto WAJIB lewat bucket privat + signed URL, tidak pernah
  URL publik — untuk pendaftar login MAUPUN tanpa akun, dua skema path
  berbeda tapi aturan privat ini sama untuk keduanya.
- `batch_leads`/`daftar-minat-dialog.tsx` lama TIDAK dihapus sampai saya
  beri instruksi eksplisit — data lama tetap riwayat, baris F01.6 di
  `feature-registry.md` yang DONE tidak diubah.
- TIDAK ada validasi/pencarian data lama berdasar email untuk pendaftar
  tanpa akun — isi ulang tiap kali disengaja sederhana.
- TIDAK ada pencegahan duplikat otomatis untuk pendaftar tanpa akun —
  dibiarkan, Admin menilai manual.
- Kode referral TETAP teks bebas, TIDAK ada validasi/reward otomatis.
- Bukan LMS/manajemen kelas — jangan tambah fitur di luar 5 baris
  F07.1–F07.5.
- Jangan tambah dependency baru tanpa bertanya dulu.
- Light theme saja, mobile-first di semua halaman baru (publik maupun
  admin).
- RLS tidak boleh subquery ke tabel dirinya sendiri untuk cek role —
  policy sudah dibuat pakai `is_admin()`/kondisi eksplisit, jangan diubah.

## Laporan yang saya butuhkan di SETIAP bagian

1. Konfirmasi tsc/lint/build hijau.
2. Screenshot 375px dan desktop untuk halaman/komponen baru/berubah di
   bagian itu — termasuk KETIGA kondisi F07.3 (tanpa akun, login lengkap,
   login belum lengkap) dan dialog pilihan login/tanpa-akun.
3. Daftar file baru/diubah.
4. Untuk F07.1: potongan tipe hasil regenerate sebagai bukti skema baru
   terbaca.
5. Untuk F07.3: jelaskan pendekatan yang dipilih untuk menangani kegagalan
   upload foto setelah baris registrasi terlanjur dibuat (lihat catatan di
   langkah 3).

Saya uji sendiri di browser sesuai Definition of Done (`PRD.md` Bagian 14)
untuk tiap bagian sebelum bagian berikutnya dikerjakan. Status F07.1–F07.5
di `feature-registry.md` saya update ke DONE satu per satu setelah saya
konfirmasi sendiri — bukan otomatis dari laporan Cursor.
