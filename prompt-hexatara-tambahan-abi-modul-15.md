# Hexatara — Tambahan dari Abi (Modul 15 / ADR-028 / F15.1–F15.8)

Dibuat 11 Oktober 2026 setelah pemeriksaan kode aktual repo Hexatara (commit terakhir `2c0f071`). Semua temuan di bawah berasal dari kode dan dump database, bukan asumsi.

## Ringkasan: 9 permintaan Abi → 8 fitur + 1 sinkron dokumen

Urutan eksekusi dari paling mudah ke paling sulit.

| Prompt | F | Permintaan Abi | Temuan kode aktual | SQL? | Tingkat |
|---|---|---|---|---|---|
| 1 | F15.1 | Poin 6 + 7: judul `/pelatihan` dan `/katalog` | Teks ada di `messages/id.json` + `en.json` (`pelatihan.pageTitle/pageSubtitle`, `catalog.pageTitle/pageSubtitle`, `seo.*`, `nav.katalog`). Subtitle sudah dirender di kedua halaman | Tidak | Sangat mudah |
| 2 | F15.2 | Poin 5: "PAS FOTO (Background Merah)" | Label di `messages` (`pasFotoLabel`, `errPasFoto`), `identitas-form.tsx` ("Pas Foto"), pesan hardcode di `daftar-batch-actions.ts`, label "Pas foto" di dua detail Admin | Tidak | Mudah |
| 3 | F15.3 | Poin 2: hapus checkbox tabel | `src/components/data-table.tsx` menambah kolom `_select` otomatis (`enableRowSelection = true` default). Tidak ada satu pun dari 14 tabel yang memakai state pilihan baris | Tidak | Mudah |
| 4 | F15.4 | Poin 3: batch tidak bisa dihapus | `hapusBatchAction` langsung `delete` tanpa cek. FK `company_registrations.batch_id` = NO ACTION (menahan hapus). FK `batch_registrations.batch_id` = ON DELETE CASCADE (pendaftar perorangan ikut terhapus diam-diam). Pesan error generik | Tidak | Sedang |
| 5 | F15.5 | Poin 4: Penerbitan Baru/Renewal hanya SiDOPI | Selalu tampil di `daftar-batch-dialog.tsx`. Kolom `batch_registrations.kategori_peserta` NOT NULL tanpa default. Pendaftaran kelompok tidak memakai kolom ini | Ya (Blok A) | Sedang |
| 6 | F15.6 | Poin 8: Jadwal Kelas Teori + Metode Kelas Teori | `batches` punya `alamat`, `lokasi_id/en`, `tanggal_mulai/selesai`. Publik: `timeLabel` ("Waktu"), `addressLabel` ("Alamat") di `pelatihan/[slug]/page.tsx` | Ya (Blok B) | Sedang |
| 7 | F15.7 | Poin 1: urutan seragam naik/turun | Panah (`ReorderButtons` + `moveItem`) sudah dipakai di Produk, Hero, Bab, Lampiran, Soal, Kategori Produk, Kategori Batch. Masih angka: Lokasi Praktek, Instruktur, Partner, Testimoni. Input angka juga masih ada di form Produk dan Hero | Tidak (diverifikasi Cursor per tabel) | Sulit |
| 8 | F15.8 | Poin 9: urutan merchandise vs produk | Merchandise dan produk satu tabel `products`, satu kolom `urutan`. Admin Merchandise menulis ulang `urutan` 0..n hanya untuk merchandise sehingga bentrok dengan produk. Landing (6 teratas) memakai urutan dan ikut memuat merchandise. `/katalog` memakai `created_at`, bukan urutan | Tidak | Sulit (bergantung Prompt 7) |
| 9 | — | Sinkron PRD, ENGINEERING, feature-registry | Pola yang sama dengan Modul 14 | Tidak | Mudah |

## Keputusan final (sudah Anda setujui, jangan diubah Cursor)

1. **Hapus batch:** batch tanpa pendaftar (perorangan maupun kelompok) boleh dihapus. Batch yang punya pendaftar ditolak dengan pesan jelas dan saran Nonaktifkan. Tanpa SQL. FK database tidak diubah.
2. **Urutan merchandise vs produk:** reorder aman per kelompok, landing hanya menampilkan produk non-merchandise, `/katalog` default memakai urutan admin (non-merchandise dulu, merchandise setelahnya) dengan opsi harga tetap ada.
3. **Kategori peserta (Baru/Renewal):** flag baru `batch_categories.butuh_kategori_peserta`, toggle di Admin Kategori Pelatihan, pola sama dengan `butuh_lokasi_praktek` dan `butuh_ukuran_baju`.
4. **Metode Kelas Teori:** flag baru `batch_categories.butuh_metode_kelas_teori`. Kolom `alamat` dipertahankan dan hanya tampil sebagai "Alamat Kelas Teori" bila metode Hybrid atau Full Tatap Muka.
5. **Asumsi default (boleh dibatalkan Alif sebelum eksekusi):**
   - Subjudul Indonesia `/katalog`: "Jelajahi pilihan drone, suku cadang, flight gear & aksesori, serta merchandise eksklusif Hexatara."
   - Label navbar `nav.katalog` ikut diganti menjadi "Marketplace" (ID dan EN). Label navbar "Pelatihan" tidak diubah.
   - Heading landing "Jadwal Pelatihan Mendatang" (`landing.scheduleHeading`) tidak diubah karena itu daftar batch mendatang, bukan judul halaman `/pelatihan`.
   - Reorder memakai satu hook bersama `useReorderList` (komponen tabel produk direfaktor memakainya tanpa perubahan perilaku).

## Aturan umum (berlaku untuk semua prompt)

- Baca `CLAUDE.md`, `AGENTS.md`, `PRD.md` §13 (anti-scope-creep), `ENGINEERING.md` sebelum mulai.
- **Agent tidak pernah menjalankan DDL.** SQL hanya ditulis sebagai usulan di `usulan-sql-modul15-adr028.sql`. Alif menjalankannya manual di Supabase SQL Editor lalu regenerate `src/types/database.ts` (PowerShell: `| Out-File -Encoding utf8`, jangan `>`).
- **Jangan menandai DONE** di `feature-registry.md`. Semua F15.x berstatus TODO sampai Alif konfirmasi sudah uji sendiri di browser.
- Tidak boleh menambah dependency baru. Jangan mengubah nama tabel, route, atau kolom yang sudah ada kecuali tertulis eksplisit.
- Setiap prompt melapor di `plan.md` dalam bagian terpisah ("Modul 15 — F15.x"), tidak menimpa bagian lain.
- Setelah tiap prompt: `pnpm tsc --noEmit`, `pnpm lint`, `pnpm test`. Laporkan hasilnya.
- Teks UI dwibahasa lewat `next-intl` (`messages/id.json` dan `messages/en.json`). Teks khusus Admin boleh hardcode Indonesia mengikuti pola menu Admin yang ada.
- Jangan mengerjakan prompt berikutnya sebelum Alif menyuruh.

---

## Bagian 0 — SQL (jalankan SEBELUM Prompt 5 dan 6)

Dibutuhkan hanya oleh Prompt 5 (Blok A) dan Prompt 6 (Blok B). Prompt 1–4 dan 7–9 tidak membutuhkan SQL. Cursor menulis file `usulan-sql-modul15-adr028.sql` berisi blok di bawah (defensif, idempoten). Alif yang menjalankan.

### Pengecekan dulu (read-only, jalankan satu per satu karena SQL Editor hanya menampilkan hasil statement terakhir)

```sql
-- Aturan hapus FK yang menunjuk ke batches (a=NO ACTION, c=CASCADE, n=SET NULL, r=RESTRICT)
select conrelid::regclass as tabel, conname, confdeltype
from pg_constraint
where confrelid = 'public.batches'::regclass and contype = 'f'
order by 1;
```

```sql
-- Jumlah pendaftar per batch (untuk melihat batch mana yang tidak bisa dihapus)
select b.id, b.judul_id,
  (select count(*) from public.batch_registrations r where r.batch_id = b.id) as perorangan,
  (select count(*) from public.company_registrations c where c.batch_id = b.id) as kelompok
from public.batches b
order by b.id;
```

```sql
-- Kategori yang ada sekarang beserta flag program
select id, nama_id, butuh_lokasi_praktek, butuh_ukuran_baju
from public.batch_categories
order by urutan;
```

### Blok A — Kategori peserta hanya untuk SiDOPI (Prompt 5)

```sql
alter table public.batch_categories
  add column if not exists butuh_kategori_peserta boolean not null default false;

-- Pendaftaran non-SiDOPI tidak mengisi kategori peserta
alter table public.batch_registrations
  alter column kategori_peserta drop not null;
```

Setelah dijalankan, buka Admin → Batch → Kategori, lalu centang "Butuh kategori peserta" pada kategori SiDOPI. Nilai `kategori_peserta` pendaftar lama tidak berubah.

### Blok B — Metode Kelas Teori (Prompt 6)

```sql
alter table public.batch_categories
  add column if not exists butuh_metode_kelas_teori boolean not null default false;

alter table public.batches
  add column if not exists metode_kelas_teori text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chk_batches_metode_kelas_teori'
  ) then
    alter table public.batches
      add constraint chk_batches_metode_kelas_teori
      check (metode_kelas_teori is null
             or metode_kelas_teori in ('virtual_meeting', 'hybrid', 'full_tatap_muka'));
  end if;
end $$;
```

Setelah dijalankan, centang "Butuh metode kelas teori" pada kategori RPC lewat Admin. Batch lama kategori itu yang `metode_kelas_teori`-nya masih kosong tetap tampil seperti sekarang (Alamat) sampai Anda mengisi metodenya.

### Verifikasi setelah Blok A dan B

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'batch_categories' and column_name in ('butuh_kategori_peserta', 'butuh_metode_kelas_teori'))
    or (table_name = 'batches' and column_name = 'metode_kelas_teori')
    or (table_name = 'batch_registrations' and column_name = 'kategori_peserta')
  )
order by table_name, column_name;
```

Harapan: `batch_registrations.kategori_peserta` → `is_nullable = YES`; tiga kolom baru ada.

### Rollback (hanya bila perlu)

```sql
-- Blok B
alter table public.batches drop constraint if exists chk_batches_metode_kelas_teori;
alter table public.batches drop column if exists metode_kelas_teori;
alter table public.batch_categories drop column if exists butuh_metode_kelas_teori;
-- Blok A (hanya aman bila tidak ada baris batch_registrations dengan kategori_peserta null)
alter table public.batch_categories drop column if exists butuh_kategori_peserta;
-- alter table public.batch_registrations alter column kategori_peserta set not null;
```

---

## Prompt 1 — F15.1: Teks halaman `/pelatihan` dan `/katalog` (Poin 6 + 7)

```
Kerjakan F15.1 (Modul 15 / ADR-028). Perubahan teks saja, tanpa SQL, tanpa perubahan logika.

Konteks: Abi minta judul halaman publik /pelatihan dan /katalog diganti. Teks tersimpan di messages/id.json dan messages/en.json.

TAHAP 1 — Audit (read-only, laporkan di plan.md bagian "Modul 15 — F15.1"):
Cari semua kemunculan kata berikut di messages/*.json dan src/ (case-insensitive): "Jadwal Pelatihan", "Training Schedule", "Katalog Produk", "Product Catalog". Untuk tiap temuan catat key + lokasi pemakaian (heading halaman, metadata SEO, navbar, breadcrumb, footer, tombol "kembali ke katalog", email, dll.). Jangan ubah dulu yang bukan di daftar Tahap 2.

TAHAP 2 — Ubah persis seperti ini:

A. Halaman /pelatihan (namespace "pelatihan")
- pelatihan.pageTitle
  id: "Direktori Pelatihan & Sertifikasi"
  en: "Training & Certification Directory"
- pelatihan.pageSubtitle
  id: "Jelajahi berbagai pilihan program pelatihan drone, mulai dari tingkat dasar hingga spesialisasi industri"
  en: "Discover our comprehensive drone training programs, ranging from beginner courses to advanced industry specializations"
- Metadata SEO (namespace "seo"): pelatihanTitle = judul baru (id/en sama dengan pageTitle). pelatihanDescription = subtitle baru (id/en).

B. Halaman /katalog (namespace "catalog")
- catalog.pageTitle: id dan en sama: "Hexatara Marketplace"
- catalog.pageSubtitle
  en: "Explore our diverse selection of drones, spare parts, flight gears & accessories, and exclusive Hexatara merchandise."
  id: "Jelajahi pilihan drone, suku cadang, flight gear & aksesori, serta merchandise eksklusif Hexatara."
- Metadata SEO: seo.katalogTitle = "Hexatara Marketplace" (id/en). seo.katalogDescription = subtitle baru (id/en).
- Navbar: nav.katalog -> "Marketplace" (id dan en). Jangan ubah nav.pelatihan dan nav.produk.
- Jika audit menemukan breadcrumb/tombol "kembali" yang memakai kata "Katalog Produk"/"Product Catalog" sebagai nama halaman /katalog, samakan dengan "Hexatara Marketplace".

TIDAK diubah: landing.scheduleHeading ("Jadwal Pelatihan Mendatang"), label filter, nama route, slug, struktur komponen.

Verifikasi: halaman memakai t("pageTitle") dan t("pageSubtitle") (sudah ada di pelatihan/page.tsx baris ~125 dan katalog/page.tsx baris ~128). Pastikan id.json dan en.json tetap JSON valid dan key-nya simetris. Jalankan pnpm tsc --noEmit, pnpm lint, pnpm test.

Laporkan di plan.md: daftar key yang diubah (lama -> baru) dan temuan audit yang sengaja tidak diubah beserta alasannya. Tambahkan F15.1 di feature-registry.md dengan status TODO.
```

---

## Prompt 2 — F15.2: "PAS FOTO (Background Merah)" (Poin 5)

```
Kerjakan F15.2 (Modul 15 / ADR-028). Perubahan label, tanpa SQL.

Konteks: Abi minta setiap form yang meminta pas foto menegaskan aturan: pas foto berlatar belakang merah.

TAHAP 1 — Audit (read-only): cari semua tempat yang menampilkan atau meminta pas foto, case-insensitive: "pas foto", "pasfoto", "pas_foto", "passport". Yang sudah saya temukan, pastikan lengkap dan tambah yang terlewat:
- messages/id.json & en.json: key pasFotoLabel (baris ~127), errPasFoto (baris ~149) pada form pendaftaran pelatihan.
- src/app/[locale]/(public)/pelatihan/[slug]/daftar-batch-dialog.tsx dan komponen upload foto yang dipakainya.
- src/app/[locale]/(public)/pelatihan/[slug]/daftar-batch-actions.ts baris ~141 (pesan hardcode "Foto KTP dan pas foto wajib diunggah ...").
- src/app/[locale]/(user)/dashboard/profil/identitas-form.tsx (label "Pas Foto") dan identitas-foto-field.tsx (toast "Pas foto berhasil diunggah").
- Admin: pendaftaran-batch-detail.tsx dan peserta-pendaftaran-detail.tsx (label FotoInline "Pas foto").
- Cek apakah form Pendaftaran Kelompok (daftar-perusahaan-*) atau template Excel meminta foto. Jika tidak ada, catat "tidak berlaku".

TAHAP 2 — Ubah:
- Label field di semua form peserta:
  id: "Pas Foto (Background Merah)"
  en: "Passport Photo (Red Background)"
- Tambahkan teks bantuan singkat di bawah/di dalam area upload pas foto (di form pendaftaran pelatihan dan di halaman profil identitas), memakai pola helper text yang sudah ada di komponen itu:
  id: "Gunakan pas foto dengan latar belakang merah."
  en: "Use a passport photo with a red background."
- Pesan error / validasi / toast yang menyebut pas foto: sesuaikan agar konsisten ("Pas foto (background merah) wajib diunggah." / "Passport photo (red background) is required.").
- Label di Admin (detail pendaftaran dan detail peserta): "Pas Foto (Background Merah)" supaya verifikator tahu aturan yang dicek.
- Pindahkan teks hardcode di daftar-batch-actions.ts ke pola yang sudah dipakai file itu (jika file itu memang hardcode Indonesia, cukup ubah teksnya; jangan refactor).

TIDAK diubah: nama kolom pas_foto_url, nama field form ('pas_foto'), validasi tipe/ukuran file, kompresi gambar, bucket storage. Tidak ada validasi warna latar (tidak diminta; jangan menambah deteksi gambar).

Verifikasi: pnpm tsc --noEmit, pnpm lint, pnpm test. Laporkan di plan.md ("Modul 15 — F15.2") daftar file + teks lama -> baru. Tambah F15.2 di feature-registry.md status TODO.
```

---

## Prompt 3 — F15.3: Hapus checkbox tabel Admin (Poin 2)

```
Kerjakan F15.3 (Modul 15 / ADR-028). Tanpa SQL.

Konteks: Semua tabel Admin yang memakai komponen DataTable menampilkan kolom checkbox (src/components/data-table.tsx, prop enableRowSelection default true, kolom '_select'). Tidak ada aksi yang memakai pilihan baris, jadi checkbox hanya menyesatkan. Abi minta dihilangkan.

TAHAP 1 — Audit (read-only):
1. Daftar semua pemakai <DataTable (ada ±14: batch-table, instructor-list, partner-list, popup-list, sale-banner-list, testimonial-list, penawaran-table, pesanan-merchandise-table, pesanan-publik-table, pendaftaran-batch-table, pendaftaran-perusahaan-table, peserta-pendaftaran-table, sertifikat-table, upgrade-tables x2).
2. Untuk tiap tabel: apakah ada kode yang membaca pilihan baris (getSelectedRowModel, rowSelection, onSelectionChange, bulk action yang bergantung pada checkbox)? Laporkan hasilnya. Dugaan: tidak ada satu pun.
3. Jika ada tabel yang ternyata memakai pilihan baris untuk aksi nyata, JANGAN ubah tabel itu; laporkan dan tanyakan.

TAHAP 2 — Implementasi:
- Ubah default enableRowSelection pada DataTable menjadi false sehingga kolom '_select' tidak muncul di semua tabel. Pertahankan prop agar bisa dinyalakan lagi bila suatu hari dibutuhkan (jangan hapus fitur dari komponen).
- Periksa efek sampingnya: perhitungan colSpan untuk baris kosong ("Belum ada data"), lebar kolom, dan teks yang menyebut jumlah baris terpilih (mis. "N dari M baris dipilih") di footer/pagination DataTable. Jika ada teks seperti itu, sembunyikan saat enableRowSelection false.
- Jangan mengubah tabel yang bukan DataTable (mis. ProdukTable, BabList) — mereka tidak punya checkbox.

Verifikasi: pnpm tsc --noEmit, pnpm lint, pnpm test, lalu pnpm knip (laporkan jika ada temuan baru akibat perubahan ini). Cek manual yang harus dilaporkan Cursor lewat pembacaan kode: tidak ada lagi checkbox pada /admin/batch dan 13 tabel lain.

Laporkan di plan.md ("Modul 15 — F15.3"). Tambah F15.3 di feature-registry.md status TODO.
```

---

## Prompt 4 — F15.4: Batch pelatihan tidak bisa dihapus (Poin 3)

**Penjelasan untuk Alif (akar masalah dari kode + dump database 23 Sept 2026):**

1. `hapusBatchAction` (`src/app/admin/(protected)/batch/actions.ts`) hanya menjalankan `delete from batches where id = ...` lalu menampilkan "Gagal menghapus. Coba lagi." untuk error apa pun.
2. Tabel `company_registrations.batch_id` mereferensikan `batches(id)` tanpa `ON DELETE` (NO ACTION). Jika batch itu pernah dipakai Pendaftaran Kelompok (termasuk data uji F13.5/F14.2), Postgres menolak hapus dengan error 23503 (FK violation). Inilah penyebab paling mungkin "tidak bisa dihapus". Konfirmasi dengan dua query pengecekan di Bagian 0.
3. Sebaliknya `batch_registrations.batch_id` bersifat `ON DELETE CASCADE`: jika batch hanya punya pendaftar perorangan, batch terhapus dan data semua pendaftarnya ikut hilang tanpa peringatan. Ini lebih berbahaya daripada gagal hapus.
4. Dialog konfirmasi (`batch-row-actions.tsx`) tidak menyebut pendaftar sama sekali.

**Solusi (keputusan Anda):** blokir hapus bila ada pendaftar, beri pesan jelas, arahkan ke Nonaktifkan. Tanpa SQL.

```
Kerjakan F15.4 (Modul 15 / ADR-028). Tanpa SQL. Jangan mengubah FK database.

Konteks lengkap:
- hapusBatchAction(batchId) di src/app/admin/(protected)/batch/actions.ts (baris ~166) langsung delete batches lalu mengembalikan pesan generik "Gagal menghapus. Coba lagi.".
- FK yang menunjuk batches: batch_benefits/equipment/faqs/gallery/requirements = CASCADE; batch_leads = SET NULL; batch_registrations = CASCADE; company_registrations = NO ACTION (menahan hapus). company_registration_participants cascade dari company_registrations.
- Keputusan produk: batch TANPA pendaftar boleh dihapus; batch DENGAN pendaftar (perorangan atau kelompok) DITOLAK dengan pesan jelas dan saran Nonaktifkan. Pendaftar tidak boleh terhapus diam-diam.

TAHAP 1 — Verifikasi (read-only, laporkan):
1. Telusuri semua kode yang memanggil hapusBatchAction dan komponen yang menampilkannya (batch-row-actions.tsx, batch-table.tsx).
2. Konfirmasi dari src/types/database.ts dan file SQL usulan tabel apa saja yang mereferensikan batches, dan apakah ada tabel lain (mis. sertifikat, upgrade, dashboard pelatihan user) yang menyimpan batch_id.
3. Tambahkan logging error lengkap (code, message, details) di catch/branch error hapus agar kegagalan berikutnya terlihat di log (console.error dengan error.code).

TAHAP 2 — Implementasi:
1. Di hapusBatchAction, SEBELUM delete: hitung (pakai client admin, count exact, head true) batch_registrations dan company_registrations untuk batch_id tersebut.
   - Jika total > 0: jangan delete. Kembalikan { ok: false as const, pesan } dengan teks seperti:
     "Batch ini tidak bisa dihapus karena sudah punya {X} pendaftar perorangan dan {Y} pendaftaran kelompok. Nonaktifkan batch agar tidak tampil di publik."
     (hilangkan bagian yang bernilai 0).
   - Jika 0: lanjut delete seperti sekarang.
2. Setelah delete, jika masih error dengan code '23503' (FK violation, mis. race condition), kembalikan pesan yang sama jenisnya (bukan "Coba lagi"). Error lain tetap pesan generik + log.
3. Dialog hapus di batch-row-actions.tsx: perbarui deskripsi agar jujur: batch dengan pendaftar tidak bisa dihapus, gunakan toggle "Aktif" untuk menyembunyikan dari publik. Tampilkan pesan dari server lewat toast.error dengan durasi cukup (pesan panjang).
4. Jangan menambah dependency. Jangan menyentuh tombol Aktif/toggleAktifBatchAction.
5. Tambahkan unit test fungsi murni jika ada helper pembentuk pesan (ekstrak ke src/lib/batch.ts fungsi susunPesanBatchTidakBisaDihapus(perorangan, kelompok) dan uji kombinasi 0/ >0). Pola test mengikuti folder test yang sudah ada.

Verifikasi: pnpm tsc --noEmit, pnpm lint, pnpm test. Skenario uji manual untuk Alif (tulis di plan.md):
(a) batch baru tanpa pendaftar -> bisa dihapus; (b) batch dengan pendaftar perorangan -> ditolak dengan pesan, pendaftar tetap ada; (c) batch dengan pendaftaran kelompok -> ditolak dengan pesan; (d) toggle Aktif tetap berfungsi.

Laporkan di plan.md ("Modul 15 — F15.4"). Tambah F15.4 di feature-registry.md status TODO.
```

---

## Prompt 5 — F15.5: Kategori peserta (Baru/Renewal) hanya untuk SiDOPI (Poin 4)

Prasyarat: SQL Bagian 0 Blok A sudah dijalankan Alif, `src/types/database.ts` sudah diregenerate, dan kategori SiDOPI sudah dicentang di Admin setelah kode selesai.

```
Kerjakan F15.5 (Modul 15 / ADR-028).

Konteks:
- Form pendaftaran pelatihan (src/app/[locale]/(public)/pelatihan/[slug]/daftar-batch-dialog.tsx, field kategori_peserta ~baris 523, default 'penerbitan_baru' baris ~57) selalu menampilkan pilihan "Penerbitan Baru / Perpanjangan (Renewal)". Menurut Abi pilihan ini hanya relevan untuk SiDOPI.
- Kolom batch_registrations.kategori_peserta bertipe enum kategori_peserta_rpc ('penerbitan_baru','perpanjangan_renewal'). SQL Bagian 0 Blok A SUDAH dijalankan Alif: kolom ini kini NULLABLE dan batch_categories punya kolom baru butuh_kategori_peserta boolean not null default false. Jika database.ts belum mencerminkan ini, BERHENTI dan minta Alif regenerate.
- Pola yang harus diikuti: flag lokasi praktek dan ukuran baju (butuh_lokasi_praktek, butuh_ukuran_baju) di kategori. Pelajari alurnya end-to-end: src/components/admin/kategori-manager.tsx (checkbox flag + badge), src/app/admin/(protected)/batch/kategori/ (actions + validasi), query publik di pelatihan/[slug]/page.tsx (select batch_categories(... butuh_lokasi_praktek, butuh_ukuran_baju)), prop ke dialog, dan validasi server.
- Pendaftaran Kelompok (company_registrations/Excel) TIDAK memakai kolom ini; jangan diubah.

TAHAP 1 — Audit (read-only, laporkan):
Semua tempat yang membaca/menulis/menampilkan kategori_peserta: 
pendaftaran-batch/{page,table,detail,export}, peserta-pendaftaran/{page,peserta-types,peserta-export,detail}, pelatihan/[slug]/{daftar-batch-actions,daftar-batch-dialog}, src/lib/validations/pendaftaran-batch.ts (KATEGORI_PESERTA, KategoriPesertaRpc), email/template, dan lainnya. Juga cek view/fungsi/trigger database yang mungkin bergantung (cari di file SQL usulan). Setelah database.ts diregenerate, `pnpm tsc --noEmit` akan menandai semua tempat yang harus menangani null.

TAHAP 2 — Implementasi:
1. Admin Kategori Pelatihan: tambah checkbox "Butuh kategori peserta (Penerbitan Baru / Renewal)" dengan pola dan badge yang sama seperti dua flag yang ada, termasuk validasi + action simpan.
2. Publik: sertakan butuh_kategori_peserta di select kategori pada pelatihan/[slug]/page.tsx dan teruskan ke dialog. Dialog menampilkan field kategori_peserta HANYA jika flag true; jika false, field tidak dirender dan tidak dikirim.
3. Server (daftar-batch-actions.ts + schema zod): JANGAN percaya klien. Muat kategori batch dari database; jika flag true -> kategori_peserta wajib dan valid; jika false -> abaikan nilai yang dikirim dan simpan NULL. Ubah schema zod agar kategori_peserta optional lalu divalidasi bersyarat (refine / validasi di action sesuai pola ukuran_baju/lokasi praktek yang sudah ada).
4. Semua tampilan Admin yang memakai LABEL_KATEGORI[row.kategori_peserta] harus aman untuk null: tampilkan "—" (tabel, detail, export Excel "Kategori Peserta"). Sesuaikan tipe PendaftaranBatchRow/PesertaPendaftaranRow menjadi nullable.
5. Kolom/baris pendaftar lama tetap utuh. Jangan mengisi ulang atau menghapus nilai lama. Jangan mengubah enum.
6. Tambahkan test untuk fungsi murni (mis. resolver kategori_peserta berdasarkan flag) bila ada logika yang bisa diekstrak.

Skenario uji untuk Alif (tulis di plan.md): (a) kategori tanpa flag (mis. Advanced) -> dialog daftar tidak menampilkan Baru/Renewal, pendaftaran tersimpan dengan kategori_peserta null, Admin menampilkan "—"; (b) kategori SiDOPI dengan flag -> field tampil dan wajib; (c) pendaftar lama tetap menampilkan nilai lamanya; (d) Excel ekspor Admin tidak error pada baris null.

Verifikasi: pnpm tsc --noEmit, pnpm lint, pnpm test. Laporkan di plan.md ("Modul 15 — F15.5") dan tambah F15.5 di feature-registry.md status TODO.
```

---

## Prompt 6 — F15.6: Jadwal Kelas Teori + Metode Kelas Teori (Poin 8)

Prasyarat: SQL Bagian 0 Blok B sudah dijalankan Alif dan `database.ts` sudah diregenerate.

```
Kerjakan F15.6 (Modul 15 / ADR-028).

Konteks:
- Tabel batches punya: tanggal_mulai, tanggal_selesai, lokasi_id/lokasi_en (input teks), alamat (textarea). Admin: src/app/admin/(protected)/batch/batch-form.tsx (label "Tanggal Mulai/Selesai", "Lokasi (Indonesia/Inggris)", "Alamat" ~baris 261). Publik: src/app/[locale]/(public)/pelatihan/[slug]/page.tsx menampilkan blok "Waktu" (t("timeLabel")), "Lokasi" (t("locationLabel")), "Alamat" (t("addressLabel")) pada ~baris 246-268; key ada di messages (baris ~88-90, id: "Waktu: ", "Alamat: ").
- Permintaan Abi untuk program RPC (kelas teori): "Waktu" -> "Jadwal Kelas Teori"; "Alamat" -> "Metode Kelas Teori" dengan 3 pilihan: Virtual Meeting, Hybrid, Full Tatap Muka.
- SQL Bagian 0 Blok B SUDAH dijalankan Alif: batch_categories.butuh_metode_kelas_teori boolean not null default false; batches.metode_kelas_teori text null dengan CHECK in ('virtual_meeting','hybrid','full_tatap_muka'). Jika database.ts belum mencerminkan ini, BERHENTI dan minta Alif regenerate.
- Keputusan: perubahan HANYA untuk batch yang kategorinya butuh_metode_kelas_teori = true. Batch kategori lain tidak berubah sama sekali. Kolom alamat TIDAK dihapus dan tidak di-rename.

TAHAP 1 — Audit (read-only): temukan semua pemakai batches.alamat dan label Waktu/Alamat (admin form, validasi src/lib/validations/*batch*, actions.ts termasuk "salin dari batch" ~baris 256, halaman detail publik, dashboard pelatihan user, email/template, export Excel). Laporkan.

TAHAP 2 — Implementasi:
A. Kategori (pola sama dengan butuh_lokasi_praktek): checkbox Admin "Butuh metode kelas teori (Virtual / Hybrid / Tatap Muka)" di kategori-manager + validasi + action simpan + badge.
B. Form batch Admin (batch-form.tsx): form perlu tahu flag kategori terpilih (ambil dari daftar kategori yang sudah dimuat, tanpa query tambahan bila memungkinkan).
   - Jika kategori terpilih butuh_metode_kelas_teori: judul/label bagian tanggal menjadi "Jadwal Kelas Teori" (Tanggal Mulai / Tanggal Selesai tetap, hanya label bagian), field "Alamat" digantikan Select "Metode Kelas Teori" (Virtual Meeting / Hybrid / Full Tatap Muka). Jika metode = Hybrid atau Full Tatap Muka, tampilkan textarea "Alamat Kelas Teori" (memakai kolom alamat, opsional). Jika Virtual Meeting, sembunyikan alamat dan simpan alamat = null.
   - Jika kategori tidak butuh: form persis seperti sekarang.
   - Validasi server (zod + action): metode hanya diterima bila kategori batch memang flag true; selain itu simpan metode null. Jangan percaya klien. Saat kategori batch diganti dari flag true ke false, metode_kelas_teori di-null-kan.
   - Aksi "Salin dari batch" ikut menyalin metode_kelas_teori.
C. Publik (pelatihan/[slug]/page.tsx): tambahkan butuh_metode_kelas_teori ke select kategori dan metode_kelas_teori ke select batch.
   - Flag true dan metode terisi: label waktu "Jadwal Kelas Teori" (en: "Theory Class Schedule"), baris baru "Metode Kelas Teori" (en: "Theory Class Method") bernilai Virtual Meeting / Hybrid / Full Tatap Muka (en: Virtual Meeting / Hybrid / Full In-Person). Jika Hybrid atau Full Tatap Muka dan alamat terisi: tampilkan "Alamat Kelas Teori" (en: "Theory Class Address"). Baris "Lokasi" yang ada tetap tampil seperti sekarang.
   - Flag true tetapi metode masih kosong (batch lama): tampilan lama (Waktu, Lokasi, Alamat) agar tidak ada data hilang.
   - Flag false: tampilan lama tanpa perubahan.
   - Tambahkan key i18n baru di id.json dan en.json (jangan mengubah timeLabel/addressLabel lama).
D. Tempat lain yang menampilkan jadwal/alamat batch hasil audit (dashboard pelatihan user, email) disesuaikan seperlunya hanya jika di sana label Waktu/Alamat tampil untuk batch flag true; laporkan keputusan.
E. Helper pemetaan nilai metode -> label (id/en) diletakkan di src/lib/batch.ts dan diuji unit test.

Skenario uji Alif (tulis di plan.md): (1) centang flag pada kategori RPC; (2) buat/ubah batch RPC: label jadwal dan dropdown metode muncul, alamat kondisional; (3) halaman publik batch RPC menampilkan Jadwal Kelas Teori + Metode; Virtual tanpa alamat, Hybrid/Tatap Muka dengan Alamat Kelas Teori; (4) batch kategori lain tidak berubah; (5) batch RPC lama tanpa metode tampil seperti dulu.

Verifikasi: pnpm tsc --noEmit, pnpm lint, pnpm test. Laporkan di plan.md ("Modul 15 — F15.6"), tambah F15.6 di feature-registry.md status TODO.
```

---

## Prompt 7 — F15.7: Urutan seragam naik/turun di semua menu Admin (Poin 1)

```
Kerjakan F15.7 (Modul 15 / ADR-028). Tanpa SQL kecuali audit membuktikan perlu (lihat Tahap 1 butir 3).

Konteks (hasil pemeriksaan kode):
- Pola acuan = Admin Produk: src/app/admin/(protected)/produk/produk-table.tsx memakai <ReorderButtons> (src/components/admin/reorder-buttons.tsx) + moveItem (src/lib/reorder.ts) + Server Action reorderProdukAction (update urutan = index per baris, urutan tidak unique). Daftar selalu diurutkan urutan, reorder terhadap daftar penuh (bukan hasil filter), optimistic update + rollback + toast.
- Sudah memakai panah: Produk (tabel), Hero (hero-slide-list.tsx), Bab/Lampiran/Soal materi, Kategori Produk dan Kategori Batch (kategori-manager.tsx, RPC reorder_batch_categories).
- MASIH angka (harus diseragamkan): 
  1) Lokasi Praktek: src/app/admin/(protected)/batch/lokasi-praktek/lokasi-praktek-manager.tsx (kolom {l.urutan} baris ~136 dan input "Urutan" ~baris 263) + actions.ts + validations/practice-location-admin.ts.
  2) Instruktur: konten/instructor-list.tsx (kolom "Urutan" sortable ~baris 91 pada DataTable), instructor-form-dialog.tsx (input ~baris 148), instructor-detail-dialog.tsx (baris "Urutan" ~baris 50), instructor-actions.ts, validations/instructor-admin.ts.
  3) Partner Kami: konten/partner-list.tsx (~baris 67), partner-form-dialog.tsx (~baris 121), partner-actions.ts (~baris 69), validations/partner-admin.ts.
  4) Testimoni: konten/testimonial-list.tsx (~baris 56), testimonial-form-dialog.tsx (~baris 160), testimonial-actions.ts, validations/testimonial-admin.ts.
- Input angka "Urutan" juga masih ada di form yang listnya sudah panah: produk-form.tsx (~baris 162) dan hero-slide-form-dialog.tsx (~baris 160) -> harus dihapus agar tidak ada dua cara mengubah urutan.
- Keputusan: SEMUA menu Admin yang punya urutan memakai satu cara saja: panah naik/turun di daftar, tanpa input angka di form. Kolom urutan di database TIDAK dihapus dan TIDAK di-rename.

TAHAP 1 — Audit (read-only, laporkan sebelum mengubah):
1. Jalankan pencarian menyeluruh di src/app/admin dan src/components/admin untuk "urutan" (kolom, input name="urutan", header "Urutan", field di zod) dan lengkapi daftar di atas dengan menu lain yang terlewat (mis. Banner Sale, Popup, Tentang Kami, Company, galeri gambar produk/batch, materi). Untuk tiap menu tulis status: sudah panah / masih angka / tidak relevan.
2. Untuk setiap tabel yang akan diubah, cek bagaimana halaman publiknya mengurutkan data (order by urutan?) agar perilaku publik tidak berubah.
3. Untuk setiap tabel yang akan diubah, cek apakah kolom urutan punya constraint UNIQUE atau fungsi RPC khusus (seperti reorder_batch_categories). Jika UNIQUE: JANGAN menulis DDL; laporkan dan ikuti pola RPC kategori batch dengan usulan SQL terpisah di usulan-sql-modul15-adr028.sql untuk dijalankan Alif.
Tunggu saya setuju daftar menu final hanya jika audit menemukan menu di luar 4 menu di atas; jika tidak, lanjut ke Tahap 2.

TAHAP 2 — Implementasi:
1. Buat hook bersama `useReorderList` (mis. src/components/admin/use-reorder-list.ts) yang membungkus pola dari ProdukTable: state daftar terurut, pindah(id, 'up'|'down') memakai moveItem, useTransition, panggil Server Action reorder, rollback + toast.error saat gagal, toast.success + router.refresh saat berhasil. Refaktor ProdukTable memakai hook ini TANPA mengubah perilaku atau tampilannya.
2. Untuk tiap menu yang masih angka:
   - Tampilkan daftar terurut tetap berdasarkan urutan (hapus kolom angka "Urutan" dan sortir kolom urutan). Kolom pertama berisi <ReorderButtons> persis seperti ProdukTable.
   - Instruktur, Partner, Testimoni saat ini DataTable (pagination 10 + sort kolom). Reorder harus bekerja pada daftar penuh, jadi ganti ke pola ProdukTable (tabel polos + kolom pencarian + panah). Pertahankan kolom, switch Aktif, aksi baris (ubah/hapus/detail), dan filter yang sudah ada. Jangan hilangkan fungsi.
   - Lokasi Praktek: ganti kolom dan input angka dengan panah yang sama.
   - Server Action reorder per entitas: requireAdmin(), validasi ids (array unik, semua id benar-benar ada), update urutan = index per baris (pola reorderProdukAction), kembalikan { ok, pesan }, revalidate path publik yang relevan seperti action simpan yang sudah ada.
3. Form tambah/ubah: hapus input "Urutan" di semua form (Produk, Hero, Instruktur, Partner, Testimoni, Lokasi Praktek). Hapus `urutan` dari schema zod admin masing-masing. 
   - Tambah baru: urutan otomatis = nilai urutan tertinggi di tabel itu + 1 (item baru muncul paling bawah). Untuk tabel yang sudah dikelompokkan (mis. produk per kelompok) ikuti hasil Prompt 8, jangan mengerjakannya di sini.
   - Ubah (edit): payload update TIDAK menyertakan urutan sehingga urutan tidak tertimpa.
   - Duplikasi/salin (jika ada) ikut aturan tambah baru.
4. Dialog Detail Instruktur: hapus baris "Urutan".
5. Aksesibilitas: aria-label tombol sudah ada di ReorderButtons ("Naikkan urutan {label}"); pastikan prop label diisi nama item di tiap tabel. Target sentuh ≥44px sudah diatur komponen.
6. Test: unit test untuk helper murni (hitung urutan berikutnya = max+1; moveItem sudah punya pola test jika ada).

Skenario uji Alif (tulis di plan.md): untuk tiap menu (Produk, Hero, Lokasi Praktek, Instruktur, Partner, Testimoni, plus menu hasil audit): (a) tambah item baru muncul paling bawah; (b) klik panah menaikkan/menurunkan dan tetap setelah refresh; (c) halaman publik mengikuti urutan baru; (d) tidak ada lagi input atau kolom angka urutan di form maupun tabel; (e) edit item tidak mengubah posisinya; (f) panah atas item pertama dan panah bawah item terakhir nonaktif.

Verifikasi: pnpm tsc --noEmit, pnpm lint, pnpm test, pnpm knip (laporkan temuan baru). Laporkan di plan.md ("Modul 15 — F15.7") daftar menu final beserta status sebelum/sesudah. Tambah F15.7 di feature-registry.md status TODO.
```

---

## Prompt 8 — F15.8: Urutan Produk vs Merchandise (Poin 9)

Kerjakan SETELAH Prompt 7 (memakai hook `useReorderList`).

**Jawaban pertanyaan Abi (kondisi sebelum perbaikan):** merchandise dan produk adalah satu tabel `products` dengan satu kolom `urutan`; merchandise hanyalah produk berkategori "Merchandise". Jika merchandise memakai urutan 1 dan produk urutan 1, keduanya bersaing di daftar yang sama. Landing page mengambil 6 produk teratas berdasarkan `urutan` tanpa menyaring kategori, jadi merchandise bisa ikut muncul di landing. Halaman `/katalog` sekarang tidak memakai urutan sama sekali (urut terbaru). Reorder di menu Admin Merchandise menulis ulang `urutan` 0..n hanya untuk item merchandise sehingga bentrok dengan produk. Perbaikan di bawah membuat tiap kelompok punya urutan sendiri dan tidak saling mengganggu.

```
Kerjakan F15.8 (Modul 15 / ADR-028). Tanpa SQL. Prasyarat: F15.7 selesai (hook useReorderList).

Konteks (hasil pemeriksaan kode):
- Produk dan Merchandise satu tabel `products` (satu kolom urutan, tidak unique). Merchandise = produk dengan category_id kategori bernama "Merchandise" (src/lib/merchandise.ts getKategoriMerchandiseId, ilike 'merchandise').
- Admin Produk (admin/produk/page.tsx) mengambil SEMUA produk (termasuk merchandise) order urutan. Admin Merchandise (admin/merchandise/page.tsx) hanya merchandise. Keduanya memakai ProdukTable + reorderProdukAction yang menulis urutan 0..n untuk id yang dikirim. Akibatnya reorder di Merchandise menimpa urutan yang bentrok dengan produk.
- Publik: src/components/produk-section.tsx (landing) query products_public order urutan limit 6 TANPA filter kategori. /katalog (src/app/[locale]/(public)/katalog/page.tsx) order created_at desc default (opsi harga asc/desc). Dashboard merchandise user (lib/merchandise.ts getProdukMerchandiseAktif) order urutan, hanya merchandise.
- Keputusan produk:
  (1) Reorder aman per kelompok: Produk (non-merchandise) dan Merchandise punya urutan sendiri; reorder satu kelompok tidak boleh menyentuh baris kelompok lain.
  (2) Landing "Produk" hanya menampilkan produk non-merchandise.
  (3) /katalog default memakai urutan admin: produk non-merchandise dulu (urutan naik), lalu merchandise (urutan naik), tie-break created_at desc. Opsi harga asc/desc tetap ada.

TAHAP 1 — Audit (read-only, laporkan):
1. Semua query ke products/products_public yang memakai urutan atau menampilkan daftar produk (landing, katalog, katalog/[slug] "produk lain", dashboard, sitemap, dan lainnya) dan apakah memuat merchandise.
2. Definisi opsi sort /katalog saat ini (nilai sortValue, label i18n, default). Cek apakah ada pagination (jika ada, sorting harus dilakukan di query, bukan di JS).
3. Cara halaman edit produk/merchandise menyimpan category_id (apakah produk bisa dipindah dari/ke kategori Merchandise).

TAHAP 2 — Implementasi:
1. Admin Produk: filter agar TIDAK memuat kategori Merchandise (jika getKategoriMerchandiseId() null, tampilkan semua). Admin Merchandise tetap hanya merchandise. Pastikan teks kosong/pesan di kedua halaman masuk akal.
2. Server Action reorder: sediakan versi per kelompok (mis. reorderProdukAction dan reorderMerchandiseAction, atau satu action dengan parameter kelompok). Validasi di server: semua id yang dikirim memang milik kelompok itu (kategori Merchandise vs bukan), tolak jika tidak. Update urutan = index per baris. ProdukTable menerima action reorder sebagai prop.
3. Tambah produk baru: urutan = nilai urutan tertinggi DI KELOMPOK yang sama + 1 (merchandise baru di menu Merchandise -> akhir kelompok merchandise; produk baru -> akhir kelompok produk). Jika sebuah produk dipindah antar kelompok lewat edit kategori, urutannya diset ke akhir kelompok tujuan.
4. Landing ProdukSection: tambahkan filter keluarkan merchandise. Waspada NULL: kategori null harus tetap ikut (jangan memakai not-ilike sederhana yang membuang baris category_nama_id null; gunakan or('category_nama_id.is.null,category_nama_id.not.ilike.merchandise') atau setara yang sudah diuji). Pertahankan order urutan dan limit.
5. /katalog: tambahkan opsi sort baru "urutan" sebagai DEFAULT dengan label i18n (id: "Urutan Pilihan", en: "Featured Order"), opsi lain (harga naik/turun, terbaru bila ada) tetap tersedia. Sort 'urutan': non-merchandise dulu lalu merchandise, tiap kelompok urutan naik, tie-break created_at desc. Implementasi di query bila bisa (mis. dua query/union) atau di JS bila tidak ada pagination (sesuai hasil audit). Filter kategori yang sudah ada tetap bekerja.
6. Data lama: urutan existing mungkin bentrok/semua 0. Tidak perlu SQL; reorder pertama di tiap kelompok menormalkan 0..n. Jelaskan di plan.md.
7. Test: unit test fungsi murni pembanding sort katalog (kelompok merch di akhir, urutan naik, tie-break) dan fungsi hitung urutan berikutnya per kelompok.

Skenario uji Alif (tulis di plan.md): (a) di Admin Produk geser urutan produk -> Merchandise tidak berubah; (b) di Admin Merchandise geser urutan -> Produk tidak berubah; (c) landing menampilkan 6 produk non-merchandise sesuai urutan admin; (d) /katalog default urut sesuai admin (produk lalu merchandise) dan opsi harga masih jalan; (e) merchandise baru muncul paling akhir di kelompoknya; (f) dashboard merchandise user tetap berurutan.

Verifikasi: pnpm tsc --noEmit, pnpm lint, pnpm test. Laporkan di plan.md ("Modul 15 — F15.8"). Tambah F15.8 di feature-registry.md status TODO.
```

---

## Prompt 9 — Sinkron dokumen (setelah Prompt 1–8 selesai dan Alif sudah uji)

```
Sinkronkan dokumen dengan kondisi aktual Modul 15. Jangan mengubah kode.

1. ENGINEERING.md: tambah ADR-028 "Tambahan Abi pasca meeting 4 Okt (Modul 15)": Konteks (9 permintaan Abi), Keputusan (urutan seragam panah via hook useReorderList; checkbox DataTable default off; hapus batch diblokir bila ada pendaftar, FK tidak diubah; kategori peserta dan metode kelas teori lewat flag kategori; urutan produk/merchandise per kelompok dan /katalog default urutan admin), Konsekuensi (2 SQL: butuh_kategori_peserta + kategori_peserta nullable; butuh_metode_kelas_teori + batches.metode_kelas_teori + CHECK). Update §3.7 (skema tambahan) dan baris riwayat bertanggal.
2. PRD.md: update bagian fitur terkait (halaman /pelatihan "Direktori Pelatihan & Sertifikasi", /katalog "Hexatara Marketplace", aturan pas foto background merah, pendaftaran SiDOPI, kelas teori RPC, aturan hapus batch, urutan Admin). Jangan menambah larangan baru di §13 kecuali relevan.
3. feature-registry.md: tambah Modul 15 F15.1–F15.8 dengan status sesuai yang Alif konfirmasi (default TODO), daftar file kunci, dan baris log. JANGAN menandai DONE tanpa konfirmasi eksplisit Alif.
4. Tandai di PRD/ENGINEERING bahwa pengubahan menu Admin dengan angka urutan ke panah adalah standar baru: setiap menu Admin baru yang punya urutan wajib memakai ReorderButtons + useReorderList.
5. Laporkan di plan.md ("Modul 15 — sinkron dokumen") daftar perubahan dan ketidakkonsistenan yang ditemukan.
```

---

## Checklist uji akhir untuk Alif (setelah semua prompt)

1. `/pelatihan` dan `/katalog`: judul + subjudul benar di ID dan EN, navbar "Marketplace".
2. Semua form pas foto menyebut "(Background Merah)".
3. Tidak ada checkbox di tabel Admin.
4. Hapus batch: tanpa pendaftar berhasil, dengan pendaftar ditolak dengan pesan jelas.
5. Pendaftaran non-SiDOPI tanpa Baru/Renewal; SiDOPI tetap wajib.
6. Batch RPC: Jadwal Kelas Teori + Metode (Virtual/Hybrid/Tatap Muka) di Admin dan publik.
7. Semua menu Admin mengatur urutan dengan panah; tidak ada input angka urutan.
8. Urutan Produk dan Merchandise saling independen; landing dan `/katalog` mengikuti.
9. Setelah lolos, tandai DONE di registry dan jalankan Prompt 9.
