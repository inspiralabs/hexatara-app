# Prompt: Konversi Dokumen Hexatara UAT ke DOCX

**Catatan:** ini bukan isi dokumen final — ini **prompt** (instruksi) yang dijalankan lewat Cursor (atau asisten AI lain dengan akses ke skill/tool pembuat .docx) untuk mengonversi kelima file markdown Hexatara menjadi file Word (.docx) berbranding InspiraLabs. Prompt ini khusus untuk lima dokumen ini — bukan template konversi umum untuk proyek lain.

Jalankan prompt ini **satu dokumen per sesi** kalau memakai agent AI, supaya hasil per dokumen bisa dicek dulu sebelum lanjut ke dokumen berikutnya.

---

## Dokumen sumber yang dikonversi (5 file, urutan konversi)

1. `05-pendahuluan-sistem-hexatara.md` → **konversi pertama** (dokumen pembuka yang akan dibaca Abi lebih dulu)
2. `01-persiapan-hexatara.md`
3. `02-skenario-uji-uat.md`
4. `03-penjelasan-fitur.md`
5. (Dokumen `04-catatan-perubahan-inspiralabs.md` **tidak** dikonversi ke .docx — itu dokumen kerja internal InspiraLabs, tetap dalam format markdown/kerja, tidak diserahkan ke Hexatara)

---

## PROMPT

```
Tugas: konversi 4 dokumen markdown Hexatara UAT (dari folder docs/UAT/) menjadi 4
file .docx terpisah, satu file per dokumen, dengan branding InspiraLabs.

DOKUMEN YANG DIKONVERSI (proses satu per satu, urutan ini):
1. 05-pendahuluan-sistem-hexatara.md
2. 01-persiapan-hexatara.md
3. 02-skenario-uji-uat.md
4. 03-penjelasan-fitur.md

JANGAN mengubah isi/substansi dokumen markdown saat konversi — tugas ini murni
tentang tampilan (styling), bukan menulis ulang konten. Kalau ada tabel markdown,
pastikan berubah jadi tabel Word asli (bukan teks rata biasa).

SPESIFIKASI DESAIN — WAJIB DIIKUTI SEMUA:

1. FONT
   - Font utama: DM Sans, untuk seluruh isi dokumen (judul, subjudul, isi paragraf,
     isi tabel).
   - Kalau DM Sans tidak tersedia di environment konversi, gunakan font sans-serif
     modern terdekat (misalnya Inter atau Poppins) sebagai fallback, dan catat di
     akhir proses font pengganti apa yang dipakai.

2. WARNA AKSEN
   - Warna aksen utama: emas/gold (contoh hex: #C9A227 atau warna gold serupa —
     pilih satu nuansa gold yang elegan, bukan gold mencolok/neon).
   - Dipakai untuk: garis pemisah section, warna judul/heading, border tabel,
     warna footer/header, aksen di cover.
   - Warna teks isi tetap hitam/abu gelap standar untuk keterbacaan — gold hanya
     untuk aksen, BUKAN warna teks paragraf panjang.

3. COVER (halaman pertama tiap dokumen)
   - Logo InspiraLabs (kalau tersedia berkasnya; kalau tidak ada, sediakan area
     placeholder logo di pojok atas dan beri tahu bahwa logo perlu ditambahkan
     manual).
   - Judul dokumen (besar, jelas, memakai warna aksen gold atau hitam dengan
     garis bawah gold).
   - Sub-judul: nama proyek "Sistem Hexatara" + jenis dokumen (mis. "Dokumen
     Persiapan UAT Fase 1").
   - Tanggal dokumen.
   - Disusun oleh: InspiraLabs.
   - Untuk: Hexatara.

4. HEADER (tiap halaman setelah cover)
   - Nama dokumen (kiri) + logo kecil atau nama "InspiraLabs" (kanan), dipisah
     garis tipis warna gold di bagian bawah header.

5. FOOTER (tiap halaman setelah cover)
   - Nomor halaman (tengah atau kanan).
   - Teks kecil: "Sistem Hexatara — Dokumen UAT Fase 1" (kiri), warna abu gelap.
   - Garis tipis warna gold di bagian atas footer sebagai pemisah dari isi.

6. DAFTAR ISI (table of contents)
   - Tambahkan daftar isi otomatis di halaman kedua (setelah cover), dibuat dari
     heading H1/H2 dokumen tersebut, dengan nomor halaman.
   - Gaya daftar isi mengikuti warna aksen gold untuk judulnya ("Daftar Isi").

7. STRUKTUR HEADING
   - H1 markdown (#) → Heading 1 Word, warna gold, ukuran besar.
   - H2 markdown (##) → Heading 2 Word, warna hitam/abu gelap, tebal, dengan
     garis bawah tipis gold.
   - H3 markdown (###) → Heading 3 Word, tebal, tanpa garis bawah.

8. TABEL
   - Header baris pertama tabel: latar belakang gold muda/pastel, teks tebal
     hitam.
   - Border tabel: garis tipis abu muda (bukan gold, supaya tidak terlalu ramai).
   - Baris berselang-seling (zebra striping) putih/abu sangat muda untuk tabel
     panjang, supaya mudah dibaca.

9. KHUSUS DOKUMEN 05 (PENDAHULUAN) — TAMBAHAN
   - Ini dokumen pembuka yang dibaca Abi lebih dulu — beri perhatian ekstra pada
     kualitas visual cover dan tata letak, karena dokumen ini yang paling
     merepresentasikan kesan pertama pekerjaan InspiraLabs.
   - Bagian "3. Keunggulan Sistem" dan "4. Dibandingkan dengan Sistem Sejenis"
     boleh diberi kotak (box/callout) bernuansa gold muda untuk tiap sub-bagian,
     supaya lebih mudah dipindai (scan) saat dibaca cepat.

10. KHUSUS DOKUMEN 02 (SKENARIO UJI UAT) — TAMBAHAN
    - Kolom "✓" / "Sudah?" di tabel checklist harus tetap berupa kotak centang
      yang bisa dicentang (checkbox), bukan berubah jadi teks biasa — dokumen ini
      akan dicetak/dicentang manual saat sesi UAT berlangsung.

PENAMAAN FILE HASIL:
- 05-pendahuluan-sistem-hexatara.docx
- 01-persiapan-hexatara.docx
- 02-skenario-uji-uat.docx
- 03-penjelasan-fitur.docx

Simpan hasil di folder yang sama dengan sumber markdown-nya (docs/UAT/) dalam
sub-folder docs/UAT/docx/.

SETELAH SELESAI, laporkan:
- Font yang benar-benar dipakai (DM Sans atau fallback-nya)
- Apakah cover, header, footer, dan daftar isi berhasil dibuat di keempat file
- Apakah ada isi/tabel yang rusak/terpotong saat konversi (kalau ada, sebutkan
  di dokumen mana dan bagian mana)
```

---

## Catatan Eksekusi

Sesuai kesepakatan, langkah konversi ini **belum dijalankan sekarang** — file .docx akan dibuat pada tahap terpisah setelah keempat dokumen markdown final disetujui Alif (dan idealnya setelah masukan dari sesi UAT pertama sudah masuk, supaya tidak perlu konversi ulang karena ada revisi isi).
