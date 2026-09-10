### ADR-011 — Rating bintang manual Admin, kolom opsional di `batches` dan `products`
**2026-09-09 · Berlaku**

**Konteks.** BRD/PRD tidak menyebut sistem rating sama sekali. User (Alif) meminta tampilan bintang 5 di card pelatihan dan produk untuk kelengkapan visual premium, tanpa sistem review sungguhan (di luar scope Fase 1 — butuh alur submit, moderasi, dan tidak ada waktu untuk itu di 8 minggu).

**Keputusan.** Tambah kolom `rating` (numeric(2,1), nullable, check antara 0.0-5.0) di `batches` dan `products`. Diisi manual oleh Admin lewat form CRUD yang sudah ada. Kalau NULL, card tidak menampilkan bintang sama sekali — bukan menampilkan 0.0 atau placeholder kosong.

**Konsekuensi.** Ini bukan rating yang terverifikasi dari peserta/pembeli sungguhan — murni angka yang diinput Admin berdasarkan pertimbangannya sendiri (bisa dari testimoni, bisa estimasi). Kalau Hexatara suatu saat minta sistem review sungguhan, ini jadi utang migrasi: kolom manual perlu diganti dengan agregasi dari tabel review baru. Untuk Fase 1, trade-off ini diterima karena tidak ada waktu/scope untuk sistem review penuh.

---

### ADR-011b — Hero gallery pakai `hero_slides` yang sudah ada, bukan tabel baru
**2026-09-09 · Berlaku**

**Konteks.** User minta kotak galeri gambar di sisi kanan hero Beranda — poster produk/pelatihan yang bisa diklik menuju halaman terkait, dikelola Admin sebagai carousel. Sempat dipertimbangkan tabel baru "Hero Gallery" khusus.

**Keputusan.** TIDAK ada tabel baru. `hero_slides` (PANDUAN.md §3.3, sudah ada sejak Sprint 0/1 untuk F01.3) sudah punya seluruh kolom yang dibutuhkan: `gambar_url`, `cta_url` (link tujuan bebas — bisa ke `/pelatihan`, `/katalog`, atau slug spesifik), `urutan` (dipakai sebagai urutan carousel, sekaligus tunduk ke pola reorder otomatis ADR-014), `is_active`, judul/subjudul dwibahasa. F01.3 ("Hero produk unggulan + CTA utama") secara konsep memang dirancang untuk kebutuhan yang sama.

**Konsekuensi.** Tidak ada SQL baru untuk fitur ini. Admin Panel yang mengelola `hero_slides` (sudah ada dari Sprint 1) diperluas tampilannya jadi carousel di hero (bukan cuma satu slide statis, kalau implementasi sebelumnya hanya menampilkan satu slide aktif) — ini perubahan tampilan/komponen, bukan skema.

---

### ADR-012 — Kategori produk & pelatihan dinamis, dua tabel baru
**2026-09-09 · Berlaku**

**Konteks.** Kategori produk dan pelatihan saat ini kemungkinan hardcode/enum. User minta keduanya dikelola dinamis oleh Admin (tambah/ubah/hapus kategori sendiri), dipanggil lewat dropdown searchable di form produk/batch.

**Keputusan.** Dua tabel baru: `product_categories` (id, nama_id, nama_en, urutan, is_active) dan `batch_categories` (struktur sama). Kolom `products.category_id` dan `batches.category_id` sebagai FK, nullable saat transisi data lama.

**Konsekuensi.** Data kategori existing (kalau ada, tersimpan sebagai teks bebas di `products`/`batches`) perlu dipetakan manual ke kategori baru saat migrasi — Admin perlu meninjau dan mencocokkan satu per satu. Filter kategori di halaman publik (Pelatihan, Produk) sekarang query ke tabel terpisah, bukan `DISTINCT` dari kolom teks.

---

### ADR-013 — LMS Freemium: materi berbab (`material_chapters`), progress tersimpan di database
**2026-09-09 · Berlaku**

**Konteks.** PRD §8.5 mendesain kuis stateless (state di React, tidak di database) karena tidak ada kondisi gagal yang mungkin — cocok untuk kuis correctable yang selalu berakhir 100%. Tapi user sekarang minta pengalaman LMS penuh untuk MATERI: banyak bab per materi, wajib dibaca berurutan (tidak bisa skip), course completion & progress bar per bab, dan yang penting — progress ini harus bertahan lintas sesi/device untuk user yang sudah login (memperbaiki bug alur freemium yang membuat user kembali ke awal saat login ulang).

Materi ditulis Admin langsung di rich text editor Tiptap (bukan import dari file eksternal), konsisten dengan pola `deskripsi_*`/`silabus_*`/`konten_*` yang sudah ada.

**Keputusan.**
- Tabel baru `material_chapters`: banyak bab per `materials`, flat (bukan bertingkat modul>bab), dengan `urutan` (reindex otomatis saat diubah — lihat ADR-014), `judul_id`/`judul_en`, `konten_id`/`konten_en` (HTML dari Tiptap).
- Tabel baru `material_progress`: satu baris per (`user_id`, `chapter_id`), kolom `is_selesai` dan `selesai_at`. Ditulis saat user menyelesaikan syarat baca (scroll ke akhir konten, lihat ADR untuk detail validasi) di client, dikonfirmasi lewat Server Action ke server.
- Course content (daftar bab) terkunci berurutan: bab ke-N hanya bisa diklik kalau bab 1..N-1 sudah `is_selesai`. Divalidasi di server (Server Action menolak submit bab N kalau bab N-1 belum selesai), bukan cuma di UI — supaya tidak bisa diakali lewat DevTools.
- Menu kuis (yang sudah ada, F03.2, tidak diubah alurnya) hanya terbuka setelah SEMUA bab materi `is_selesai` untuk user itu.
- User yang sudah login (dari Dashboard User) langsung masuk ke LMS materi+kuis tanpa form daftar di akhir — beda dari pengunjung anonim yang tetap lewat form daftar akun di ujung alur (PRD §8.3 tidak berubah untuk anonim).

**Konsekuensi.** Ini pengecualian eksplisit terhadap prinsip "state kuis tidak di database" — tapi PENGECUALIAN INI HANYA UNTUK MATERI, bukan kuis. Kuis (F03.2) tetap 100% stateless sesuai PRD §8.5, tidak ada perubahan sama sekali di sana; larangan §13.3 (tidak ada tabel riwayat pengerjaan KUIS) tetap berlaku penuh. `material_progress` adalah tabel progress MATERI, bukan riwayat skor kuis — tidak melanggar larangan yang ada karena larangan itu spesifik soal kuis.

Menambah 2 tabel baru di luar 24 tabel PRD §5 — perlu SQL baru yang dijalankan manual oleh user (tidak dieksekusi otomatis, sesuai larangan #2).

---

### ADR-014 — Reorder otomatis via drag-and-drop, berlaku di semua fitur berurutan
**2026-09-09 · Berlaku**

**Konteks.** Pola lama: Admin mengubah angka urutan manual di setiap baris, berisiko menghasilkan angka urutan yang bentrok (dua baris dengan urutan sama) karena baris lain tidak ikut bergeser otomatis. User eksplisit minta pola reorder otomatis diterapkan di semua tempat yang punya konsep urutan eksplisit: soal kuis (`quiz_questions`), bab materi (`material_chapters`, baru), dan produk katalog (`products.urutan`). Batch/pelatihan dikonfirmasi TETAP urut berdasarkan tanggal seperti sekarang — tidak diberi kolom urutan manual baru, jadi ADR ini tidak menyentuh `batches`.

**Keputusan.** UI reorder berbentuk drag-and-drop (bukan input angka manual). Saat urutan diubah, Server Action menghitung ulang SEMUA baris yang terpengaruh dalam satu transaksi — bukan hanya baris yang digeser. Pola implementasi: kirim array id sesuai urutan baru dari client, Server Action melakukan `UPDATE ... SET urutan = idx` per id dalam satu request, dibungkus transaksi (RPC Postgres kalau lintas banyak baris, mengikuti pola ADR yang sudah ada di §5.2 soal transaksi batal-semua).

**Konsekuensi.** Berlaku untuk `quiz_questions.urutan` (sudah ada), `material_chapters.urutan` (baru, ADR-013), dan `products.urutan` (sudah ada dari F04.6). Tidak ada kolom baru yang perlu ditambahkan untuk ADR ini sendiri — murni perubahan pola UI dan Server Action di tempat yang kolom urutannya sudah ada atau sudah direncanakan di ADR lain.

---

### ADR-015 — Popup landing: dua gambar terpisah per orientasi (mobile portrait, desktop landscape)
**2026-09-09 · Berlaku**

**Konteks.** Popup pembuka (F01.1) sebelumnya berbasis konten teks dari kolom `popups`. User sekarang minta popup berbasis gambar poster/flyer penuh yang diupload Admin, dengan orientasi berbeda untuk mobile (portrait) vs desktop/tablet (landscape) — bukan satu gambar yang di-crop otomatis, karena komposisi visual poster biasanya dirancang khusus per orientasi.

**Keputusan.** Tambah kolom `gambar_mobile_url` dan `gambar_desktop_url` di `popups` (menggantikan/melengkapi kolom konten teks yang ada). Client memilih gambar berdasarkan lebar viewport (breakpoint sama dengan breakpoint Tailwind `md:` yang sudah dipakai di seluruh proyek). Popup dibatasi ukuran (tidak memenuhi layar penuh — ada padding/margin dari tepi viewport, dengan tombol tutup yang jelas).

**Konsekuensi.** Admin wajib menyiapkan 2 file gambar per popup, bukan 1. Form CRUD popup di Admin Panel perlu 2 slot upload gambar terpisah dengan preview masing-masing. Popup lama (kalau ada baris existing berbasis teks) perlu migrasi data manual oleh Admin — tidak ada cara otomatis mengonversi teks jadi gambar.

---

### ADR-016 — Ekspor CSV diganti XLSX, seluruh titik ekspor dan import
**2026-09-09 · Berlaku · Membatalkan bagian ekspor dari ADR-010 soal `papaparse`**

**Konteks.** `papaparse` dengan BOM (§5.6 ENGINEERING.md, PRD §6.4/§6.5) dipilih di awal karena sederhana. Tapi Admin (Abi, pengguna awam) kesulitan dengan format CSV satu-kolom-dipisah-koma saat membuka di Excel — terutama pada data dengan banyak field (leads, sertifikat). XLSX per kolom asli jauh lebih mudah dibaca dan diedit non-teknis.

**Keputusan.** Ganti seluruh ekspor dan import CSV di sistem jadi XLSX, menggunakan `xlsx` yang SUDAH terpasang dari CDN SheetJS (ADR-010) — tidak perlu dependency baru:
- Ekspor lead (`/admin/leads`, kedua tab) → `.xlsx`, kolom asli tanpa concat
- Template & hasil import sertifikat massal (F02.8) → `.xlsx`
- Template & hasil import bank soal (F03.13) — PRD §8.10 sudah menyebut Excel, jadi ini tinggal dikonfirmasi konsisten, bukan perubahan besar

**Konsekuensi.** PRD §6.4/§6.5 (acceptance criteria menyebut "CSV" eksplisit, termasuk pola nama file `leads-batch-YYYY-MM-DD.csv`) perlu diperbarui jadi `.xlsx` — ini perubahan PRD, bukan cuma kode, karena mengubah acceptance criteria tertulis. `papaparse` yang sudah terpasang jadi kandidat dependency unused setelah migrasi ini selesai — cek ulang dengan `pnpm knip` setelah seluruh titik ekspor/import berpindah ke XLSX, dan hapus `papaparse` dari dependencies kalau memang sudah tidak dipakai di mana pun (lihat catatan testing dependency dari analisis knip 2026-09-09).

---

### ADR-017 — Navbar Admin collapsible dengan sub-menu, menggantikan pola tab-in-page
**2026-09-09 · Berlaku**

**Konteks.** F01.14 (baru selesai 2026-09-09) memakai pola tab di dalam halaman untuk memisahkan pendaftaran minat vs permintaan penawaran. User sekarang minta pola ini diganti: setiap menu yang tadinya tab-in-page menjadi sub-item collapsible di navbar utama Admin. Navbar utama sendiri juga perlu bisa di-hide penuh (collapse ke ikon saja).

**Keputusan.** Navbar Admin diberi dua level: menu utama (Dashboard, Batch, Konten, Leads, Sertifikat, Upgrade, Materi, Produk, Pengaturan — sesuai peta route PRD §4) dan sub-menu di bawah menu yang punya lebih dari satu tampilan data (Leads → Pendaftaran Minat, Permintaan Penawaran; Materi → Materi, Bank Soal). Navbar bisa di-collapse penuh jadi strip ikon (state disimpan di client, misal localStorage, murni preferensi tampilan per device).

**Konsekuensi.** `/admin/leads` yang baru selesai dirombak pola tab-nya (dikerjakan ulang, bukan pekerjaan sia-sia — komponen tabel dan ekspornya tetap dipakai ulang, hanya kontainer navigasinya yang berubah dari `<Tabs>` ke routing sub-menu, kemungkinan `/admin/leads/minat` dan `/admin/leads/penawaran` sebagai route terpisah). Ini dikerjakan SEBELUM Sprint 5 (hardening), sebagai bagian dari paket redesign, bukan sesudahnya.
