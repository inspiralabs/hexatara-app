# DESIGN SYSTEM v2 — Hexatara Premium Minimalist

> Menggantikan token lama di PRD §12.2/ENGINEERING §7 secara SELEKTIF — warna dasar tetap, tapi filosofi dan aturan pemakaian diperluas signifikan. Ini bukan penggantian total, tapi pengetatan dan penambahan aturan komponen.

## Filosofi (dari 16 poin harapan user)

Minimalis, elegan, profesional, tema putih. Satu warna aksen datar — TANPA gradient. Angka adalah pahlawan (statistik/harga ditampilkan besar dan jelas, bukan dibungkus ikon dekoratif berlebihan). Satu elemen primer, tiga elemen sekunder dengan ukuran dan bobot sama untuk membangun hierarki visual yang jelas — bukan sembarang elemen dibesar-besarkan. Shadow HANYA dipakai pada elemen yang secara konsep "mengambang" (card, dropdown, modal) — elemen yang menempel ke layout (header sticky, section biasa) tidak diberi shadow dekoratif.

## Token warna (tetap dari PRD §12.2, tidak berubah)

```css
--warna-utama:   #1E40AF;   /* biru profesional — dipakai untuk teks tautan, ikon aktif, elemen primer */
--warna-aksen:   #F59E0B;   /* oranye — SATU-SATUNYA warna CTA/highlight. Flat, tanpa gradient */
--warna-sukses:  #059669;
--warna-bahaya:  #DC2626;
--warna-teks:    #111827;
--warna-teks-2:  #4B5563;
--warna-latar:   #FFFFFF;
--warna-latar-2: #F9FAFB;
```

**Aturan baru:** `--warna-aksen` tidak pernah dipakai sebagai `background: linear-gradient(...)`. Tombol CTA solid oranye flat, hover-nya menggelapkan sedikit (`#D97706`) bukan berubah gradasi.

## Shadow — hanya pada yang mengambang

```css
--shadow-float: 0 1px 3px rgba(17, 24, 39, 0.08), 0 1px 2px rgba(17, 24, 39, 0.04);
--shadow-float-hover: 0 4px 12px rgba(17, 24, 39, 0.10), 0 2px 4px rgba(17, 24, 39, 0.06);
```

Dipakai HANYA pada: card (batch, produk, testimoni), dropdown menu, modal/dialog, popup. TIDAK dipakai pada: header/navbar, section wrapper, tabel biasa, tombol (tombol pakai border atau warna solid, bukan shadow).

## Tipografi — angka sebagai hero

Untuk statistik/harga/angka penting (harga produk, jumlah peserta, rating), gunakan ukuran signifikan lebih besar dari teks sekitarnya dan `font-weight: 700`, TANPA ikon dekoratif di sampingnya (larangan eksplisit user: "drop icon tiles"). Contoh: harga produk ditampilkan `text-3xl font-bold`, bukan `text-base` dengan ikon tag di sebelahnya.

Sparkline/grafik kecil (dashboard) memakai garis tipis satu warna (`--warna-utama` atau `--warna-aksen`), tanpa area fill gradient, tanpa grid line berlebihan — inline kecil di samping angka, bukan chart besar dengan axis lengkap.

## Hierarki "one primary three secondary"

Setiap blok dengan beberapa CTA/elemen pilihan (contoh: empat kartu ringkasan di dashboard, atau tombol aksi di toolbar tabel) mengikuti pola: SATU elemen primer (warna aksen solid, paling menonjol) dan TIGA elemen sekunder yang ukuran dan bobot visualnya SAMA satu sama lain (border/outline style, warna teks netral) — tidak ada sekunder yang dibuat lebih besar/tebal dari sekunder lainnya untuk menciptakan hierarki palsu.

## Animasi hover — premium, konsisten

```css
--transition-hover: 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

Card: `transform: translateY(-2px)` + shadow berubah dari `--shadow-float` ke `--shadow-float-hover`, durasi `--transition-hover`. Tombol: perubahan warna background/border halus, tanpa scale/bounce berlebihan (tetap "elegan", bukan playful). Tidak ada animasi yang berjalan otomatis tanpa interaksi (tidak ada auto-slide tanpa kontrol, tidak ada elemen yang terus bergerak/pulsing) — kontras dengan larangan `setInterval` di banner (PRD §6.4) yang tetap berlaku penuh.

## Reusability — komponen wajib dipakai ulang

Sebelum menulis komponen baru untuk halaman mana pun, cek dulu apakah pola yang sama sudah ada:

| Pola | Komponen wajib dipakai ulang |
|---|---|
| Card dengan gambar + judul + meta + CTA | Satu komponen `<ContentCard>` generik, dipakai untuk batch, produk, dan materi — beda hanya lewat props, bukan komponen terpisah per fitur |
| Badge status (dibuka/akan datang/tutup, DONE/TODO) | Satu komponen `<StatusBadge>` dengan varian warna, dipakai di publik maupun admin |
| Tabel data dengan filter + sort + pagination (lihat bagian Admin) | Satu komponen `<DataTable>` generik yang menerima kolom dan data sebagai props |
| Upload gambar dengan preview + validasi (lihat bagian Admin) | Satu komponen `<ImageUploadField>` dipakai di SEMUA form yang butuh upload gambar |
| Dialog konfirmasi hapus | Sudah ada (`AlertDialog` dari shadcn) — TETAP dipakai ulang, jangan buat modal custom baru |
| Rating bintang display | Satu komponen `<StarRating>` read-only, dipakai di card batch dan produk |

**Aturan tegas:** kalau menemukan diri menulis styling yang mirip (misal border-radius, padding, shadow) yang sudah ada di komponen lain, itu sinyal untuk extract jadi komponen bersama — bukan copy-paste class Tailwind ke tempat baru.

## Bahasa Inggris untuk UI, kecuali istilah domain

Label navigasi dan elemen UI umum diterjemahkan ke Inggris di `messages/en.json` (sudah ada infrastrukturnya lewat next-intl — TIDAK butuh perubahan arsitektur, hanya mengisi string yang sebelumnya hardcode Indonesia langsung di komponen). Contoh yang WAJIB dipindah ke sistem terjemahan: label navbar (Beranda→Home, Pelatihan→Training, Produk→Products), label tombol umum (Simpan→Save, Batal→Cancel, Hapus→Delete).

Istilah domain yang TETAP Bahasa Indonesia meski locale EN (sesuai konvensi ENGINEERING §6.2 — Bahasa Indonesia untuk domain bisnis): nama kolom teknis di kode, istilah regulasi (RPC, DKPPU), dan label yang secara eksplisit direferensikan user sebagai "tidak perlu diubah" — user perlu mengonfirmasi daftar lengkap ini per halaman saat implementasi (lihat bagian pertanyaan tambahan di akhir dokumen kalau ada sisa ambiguitas).

## Zero AI Slop

Larangan eksplisit dari user, berlaku untuk SEMUA teks yang ditulis di kode maupun konten (copy tombol, deskripsi, pesan error, komentar kode yang customer-facing):

- Tidak ada em dash (—) di copy UI atau microcopy. Ganti dengan kalimat pendek terpisah, koma, atau kata sambung biasa.
- Tidak ada frasa generik AI seperti "Elevate your experience", "Unlock the power of", "Seamlessly", "In today's world" — copy harus spesifik dan konkret sesuai konteks Hexatara (pelatihan drone, sertifikasi, penjualan Autel).
- Tidak ada bullet list berlebihan di copy publik yang seharusnya kalimat mengalir natural.

Ini berlaku untuk SEMUA blok prompt PANDUAN.md di bawah — termasuk copy yang saya (Claude) tulis sebagai instruksi ke Claude Code.
