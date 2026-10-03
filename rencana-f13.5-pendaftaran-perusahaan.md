# Rencana F13.5 — Pendaftaran Perusahaan/Komunitas

Fase diskusi, belum ada kode/SQL ditulis. Berdasarkan investigasi kode (bukan
asumsi) + 3 keputusan yang sudah dikonfirmasi: PIC tanpa login, kolom Excel
(Nama, WhatsApp, Email per peserta), nominal satu angka total.

## Kondisi project yang relevan (dikonfirmasi baca kode)

- `batch_registrations` (individu) sudah membolehkan `user_id` kosong — berarti
  "daftar tanpa akun" sudah pola yang dipakai di project ini, bukan hal baru.
- Parsing Excel/CSV generik SUDAH ADA di `src/lib/import/spreadsheet.ts`,
  dipakai bersama oleh impor soal kuis dan impor sertifikat — tinggal
  didefinisikan kolom wajib baru untuk peserta, tidak perlu library tambahan.
- Notifikasi email ke Admin SUDAH ADA sistemnya: `kirimEmailLeadBaru()`
  (`src/lib/email/send.ts`), parameter `jenis` sekarang `'minat_batch' |
  'penawaran'` — tinggal ditambah `'pendaftaran_perusahaan'`.
- Klik-to-chat WA (`getWhatsappAdmin()`) konsisten dipakai di seluruh sistem,
  tidak ada WA Business API — pendaftaran perusahaan ikut pola yang sama.
- Penerbitan sertifikat untuk peserta batch (individu MAUPUN nanti grup)
  ternyata sudah lewat jalur terpisah: **Admin > Sertifikat > Impor** (bulk
  input nama+nomor sertifikat manual setelah pelatihan selesai), BUKAN
  otomatis dari `batch_registrations`. Jadi `company_registration_participants`
  **tidak perlu** terhubung otomatis ke penerbitan sertifikat — Admin tetap
  pakai alur impor sertifikat yang sudah ada, siapa pun jalur pendaftarannya.
  Ini menyederhanakan skema (tidak perlu migrasi data peserta grup ke
  `batch_registrations`).
- Storage bucket di project ini dipisah per kebutuhan (`payment-proofs`,
  `identity-documents`, `materials`, `products`, `content`) — bukan satu
  bucket umum. File Excel peserta akan dapat bucket baru sendiri, PRIVAT
  (pola sama `payment-proofs`, akses lewat signed URL khusus Admin).
- Tempat tombol "Daftar sebagai Perusahaan/Komunitas" paling pas di halaman
  **`/pelatihan/[slug]`** (detail pelatihan), berdampingan dengan tombol
  "Daftar Individu" yang sudah ada (`daftar-batch-dialog.tsx`) — sesuai
  permintaan awal Abi ("menu latihan detail"). Karena halaman ini sudah tahu
  `batch_id`-nya, form BARU TIDAK PERLU dropdown pilih batch lagi (beda dari
  rencana awal yang masih menyebut field itu).

## Skema SQL yang diusulkan (akan ditulis lengkap sebagai file usulan terpisah, Alif jalankan manual)

**Tabel baru 1 — `company_registrations`**
nama_pic, whatsapp_pic, email_pic, nama_perusahaan, batch_id (FK `batches`),
jumlah_peserta (angka, diisi otomatis dari hasil parse Excel saat submit — bukan
input manual terpisah, supaya tidak ada dua sumber kebenaran yang bisa beda),
file_excel_url (path storage, bucket baru `company-registrations`), nominal
(nullable, diisi Admin setelah nego — SATU angka total, bukan per peserta),
status (reuse enum `status_registrasi_batch` yang sudah ada —
menunggu_verifikasi/disetujui/ditolak, TIDAK bikin enum baru), alasan_tolak
(nullable), catatan_admin (nullable), created_at, updated_at.

**Tabel baru 2 — `company_registration_participants`**
registration_id (FK `company_registrations`, cascade delete), nama, whatsapp,
email, created_at. Satu baris = satu peserta dari hasil parse Excel.

**RLS**: nol akses anon untuk KEDUA tabel (pola sama `quote_requests`/
`merchandise_public_orders`) — insert wajib lewat server action dengan service
role, karena PIC tidak login. Admin full akses lewat `profiles.role = 'admin'`.

**Storage**: bucket baru `company-registrations` (privat). Upload file Excel
dilakukan DI SERVER ACTION (pakai service role), bukan upload langsung dari
browser ke storage — supaya tidak perlu bikin policy storage untuk anon sama
sekali, lebih aman.

## Alur form publik (halaman baru, bukan dialog — kompleksitasnya lebih besar dari dialog individu)

Rute: `/pelatihan/[slug]/daftar-perusahaan` (atau sejenis — detail nama rute
dikonfirmasi saat prompt ditulis). Isi form:

1. Field teks: Nama PIC, WhatsApp PIC, Email PIC, Nama Perusahaan/Komunitas/
   Instansi, catatan opsional. (Batch sudah otomatis dari halaman asal.)
2. Tombol **"Unduh Template Excel"** — dibuat LANGSUNG di browser (client-side,
   pakai library `xlsx` yang sudah terpasang, `XLSX.utils.book_new()` +
   header kolom "Nama Lengkap", "WhatsApp", "Email" + satu baris contoh),
   TIDAK pindah halaman/tab, form yang sedang diisi tidak hilang — sesuai
   keputusan sebelumnya.
3. Upload Excel yang sudah diisi (`FileUploadField`, accept `.xlsx,.xls,.csv`).
4. Submit → server parse pakai `src/lib/import/spreadsheet.ts` dengan kolom
   wajib Nama Lengkap, WhatsApp, Email. **Validasi all-or-nothing**: kalau ADA
   baris gagal (misal nama kosong), submit DITOLAK SELURUHNYA dan ditampilkan
   daftar baris+alasan error untuk diperbaiki PIC — BEDA dari pola impor soal
   kuis (yang boleh sebagian gagal) karena ini pendaftaran resmi, tidak boleh
   ada peserta "hilang" tanpa sepengetahuan PIC.
5. Submit sukses → simpan `company_registrations` (status menunggu_verifikasi)
   + bulk insert `company_registration_participants` + kirim email notifikasi
   Admin (`kirimEmailLeadBaru` jenis baru) → tampilkan state sukses dengan
   tombol "Konfirmasi via WhatsApp" (klik-to-chat ke `getWhatsappAdmin()`,
   pesan pre-filled: nama perusahaan, jumlah peserta, batch yang dituju).

## Alur Admin (menu baru)

- Menu baru "Pendaftaran Perusahaan" (saran: di bawah section Batch/Pelatihan
  yang sudah ada di sidebar, biar dekat dengan Pendaftaran Batch individu —
  detail lokasi dikonfirmasi saat prompt ditulis).
- Tabel (pola `DataTable` sama seperti tabel admin lain): Nama Perusahaan, PIC,
  WhatsApp, Batch, Jumlah Peserta, Status, Nominal, Tanggal. Termasuk tombol
  Export Excel (pola sama `leads/penawaran-export.ts`) — saya tambahkan
  sekalian karena polanya sudah ada dan murah untuk diterapkan, tidak perlu
  diminta terpisah lagi nanti.
- Klik baris → detail: daftar nama peserta (dari
  `company_registration_participants`), link unduh file Excel asli yang
  diupload (signed URL), form ubah status + isi nominal + catatan Admin.

## Yang TIDAK disentuh (supaya tidak ada regresi)

- Alur pendaftaran batch INDIVIDU (`batch_registrations`,
  `daftar-batch-dialog.tsx`) sama sekali tidak diubah — fitur ini sepenuhnya
  paralel/baru.
- Tidak ada perubahan ke penerbitan sertifikat (`Admin > Sertifikat > Impor`
  tetap jalur satu-satunya, dipakai untuk peserta grup juga).

## Pertanyaan yang masih perlu dikonfirmasi sebelum saya tulis SQL+prompt final

Saya cek dulu beberapa hal teknis kecil (nama bucket storage, lokasi menu
Admin persis) langsung ke Cursor lewat instruksi "cek dulu, laporkan kalau
beda" — tidak perlu nanya kamu untuk hal teknis murni. Yang perlu persetujuanmu
cuma: **apakah rencana skema & alur di atas sudah sesuai untuk dieksekusi?**
Kalau ya, saya lanjut tulis SQL usulan + prompt Cursor (kemungkinan dipecah 2
prompt: skema+form publik dulu, lalu menu Admin — mengikuti pola Grup yang
sudah terbukti efektif di F13.4).
