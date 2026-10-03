# Prompt Cursor — Pendaftaran Perusahaan/Komunitas (3a: Form Publik)

## Konteks

F13.5 (ADR-026, permintaan #1 Abi — paling besar dari 5 permintaan UAT 30 Sep
2026). Rencana lengkap sudah didiskusikan dan disetujui Alif — lihat
`rencana-f13.5-pendaftaran-perusahaan.md` di root project untuk latar belakang
lengkap. Ringkasan keputusan yang SUDAH FINAL (jangan ditanyakan ulang ke
Alif, tapi tetap laporkan kalau kode yang ditemukan beda dari asumsi di sini):

- PIC perusahaan/komunitas/instansi mendaftar **TANPA LOGIN** (form publik),
  sama seperti pendaftaran batch individu yang sudah ada.
- Daftar peserta diunggah lewat **Excel**, kolom wajib: **Nama Lengkap,
  WhatsApp, Email** per peserta.
- **Nominal harga satu angka TOTAL** untuk seluruh grup, diisi Admin manual
  setelah nego WA (TIDAK ada input harga di form publik ini sama sekali).
- Tombol "Daftar sebagai Perusahaan/Komunitas" ada di halaman detail
  pelatihan (`/pelatihan/[slug]`), berdampingan dengan tombol "Daftar
  Individu" (`DaftarBatchDialog`) yang sudah ada — karena `batch_id` sudah
  diketahui dari halaman ini, form BARU TIDAK PERLU dropdown pilih batch.
- Validasi Excel **all-or-nothing**: kalau ada baris gagal, submit DITOLAK
  seluruhnya dengan daftar baris+alasan error, PIC perbaiki dan unggah ulang
  (BEDA dari pola impor soal kuis yang boleh sebagian gagal — ini pendaftaran
  resmi, tidak boleh ada peserta hilang tanpa sepengetahuan PIC).
- Tombol "Unduh Template Excel" dibuat **langsung di browser** (client-side,
  generate file pakai `xlsx`, bukan link ke file statis), supaya form yang
  sedang diisi tidak hilang/pindah tab.

**Di luar cakupan prompt ini (menyusul di 3b)**: menu Admin "Pendaftaran
Perusahaan" (lihat/approve/isi nominal). Jangan kerjakan itu sekarang.

## Langkah wajib sebelum menulis kode

1. Baca `rencana-f13.5-pendaftaran-perusahaan.md`, `PRD.md` Bagian 0,
   `feature-registry.md` (cari F13.5), `ENGINEERING.md` entri ADR-026.
2. Baca ulang file-file berikut untuk pastikan pola yang saya gambarkan masih
   sesuai kondisi kode terbaru — kalau beda, **berhenti dan laporkan**, jangan
   menebak:
   `src/lib/import/spreadsheet.ts`, `src/lib/quiz/import.ts` (contoh pakai
   generic parser), `src/lib/email/send.ts` (`kirimEmailLeadBaru`),
   `src/lib/email/templates.ts` (`templateLeadBaru`), `src/lib/site-settings.ts`
   (`getWhatsappAdmin`), `src/components/file-upload-field.tsx`,
   `src/app/[locale]/(public)/pelatihan/[slug]/page.tsx`,
   `src/app/[locale]/(public)/pelatihan/[slug]/daftar-batch-dialog.tsx` (HANYA
   untuk pola UI/dialog, JANGAN diubah — ini alur individu, terpisah total).
3. Paparkan rencana singkat sebelum menulis kode. Tunggu persetujuan Alif.

## 1. SQL (usulan, JANGAN dieksekusi)

File `usulan-sql-pendaftaran-perusahaan.sql` sudah ada di root project — cek
isinya. Dua tabel baru: `company_registrations` (induk, reuse enum
`status_registrasi_batch`) dan `company_registration_participants` (anak).
RLS nol akses anon. Bucket storage baru `company-registrations` (privat).
**Jangan dijalankan** — Alif yang menjalankan manual, lalu generate ulang
`src/types/database.ts` setelah itu.

## 2. Validasi (`src/lib/validations/company-registration.ts`, file baru)

```ts
export const CompanyRegistrationFormSchema = z.object({
  nama_pic: z.string().min(1, { error: 'Nama PIC wajib diisi' }),
  whatsapp_pic: z.string().min(1, { error: 'WhatsApp PIC wajib diisi' }),
  email_pic: z.string().email({ error: 'Email tidak valid' }),
  nama_perusahaan: z.string().min(1, { error: 'Nama perusahaan/komunitas wajib diisi' }),
  catatan: z.string().optional(),
});

export const PesertaExcelSchema = z.object({
  nama: z.string().min(1),
  whatsapp: z.string().min(1),
  email: z.string().email(),
});
```

Sesuaikan nama/pola dengan konvensi file validations lain di project.

## 3. Kolom wajib Excel (extend `src/lib/import/spreadsheet.ts` kalau perlu, atau definisikan di file baru yang memanggilnya)

Header kolom yang diterima: **Nama Lengkap**, **WhatsApp**, **Email** (cek
pola `KOLOM_WAJIB` di `src/lib/quiz/import.ts`/`src/lib/certificate/import.ts`
untuk tahu bagaimana project ini mencocokkan nama header — case-insensitive,
trim spasi, dst). Buat fungsi baru (mis. `parsePesertaPerusahaan(file)`) yang
memanggil `parseSpreadsheet` generic dari `@/lib/import/spreadsheet` dengan
kolom wajib ini, return baris tervalidasi + daftar baris gagal (format sama
seperti `BarisGagal` yang sudah ada).

## 4. Tombol "Unduh Template Excel" (client-side)

Komponen kecil (bisa inline di form), onClick:

```ts
async function unduhTemplate() {
  const XLSX = await import('xlsx'); // dynamic import, pola sama eksport yang ada
  const ws = XLSX.utils.json_to_sheet([
    { 'Nama Lengkap': 'Contoh: Budi Santoso', WhatsApp: '08123456789', Email: 'budi@contoh.com' },
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Peserta');
  XLSX.writeFile(wb, 'template-peserta-pelatihan.xlsx');
}
```

## 5. Komponen form (`pelatihan/[slug]/daftar-perusahaan-dialog.tsx` atau halaman terpisah — PILIH SALAH SATU)

Karena form ini lebih panjang dari dialog individu (field PIC + unduh
template + upload Excel + laporan error), evaluasi dulu: kalau project ini
punya pola Dialog yang scrollable dan nyaman untuk form panjang (cek
`daftar-batch-dialog.tsx` — formnya juga panjang dengan upload foto KTP, jadi
kemungkinan Dialog tetap cukup), pakai Dialog yang konsisten dengan tombol
"Daftar Individu" di sebelahnya. Kalau dirasa terlalu sempit, buat halaman
terpisah `pelatihan/[slug]/daftar-perusahaan/page.tsx` — SILAKAN PILIH salah
satu berdasarkan hasil cek pola existing, laporkan pilihannya ke saya di
plan.md.

Alur form:
1. Field teks: Nama PIC, WhatsApp PIC, Email PIC, Nama Perusahaan/Komunitas/
   Instansi, catatan (opsional).
2. Tombol "Unduh Template Excel" (langkah 4).
3. `FileUploadField` untuk upload Excel (`accept=".xlsx,.xls,.csv"`).
4. Submit → kalau ada baris gagal dari parsing (langkah 3), tampilkan daftar
   baris+alasan, JANGAN lanjut submit ke server (validasi all-or-nothing).
5. Kalau semua baris valid → panggil server action (langkah 6) → state sukses
   dengan tombol "Konfirmasi via WhatsApp" (link `wa.me` ke
   `getWhatsappAdmin()`, pesan pre-filled: nama perusahaan, jumlah peserta,
   judul batch).

## 6. Server action (`pelatihan/[slug]/daftar-perusahaan-actions.ts`, file baru)

```ts
export async function daftarPerusahaanAction(batchId: unknown, formInput: unknown, file: File) {
  // 1. Validasi batchId + formInput (CompanyRegistrationFormSchema)
  // 2. Parse file Excel (langkah 3) — kalau ada baris gagal, return { ok: false, gagal: [...] }
  // 3. supabaseAdmin (createAdminClient()) upload file Excel ASLI ke bucket
  //    'company-registrations' (path mis. `${batchId}/${timestamp}-${nama file}`)
  // 4. Insert company_registrations (status 'menunggu_verifikasi',
  //    jumlah_peserta = jumlah baris valid, file_excel_url = path upload)
  // 5. Bulk insert company_registration_participants dari baris valid
  // 6. kirimEmailLeadBaru({ jenis: 'pendaftaran_perusahaan', nama: nama_perusahaan, kontak: whatsapp_pic, detail: `${jumlah_peserta} peserta, batch ${judul_batch}` })
  //    — lihat langkah 7 untuk extend jenis-nya dulu
  // 7. return { ok: true, waLink: <link wa.me dengan pesan pre-filled> }
}
```

## 7. Extend `kirimEmailLeadBaru` + `templateLeadBaru`

`src/lib/email/send.ts` dan `src/lib/email/templates.ts`: tambah
`'pendaftaran_perusahaan'` ke union type `jenis`. Di `templateLeadBaru`,
tambah cabang judul/body untuk jenis ini (mis. "Pendaftaran perusahaan/
komunitas baru").

## Testing sequence

1. Buka `/pelatihan/[slug]` pelatihan yang masih `open`/`upcoming` → pastikan
   ada tombol "Daftar sebagai Perusahaan/Komunitas" di samping tombol
   individu, tidak mengganggu layout yang ada.
2. Klik tombol itu → isi field PIC → klik "Unduh Template Excel" → pastikan
   file terunduh TANPA form tertutup/pindah tab, isi data field PIC masih ada.
3. Isi template dengan 2-3 baris valid → upload → submit → cek state sukses +
   tombol WA berfungsi dengan pesan benar.
4. Cek di database: `company_registrations` dan `company_registration_participants`
   terisi benar, `jumlah_peserta` cocok jumlah baris.
5. Coba upload Excel dengan satu baris nama kosong → submit → pastikan DITOLAK
   SELURUHNYA dengan pesan error jelas menyebut baris mana, TIDAK ada data
   yang masuk ke database sama sekali.
6. Coba upload file bukan Excel (mis. .pdf) → pastikan error jelas, tidak crash.
7. Pastikan alur "Daftar Individu" (`DaftarBatchDialog`) di halaman yang sama
   TIDAK terpengaruh/regresi.

## Dokumentasi

1. **`plan.md`**: ringkas keputusan implementasi (Dialog vs halaman terpisah,
   dll), file yang disentuh, status "menunggu uji Alif".
2. **`ENGINEERING.md`** — perluas `### ADR-026` yang sudah ada (JANGAN buat
   ADR baru): sub-bagian "Diperluas [tanggal]" ringkas alur form publik
   pendaftaran perusahaan. Update Bagian 11 (RIWAYAT PERUBAHAN STRUKTUR).
3. **`feature-registry.md`** — baris F13.5: update kolom Berkas, status
   **TETAP TODO**, kolom Bukti: "Form publik selesai, menunggu uji Alif. Menu
   Admin menyusul (Prompt 3b)."
4. **Jangan pernah menandai DONE atas inisiatif sendiri.**

## Saran pesan commit

```
feat(pendaftaran-perusahaan): form publik daftar grup via Excel (F13.5a)

- Tabel baru company_registrations + company_registration_participants
  (usulan SQL, belum dieksekusi), bucket privat company-registrations
- Form publik di /pelatihan/[slug]: PIC tanpa login, upload Excel peserta
  (nama/WA/email), validasi all-or-nothing, template Excel diunduh di browser
- Email notifikasi Admin + WA klik-to-chat setelah submit

Ref: ADR-026, F13.5
```
