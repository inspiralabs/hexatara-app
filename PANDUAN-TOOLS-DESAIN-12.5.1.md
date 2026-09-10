# PANDUAN TOOLS DESAIN — sebelum mulai §12.5.1

Referensi terpisah dari `PANDUAN.md`. Baca dan siapkan tools di sini **sebelum** menjalankan blok prompt `## 12.5.1 Design system v2`, supaya Claude Code punya "selera" desain yang lebih tajam (bukan hasil default yang generik/"AI slop") saat membangun Design System v2 dan redesign halaman-halaman berikutnya (§12.5.6–§12.5.8 dan seterusnya).

File ini murni referensi instalasi & cara pakai. Tidak ada perubahan skema, tidak ada kode yang dijalankan otomatis — semua langkah instalasi di bawah dijalankan manual oleh Alif, sama seperti aturan SQL manual di §12.5.0.

Urutan baca yang disarankan: **impeccable dulu** (sudah terpasang, langsung bisa dipakai), lalu opsional lihat **awesome-design-md** untuk referensi visual saat masuk ke redesign halaman. **taste-skill** dan **img2threejs** sifatnya opsional/kondisional — alasannya dijelaskan di masing-masing bagian.

---

## 1. impeccable (impeccable.style) — PAKAI INI, sudah terpasang

**Apa itu.** Skill Claude Code open-source (`github.com/pbakaus/impeccable`) yang memberi "kosakata desain" bersama ke agent lewat serangkaian command, plus 61 pemeriksaan otomatis untuk menangkap cacat umum UI hasil AI (kontras kurang, spacing serampangan, hierarki tombol tidak jelas, dst). Cocok langsung dengan kebutuhan Fase 12.5: minimalist/premium, satu warna aksen flat, shadow hanya di elemen mengambang.

**Instalasi.** Sudah terpasang di environment sesi ini (terverifikasi ada di direktori skill Claude Code). Kalau suatu saat perlu pasang ulang di environment lain:

```powershell
npx impeccable install
```

Butuh Node.js 22.18+. Setelah instalasi, reload Claude Code.

**Cara verifikasi terpasang.** Ketik `/impeccable` di chat Claude Code — kalau terpasang, akan muncul daftar lengkap command yang tersedia (`init`, `critique`, `audit`, `polish`, `bolder`, `quieter`, `harden`, `colorize`, `typeset`, `layout`, dst). Bisa juga cek lewat `npx impeccable check`.

**Cara pakai.**

1. Jalankan `/impeccable init` sekali di awal — ini akan membaca konteks produk (bisa diarahkan ke `design-system-v2.md` dan `ENGINEERING.md` Bagian 7 yang sudah ada) supaya rekomendasi impeccable konsisten dengan token desain Hexatara, bukan template generik.
2. Setelah blok §12.5.1 selesai membuat komponen dasar (`ContentCard`, `StatusBadge`, `StarRating`, `ImageUploadField`), jalankan `/impeccable audit` untuk memeriksa komponen-komponen itu terhadap 61 pemeriksaan bawaan.
3. Untuk halaman yang sudah ada dan mau dipertajam (redesign Beranda §12.5.6, Pelatihan §12.5.7, Produk §12.5.8), pakai `/impeccable critique [halaman]` dulu untuk diagnosis, baru `/impeccable polish [halaman]` untuk perbaikan bertahap.

**Kapan dipakai di alur 12.5.x:** §12.5.1 (audit komponen dasar), §12.5.6–§12.5.8 (critique + polish per halaman), §12.5.14 (Dashboard User), §12.5.16 (audit visual menyeluruh — cocok banget dipasangkan dengan `/impeccable audit` sebagai pelengkap, bukan pengganti, pemeriksaan manual yang sudah didesain di blok itu).

---

## 2. taste-skill (tasteskill.dev) — opsional, jangan pakai bersamaan dengan impeccable

**Apa itu.** Skill Claude Code lain (`github.com/Leonxlnx/taste-skill`) dengan tujuan serupa impeccable: mencegah frontend generik lewat aturan tipografi/spacing/warna/layout yang lebih ketat. Isinya kumpulan skill (`design-taste-frontend`, `redesign-existing-projects`, `minimalist-ui`, dan beberapa skill image-generation seperti `brandkit`).

**Kenapa opsional.** Fungsinya tumpang tindih dengan impeccable yang sudah terpasang. Menjalankan keduanya sekaligus berisiko konteks yang saling bertentangan masuk ke sesi Claude Code (dua set aturan desain berbeda dibaca bersamaan). **Rekomendasi: tetap pakai impeccable saja** — sudah terpasang dan command-nya lebih lengkap. Pertimbangkan taste-skill hanya kalau nanti terasa impeccable kurang pas untuk kasus tertentu (mis. skill `minimalist-ui`-nya secara spesifik relevan, atau butuh skill `brandkit` untuk keperluan branding di luar UI).

**Instalasi (kalau memang mau dicoba).**

```powershell
npx skills add https://github.com/Leonxlnx/taste-skill --skill "minimalist-ui"
```

Pakai flag `--skill` untuk pasang satu skill spesifik saja (hindari pasang semua sekaligus supaya tidak bentrok dengan impeccable).

**Cara verifikasi.** Cek file skill muncul di direktori skill Claude Code (`~/.claude/skills/`), lalu skill tersebut akan muncul di daftar skill yang tersedia saat sesi baru dimulai.

**Cara pakai.** Tidak ada command slash terpisah yang wajib — begitu terpasang, skill ini bekerja pasif sebagai panduan tambahan yang dibaca Claude Code saat membuat/mengubah kode frontend.

---

## 3. awesome-design-md (VoltAgent) — referensi visual, bukan tool aktif

**Apa itu.** Bukan skill atau package — ini kumpulan 73+ file `DESIGN.md` (`github.com/VoltAgent/awesome-design-md`) hasil reverse-engineering sistem desain dari produk-produk terkenal (Linear, Notion, gaya Stripe, dst), masing-masing berisi dokumentasi warna/tipografi/komponen plus contoh HTML.

**Instalasi.** Tidak ada instalasi. Cukup clone atau unduh repo-nya, lalu pilih 1–2 file `DESIGN.md` yang gayanya paling dekat dengan brief Hexatara (minimalist/premium, satu warna aksen flat, shadow hanya di elemen mengambang — cari yang bergaya "clean SaaS minimal", bukan yang ramai/dekoratif).

**Cara verifikasi.** Tidak relevan — tidak ada proses instalasi untuk diverifikasi. Cukup pastikan file `DESIGN.md` yang dipilih sudah ada di komputer sebelum dipakai sebagai referensi.

**Cara pakai.** Salin isi 1–2 file `DESIGN.md` yang dipilih ke dalam prompt (atau taruh di root project sementara), lalu minta Claude Code menjadikannya referensi visual saat membangun halaman — misalnya di blok §12.5.6 (Redesign Beranda): "gunakan DESIGN.md ini sebagai referensi rasa tipografi dan spacing, TAPI tetap pakai warna dasar dan design token Hexatara yang sudah ada di `design-system-v2.md` — jangan tiru warna dari DESIGN.md referensi." Ini murni referensi rasa/gaya, bukan sumber kebenaran token warna Hexatara.

**Sudah dikerjakan:** empat file `DESIGN.md` yang paling cocok (Linear, Cal.com, Mintlify, Vercel) sudah dipilih dan dirangkum jadi satu file referensi gabungan: **`hexatara_DESIGN.md`**, khusus mengambil pola struktural (skala radius, ritme spacing, filosofi elevasi shadow-hanya-mengambang, disiplin satu-warna-aksen) dari keempatnya dan dicocokkan langsung dengan aturan `design-system-v2.md`. Tidak perlu memilih ulang dari 73+ file di repo — cukup lampirkan `hexatara_DESIGN.md` bersama `design-system-v2.md` saat menjalankan blok §12.5.1 dan blok redesign halaman berikutnya (§12.5.6–§12.5.8, §12.5.14).

**Kapan dipakai di alur 12.5.x:** §12.5.1 (fondasi komponen), §12.5.6–§12.5.8 (redesign Beranda/Pelatihan/Produk), §12.5.14 (Dashboard User) — lampirkan `hexatara_DESIGN.md` di setiap blok ini sebagai referensi struktur, bukan warna.

---

## 4. img2threejs — kemungkinan besar TIDAK relevan untuk Fase 12.5, jangan pasang dulu

**Apa itu.** Tool (`github.com/img2threejs/img2threejs`) yang mengubah gambar referensi menjadi model 3D prosedural berbasis Three.js/TypeScript (bukan sekadar ekstraksi mesh dari foto) lewat pipeline bertahap (blockout → struktur → material → pencahayaan → optimasi).

**Kenapa kemungkinan tidak relevan.** Brief Design System v2 Hexatara (§12.5.1, `design-system-v2.md`) adalah minimalist/premium 2D — tidak ada kebutuhan elemen 3D yang disebutkan di PRD atau ADR manapun untuk Fase 12.5. Memasang tool ini sekarang menambah kompleksitas tanpa use case yang jelas.

**Instalasi (simpan sebagai catatan, untuk nanti kalau memang dibutuhkan).**

```powershell
git clone https://github.com/img2threejs/img2threejs.git ~/.claude/skills/img2threejs
```

Butuh Python 3.10+ (standard library saja, tanpa pip install tambahan untuk fitur inti). Tidak butuh API key — memakai kemampuan vision Claude secara langsung.

**Cara verifikasi (kalau nanti dipasang).** Cek folder `~/.claude/skills/img2threejs/` sudah ada isinya, lalu command `/img2threejs` harus muncul di sesi Claude Code baru.

**Rekomendasi:** lewati dulu. Pasang hanya kalau nanti ada kebutuhan spesifik menampilkan model 3D (misal untuk visualisasi drone di halaman produk/pelatihan) yang belum ada di scope Fase 12.5 saat ini.

---

## Ringkasan keputusan cepat

| Tool | Status | Tindakan |
| --- | --- | --- |
| impeccable | Sudah terpasang | Pakai langsung mulai §12.5.1 |
| taste-skill | Opsional, tumpang tindih dengan impeccable | Lewati kecuali ada kebutuhan spesifik |
| awesome-design-md | Referensi, bukan tool | Pakai sebagai inspirasi visual di §12.5.6–§12.5.8, opsional |
| img2threejs | Di luar scope saat ini | Jangan pasang dulu |

Setelah tools di atas siap (minimal impeccable, karena sudah terpasang), lanjut ke blok prompt `## 12.5.1 Design system v2` di `PANDUAN.md` seperti biasa.
