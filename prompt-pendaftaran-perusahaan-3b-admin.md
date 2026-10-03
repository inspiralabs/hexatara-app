# Prompt Cursor — Pendaftaran Perusahaan/Komunitas (3b: Admin)

## Konteks

Lanjutan F13.5 (ADR-026). Bagian form publik (Prompt 3a) sudah dikerjakan dan
diuji — **jangan jalankan prompt ini sebelum 3a dikonfirmasi beres oleh
Alif**. Bagian ini menyelesaikan sisi Admin: lihat, verifikasi, isi nominal,
dan export pendaftaran perusahaan/komunitas.

## Langkah wajib sebelum menulis kode

1. Baca `rencana-f13.5-pendaftaran-perusahaan.md`, `ENGINEERING.md` entri
   ADR-026 (termasuk yang diperluas dari Prompt 3a), `feature-registry.md`
   baris F13.5.
2. Baca ulang file-file berikut untuk pastikan pola masih sesuai, terutama
   hasil keputusan teknis dari Prompt 3a (nama komponen/file sebenarnya bisa
   beda dari asumsi di sini) — kalau beda, **berhenti dan laporkan**:
   file-file yang disebut di `plan.md` bagian F13.5a,
   `src/app/admin/(protected)/upgrade/upgrade-tables.tsx` (pola `DataTable`),
   `src/app/admin/(protected)/leads/penawaran-export.ts` (pola export xlsx),
   `src/app/admin/(protected)/leads/penawaran-table.tsx`,
   `src/components/shell/admin-shell.tsx` (section "Leads").
3. Paparkan rencana singkat sebelum menulis kode.

## 1. Menu Admin (`admin-shell.tsx`)

Tambah item baru di section "Leads" yang sudah ada (JANGAN buat section baru):

```ts
{
  section: "Leads",
  icon: InboxIcon,
  items: [
    { href: "/admin/leads/penawaran", label: "Permintaan Penawaran" },
    { href: "/admin/pendaftaran-batch", label: "Pendaftaran Batch" },
    { href: "/admin/peserta-pendaftaran", label: "Peserta Pendaftaran" },
    { href: "/admin/pendaftaran-perusahaan", label: "Pendaftaran Perusahaan" },
  ],
},
```

## 2. Halaman daftar (`src/app/admin/(protected)/pendaftaran-perusahaan/page.tsx`)

- Query `company_registrations` join `batches` (judul batch) — tabel
  (`DataTable`, pola sama `AntreanTable`): kolom Nama Perusahaan, PIC
  (nama+WA), Batch, Jumlah Peserta, Status, Nominal (format Rupiah, "—" kalau
  null), Tanggal.
- Tombol Export Excel (pola sama `eksporPenawaranXlsx`, file baru
  `pendaftaran-perusahaan-export.ts`): kolom Nama Perusahaan, PIC, WhatsApp
  PIC, Email PIC, Batch, Jumlah Peserta, Nominal, Status, Tanggal.
- Filter status (menunggu_verifikasi/disetujui/ditolak), pola sama filter
  yang sudah ada di tabel admin lain.

## 3. Halaman/dialog detail (klik baris → lihat peserta + aksi)

- Tampilkan: data PIC lengkap, link unduh file Excel asli (signed URL dari
  bucket `company-registrations`, pola sama `createSignedUrl` yang dipakai
  untuk `payment-proofs`), daftar nama peserta (dari
  `company_registration_participants`, tabel sederhana nama/WA/email).
- Form aksi Admin:
  - Ubah status (`menunggu_verifikasi` → `disetujui`/`ditolak`), kalau
    `ditolak` wajib isi `alasan_tolak` (pola sama alur `batch_registrations`
    yang sudah ada).
  - Input/ubah `nominal` (satu angka total, boleh diisi kapan saja setelah
    nego WA, tidak harus bersamaan dengan ubah status).
  - Catatan Admin (textarea bebas, opsional).

## Testing sequence

1. Admin > Leads > Pendaftaran Perusahaan: cek tabel menampilkan data dari
   pendaftaran yang dibuat lewat Prompt 3a dengan benar.
2. Export Excel → cek file terunduh dengan data benar.
3. Klik salah satu baris → cek daftar peserta tampil lengkap, link unduh
   Excel asli berfungsi (file yang diupload PIC bisa dibuka).
4. Isi nominal → simpan → cek tersimpan dan tampil di tabel daftar.
5. Ubah status jadi "disetujui" → cek tersimpan. Coba juga "ditolak" dengan
   alasan → cek tersimpan dan tampil di detail.
6. Pastikan menu "Pendaftaran Batch" dan "Peserta Pendaftaran" (individu) di
   section Leads yang sama TIDAK terpengaruh/regresi.

## Dokumentasi

1. **`plan.md`**: ringkas implementasi Admin + file, status "menunggu uji
   Alif". Tandai F13.5 SELESAI DIKODEKAN SELURUHNYA (3a+3b) di catatan ini,
   tapi status resmi di feature-registry tetap menunggu konfirmasi Alif.
2. **`ENGINEERING.md`** — perluas `### ADR-026` (bukan ADR baru): sub-bagian
   "Diperluas [tanggal]" — F13.5 Admin selesai, sebutkan F13.5 (5 dari 5
   permintaan Abi) sekarang LENGKAP dikodekan. Update Bagian 11.
3. **`feature-registry.md`** — baris F13.5: status **TETAP TODO** sampai Alif
   konfirmasi uji browser (3a dan 3b sama-sama sudah diuji), kolom Bukti:
   "3a (publik) + 3b (Admin) selesai dikodekan, menunggu uji Alif."
4. **Jangan pernah menandai DONE atas inisiatif sendiri.**

## Saran pesan commit

```
feat(admin-pendaftaran-perusahaan): menu lihat/verifikasi/export (F13.5b)

- Menu baru di section Leads: tabel pendaftaran perusahaan + export Excel
- Detail: daftar peserta, link unduh Excel asli, ubah status, isi nominal
  (satu angka total), catatan Admin

Ref: ADR-026, F13.5 (lengkap — 3a publik + 3b admin)
```
