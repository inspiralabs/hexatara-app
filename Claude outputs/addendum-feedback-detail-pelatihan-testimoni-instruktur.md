# Feedback lanjutan Tahap 2 (Pelatihan) + update Testimoni & Instruktur Beranda — tempel ke Cursor

## 1. Keputusan suggest pelatihan (dari plan.md sebelumnya): kombinasi A+B, TOLAK C

- **(A)** Isi `category_id` yang masih kosong untuk batch "rpc-oktober-2026" dan
  "rpc-agustus-2026" — samakan dengan `category_id` batch "rpc-november-2026"
  (ketiganya `kategori_id` teksnya sudah sama: "Sertifikasi RPC"). Ini WAJIB pakai
  SQL yang diajukan dulu ke saya untuk dijalankan manual di Supabase (aturan PRD §5:
  agent tidak pernah eksekusi DDL/DML sendiri) — tulis SQL UPDATE-nya, jangan
  dieksekusi.
- **(B)** Sebagai pengaman jangka panjang, ubah query rekomendasi di
  `pelatihan/[slug]/page.tsx` supaya fallback: utamakan match `category_id` sama
  kalau ada; kalau `category_id` batch ini kosong ATAU tidak ada peer dengan
  `category_id` sama, baru cocokkan lewat `kategori_id` (teks) yang identik. TETAP
  exclude batch itu sendiri, tetap limit 3, TETAP disembunyikan (bukan fallback ke
  batch acak) kalau dua-duanya tidak ada yang cocok — jangan ubah prinsip "tidak
  asal tampil" yang sudah ada.
- **JANGAN** kerjakan opsi C (OR longgar tanpa prioritas) — berisiko false-positive.

## 2. Reorganisasi & aksordion di halaman detail batch (`pelatihan/[slug]/page.tsx`)

- Card "Jadwal & Investasi" berisi info paling penting (tanggal, lokasi, harga,
  tombol daftar) — saat ini sejajar 1:1:1 dengan "Dukungan Peserta" dan "Peralatan
  Belajar" di grid 3 kolom, jadi tidak terlihat dominan. Ubah grid supaya "Jadwal &
  Investasi" tampil lebih besar/menonjol (misal 2 kolom dari 3, atau full-width di
  baris sendiri di atas — putuskan sendiri sesuai konteks layout, tapi jangan
  hilangkan sifat responsive yang sudah ada di 375px).
- Urutan tampil: "Jadwal & Investasi" → "Peralatan Belajar" → "Dukungan Peserta"
  (Peralatan Belajar naik ke urutan kedua karena berisi info konkret yang
  dibutuhkan; Dukungan Peserta sifatnya pendukung/kontak, taruh terakhir).
- Bagian "Silabus" (salah satu tab di Deskripsi/Silabus) — ganti jadi akordion
  seperti pola FAQ yang sudah ada di halaman yang sama (`Accordion`/
  `AccordionItem`/`AccordionTrigger`/`AccordionContent` dari
  `@/components/ui/accordion`, sudah dipakai untuk FAQ section — reuse komponen
  yang sama, jangan bikin akordion baru). Deskripsi tetap seperti sekarang (bukan
  akordion), yang diubah cuma tab Silabus jadi akordion — periksa dulu apakah
  silabus disimpan sebagai satu blok HTML panjang atau berformat list per-item;
  kalau satu blok HTML dari Tiptap, pecah dulu jadi item-item akordion berdasarkan
  heading `<h2>`/`<h3>` di dalamnya (kalau tidak bisa diparse otomatis dengan aman,
  laporkan ke saya dulu sebelum eksekusi, jangan asal split teks).

## 3. Testimoni Beranda — referensi visual dari 21st.dev (`testimonial-card.tsx`), diselaraskan ke sistem Hexatara

Berikut kode referensi ASLI dari 21st.dev (dipakai HANYA sebagai acuan visual/layout —
struktur data dan sebagian besar implementasinya TIDAK cocok untuk proyek ini, lihat
poin penyesuaian di bawahnya):

```tsx
// REFERENSI VISUAL SAJA — testimonial-card.tsx dari 21st.dev
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'

  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex flex-col rounded-lg border-t",
        "bg-gradient-to-b from-muted/50 to-muted/10",
        "p-4 text-start sm:p-6",
        "hover:from-muted/60 hover:to-muted/20",
        "max-w-[320px] sm:max-w-[320px]",
        "transition-colors duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={author.avatar} alt={author.name} />
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-md font-semibold leading-none">
            {author.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {author.handle}
          </p>
        </div>
      </div>
      <p className="sm:text-md mt-4 text-sm text-muted-foreground">
        {text}
      </p>
    </Card>
  )
}
```

Layout intinya yang ingin saya ambil: avatar + nama + sub-label sejajar di atas, lalu
teks testimoni di bawahnya, dalam card dengan gradient halus dan radius lembut. Grid
tampilan: `sm:grid-cols-2 lg:grid-cols-3`, mirip contoh demo referensi itu.

**Catatan bentuk avatar:** JANGAN dibuat bulat (`rounded-full`) seperti implementasi
`testimoni-section.tsx`/`instruktur-section.tsx` yang sekarang — ikuti kode referensi
21st.dev di atas (`Avatar` polos tanpa `rounded-full`, defaultnya persegi/sedikit
rounded sesuai style shadcn `Avatar`). Cek dulu default radius komponen `Avatar` versi
Base UI yang sudah ada di proyek (`@/components/ui/avatar.tsx`) — kalau default-nya
`rounded-full` bawaan komponen, override dengan class radius kecil (misal
`rounded-md`/`rounded-lg`, bukan `rounded-full`) supaya sesuai referensi.

**Penyesuaian WAJIB ke sistem Hexatara — jangan copy-paste kode di atas mentah-mentah:**

- Kode itu pakai `@radix-ui/react-avatar` (lewat `@/components/ui/avatar` versi shadcn
  default). Proyek ini SUDAH punya `Avatar`/`AvatarImage` sendiri di
  `@/components/ui/avatar.tsx`, tapi berbasis **Base UI** (`@base-ui/react/avatar`),
  BUKAN Radix. **JANGAN install `@radix-ui/react-avatar`** — itu dependency baru yang
  butuh izin eksplisit dan akan bikin dua library avatar primitive nyampur di satu
  proyek. Reuse `Avatar`/`AvatarImage` yang sudah ada di proyek, sesuaikan prop-nya
  kalau beda signature dengan versi Radix di contoh (cek dulu API `Avatar` versi
  Base UI yang sudah ada sebelum dipakai).
- Struktur data 21st.dev itu `{ name, handle, avatar }` (gaya testimoni Twitter/X) —
  data aktual testimoni Hexatara ada di tabel `testimonials` (`nama`,
  `peran_id`/`peran_en`, `isi_id`/`isi_en`, `foto_url`). Ganti `handle` dengan `peran`
  (cek isi kolom `peran_id` aktual — kemungkinan berisi jabatan atau nama batch
  pelatihan yang diikuti, misal "RPC Batch 2"). TIDAK ada dan TIDAK perlu field
  handle media sosial.
- **JANGAN** pakai foto placeholder CDN 21st.dev — pakai `foto_url` dari database
  (field sudah ada), fallback avatar kosong kalau `foto_url` null (pola yang sudah
  ada di `testimoni-section.tsx` sekarang).
- `href` (link ke profil sosial) di kode referensi TIDAK relevan untuk testimoni
  Hexatara — hilangkan prop itu sepenuhnya, card testimoni tidak perlu jadi link.
  Kalau interaksi hover diperlukan, cukup efek visual (translate/shadow), bukan
  navigasi.
- Ganti token warna: `bg-gradient-to-b from-muted/50 to-muted/10` boleh dipakai
  sebagai INSPIRASI gradient halus, tapi ADAPTASIKAN ke token Cobalt Mist yang sudah
  ada di `public-ui.ts` (`border-border`, `bg-card`, dst) — bukan token abu-abu
  generik shadcn default apa adanya. Heading section tetap pakai `publicSectionHeading`
  yang sudah dipakai section lain.
- Update `testimoni-section.tsx` yang SUDAH ADA — jangan bikin file/komponen baru
  terpisah dari struktur section yang sudah dipakai di Beranda. Jangan install
  file `demo.tsx` dari referensi, itu cuma contoh pemakaian untuk 21st.dev sendiri.

## 4. Instruktur Kami Beranda — referensi visual dari 21st.dev ("Example"), diselaraskan ke sistem Hexatara

Berikut kode referensi ASLI dari 21st.dev (dipakai HANYA sebagai acuan visual foto
besar + rounded-2xl + hover scale — struktur dan tema warnanya TIDAK cocok, lihat
penyesuaian di bawah):

```tsx
// REFERENSI VISUAL SAJA — testimonial.tsx / "Example" dari 21st.dev
export default function Example() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="max-w-80 bg-black text-white rounded-2xl">
                <div className="relative -mt-px overflow-hidden rounded-2xl">
                    <img src="..." alt="" className="h-[270px] w-full rounded-2xl hover:scale-105 transition-all duration-300 object-cover object-top" />
                    <div className="absolute bottom-0 z-10 h-60 w-full bg-gradient-to-t pointer-events-none from-black to-transparent"></div>
                </div>
                <div className="px-4 pb-4">
                    <p className="font-medium border-b border-gray-600 pb-5">"Quote di sini"</p>
                    <p className="mt-4">— Nama</p>
                    <p className="text-sm font-medium bg-gradient-to-r from-[#8B5CF6] via-[#E0724A] to-[#9938CA] text-transparent bg-clip-text">Peran</p>
                </div>
            </div>
            {/* ...card berikutnya, pola sama */}
        </div>
    );
}
```

Elemen visual yang ingin saya ambil: foto lebih besar dan dominan (bukan avatar
bulat kecil seperti sekarang), radius besar (`rounded-2xl`), hover scale halus pada
foto.

**Penyesuaian WAJIB ke sistem Hexatara — jangan copy-paste kode di atas mentah-mentah:**

- Kode itu dark card (`bg-black text-white`) dengan foto stok Unsplash generik —
  proyek ini WAJIB light theme, **NO dark theme sama sekali** di halaman publik
  (aturan yang sudah berkali-kali ditegaskan sepanjang §12.6.9 ini). **JANGAN** pakai
  `bg-black`/`text-white`/gradient overlay hitam. Ganti ke `bg-card`/`border-border`/
  `text-foreground` sesuai token Cobalt Mist yang sudah dipakai section lain.
- Data instruktur aktual ada di tabel `instructors` (`nama`, `foto_url`,
  `jabatan_id`/`jabatan_en`) — **TIDAK ADA** field kutipan/quote seperti di contoh
  21st.dev itu (yang formatnya lebih ke arah testimonial-quote-dengan-foto-besar).
  Instruktur BUKAN testimoni — jangan pindahkan konsep "quote" ke card instruktur,
  cukup nama + jabatan di bawah foto (struktur data yang sudah ada sekarang, TIDAK
  perlu field baru).
- Gradient teks warna-warni `from-[#8B5CF6] via-[#E0724A] to-[#9938CA]` di contoh
  itu bukan bagian dari palet Cobalt Mist yang disetujui (§12.6.9) — **JANGAN**
  dipakai, ganti jabatan dengan teks polos `text-muted-foreground` seperti section
  lain.
- Foto `object-cover object-top` dan hover-scale (`hover:scale-105
  transition-all duration-300`) boleh diadopsi apa adanya — itu murni interaksi
  visual, tidak menyentuh warna/tema.
- Update `instruktur-section.tsx` yang SUDAH ADA (bukan file baru), struktur data
  tetap dari Supabase seperti sekarang (`instructors` table, prop `limit`
  opsional yang sudah ada tetap dipertahankan karena dipakai juga di halaman detail
  batch), cuma tampilan card-nya yang di-upgrade ke foto lebih besar & modern,
  tanpa dark theme.

## 5. Berlaku untuk poin 3 dan 4

Light theme wajib (no dark theme di publik), mobile-first (cek grid/spacing di
375px — di layar sempit foto besar di poin 4 kemungkinan perlu turun jadi 1 kolom
per baris, sesuaikan), dan pastikan `ContentCard` shared TIDAK diubah langsung kalau
ternyata butuh reuse — tetap ikuti pola `variant="public"` yang sudah dipakai di
Produk/Jadwal, atau pertahankan markup section-specific seperti yang sudah ada
sekarang kalau `ContentCard` tidak cocok untuk struktur testimoni/instruktur ini.

---

Setelah semua selesai, jalankan tsc/lint/build, verifikasi visual mobile+desktop,
laporkan SQL untuk poin 1a (isi `category_id`) ke saya untuk dijalankan manual —
JANGAN dieksekusi otomatis.
