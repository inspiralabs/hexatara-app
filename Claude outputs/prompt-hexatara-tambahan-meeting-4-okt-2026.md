# Panduan Prompt — Tambahan Hexatara (Hasil Meeting 4 Oktober 2026)

Satu file berisi: keputusan final, SQL (jalankan sekali), lalu prompt Cursor
berurutan dari yang paling mudah ke yang paling sulit.

| Urutan | Prompt | Isi | Butuh SQL |
|---|---|---|---|
| 0 | SQL | Semua perubahan database sekaligus | (dijalankan Alif) |
| 1 | Badge Autel | Pill "Autel Robotics Authorized Dealer" di hero | Tidak |
| 2 | Pendaftaran Kelompok | Ganti label, minimal 3 peserta, template tanpa baris contoh | Tidak |
| 3 | Instruktur | Foto portrait 4:5, Bio jadi Catatan, tombol Detail | Tidak |
| 4 | Partner Kami | Section publik + CRUD menu Konten | Ya (B) |
| 5 | Tutup Freemium LMS | Saklar buka/tutup, gerbang di server, pratinjau admin | Ya (A, opsional) |
| 6A | Program + Lokasi Praktek | Flag kategori, CRUD Lokasi Praktek, filter /pelatihan?kategori= | Ya (C, D) |
| 6B | SiDOPI: pendaftaran individu | Lokasi + ukuran baju di form, tampilan & export admin | Ya (E) |
| 6C | SiDOPI: pendaftaran kelompok | Template/parser Excel dinamis, tampilan admin | Ya (E) |
| 7 | Sinkronisasi dokumen | PRD, ENGINEERING, feature-registry, plan, AS_BUILT, UAT | Tidak |

Cara pakai: jalankan SQL Bagian 0 (cukup sebelum Prompt 4), lalu berikan prompt
ke Cursor satu per satu. Setelah tiap prompt: Alif uji di browser, konfirmasi
hasilnya, baru lanjut ke prompt berikutnya.

---

## Keputusan final (jangan ditanyakan ulang ke Alif)

Dilaporkan hanya jika kode yang ditemukan berbeda dari asumsi di sini.

1. **Badge:** teks persis `Autel Robotics Authorized Dealer`, tampil sebagai pill
   dengan ikon centang, di bawah kalimat "Jual Drone Profesional Autel".
2. **Foto instruktur:** rasio portrait 4:5 (800×1000px). Foto lama yang kotak
   wajib diupload ulang oleh Hexatara. Selama belum diganti, tampilan publik
   memotong otomatis dengan fokus atas.
3. **Bio instruktur:** hanya label yang berubah menjadi **Catatan** (internal
   tim Hexatara, satu bahasa). Nama kolom database TIDAK diubah.
4. **LMS Freemium:** saat ditutup, CTA ke LMS disembunyikan (bukan dinonaktifkan),
   URL LMS menampilkan halaman ramah "Materi sedang disiapkan", admin yang login
   tetap bisa pratinjau dengan strip penanda. User lama tetap bisa melihat
   sertifikat dan upgrade. Data saat ini masih dummy, jadi aman.
5. **Tiga program** (RPC, Advanced, SiDOPI) memakai `batch_categories`. Pemisahan
   di sisi publik lewat filter di `/pelatihan` dengan parameter URL yang bisa
   dibagikan, tanpa rute baru.
6. **Lokasi praktek:** daftar kota global (bukan per batch), dikelola di Admin
   Batch tepat di bawah "Kategori Pelatihan". Di Excel kelompok diisi per
   peserta, dicocokkan ke daftar kota aktif.
7. **Pendaftaran Kelompok:** minimal 3 peserta (3 boleh, 1 sampai 2 ditolak).
   Field nama diberi label "Nama Kelompok" dengan petunjuk "mis. perusahaan,
   komunitas, atau instansi". Template Excel tanpa baris contoh.

---

## Aturan umum (berlaku untuk SEMUA prompt di bawah)

1. **Agent tidak pernah mengeksekusi DDL.** SQL di Bagian 0 dijalankan manual
   oleh Alif di Supabase SQL Editor. Setelah Alif konfirmasi SQL jalan,
   generate ulang `src/types/database.ts` memakai perintah yang biasa dipakai
   (di PowerShell pipe ke `| Out-File -Encoding utf8`, jangan `>`), lalu
   `pnpm tsc --noEmit`.
2. **Baca dulu sebelum menulis kode:** `CLAUDE.md`, `PRD.md` Bagian 0 dan §13
   (larangan anti scope creep), `ENGINEERING.md` (ADR terakhir), 
   `feature-registry.md`, `plan.md`. Setiap prompt menyebut file spesifik yang
   harus dibaca ulang. Kalau kode berbeda dari asumsi di prompt, **berhenti dan
   laporkan**, jangan menebak.
3. **Paparkan rencana singkat** sebelum menulis kode.
4. **Jangan menambah fitur di luar permintaan** (filter, export, kolom, atau
   halaman tambahan). Kalau ada ide tambahan, tulis sebagai saran di akhir
   laporan, bukan dikerjakan.
5. **Jangan pernah menandai DONE di `feature-registry.md`.** Status tetap TODO
   sampai Alif konfirmasi sudah menguji sendiri di browser.
6. **Penomoran dokumen:** batch permintaan ini memperoleh Modul, ADR, dan
   nomor F baru. Cek `ENGINEERING.md` dan `feature-registry.md` untuk nomor
   bebas berikutnya. Perkiraan: Modul 14, ADR-027, F14.1 sampai F14.6 (pemetaan:
   F14.1 badge, F14.2 kelompok, F14.3 instruktur, F14.4 partner, F14.5 freemium,
   F14.6 program/SiDOPI). Prompt 1 membuat ADR dan baris registry; prompt
   berikutnya memperluas sub-bagian "Diperluas [tanggal]" pada ADR yang sama.
7. Setiap prompt diakhiri `pnpm tsc --noEmit` dan `pnpm lint` (harus bersih),
   lalu laporan ringkas di `plan.md` (bagian terpisah per prompt, jangan menimpa
   bagian lain).
8. Uji tampilan di desktop, lebar HP 390px, mode gelap, dan kedua locale (ID dan
   EN) untuk semua perubahan yang terlihat user.

---

# BAGIAN 0 — SQL (dijalankan Alif sekali, di Supabase SQL Editor)

Semua perintah idempotent (aman dijalankan ulang). Tabel yang dirujuk dan sudah
ada: `batch_categories`, `batch_registrations`,
`company_registration_participants`, `site_settings`, `profiles`. Kalau ada
error "relation/column does not exist", **berhenti dan laporkan pesan
errornya**; jangan diubah sendiri.

```sql
-- =====================================================================
-- A. Saklar akses LMS Freemium (dipakai Prompt 5) — OPSIONAL
-- Default TERTUTUP. Kode membaca fail-closed: baris tidak ada = tertutup,
-- jadi kalau blok ini gagal, aplikasi tetap aman dan saklar bisa disimpan
-- lewat Admin > Pengaturan setelah Prompt 5 selesai.
-- =====================================================================
do $$
begin
  if not exists (select 1 from public.site_settings where key = 'freemium_lms_open') then
    insert into public.site_settings (key, value) values ('freemium_lms_open', 'false');
  end if;
end $$;

-- =====================================================================
-- B. Partner Kami (dipakai Prompt 4)
-- =====================================================================
create table if not exists public.partners (
  id bigint generated always as identity primary key,
  nama text not null,
  logo_url text not null,
  urutan integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.partners is
  'Modul 14 — logo & nama mitra/partner yang tampil di landing page, tepat di bawah section Instruktur Kami. logo_url = path file di bucket storage content (folder partners/).';

create index if not exists idx_partners_active_urutan
  on public.partners (is_active, urutan);

alter table public.partners enable row level security;

drop policy if exists "partners: publik baca yang aktif" on public.partners;
create policy "partners: publik baca yang aktif"
  on public.partners
  for select
  using (is_active = true);

drop policy if exists "partners: admin kelola" on public.partners;
create policy "partners: admin kelola"
  on public.partners
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- =====================================================================
-- C. Lokasi Praktek (dipakai Prompt 6A, 6B, 6C)
-- Daftar kota GLOBAL. Kota yang sudah dipakai pendaftar tidak boleh dihapus,
-- hanya dinonaktifkan (FK on delete restrict).
-- =====================================================================
create table if not exists public.practice_locations (
  id bigint generated always as identity primary key,
  nama_kota text not null,
  urutan integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.practice_locations is
  'Modul 14 — kota tempat praktek pelatihan (mis. SiDOPI). Materi teori seragam, praktek di kota masing-masing. Daftar global, bukan per batch.';

create unique index if not exists uq_practice_locations_nama_kota
  on public.practice_locations (lower(nama_kota));

alter table public.practice_locations enable row level security;

drop policy if exists "lokasi praktek: publik baca yang aktif" on public.practice_locations;
create policy "lokasi praktek: publik baca yang aktif"
  on public.practice_locations
  for select
  using (is_active = true);

drop policy if exists "lokasi praktek: admin kelola" on public.practice_locations;
create policy "lokasi praktek: admin kelola"
  on public.practice_locations
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- =====================================================================
-- D. Flag per kategori pelatihan (dipakai Prompt 6A)
-- Perilaku khusus SiDOPI dikendalikan lewat flag ini, BUKAN hardcode
-- nama/slug "sidopi" di kode. Admin mencentangnya di form kategori.
-- =====================================================================
alter table public.batch_categories
  add column if not exists butuh_lokasi_praktek boolean not null default false;
alter table public.batch_categories
  add column if not exists butuh_ukuran_baju boolean not null default false;

comment on column public.batch_categories.butuh_lokasi_praktek is
  'Modul 14 — true: form pendaftaran batch kategori ini wajib memilih lokasi praktek.';
comment on column public.batch_categories.butuh_ukuran_baju is
  'Modul 14 — true: form pendaftaran batch kategori ini wajib memilih ukuran baju.';

-- =====================================================================
-- E. Kolom lokasi praktek & ukuran baju di data pendaftar (Prompt 6B, 6C)
-- Nullable: pendaftaran lama dan kategori non-SiDOPI tidak terpengaruh.
-- =====================================================================
alter table public.batch_registrations
  add column if not exists practice_location_id bigint
    references public.practice_locations(id) on delete restrict;
alter table public.batch_registrations
  add column if not exists ukuran_baju text;

alter table public.company_registration_participants
  add column if not exists practice_location_id bigint
    references public.practice_locations(id) on delete restrict;
alter table public.company_registration_participants
  add column if not exists ukuran_baju text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_batch_registrations_ukuran_baju') then
    alter table public.batch_registrations
      add constraint chk_batch_registrations_ukuran_baju
      check (ukuran_baju is null or ukuran_baju in ('S','M','L','XL','XXL'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'chk_company_participants_ukuran_baju') then
    alter table public.company_registration_participants
      add constraint chk_company_participants_ukuran_baju
      check (ukuran_baju is null or ukuran_baju in ('S','M','L','XL','XXL'));
  end if;
end $$;

create index if not exists idx_batch_registrations_practice_location
  on public.batch_registrations (practice_location_id);
create index if not exists idx_company_participants_practice_location
  on public.company_registration_participants (practice_location_id);
```

Query verifikasi setelah SQL jalan (hasil dikirim ke Claude/Cursor):

```sql
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and ((table_name = 'batch_categories' and column_name in ('butuh_lokasi_praktek','butuh_ukuran_baju'))
    or (table_name in ('batch_registrations','company_registration_participants')
        and column_name in ('practice_location_id','ukuran_baju'))
    or table_name in ('partners','practice_locations'))
order by table_name, ordinal_position;

select key, value from public.site_settings where key = 'freemium_lms_open';
select id, public from storage.buckets where id in ('content','materials');
```

Rollback (jangan dijalankan kecuali perlu; tabel harus kosong dulu):

```sql
-- drop table if exists public.partners;
-- alter table public.company_registration_participants drop column if exists practice_location_id, drop column if exists ukuran_baju;
-- alter table public.batch_registrations drop column if exists practice_location_id, drop column if exists ukuran_baju;
-- alter table public.batch_categories drop column if exists butuh_lokasi_praktek, drop column if exists butuh_ukuran_baju;
-- drop table if exists public.practice_locations;
-- delete from public.site_settings where key = 'freemium_lms_open';
```

---

# PROMPT 1 — Badge "Autel Robotics Authorized Dealer" (paling mudah)

## Konteks

Hexatara meminta legitimasi brand di hero landing page: frasa **Autel Robotics
Authorized Dealer** tepat di bawah kalimat "Jual Drone Profesional Autel" pada
hero section (card branding). Tidak ada SQL.

## Langkah wajib sebelum menulis kode

1. Cari teks "Jual Drone Profesional Autel" (komponen hero dan file pesan
   terjemahan next-intl ID/EN) untuk menemukan komponen persisnya. Laporkan
   path file sebelum mengubah.
2. Baca ulang pola komponen badge/pill yang sudah ada di project (jangan
   membuat gaya baru).

## Spesifikasi

- Tambah pill badge tepat di bawah kalimat tersebut: ikon centang/verifikasi
  (lucide, mis. `BadgeCheck`) + teks `Autel Robotics Authorized Dealer`.
- Teks adalah nama resmi: isi sama di ID dan EN, tetapi tetap lewat file
  terjemahan (kedua locale).
- Pakai token warna yang sudah ada, kontras terjaga di mode terang dan gelap.
- Di HP 390px tidak boleh membuat hero melebar atau teks terpotong; boleh wrap
  rapi ke dua baris.
- Jangan mengubah elemen hero lain.

## Testing sequence

1. Beranda desktop: pill tampil di bawah kalimat yang benar.
2. Lebar 390px: tidak ada horizontal scroll, pill rapi.
3. Locale EN dan mode gelap: tampil benar.
4. `pnpm tsc --noEmit` dan `pnpm lint` bersih.

## Dokumentasi

1. `plan.md`: ringkas perubahan + file, status "menunggu uji Alif".
2. `ENGINEERING.md`: buat **ADR baru** (nomor berikutnya, perkiraan ADR-027)
   "Tambahan Hexatara hasil meeting 4 Okt 2026" berisi daftar 6 permintaan dan
   keputusan final di atas; tambah entri Bagian 11. Sub-bagian pertama:
   F14.1 badge.
3. `feature-registry.md`: tambah baris F14.1 sampai F14.6, semuanya **TODO**
   (F14.1 Berkas: file hero + pesan; Bukti: "selesai dikodekan, menunggu uji
   Alif"; F14.2 sampai F14.6 Bukti: "belum dikerjakan").
4. Jangan menandai DONE.

## Saran pesan commit

```
feat(landing): badge Autel Robotics Authorized Dealer di hero (F14.1)

- Pill badge dengan ikon centang di bawah kalimat "Jual Drone Profesional Autel"
- Teks lewat file terjemahan ID/EN

Ref: ADR-027 (nomor sesuai ENGINEERING.md), F14.1
```

---

# PROMPT 2 — Pendaftaran Kelompok, minimal 3 peserta

## Konteks

Lanjutan F13.5 (ADR-026). Istilah "Pendaftaran Perusahaan" berubah menjadi
**"Pendaftaran Kelompok"** dengan syarat **minimal 3 peserta**. Tidak ada SQL.
Hanya label dan validasi; nama tabel (`company_registrations`), rute
(`/admin/pendaftaran-perusahaan`), nama file, dan nilai `jenis:
'pendaftaran_perusahaan'` pada email **TIDAK diubah**. Alasannya: mengubahnya
berisiko dan tidak terlihat user. Catat ini sebagai catatan teknis di ADR.

## Langkah wajib sebelum menulis kode

1. Baca ulang file hasil F13.5: `daftar-perusahaan-dialog.tsx`,
   `daftar-perusahaan-actions.ts`, `src/lib/company-registration/import.ts`,
   `src/lib/validations/company-registration.ts`,
   `admin/pendaftaran-perusahaan/*`, `src/lib/email/templates.ts` (cabang
   `pendaftaran_perusahaan`), `admin-shell.tsx`.
2. Jalankan pencarian (grep) untuk semua kemunculan teks tampil
   "Perusahaan"/"perusahaan" dan "Komunitas" terkait fitur ini (UI, toast,
   email, pesan WA, header export, judul halaman, metadata, file pesan
   terjemahan). Laporkan daftarnya dulu.

## Spesifikasi

**A. Ganti label (hanya teks tampil):**
- Tombol detail pelatihan: "Daftar sebagai Kelompok".
- Judul dialog, state sukses, toast, pesan WA pre-filled, teks email notifikasi
  Admin (judul/body), menu Admin "Pendaftaran Kelompok", judul halaman, header
  kolom tabel, nama file dan header export Excel, deskripsi/metadata.
- Field `nama_perusahaan`: label **"Nama Kelompok"**, petunjuk (helper text)
  **"mis. perusahaan, komunitas, atau instansi"**, pesan error "Nama kelompok
  wajib diisi". Nama kolom database tidak berubah.
- Cakup kedua locale.

**B. Minimal 3 peserta:**
- Konstanta `MIN_PESERTA_KELOMPOK = 3` di satu tempat (validations/import).
  Bukan constraint database (aturan bisa berubah).
- Cek di **server** (server action) setelah seluruh baris Excel valid. Kalau
  jumlah baris valid kurang dari 3: tolak total, tidak ada data masuk ke
  database/storage, kembalikan pesan "Pendaftaran kelompok minimal 3 peserta.
  Terbaca: N peserta. Untuk 1 sampai 2 orang, gunakan Daftar Individu."
- Kalau ada baris gagal validasi, tampilkan daftar baris gagal terlebih dahulu
  (all-or-nothing tetap berlaku); cek minimal dilakukan setelah semua baris
  valid.
- Pastikan baris kosong di akhir sheet TIDAK ikut terhitung peserta.
- Dialog menampilkan teks informasi di dekat upload: "Minimal 3 peserta."
- Tampilkan state error minimal di dialog dengan gaya yang sama seperti daftar
  baris gagal (tanpa komponen baru yang tidak perlu).

**C. Template Excel tanpa baris contoh:**
- Template yang diunduh (client-side) hanya berisi header `Nama Lengkap`,
  `WhatsApp`, `Email`, tanpa baris contoh. Sheet tetap "Peserta".
- Tambahkan petunjuk singkat di dialog tepat di dekat tombol unduh (mis. "Isi
  satu peserta per baris, mulai dari baris kedua").

## Testing sequence

1. Detail pelatihan: tombol berlabel "Daftar sebagai Kelompok"; layout tidak
   bergeser.
2. Unduh template: hanya header, tanpa baris contoh.
3. Upload file berisi 2 peserta valid: ditolak dengan pesan minimal 3, cek
   database `company_registrations` dan participants TIDAK bertambah.
4. Upload file 3 peserta valid: sukses, WA dan email memakai istilah Kelompok.
5. Upload 3 baris dengan 1 baris salah: ditolak seluruhnya dengan daftar baris.
6. Admin: menu, judul, tabel, export memakai istilah Kelompok; data lama tetap
   tampil.
7. Locale EN dan HP 390px.
8. Regresi: Daftar Individu tidak berubah.

## Dokumentasi

1. `plan.md`: ringkas, status "menunggu uji Alif".
2. `ENGINEERING.md`: perluas ADR batch ini (F14.2): catat keputusan "label saja,
   rute dan tabel tetap `company_*`", konstanta minimal 3 dan lokasi
   penegakannya. Update Bagian 11.
3. `feature-registry.md`: baris F14.2 kolom Berkas dan Bukti, status TETAP TODO.
   Tambahkan catatan di baris F13.5 bahwa istilahnya kini "Pendaftaran
   Kelompok" (status F13.5 tidak diubah).

## Saran pesan commit

```
feat(pendaftaran-kelompok): ganti istilah perusahaan jadi kelompok, minimal 3 peserta (F14.2)

- Label UI, email, pesan WA, export memakai "Pendaftaran Kelompok"
  (tabel dan rute company_* tidak diubah)
- Server menolak pendaftaran kurang dari 3 peserta tanpa menyimpan data
- Template Excel tanpa baris contoh

Ref: ADR-027, F14.2, ADR-026
```

---

# PROMPT 3 — Instruktur: foto portrait, Catatan, tombol Detail

## Konteks

Tidak ada SQL. Kolom database instruktur (bio dan variannya) **TIDAK diubah
namanya dan tidak dihapus**: hanya label dan form yang berubah.

## Langkah wajib sebelum menulis kode

1. Temukan komponen publik "Instruktur Kami" dan halaman/form Admin CRUD
   instruktur (laporkan path). Baca ulang pola `FileUploadField`, preset kompresi
   gambar upload, dan pola dialog Detail (mis. Detail pesanan merchandise).
2. **Telusuri semua pemakaian** field bio (dan varian bahasa Inggrisnya): form,
   tabel Admin, tampilan publik, metadata/JSON-LD, pencarian, fallback query.
   Laporkan hasilnya sebelum menghapus apa pun dari form. Pastikan bio **tidak
   dirender di halaman publik mana pun** setelah perubahan; publik hanya
   menampilkan nama dan jabatan.

## Spesifikasi

**A. Rasio portrait:**
- Foto instruktur publik memakai kontainer `aspect-[4/5]` dengan `object-cover`
  dan `object-top` (wajah aman). Sesuaikan grid agar kartu portrait proporsional
  di desktop dan HP (jangan merusak layout section).
- Form Admin: pratinjau foto memakai rasio 4:5; teks bantuan menjadi **"Format
  JPG, PNG, atau WebP, maksimal 5.0 MB sebelum kompresi. Disarankan rasio
  portrait 4:5 (sekitar 800×1000px)."** Pastikan preset kompresi tidak
  menurunkan sisi terpanjang di bawah 1000px.
- Thumbnail di tabel Admin ikut rasio 4:5.
- Penanda foto lama: di tabel Admin, tampilkan badge kecil "Perlu foto portrait"
  untuk foto yang rasionya belum portrait (deteksi dari ukuran natural gambar di
  sisi client). Hexatara akan mengupload ulang semua foto; badge membantu
  menandai mana yang belum.

**B. Bio menjadi Catatan:**
- Label form "Catatan" dengan petunjuk "Catatan internal tim Hexatara, tidak
  tampil di website." Satu field saja, Bahasa Indonesia, tanpa varian bahasa
  Inggris.
- Sembunyikan field bahasa Inggris dari form dan schema validasi (jangan wajib).
  **Pastikan aksi simpan tidak menimpa kolom tersembunyi dengan null/kosong**
  (update hanya kolom yang dikirim).
- Header kolom tabel Admin "Catatan" (kalau ada kolom bio di tabel), dipotong
  rapi.

**C. Tombol Detail:**
- Setiap baris instruktur Admin punya tombol **Detail** yang membuka dialog
  read-only: foto 4:5, nama, jabatan, catatan (teks lengkap), status aktif,
  urutan. Tombol Ubah/Hapus yang ada tidak berubah.
- Tampilan publik tidak berubah selain rasio foto (nama dan jabatan saja).

## Testing sequence

1. Publik: kartu instruktur portrait, wajah tidak terpotong untuk foto kotak
   lama, grid rapi di 390px.
2. Admin form: teks bantuan baru; upload foto portrait; pratinjau 4:5.
3. Label "Catatan" tampil; simpan tanpa mengubah kolom bahasa Inggris (cek
   database tidak ter-null).
4. Tombol Detail membuka dialog dengan data lengkap.
5. Badge "Perlu foto portrait" muncul pada foto kotak dan hilang setelah upload
   ulang foto portrait.
6. Cek publik: catatan tidak tampil di mana pun.

## Dokumentasi

1. `plan.md`, `ENGINEERING.md` (perluas ADR, F14.3, catat keputusan "label
   saja, kolom tidak diubah"), `feature-registry.md` (F14.3 TODO, Bukti
   "menunggu uji Alif").

## Saran pesan commit

```
feat(instruktur): foto portrait 4:5, Bio jadi Catatan internal, tombol Detail (F14.3)

- Kartu publik dan form Admin memakai rasio 4:5; badge penanda foto lama
- Label Bio menjadi Catatan (kolom database tidak diubah, field Inggris disembunyikan)
- Dialog Detail instruktur di Admin; publik tetap nama dan jabatan

Ref: ADR-027, F14.3
```

---

# PROMPT 4 — Section "Partner Kami" + CRUD

## Prasyarat

SQL Bagian 0 blok **B** sudah dijalankan Alif dan dikonfirmasi; `database.ts`
sudah digenerate ulang; `pnpm tsc --noEmit` bersih.

## Langkah wajib sebelum menulis kode

1. Temukan section "Instruktur Kami" di landing page, menu "Konten" di
   `admin-shell.tsx`, dan salah satu CRUD Konten yang sudah ada (pola
   tabel+form+aksi+revalidate). Ikuti pola persis, laporkan path.
2. Baca ulang pola upload gambar ke bucket `content` (tentukan aturan policy
   storage untuk upload admin) dan preset kompresi gambar.

## Spesifikasi

**Admin (menu Konten):** item baru **"Partner Kami"**.
- Tabel `DataTable`: logo (thumbnail), nama, urutan, status aktif, aksi
  Ubah/Hapus.
- Form: nama (wajib), logo (upload via `FileUploadField` ke bucket `content`,
  folder `partners/`; terima PNG, WebP, JPG, **jangan SVG**; pertahankan
  transparansi PNG/WebP; teks bantuan "Disarankan logo transparan (PNG/WebP),
  lebar minimal 400px"), urutan (angka, makin kecil makin awal), aktif (switch).
- Hapus dengan dialog konfirmasi; hapus juga file logo di storage.
- Aksi create/update/delete memanggil revalidate untuk halaman beranda kedua
  locale (ikuti cara CRUD Konten lain).

**Publik:** section baru **tepat di bawah "Instruktur Kami"**.
- Judul "Partner Kami" (ID) dan "Our Partners" (EN) lewat file terjemahan.
- Isi: logo dan nama partner, urut `urutan asc, id asc`, hanya `is_active`.
- Tampilan: grid/flex wrap terpusat; setiap item kotak tinggi seragam, logo
  `object-contain` warna asli, nama di bawah logo (nama partner tidak
  diterjemahkan). `alt` = nama. `quality={90}` untuk logo (hindari buram).
- **Jika belum ada partner aktif, seluruh section tidak dirender** (tidak ada
  judul kosong).
- Responsif 390px dan mode gelap (logo gelap harus tetap terbaca: berikan latar
  kontainer netral terang di mode gelap).

## Testing sequence

1. Admin: tambah 3 partner (satu logo transparan, satu logo lebar, satu logo
   kotak), atur urutan, nonaktifkan satu.
2. Publik: section muncul tepat di bawah Instruktur Kami; yang nonaktif tidak
   tampil; urutan benar; logo tidak terdistorsi.
3. Hapus semua partner aktif: section hilang tanpa bekas.
4. Edit/hapus: halaman publik ter-update tanpa redeploy.
5. Mode gelap dan 390px; locale EN.
6. Upload SVG ditolak dengan pesan jelas.

## Dokumentasi

1. `plan.md`, `ENGINEERING.md` (F14.4: tabel `partners`, reuse bucket `content`),
   `feature-registry.md` (F14.4 Berkas, TODO). Update Bagian 11.

## Saran pesan commit

```
feat(konten): section Partner Kami di landing + CRUD Admin (F14.4)

- Tabel partners (usulan SQL, sudah dijalankan Alif), logo di bucket content
- Section publik di bawah Instruktur Kami, disembunyikan jika kosong
- Menu Konten > Partner Kami: tambah/ubah/hapus, urutan, aktif

Ref: ADR-027, F14.4
```

---

# PROMPT 5 — Tutup sementara LMS Freemium

## Konteks

Hexatara menutup akses LMS Freemium sementara selama materi dan kuis disiapkan.
Syarat: (a) publik tidak bisa membuka LMS; (b) banner di halaman pelatihan
hilang tanpa merusak layout; (c) tim admin Hexatara tetap bisa pratinjau; (d)
**orang yang masih memegang URL LMS juga tidak bisa masuk**. Karena itu
penutupan wajib ditegakkan **di server**, bukan hanya menyembunyikan tombol.

SQL: Bagian 0 blok **A** (opsional; kode fail-closed). Tidak ada tabel baru;
pakai `site_settings` dengan pola DB-first seperti `getWhatsappAdmin()` dan
`getAdminNotifyEmail()`.

## Langkah 1 — Diagnosis (WAJIB, laporkan dulu, tunggu persetujuan Alif)

Buat daftar lengkap, dengan path:
1. Semua rute LMS: `/materi/[id]`, pintu `/materi/get-free-certificate-rpc`,
   rute kuis, route group `(kelas)`, dan rute API/route handler yang melayani
   materi (PDF/PPT/video).
2. Semua Server Action LMS (mulai belajar, simpan progres, submit kuis, dan
   sejenisnya) dan mana yang **bukan** LMS (sertifikat, upgrade, transaksi,
   merchandise: ini TIDAK ditutup).
3. Semua tautan/CTA ke LMS: hero "Mulai Sekarang" (`getMateriHeroHref()`),
   banner di `/pelatihan/[slug]`, kartu/ajakan di `/dashboard/pelatihan`,
   `/dashboard/kursus`, navbar/footer, sitemap.
4. Apakah halaman pelatihan/beranda memakai cache/ISR (menentukan perlunya
   revalidate), dan apakah bucket `materials` bersifat publik (laporkan saja,
   jangan diubah).
5. Cara pengecekan admin yang dipakai di gerbang admin yang ada (`profiles.role =
   'admin'`) serta apakah sesi admin dari `/admin/login` terbaca di rute publik
   (cookie Supabase yang sama).

## Spesifikasi

**A. Helper (di `src/lib/site-settings.ts`):**
- `isFreemiumLmsOpen()`: baca `site_settings` key `freemium_lms_open`; hanya
  nilai `'true'` yang berarti terbuka. Baris tidak ada/error baca/nilai lain =
  **tertutup (fail-closed)**.
- `getFreemiumLmsAccess()` mengembalikan `{ open, isAdminPreview, allowed }`;
  `allowed = open || isAdmin(user)`. Gunakan helper cek admin yang sudah ada.
- Jangan cache lintas request (cukup `cache()` per-request React) supaya saklar
  langsung berlaku.

**B. Gerbang server (lapisan utama):**
- Di layout/page server semua rute LMS pada daftar langkah 1: jika `!allowed`,
  render halaman ramah **"Materi sedang disiapkan"** (ikon, judul, satu kalimat
  penjelasan bahwa materi sedang disempurnakan tim Hexatara, tombol "Kembali ke
  Pelatihan" ke `/pelatihan`). `robots: noindex`. Dua bahasa.
- Pintu `/materi/get-free-certificate-rpc` dan `/materi/[id]` untuk SEMUA id:
  cek gerbang **sebelum** redirect, jadi tidak ada redirect ke halaman LMS saat
  tertutup.
- Route handler/API materi: kembalikan 403 saat `!allowed`.
- Pengecualian: **jangan** menutup halaman dan aksi yang tidak termasuk LMS:
  dashboard sertifikat, transaksi, merchandise, upgrade. User lama tetap bisa
  melihat sertifikat dan upgrade.

**C. Server Action LMS:**
- Semua action LMS (daftar langkah 1) memanggil gerbang di awal; jika
  `!allowed` return `{ ok: false, error: 'lms_ditutup' }` dan UI menampilkan
  toast "Materi sedang disiapkan." Ini mencegah pemanggilan action langsung
  oleh pemegang URL/tab lama.

**D. Tampilan publik saat tertutup (sembunyikan, bukan nonaktifkan):**
- Banner freemium di `/pelatihan/[slug]`: tidak dirender, tanpa menyisakan jarak
  kosong.
- Tombol hero "Mulai Sekarang": ganti dengan CTA netral yang sudah ada polanya
  (mis. "Lihat Pelatihan" ke `/pelatihan`) agar hero tidak timpang. Laporkan
  pilihan elemen penggantinya di `plan.md`.
- Dashboard (`/dashboard/pelatihan`, `/dashboard/kursus`, kartu ajakan kursus):
  sembunyikan CTA ke LMS; jika section jadi kosong, tampilkan teks pelan
  "Materi gratis sedang disiapkan." Banner upgrade sertifikat dan merchandise
  (F13.4) tetap berfungsi normal untuk user yang berhak.
- Sitemap: keluarkan URL LMS saat tertutup.

**E. Saklar di Admin Pengaturan:**
- Card baru "Akses LMS Freemium" di `/admin/pengaturan`: Switch + status
  ("Terbuka untuk publik" / "Ditutup sementara") + penjelasan "Saat ditutup,
  publik tidak bisa membuka materi dan kuis. Admin tetap bisa pratinjau."
- Dialog konfirmasi sebelum mengubah status (AlertDialog).
- Server action `updateFreemiumLmsOpenAction(open)`: cek admin, upsert key
  `freemium_lms_open` di `site_settings` (`'true'`/`'false'`), lalu
  `revalidatePath('/', 'layout')` supaya banner, hero, dan halaman pelatihan
  langsung berubah tanpa redeploy.

**F. Strip pratinjau admin:**
- Saat `open = false` dan viewer adalah admin yang login: tampilkan strip di
  atas halaman LMS: "Mode pratinjau admin: LMS Freemium sedang ditutup untuk
  publik." Admin bisa membuka materi dan kuis seperti biasa.

## Testing sequence

1. Setelah SQL (atau tanpa baris): status tertutup. Anonim membuka
   `/materi/3`, `/materi/get-free-certificate-rpc`, URL kuis: tampil halaman
   "Materi sedang disiapkan".
2. Hero dan `/pelatihan/[slug]`: CTA LMS/banner hilang, layout utuh (cek
   desktop dan 390px, kedua locale).
3. User login yang sudah punya sertifikat pratinjau: dashboard sertifikat dan
   transaksi tetap berfungsi; URL LMS tetap tertutup.
4. Admin login: LMS bisa dibuka dengan strip pratinjau.
5. Serangan: panggil Server Action LMS (submit kuis/simpan progres) tanpa hak
   saat tertutup: ditolak `lms_ditutup`; URL materi langsung ditolak.
6. Buka saklar di Admin Pengaturan: banner, hero, dan LMS pulih seketika tanpa
   redeploy. Tutup lagi: kembali tertutup.
7. Sitemap tidak berisi URL LMS saat tertutup.
8. Laporkan status bucket `materials` (publik atau tidak) di `plan.md` sebagai
   batas yang diketahui: link file langsung tidak ikut tertutup.

## Dokumentasi

1. `plan.md`: daftar diagnosis, rute/action yang digerbang, elemen pengganti
   CTA hero, batas yang diketahui (bucket materials, kuis yang sedang berjalan
   hilang saat ditutup).
2. `ENGINEERING.md`: perluas ADR (F14.5): arsitektur 3 lapis (UI, gerbang
   server, server action), fail-closed, saklar global (alternatif per-course
   dicatat sebagai peluang lanjutan), cache dan revalidate. Update Bagian 11.
3. `feature-registry.md`: F14.5 TODO. `PRD.md`: tambahkan catatan saklar
   freemium di bagian fitur free track.

## Saran pesan commit

```
feat(lms): saklar tutup sementara LMS Freemium dengan gerbang di server (F14.5)

- site_settings.freemium_lms_open (default tertutup, fail-closed)
- Gerbang di rute LMS, route handler materi, dan Server Action; halaman
  "Materi sedang disiapkan" untuk publik, pratinjau untuk admin
- CTA/banner LMS disembunyikan saat tertutup; dashboard sertifikat dan upgrade tidak terpengaruh
- Saklar di Admin > Pengaturan + revalidate

Ref: ADR-027, F14.5
```

---

# PROMPT 6A — Tiga program via kategori + CRUD Lokasi Praktek

## Prasyarat

SQL Bagian 0 blok **C dan D** sudah dijalankan dan dikonfirmasi; `database.ts`
digenerate ulang; `pnpm tsc --noEmit` bersih.

## Konteks

Program **RPC (Remote Pilot Certificate)**, **Advanced**, dan **SiDOPI**
dipisah memakai tabel `batch_categories` yang sudah ada (tanpa entitas baru).
Perilaku khusus SiDOPI dikendalikan flag di kategori
(`butuh_lokasi_praktek`, `butuh_ukuran_baju`), **bukan** `if slug === 'sidopi'`.
Agent TIDAK membuat data kategori; Admin/Hexatara membuat tiga kategori lewat
UI setelah fitur ini selesai.

## Langkah wajib sebelum menulis kode

1. Baca ulang CRUD "Kategori Pelatihan" di Admin Batch (form, tabel, action),
   section Batch di `admin-shell.tsx`, halaman publik `/pelatihan` (filter
   kategori yang sudah ada dan cara filter membaca kategori), serta field nama
   bilingual kategori. Laporkan: apakah `batch_categories` punya kolom slug;
   jika tidak, slug diturunkan di kode dari nama (tanpa SQL).

## Spesifikasi

**A. Form Kategori Pelatihan (Admin):** dua checkbox: **"Perlu Lokasi Praktek"**
dan **"Perlu Ukuran Baju"**, dengan teks bantuan singkat (mis. "Centang untuk
program seperti SiDOPI: form pendaftaran akan menanyakan kota praktek"). Tabel
kategori menampilkan badge kecil bila flag aktif. Action simpan menyertakan dua
kolom baru.

**B. CRUD Lokasi Praktek (Admin Batch):**
- Item menu baru **"Lokasi Praktek"** tepat di bawah "Kategori Pelatihan" pada
  section menu Batch (ikuti pola route kategori).
- Tabel: Kota, Urutan, Status aktif, aksi. Form: nama kota (wajib), urutan
  (angka), aktif (switch).
- Nama kota unik tanpa membedakan huruf besar/kecil (ada unique index
  `lower(nama_kota)`); tangkap error konflik dan tampilkan pesan ramah "Kota
  sudah ada".
- **Hapus:** hitung pemakaian di `batch_registrations` dan
  `company_registration_participants`; jika sudah dipakai, tolak dengan pesan
  "Sudah dipakai pendaftar, nonaktifkan saja." Tangkap juga error FK sebagai
  pengaman akhir.
- Tanpa fitur lain (jangan menambah kolom/filter tak diminta).

**C. Filter program di `/pelatihan`:**
- Filter kategori yang ada dipertahankan dan **diikat ke parameter URL**
  `?kategori=<slug>` (dibaca di server dari `searchParams`) sehingga tautan
  `/pelatihan?kategori=sidopi` bisa dibagikan dan membuka langsung hasil yang
  terfilter, dengan chip/tab kategori aktif ter-highlight.
- Parameter tidak valid diabaikan (tampilkan semua). Tanpa rute baru.
- Jaga tampilan halaman pelatihan, kedua locale.

## Testing sequence

1. Admin Batch: buat tiga kategori (RPC, Advanced, SiDOPI); centang kedua flag
   hanya di SiDOPI; badge tampil di tabel.
2. Menu "Lokasi Praktek" muncul tepat di bawah Kategori Pelatihan; tambah 3 kota,
   nonaktifkan satu; tambah kota duplikat berbeda huruf besar-kecil: ditolak
   ramah.
3. Buat batch di tiap kategori; di `/pelatihan` filter kategori bekerja dan URL
   `?kategori=sidopi` bisa dibuka langsung (tab baru) dengan filter aktif.
4. Hapus kota yang belum dipakai: berhasil. (Uji hapus kota yang sudah dipakai
   dilakukan setelah 6B.)
5. HP 390px dan locale EN.

## Dokumentasi

1. `plan.md`, `ENGINEERING.md` (perluas ADR, F14.6a: keputusan flag kategori
   alih-alih hardcode slug, daftar kota global, filter via URL), 
   `feature-registry.md` (F14.6 TODO, Bukti: "6A selesai dikodekan").

## Saran pesan commit

```
feat(batch): flag kategori SiDOPI, CRUD Lokasi Praktek, filter program via URL (F14.6a)

- Kategori pelatihan: flag butuh_lokasi_praktek dan butuh_ukuran_baju
- Admin Batch > Lokasi Praktek (CRUD kota global, hapus diblokir jika dipakai)
- /pelatihan?kategori=<slug> bisa dibagikan

Ref: ADR-027, F14.6
```

---

# PROMPT 6B — SiDOPI: pendaftaran individu + tampilan admin

## Prasyarat

6A selesai dan diuji Alif (kategori SiDOPI sudah dibuat dengan kedua flag
dicentang dan minimal 2 kota aktif).

## Langkah wajib sebelum menulis kode

1. Baca ulang `daftar-batch-dialog.tsx`, aksi pendaftaran batch
   (`daftarBatchAction` atau namanya), `pelatihan/[slug]/page.tsx`, halaman
   Admin "Pendaftaran Batch" dan "Peserta Pendaftaran" (tabel, detail, export),
   dan cara mengambil kategori batch. Laporkan relasi batch ke kategori.

## Spesifikasi

**A. Form publik (individu):**
- `page.tsx` mengambil flag kategori batch dan daftar `practice_locations`
  aktif (urut `urutan`), lalu meneruskan ke dialog.
- Dialog menampilkan field hanya bila flag aktif: **Lokasi Praktek** (Select
  dari kota aktif; helper "Materi teori seragam; praktek dilaksanakan di kota
  pilihan Anda") dan **Ukuran Baju** (Select S, M, L, XL, XXL). Wajib diisi bila
  muncul. Batch non-SiDOPI: tampilan dan alur tidak berubah sama sekali.
- **Server action adalah otoritas:** ambil flag kategori dari database
  berdasarkan `batch_id` (jangan percaya klien). Jika flag aktif: validasi lokasi
  ada dan aktif, ukuran termasuk daftar. Jika flag tidak aktif: abaikan dan
  simpan null untuk dua field itu.
- Simpan `practice_location_id` dan `ukuran_baju` di `batch_registrations`.
- Pesan WA pre-filled (jika ada pada alur ini) boleh menambahkan lokasi dan
  ukuran bila tersedia. Jangan menyentuh email `minat_batch` (sengaja ditahan
  sampai Fase 2).

**B. Tampilan Admin leads:**
- Admin "Pendaftaran Batch" dan "Peserta Pendaftaran" (individu): tampilkan
  kolom **Lokasi Praktek** (nama kota dari join) dan **Ukuran Baju** pada tabel
  dan dialog detail; "—" bila kosong.
- Export Excel kedua halaman menambah dua kolom itu.
- **Jangan menambah filter/fitur lain** (anti scope creep).

## Testing sequence

1. Batch SiDOPI: dialog menampilkan dua field wajib; submit tanpa pilihan
   ditolak; submit valid tersimpan (cek database kedua kolom terisi).
2. Batch RPC/Advanced: dialog identik seperti sebelum perubahan (regresi).
3. Serangan: kirim batch SiDOPI tanpa lokasi (modifikasi request): ditolak
   server. Kirim kota nonaktif atau id sembarang: ditolak. Kirim lokasi/ukuran
   pada batch non-SiDOPI: diabaikan (kolom null).
4. Admin: dua kolom tampil di tabel, detail, dan export (cek file Excel).
5. Uji hapus kota yang sudah dipakai di Admin > Lokasi Praktek: diblokir.
6. 390px dan locale EN.

## Dokumentasi

1. `plan.md`, `ENGINEERING.md` (F14.6b: validasi berbasis flag dari database,
   data null untuk non-SiDOPI), `feature-registry.md` (F14.6 Bukti diperbarui,
   tetap TODO).

## Saran pesan commit

```
feat(pendaftaran-batch): lokasi praktek dan ukuran baju untuk kategori SiDOPI (F14.6b)

- Field muncul hanya jika flag kategori aktif; validasi di server dari database
- Kolom Lokasi Praktek dan Ukuran Baju di Admin Pendaftaran Batch,
  Peserta Pendaftaran, dan export Excel

Ref: ADR-027, F14.6
```

---

# PROMPT 6C — SiDOPI: pendaftaran kelompok (Excel dinamis)

## Prasyarat

6B selesai dan diuji Alif.

## Langkah wajib sebelum menulis kode

1. Baca ulang hasil Prompt 2 dan F13.5: `daftar-perusahaan-dialog.tsx`,
   `daftar-perusahaan-actions.ts`, `src/lib/company-registration/import.ts`,
   `src/lib/import/spreadsheet.ts`, `admin/pendaftaran-perusahaan/*`.
   Laporkan di mana parsing dilakukan (server atau client) dan cara header
   dicocokkan.

## Spesifikasi

**A. Template Excel dinamis (client-side, `xlsx` dynamic import):**
- Dialog menerima flag kategori batch dan daftar kota aktif (dari
  `page.tsx`).
- Sheet "Peserta": header `Nama Lengkap`, `WhatsApp`, `Email` dan, bila flag
  aktif, `Lokasi Praktek` dan/atau `Ukuran Baju`. **Tanpa baris contoh.**
- Sheet kedua **"Daftar Pilihan"**: kolom "Lokasi Praktek" berisi kota aktif
  (urut `urutan`) dan kolom "Ukuran Baju" berisi S, M, L, XL, XXL. Hanya
  disertakan bila flag terkait aktif. (Library `xlsx` edisi komunitas tidak
  menulis data validation; jangan dipaksakan.)
- Batch non-SiDOPI: template tetap 3 kolom satu sheet (regresi).
- Teks bantuan di dialog menjelaskan pengisian dan menyebut sheet "Daftar
  Pilihan" untuk batch yang memakainya.

**B. Parser (`parsePesertaPerusahaan`, diperluas dengan opsi):**
- Parameter: `{ butuhLokasi, butuhUkuran, lokasiAktif: {id, nama}[] }`. Daftar
  kota **diambil server dari database** berdasarkan `batch_id` di dalam server
  action (bukan dari klien).
- Header dicocokkan dengan pola yang ada (tanpa membedakan huruf besar/kecil,
  trim). Kolom tambahan WAJIB ada bila flag aktif; jika tidak ditemukan,
  kembalikan error jelas: "Kolom 'Lokasi Praktek' tidak ditemukan. Unduh
  template terbaru." Bila flag tidak aktif, kolom tambahan diabaikan.
- Lokasi: dinormalisasi (trim, huruf kecil, spasi ganda dirapikan) lalu dicocokkan
  ke kota aktif; hasilnya `practice_location_id`. Tidak cocok: error baris
  "Baris N: lokasi 'xxx' tidak valid. Pilihan: A, B, C."
- Ukuran: dinormalisasi huruf besar; harus salah satu S, M, L, XL, XXL. Error:
  "Baris N: ukuran baju 'xxx' tidak valid. Pilihan: S, M, L, XL, XXL."
- **All-or-nothing tetap** dan **minimal 3 peserta** (dari Prompt 2) tetap
  ditegakkan setelah seluruh baris valid.

**C. Penyimpanan:** insert `company_registration_participants` dengan
`practice_location_id` dan `ukuran_baju` (null bila flag tidak aktif). File Excel
asli tetap diunggah ke bucket `company-registrations` seperti sekarang.

**D. Tampilan Admin "Pendaftaran Kelompok":**
- Dialog detail: tabel peserta menambah kolom **Lokasi Praktek** dan **Ukuran
  Baju** bila ada datanya ("—" bila kosong).
- Tidak ada filter/export baru. (Export daftar pendaftaran yang ada tidak
  memuat data per peserta; jika menurut Anda perlu ekspor peserta, tulis sebagai
  saran di laporan, jangan dikerjakan.)

## Testing sequence

1. Batch SiDOPI: unduh template: 5 kolom + sheet "Daftar Pilihan" berisi kota
   aktif dan ukuran.
2. Isi 3 peserta valid dengan kota berbeda: sukses; cek participants terisi
   `practice_location_id` dan `ukuran_baju`; detail Admin menampilkan keduanya.
3. Salah ketik kota ("Bogorr"): seluruh submit ditolak dengan nomor baris dan
   pilihan valid; tidak ada data masuk ke database maupun storage.
4. Kota yang dinonaktifkan: ditolak. Ukuran "XXXL": ditolak. Huruf kecil dan
   spasi berlebih ("  bogor ", "xl"): diterima.
5. Upload file lama 3 kolom pada batch SiDOPI: error "kolom tidak ditemukan".
6. Batch RPC/Advanced: template dan alur kelompok sama seperti Prompt 2
   (regresi), termasuk minimal 3.
7. 2 peserta SiDOPI valid: ditolak karena kurang dari 3.
8. 390px dan locale EN.

## Dokumentasi

1. `plan.md` (tandai F14.6 SELESAI DIKODEKAN seluruhnya, 6A+6B+6C), 
   `ENGINEERING.md` (F14.6c: parser berbasis flag, daftar kota diambil server,
   sheet Daftar Pilihan), `feature-registry.md` (F14.6 TETAP TODO, Bukti: "6A, 6B,
   6C selesai dikodekan, menunggu uji Alif").

## Saran pesan commit

```
feat(pendaftaran-kelompok): lokasi praktek dan ukuran baju via Excel untuk SiDOPI (F14.6c)

- Template Excel dinamis berdasarkan flag kategori + sheet Daftar Pilihan
- Parser mencocokkan lokasi ke kota aktif dan ukuran S-XXL, all-or-nothing
- Detail Admin Pendaftaran Kelompok menampilkan lokasi dan ukuran per peserta

Ref: ADR-027, F14.6
```

---

# PROMPT 7 — Sinkronisasi dokumen dengan kondisi aktual

## Konteks

Setelah Prompt 1 sampai 6C selesai dikodekan, semua dokumen proyek harus
mencerminkan kondisi **aktual** kode, bukan rencana. Prompt ini adalah audit
dokumen. Jangan mengubah kode aplikasi.

## Langkah

1. Audit dengan grep + baca kode (bukan hanya ringkasan `plan.md`) untuk
   memastikan tiap klaim di dokumen sesuai kenyataan.
2. Perbarui dokumen berikut dan laporkan tabel "dokumen, bagian, perubahan":
   - **`PRD.md`**: istilah "Pendaftaran Kelompok" (minimal 3 peserta), badge
     Autel Robotics Authorized Dealer, section Partner Kami, instruktur (foto
     portrait, Catatan internal), saklar akses LMS Freemium (status default,
     perilaku saat tertutup), program RPC/Advanced/SiDOPI dan field lokasi
     praktek/ukuran baju. Periksa §13 (larangan): pastikan tidak ada yang
     bertabrakan, dan jika ada keputusan baru yang memodifikasi larangan, tandai
     eksplisit untuk Alif (jangan diubah diam-diam).
   - **`ENGINEERING.md`**: ADR batch ini lengkap (konteks, keputusan, alternatif
     yang ditolak, catatan teknis: rute/tabel `company_*` tetap, kolom bio tetap,
     fail-closed freemium, flag kategori), skema database baru (partners,
     practice_locations, kolom baru) pada bagian skema, Bagian 11 riwayat
     perubahan struktur.
   - **`feature-registry.md`**: F14.1 sampai F14.6 lengkap kolom Berkas dan
     Bukti. Status tetap TODO untuk semua yang belum dikonfirmasi Alif.
     Pastikan baris F13.5 mencatat istilah baru.
   - **`plan.md`**: satu ringkasan penutup batch Modul 14.
   - **`docs/AS_BUILT`**: bagian landing page (badge, instruktur, partner),
     modul pelatihan/pendaftaran (program, lokasi praktek, kelompok), dan modul
     LMS/free track (saklar). Buat/ubah hanya bagian yang terdampak.
   - **`docs/UAT`**: `02-skenario-uji-uat.md`, `03-penjelasan-fitur.md`,
     `04-catatan-perubahan-inspiralabs.md`, `07-checklist-uji-internal.md`:
     tambahkan skenario uji dan penjelasan untuk enam permintaan baru (bahasa
     Indonesia awam seperti dokumen yang ada).
   - **`CLAUDE.md`**: hanya jika ada aturan kerja baru yang muncul (mis.
     konvensi fail-closed untuk saklar); jika tidak, tidak diubah.
3. Cari istilah usang yang masih tertinggal di dokumen ("Pendaftaran
   Perusahaan" sebagai nama menu, "Bio instruktur", dan sejenisnya) dan
   laporkan yang sengaja dipertahankan (nama teknis tabel/rute) beserta
   alasannya.

## Aturan

- Jangan menandai DONE apa pun. Registry hanya berubah menjadi DONE setelah Alif
  menguji dan mengonfirmasi.
- Jangan menambah klaim yang belum diverifikasi di kode.

## Saran pesan commit

```
docs: sinkronkan PRD, ENGINEERING, registry, AS_BUILT, dan UAT dengan tambahan Hexatara 4 Okt 2026

Ref: ADR-027, F14.1 sampai F14.6
```
