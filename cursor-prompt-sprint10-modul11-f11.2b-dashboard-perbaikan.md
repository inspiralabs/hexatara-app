# Prompt Cursor — F11.2 (lanjutan): Chart Tren Lead kosong, angka diperbesar lagi, warna chart, verifikasi data aktual

> Acuan: `ENGINEERING.md` ADR-024, `PRD.md` §9f (khusus 9f.4), `feature-registry.md` Sprint 10.
> Ini LANJUTAN dari F11.2 yang sudah dikerjakan sebelumnya (Ringkasan Leads, grafik tren 2 garis, pie chart, bar chart, stat card diperbesar) — BUKAN pengerjaan ulang dari nol. Alif sudah menguji di browser dan melaporkan 4 temuan yang harus diperbaiki di kode yang SUDAH ADA.
>
> Governance yang tetap berlaku penuh (CLAUDE.md/PRD.md §13.1): TIDAK ada tabel/kolom baru, TIDAK ada dependency baru — `recharts` yang sudah dipakai tetap dipakai. Perbaikan ini murni bug fix + polish visual pada kode F11.2 yang sudah ada.

## 0. Konteks yang WAJIB dipahami dulu sebelum mengubah kode

Baca dulu file-file ini secara utuh:

- `src/app/admin/(protected)/page.tsx` — `AdminHomePage`, tempat SEMUA query data dashboard di-fetch dan diolah jadi `buckets`/`certBuckets`/`pieData`/`stats`.
- `src/app/admin/(protected)/overview/leads-trend-chart.tsx` — komponen `LeadsTrendChart`, chart tren yang dilaporkan KOSONG.
- `src/app/admin/(protected)/overview/leads-status-pie.tsx` — komponen pie chart, dilaporkan warnanya monokrom/kurang menarik.
- `src/app/admin/(protected)/overview/certificates-bar-chart.tsx` — komponen bar chart, dilaporkan warnanya monokrom/kurang menarik.
- `src/app/admin/(protected)/overview/stat-cards.tsx` dan `leads-summary.tsx` — angka-angka yang diminta diperbesar LAGI (sudah pernah diperbesar sekali di F11.2 awal, tapi Alif merasa masih kurang besar).
- `src/app/globals.css` — cari definisi token warna `--chart-1` s/d `--chart-5` (dan token warna brand/cobalt kalau ada nama token khusus, misal `--primary` atau token bernama eksplisit cobalt) untuk tahu warna apa yang sudah tersedia di design system sebelum menulis warna baru.

---

## Konteks — SUDAH DITELUSURI, jangan diasumsikan ulang

**Data di database SUDAH dikonfirmasi ADA** (dicek langsung lewat SQL editor Supabase oleh Alif, 2026-09-19):
- `batch_registrations`: 3 baris dengan `created_at` di bulan September 2026 (17 Sep 2026, dua di antaranya jam berbeda)
- `quote_requests`: 1 baris dengan `created_at` 9 September 2026

Jadi **chart "Tren lead" kosong BUKAN karena data tidak ada** — root cause ada di kode: query Supabase yang gagal silent, atau cara `created_at` (timestamptz) di-parse jadi `Date` di server component, atau logika pengelompokan bucket di `page.tsx` yang tidak match dengan data asli. `monthKey()` sendiri sudah diverifikasi benar secara matematis (bulan September 2026 menghasilkan key `2026-09`, cocok dengan bucket yang dibuat `buildEmptyLeadBuckets(12)`).

Kode yang membangun buckets di `page.tsx` (baca ulang persis, JANGAN diasumsikan sudah benar hanya karena terlihat masuk akal):

```ts
const buckets = buildEmptyLeadBuckets(12);
const indexByKey = new Map(buckets.map((b, i) => [b.key, i]));
for (const row of batchRegChart.data ?? []) {
  const idx = indexByKey.get(monthKey(new Date(row.created_at)));
  if (idx != null) buckets[idx]!.pendaftaran += 1;
}
for (const row of quoteChart.data ?? []) {
  const idx = indexByKey.get(monthKey(new Date(row.created_at)));
  if (idx != null) buckets[idx]!.penawaran += 1;
}
```

Query sumber datanya:

```ts
supabase.from('batch_registrations').select('created_at').gte('created_at', chartSince),
supabase.from('quote_requests').select('created_at').gte('created_at', chartSince),
```

di mana `chartSince = startOfMonth(-11).toISOString()`.

---

## Perbaikan

### 1. Cari root cause chart "Tren lead" kosong — WAJIB didiagnosis sebelum ditambal

JANGAN langsung menebak perbaikan. Lakukan langkah diagnosis berikut secara berurutan:

a. Tambahkan `console.log` sementara (atau gunakan debugger) tepat setelah `Promise.all` di `page.tsx` untuk mencetak `batchRegChart.data`, `batchRegChart.error`, `quoteChart.data`, `quoteChart.error` — jalankan `pnpm dev`, buka `/admin`, lihat log terminal server (BUKAN console browser, karena ini server component). Cek APAKAH data benar-benar ter-fetch (harus ada minimal 3 baris `batch_registrations` dan 1 baris `quote_requests` sesuai temuan SQL editor Alif) dan APAKAH ada error yang selama ini ter-log tapi tidak terlihat (baris `for (const [label, err] of [...])` di bagian atas file sudah меng-console.error, tapi cek juga apakah `chart-reg`/`chart-quote` benar-benar muncul di log kalau ada error).

b. Kalau data ADA di `batchRegChart.data` tapi `buckets` tetap kosong setelah loop — masalahnya di parsing `monthKey(new Date(row.created_at))`. Cek format `created_at` yang benar-benar dikembalikan Supabase (dari log langkah a) — kemungkinan formatnya berbeda dari yang diasumsikan `new Date()` (misal timezone offset yang membuat tanggal "meloncat" ke bulan lain saat dikonversi UTC, meskipun untuk kasus ini seharusnya masih dalam bulan yang sama). Tambahkan log `monthKey(new Date(row.created_at))` per baris dan bandingkan dengan `indexByKey` keys yang ada (log `Array.from(indexByKey.keys())`) — cek APAKAH key yang dihasilkan benar-benar match satu sama lain (perhatikan kemungkinan trailing whitespace, format berbeda, atau tipe data unexpected).

c. Kalau data KOSONG dari query (`batchRegChart.data` adalah array kosong padahal SQL editor menunjukkan ada baris) — kemungkinan ada RLS (Row Level Security) policy di Supabase yang menghalangi service role/anon key yang dipakai `createClient()` di `src/lib/supabase/server.ts` untuk membaca `created_at` tanpa kolom lain, atau `chartSince` yang dihitung salah (cek nilai aktual `chartSince` di log, bandingkan dengan `created_at` data asli — pastikan `chartSince` tidak lebih baru dari data yang seharusnya masuk).

d. SETELAH root cause ditemukan dari langkah a-c, hapus semua `console.log` debug sebelum melapor selesai, dan tulis perbaikan yang SPESIFIK menyasar root cause itu — bukan perbaikan menebak-nebak.

### 2. Verifikasi tambahan yang diminta Alif — pastikan tidak ada sisa data lama

Alif meminta dicek apakah dashboard masih memakai data lama yang seharusnya sudah tidak relevan (referensi ke "Pendaftaran Minat"/`batch_leads`, fitur yang sudah dihapus di F10.1/ADR-023). Sudah dicek grep `batch_leads` di folder `src/app/admin/` — TIDAK ADA hasil, jadi dashboard SUDAH bersih dari referensi tabel lama itu secara struktural. Tapi tetap lakukan pengecekan tambahan ini sebagai bagian dari diagnosis:

- Pastikan SEMUA angka di `AdminHomePage` (stat card, Ringkasan Leads, chart, pie, bar) benar-benar berasal dari query LIVE ke `batch_registrations`/`quote_requests`/`certificates`/`batches` — bukan ada sisa data hardcoded/cache/mock yang tertinggal dari development.
- Laporkan secara eksplisit ke Alif tabel/kolom apa saja yang jadi sumber tiap angka di dashboard (ringkas, satu baris per card/chart), supaya Alif bisa cross-check sendiri kalau ada kejanggalan di masa depan.

### 3. Perbesar lagi angka-angka di dashboard

Alif menilai angka di 4 stat card (Lead baru, Menunggu verifikasi, Sertifikat bulan ini, Batch aktif) dan 2 card Ringkasan Leads (Pendaftaran Batch, Permintaan Penawaran) masih terlalu kecil dibanding pentingnya sebagai sumber informasi utama, meskipun sudah pernah diperbesar sekali di F11.2 awal.

Di `stat-cards.tsx` dan `leads-summary.tsx`, naikkan ukuran teks `CardTitle` angka utama SATU TINGKAT LAGI dari yang sekarang (cek dulu class yang sekarang dipakai, kemungkinan `text-2xl`/`text-3xl`/`text-4xl` — naikkan ke tingkat berikutnya di skala Tailwind, misal ke `text-4xl`/`text-5xl`). Uji di layar kecil (375px) supaya angka besar TIDAK membuat card overflow atau teks terpotong — kalau perlu, kurangi padding di sekitar angka atau kecilkan elemen lain di card (ikon, label) supaya angka tetap jadi fokus utama tanpa merusak layout.

### 4. Ganti warna chart dari monokrom/abu-abu ke warna cobalt (brand)

Pie chart (`leads-status-pie.tsx`) dan bar chart (`certificates-bar-chart.tsx`) saat ini memakai token `var(--chart-1)` s/d `var(--chart-5)` dan `var(--foreground)` yang menghasilkan warna abu-abu/monokrom di screenshot Alif — bukan warna yang menarik secara visual.

Cek `globals.css` untuk token warna brand yang sudah ada (proyek ini memakai istilah "cobalt mist" di beberapa tempat lain, lihat referensi di `ENGINEERING.md` soal desain email — cek apakah ada token CSS bernama serupa, atau token `--primary`/`--chart-*` yang NILAINYA sebenarnya biru cobalt tapi tidak ter-render karena alasan lain seperti dark/light mode, CSS variable yang belum di-resolve dengan benar oleh `recharts`, atau SVG `fill`/`stroke` yang tidak membaca CSS variable dengan benar di context tertentu).

**Kemungkinan root cause warna monokrom**: `recharts` kadang tidak resolve CSS custom property (`var(--chart-1)`) dengan benar di beberapa versi/konteks render (terutama Server Component boundary atau saat pertama render sebelum hydration) — cek apakah warna yang tampil di browser (inspect element pada elemen `<path>`/`<rect>` dari chart) benar-benar mengambil nilai `var(--chart-1)` yang di-set di `globals.css`, atau malah fallback ke warna default recharts. Kalau ini penyebabnya, pertimbangkan menulis nilai warna HEX/OKLCH LANGSUNG (bukan lewat `var()`) yang diambil dari palet cobalt yang sama, atau pastikan komponen chart di-render sebagai Client Component (`'use client'`) dengan CSS variable yang sudah ter-resolve sebelum recharts membacanya.

Ganti seluruh warna pie chart dan bar chart supaya memakai gradasi/variasi warna BIRU COBALT (bukan abu-abu/monokrom) — pertahankan agar tetap ada variasi tone antar potongan/batang supaya tetap bisa dibedakan (misal beberapa shade cobalt dari terang ke gelap), dan tetap dark-mode-friendly (uji di kedua tema).

---

## Sebelum melapor selesai

1. `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` bersih.
2. Uji manual: buka `/admin`, chart "Tren lead" (pilih periode 3/6/12 bulan) HARUS menampilkan garis untuk bulan September 2026 sesuai data yang sudah dikonfirmasi ada (3 pendaftaran, 1 penawaran).
3. Uji tambah 1 data dummy baru (pendaftaran atau penawaran) lewat form publik, refresh `/admin` — pastikan chart ikut update mencerminkan data baru, bukan cache statis.
4. Uji visual: pie chart dan bar chart sekarang memakai warna cobalt yang jelas berbeda dari sebelumnya (bukan abu-abu), diuji di light DAN dark mode.
5. Uji angka stat card dan Ringkasan Leads sudah lebih besar dari sebelumnya, tidak overflow di 375px.
6. Laporkan ke Alif: (a) apa root cause chart kosong yang ditemukan di langkah diagnosis, (b) daftar sumber data tiap card/chart (poin 2), (c) screenshot/deskripsi hasil warna baru dan ukuran angka baru.
7. Sesuai `CLAUDE.md` (Urutan kerja wajib, butir 6): **JANGAN ubah status F11.2 di `feature-registry.md` — cukup TAMBAHKAN catatan di kolom Bukti atau entri log baru** yang menyebutkan perbaikan lanjutan ini, HANYA setelah Alif eksplisit mengonfirmasi sudah menguji sendiri di browser.
