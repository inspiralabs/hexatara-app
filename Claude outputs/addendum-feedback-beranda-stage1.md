# Feedback hasil Tahap 0-1 (§12.6.9) + instruksi lanjutan — tempel ke Cursor

Sudah saya cek hasil Beranda-mu (screenshot dari Alif + saya verifikasi langsung ke kode `hero-section.tsx`, `hero-carousel.tsx`, `produk-section.tsx`, `jadwal-batch-section.tsx`, `instruktur-section.tsx`, `testimoni-section.tsx`, `page.tsx`). Token warna Cobalt Mist dan pill-button sudah kena dengan benar di Hero/Jadwal/Produk — bagus. ada 4 hal yang perlu diperbaiki sebelum lanjut ke Tahap 2 (Pelatihan):

---

## 1. Hero background masih terasa kosong/polos

`hero-section.tsx` sudah punya `bg-background` di `<section>` (benar, sudah sesuai arahan sebelumnya) — jadi ini BUKAN warna yang salah, tapi area di belakang carousel+cards itu flat tanpa elemen visual apa pun, jadi terasa kosong di layar lebar.

Tambahkan salah satu treatment berikut (pilih yang paling ringan dan konsisten dengan arah "clean, tidak AI-slop" dari prompt redesign awal — TIDAK perlu foto/image baru dari Alif):
- Radial atau linear gradient sangat halus dari `--primary`/`--secondary` dengan opacity rendah (misal `bg-gradient-to-br from-primary/5 via-background to-secondary/5`) di `<section>` hero saja, ATAU
- Elemen dekoratif abstrak (blob/shape blur pakai `bg-primary/10 blur-3xl rounded-full` diposisikan absolute di pojok, low-key, non-intrusive), ATAU
- Subtle dot-grid/pattern pakai CSS `background-image` (tanpa file gambar tambahan).

Jangan pakai foto stok generik — konsisten dengan prinsip anti-AI-slop di prompt awal. Terapkan HANYA di hero, jangan section lain.

## 2. Restrukturisasi CTA hero

Saat ini 2 card (Pelatihan Pilot Drone Bersertifikat / Jual Drone Profesional Autel) dan 3 tombol (Lihat Jadwal, Lihat Produk, Hubungi Kami) terpisah — tombol tidak terhubung visual ke card yang relevan.

Ubah jadi:
- Tombol "Lihat Jadwal" pindah KE DALAM card "Pelatihan Pilot Drone Bersertifikat" (di bagian bawah card itu).
- Tombol "Lihat Produk" pindah KE DALAM card "Jual Drone Profesional Autel" (di bagian bawah card itu).
- Di bawah kedua card (bukan di dalam card manapun), tambahkan teks CTA singkat (copy bebas kamu, sesuaikan konteks: ajakan kontak langsung) + tombol "Hubungi Kami" berdiri sendiri.

Struktur akhir per card: icon → judul → deskripsi (sudah ada, hidden di mobile) → tombol aksi card itu sendiri.

## 3. Batasi jumlah item yang tampil di Beranda (Jadwal Pelatihan & Produk)

`JadwalBatchSection` dan `ProdukSection` saat ini query TANPA `.limit()` — kalau data bertambah, Beranda jadi sangat panjang dan ramai. `InstrukturSection` SUDAH punya prop `limit?: number` opsional tapi belum dipakai — pola ini yang benar, tinggal diterapkan konsisten.

Tambahkan prop `limit` ke `JadwalBatchSection` dan `ProdukSection` (sama seperti `InstrukturSection`), default 6 kalau tidak diisi. Di `page.tsx` Beranda, panggil eksplisit dengan `limit={6}` untuk KEDUANYA (Jadwal dan Produk). Halaman `/pelatihan` dan `/katalog` (listing penuh) TIDAK pakai limit — itu tetap menampilkan semua data seperti sekarang, ini HANYA untuk Beranda.

Pastikan grid tetap rapi kalau data kurang dari 6 (jangan sisakan slot kosong aneh — grid yang sudah ada sekarang, `sm:grid-cols-2 lg:grid-cols-3`, otomatis menangani ini, cukup dikonfirmasi tidak berubah).

## 4. Instruktur Kami & Kata Mereka belum ikut redesign

`instruktur-section.tsx` dan `testimoni-section.tsx` sudah pakai `publicSectionHeading` untuk judul section (benar), TAPI kartu di dalamnya masih markup lama — belum pakai `ContentCard`/pola card yang sama dengan Produk dan Jadwal Pelatihan (border, shadow-hover, pill badge, dll dari `public-ui.ts`).

Update kedua komponen ini supaya visualnya konsisten dengan section lain di Beranda yang sudah selesai:
- Testimoni: card `<figure>` yang ada sekarang sudah dekat (pakai `border-border`, `bg-card`, hover translate) — cukup dirapikan spacing/shadow-nya biar seragam dengan `ContentCard` punya Produk/Jadwal (radius, shadow-float, dll dari token yang sama), tidak perlu diganti total.
- Instruktur: avatar bulat + nama + jabatan sudah cukup sederhana dan bisa dipertahankan strukturnya, tapi cek spacing/typography-nya konsisten dengan section sekitarnya (heading sudah oke, tinggal body text-nya disamakan skala/warnanya — `text-muted-foreground` dsb, konsisten dengan Produk/Jadwal).

Kalau ternyata butuh mengubah komponen SHARED (`ContentCard`) untuk ini, INGAT aturan yang sudah disepakati: jangan ubah `ContentCard` default langsung karena dipakai juga Dashboard User — pakai `variant="public"` yang sudah ada (`ProdukSection`/`JadwalBatchSection` sudah pakai `variant="public"` di `ContentCard`, ikuti pola yang sama kalau Instruktur/Testimoni butuh reuse `ContentCard`).

---

Setelah 4 poin ini selesai di Beranda, jalankan tsc/lint/build, verifikasi visual mobile (375px) + desktop, baru lanjut ke Tahap 2 (Pelatihan) sesuai urutan di plan.md kamu.
