# Prompt Cursor — F11.2: Ringkasan Leads, grafik ditingkatkan, angka stat diperbesar (Dashboard Admin)

> Acuan: `ENGINEERING.md` ADR-024, `PRD.md` §9f (khusus 9f.4), `feature-registry.md` Sprint 10.
> Sprint 10 / Modul 11 (ADR-024). TIDAK bergantung SQL — bisa dikerjakan kapan saja, independen dari F11.1/F11.3. Tidak butuh tabel/kolom/view baru, murni query baca + tampilan.
>
> Governance yang tetap berlaku penuh (CLAUDE.md/PRD.md §13.1): JANGAN tambah dependency chart baru — `recharts` SUDAH jadi dependency proyek sejak ADR-019 (Fase 12.6), dipakai untuk membangun SEMUA chart baru di prompt ini. JANGAN tambah tabel/kolom baru — seluruhnya query baca dari tabel yang sudah ada.

## 0. Konteks yang WAJIB dipahami dulu sebelum mengubah kode

Baca dulu file-file ini secara utuh:

- `src/app/admin/(protected)/page.tsx` — file utama, `AdminHomePage`, tempat semua data dashboard di-fetch (`Promise.all` besar) dan diolah jadi `stats`/`buckets`/`recent`.
- `src/app/admin/(protected)/overview/stat-cards.tsx` — komponen `StatCards`, tempat 4 card ditampilkan, `CardTitle` dengan `text-2xl` adalah elemen yang perlu diperbesar.
- `src/app/admin/(protected)/overview/leads-trend-chart.tsx` — komponen chart tren yang sudah ada (garis tunggal), akan diubah jadi 2 garis.
- `src/app/admin/(protected)/overview/recent-leads-table.tsx` — komponen tabel aktivitas terbaru, TIDAK perlu diubah, hanya untuk referensi pola data `RecentLeadRow`.
- Cek `package.json` untuk versi `recharts` terpasang (`^3.10.1` per pengecekan terakhir) sebelum menulis kode chart baru, supaya API yang dipakai sesuai versi ini.

---

## Konteks — SUDAH DITELUSURI, jangan diasumsikan ulang

`AdminHomePage` (`src/app/admin/(protected)/page.tsx`) saat ini melakukan `Promise.all` mengambil:
- `lead7`/`lead7prev` — jumlah `batch_registrations` 7 hari terakhir vs 7 hari sebelumnya
- `quote7`/`quote7prev` — jumlah `quote_requests` 7 hari terakhir vs 7 hari sebelumnya
- `pending` — `certificate_orders` dengan status `menunggu_verifikasi`
- `certBulanIni`/`certBulanLalu` — jumlah `certificates` diterbitkan bulan ini vs bulan lalu
- `batchAktif` — jumlah `batches` dengan `is_active = true`
- `batchRegChart`/`quoteChart` — seluruh `created_at` dari `batch_registrations`/`quote_requests` 12 bulan terakhir, digabung jadi satu array `buckets` (`MonthBucket[]`, tren gabungan)
- `batchRegRecent`/`quoteRecent` — 10 baris terbaru masing-masing, digabung jadi tabel "Aktivitas terbaru"

`stats: StatCardItem[]` berisi 4 item: `leads` (gabungan lead7+quote7), `pending`, `certs`, `batches`. Ditampilkan lewat `<StatCards items={stats} />`, tiap angka di `CardTitle` pakai class `text-2xl font-semibold tracking-tight tabular-nums`.

`buckets` (12 bulan) dibangun dari GABUNGAN `batchRegChart.data` dan `quoteChart.data` jadi satu `total` per bulan — inilah yang membuat grafik jadi satu garis, padahal datanya sebenarnya sudah dipisah per query, tinggal tidak digabung.

Status yang ada di kode (`LABEL_STATUS_REG`/`LABEL_STATUS_QUOTE`):
```ts
const LABEL_STATUS_REG = { menunggu_verifikasi: 'Menunggu', disetujui: 'Disetujui', ditolak: 'Ditolak' } as const;
const LABEL_STATUS_QUOTE = { baru: 'Baru', dihubungi: 'Dihubungi', selesai: 'Selesai' } as const;
```

---

## Perbaikan

### 1. Section baru "Ringkasan Leads" — breakdown per sumber + status

Tambahkan query baru di `Promise.all` yang sudah ada di `AdminHomePage` untuk mengambil COUNT per status, masing-masing sumber:

```ts
supabase.from('batch_registrations').select('status'),   // untuk breakdown status pendaftaran
supabase.from('quote_requests').select('status'),        // untuk breakdown status penawaran
```

(Kalau tabelnya besar, pertimbangkan query `count` per status secara terpisah dengan `.eq('status', ...)` mengikuti pola `pending`/`certBulanIni` yang sudah ada di file ini, daripada tarik semua baris — pilih pendekatan yang konsisten dengan gaya query lain di file ini.)

Olah hasilnya jadi breakdown per status untuk masing-masing sumber (pakai `LABEL_STATUS_REG`/`LABEL_STATUS_QUOTE` yang sudah ada untuk label).

Buat komponen baru `src/app/admin/(protected)/overview/leads-summary.tsx` — section terpisah dari `StatCards`, ditempatkan di antara `StatCards` dan grafik tren (atau posisi lain yang paling rapi secara visual, pilih yang konsisten dengan layout Card yang sudah ada). Tampilkan dua blok: "Pendaftaran Batch" (total + breakdown 3 status) dan "Permintaan Penawaran" (total + breakdown 3 status) — bisa berupa dua `Card` berdampingan (grid 2 kolom di desktop, tumpuk di mobile) dengan angka besar untuk total dan badge kecil untuk tiap status.

### 2. Grafik tren jadi 2 garis terpisah

Di `AdminHomePage`, ubah `MonthBucket` (definisikan ulang di `leads-trend-chart.tsx`) dari `{ key, label, total }` jadi `{ key, label, pendaftaran: number, penawaran: number }` — isi dari `batchRegChart.data` dan `quoteChart.data` secara TERPISAH (jangan digabung jadi satu `total` lagi).

Di `leads-trend-chart.tsx`, ubah dari satu `<Line>`/area tunggal jadi DUA `<Line>` (atau `<Area>` kalau chart sekarang pakai `AreaChart`) — satu untuk Pendaftaran Batch, satu untuk Permintaan Penawaran, dengan warna berbeda dan legenda (`<Legend>` dari `recharts`) supaya jelas mana yang mana. Pertahankan sumbu X (bulan) dan style umum yang sudah ada (grid, tooltip) — hanya menambah satu seri data, bukan membangun ulang chart dari nol.

### 3. Pie/donut chart baru — distribusi status Leads gabungan

Buat komponen baru `src/app/admin/(protected)/overview/leads-status-pie.tsx` menggunakan `PieChart`/`Pie`/`Cell` dari `recharts`. Data: gabungan status dari kedua sumber (bisa ditampilkan sebagai 6 potongan — 3 status Pendaftaran + 3 status Penawaran — atau dikelompokkan lebih sederhana seperti "Aktif/Diproses" vs "Selesai" vs "Ditolak", PILIH pengelompokan yang paling masuk akal dan tambahkan keterangan singkat di UI kalau perlu penjelasan). Warna tiap potongan harus konsisten dan dark-mode-friendly (pola token warna yang sudah dipakai di file lain, cek `globals.css`/`tailwind` token yang ada, jangan hardcode hex sembarangan).

### 4. Bar chart baru — distribusi Sertifikat

Buat komponen baru `src/app/admin/(protected)/overview/certificates-bar-chart.tsx` menggunakan `BarChart`/`Bar` dari `recharts`. Data: jumlah sertifikat diterbitkan per bulan, beberapa bulan terakhir (bisa reuse pola `buildEmptyBuckets`/`monthKey`/`monthLabel` yang sudah ada di `page.tsx`, tapi untuk tabel `certificates` bukan leads — tambahkan satu query baru `supabase.from('certificates').select('tanggal_terbit').gte('tanggal_terbit', chartSince)` mengikuti pola `batchRegChart`/`quoteChart` yang sudah ada).

### 5. Perbesar angka stat card

Di `stat-cards.tsx`, ubah `CardTitle` dari `text-2xl` menjadi ukuran lebih besar (`text-3xl` atau `text-4xl` — pilih yang paling seimbang dengan lebar card di grid 4 kolom, uji di layar kecil supaya tidak wrap/overflow). Pertimbangkan juga memperbesar ikon (`size-9`/`size-4` saat ini) secara proporsional supaya card tetap seimbang, bukan cuma angkanya yang membesar sendirian.

### 6. Susun ulang layout halaman

Di `AdminHomePage` (bagian JSX render, ada di bagian akhir file yang belum dibaca di atas — baca dulu sisanya sebelum mengubah), tambahkan section baru secara berurutan yang masuk akal: `StatCards` (diperbesar) → `LeadsSummary` (baru) → `LeadsTrendChart` (2 garis) → baris baru berisi `LeadsStatusPie` + `CertificatesBarChart` berdampingan (grid 2 kolom desktop, tumpuk mobile) → `RecentLeadsTable` (tidak berubah). Sesuaikan dengan struktur grid yang sudah ada supaya konsisten, jangan asal tempel section baru di bawah tanpa memperhatikan spacing/grid yang sudah dipakai.

---

## Sebelum melapor selesai

1. `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` bersih.
2. Uji manual: buka `/admin` (Overview/Beranda), pastikan section Ringkasan Leads menampilkan angka yang MASUK AKAL — total Pendaftaran Batch di section baru harus sama dengan total baris di halaman `/admin/pendaftaran-batch`, begitu juga Permintaan Penawaran vs `/admin/leads/penawaran`.
3. Uji grafik tren: pastikan 2 garis terpisah tampil dengan warna dan legenda berbeda, hover/tooltip menampilkan angka yang benar per bulan per sumber.
4. Uji pie chart: pastikan total potongan = total leads gabungan, warna berbeda tiap status, tooltip/legend menjelaskan tiap potongan.
5. Uji bar chart sertifikat: bandingkan dengan angka card "Sertifikat bulan ini" untuk bulan berjalan — harus konsisten.
6. Uji angka stat card yang diperbesar tidak overflow/wrap aneh di 4 card, terutama card dengan angka besar (ribuan, kalau ada).
7. Diuji di viewport 375px — SEMUA chart baru (pie, bar, garis 2-seri) harus tetap terbaca, tidak overflow horizontal, legend tidak menabrak chart.
8. Laporkan ke Alif dengan angka spesifik yang dibandingkan (mis. "Ringkasan Leads menunjukkan Pendaftaran Batch: 12 total, cocok dengan jumlah baris di halaman Pendaftaran Batch").
9. Sesuai `CLAUDE.md` (Urutan kerja wajib, butir 6): **JANGAN tandai F11.2 DONE di `feature-registry.md` sampai Alif eksplisit mengonfirmasi sudah menguji sendiri di browser.** Begitu dikonfirmasi, update baris F11.2 — status DONE, kolom Berkas diisi file yang benar-benar diubah/ditambah, kolom Diuji/Bukti diisi ringkasan hasil uji Alif.
