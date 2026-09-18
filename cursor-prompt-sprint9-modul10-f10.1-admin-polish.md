# Prompt Cursor — F10.1: Polish Admin (menu Leads, warna tombol, hint silabus)

> Sprint 9 / Modul 10 (ADR-023). Kelompok TERMUDAH — tidak butuh SQL, tidak menyentuh skema, murni perubahan tampilan/organisasi di Admin. Tiga bagian independen, bisa dikerjakan berurutan dan dilaporkan sekaligus.

---

## Bagian 1 — Pindahkan menu Pendaftaran Batch & Peserta Pendaftaran ke section Leads

**Masalah:** Alif merasa ambigu antara menu "Pendaftaran Batch"/"Peserta Pendaftaran" (saat ini di section "Batch") dengan section "Leads" (isinya "Pendaftaran Minat"/"Permintaan Penawaran") — sama-sama mengandung kata "pendaftaran".

**PENTING — sudah dicek, JANGAN dihapus apa pun:** tidak ada route/menu terpisah bernama polos "Pendaftaran" yang jadi dead code. Yang perlu dilakukan HANYA memindahkan dua item menu yang sudah ada ke section lain — bukan penghapusan.

Edit `src/components/shell/admin-shell.tsx`. Struktur `MENU_ADMIN` saat ini:

```tsx
{
  section: "Batch",
  icon: CalendarDaysIcon,
  items: [
    { href: "/admin/batch", label: "Daftar Batch" },
    { href: "/admin/pendaftaran-batch", label: "Pendaftaran Batch" },
    { href: "/admin/peserta-pendaftaran", label: "Peserta Pendaftaran" },
    { href: "/admin/batch/kategori", label: "Kategori Pelatihan" },
  ],
},
// ...
{
  section: "Leads",
  icon: InboxIcon,
  items: [
    { href: "/admin/leads/minat", label: "Pendaftaran Minat" },
    { href: "/admin/leads/penawaran", label: "Permintaan Penawaran" },
  ],
},
```

Ubah jadi:

```tsx
{
  section: "Batch",
  icon: CalendarDaysIcon,
  items: [
    { href: "/admin/batch", label: "Daftar Batch" },
    { href: "/admin/batch/kategori", label: "Kategori Pelatihan" },
  ],
},
// ...
{
  section: "Leads",
  icon: InboxIcon,
  items: [
    { href: "/admin/leads/minat", label: "Pendaftaran Minat" },
    { href: "/admin/leads/penawaran", label: "Permintaan Penawaran" },
    { href: "/admin/pendaftaran-batch", label: "Pendaftaran Batch" },
    { href: "/admin/peserta-pendaftaran", label: "Peserta Pendaftaran" },
  ],
},
```

Tidak ada perubahan lain di file ini — route, `page.tsx`, komponen di dalamnya semua tetap sama persis, cuma posisi di sidebar yang pindah. Cek fungsi `childAktif` di file yang sama tidak bergantung section tertentu (murni cocokkan `pathname` dengan `href`) — seharusnya tidak perlu diubah, tapi konfirmasi setelah pindah highlight menu aktif tetap benar saat membuka `/admin/pendaftaran-batch` atau `/admin/peserta-pendaftaran`.

**Uji:** buka `/admin`, section "Leads" sekarang berisi 4 item (Pendaftaran Minat, Permintaan Penawaran, Pendaftaran Batch, Peserta Pendaftaran), section "Batch" berisi 2 item (Daftar Batch, Kategori Pelatihan). Klik tiap item, pastikan mengarah ke halaman yang benar dan menu aktif ter-highlight dengan benar.

---

## Bagian 2 — Warna tombol konsisten (edit=biru, hapus=merah, setujui=hijau)

**Masalah:** tombol aksi di Admin tidak konsisten — misalnya tombol "Setuju" di `pendaftaran-batch-row-actions.tsx` masih varian `default` (warna primary biasa), "Tolak" masih `outline`, tidak ada pembeda visual jelas antara aksi edit/hapus/setujui di seluruh Admin.

**Perbaikan — TAMBAH varian baru ke `buttonVariants`, JANGAN ubah varian yang sudah ada** (varian lama `default`/`outline`/`secondary`/`ghost`/`destructive`/`link` dipakai luas di publik+Admin, mengubah definisinya berisiko regresi visual di tempat yang tidak dimaksud).

Edit `src/components/ui/button.tsx`. Tambahkan dua varian baru ke object `variants.variant` di dalam `cva(...)`, mengikuti pola token yang sudah dipakai varian `destructive` (pasangan light/dark lewat `dark:` prefix, `focus-visible:ring` senada):

```tsx
edit: "bg-blue-600/10 text-blue-700 hover:bg-blue-600/20 focus-visible:border-blue-600/40 focus-visible:ring-blue-600/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 dark:focus-visible:ring-blue-500/40",
success: "bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20 focus-visible:border-emerald-600/40 focus-visible:ring-emerald-600/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 dark:focus-visible:ring-emerald-500/40",
```

(Sesuaikan skala warna kalau proyek sudah punya token `--blue`/`--emerald` sendiri di `globals.css` — cek dulu apakah ada, kalau tidak ada token khusus, kelas Tailwind `blue-600`/`emerald-600` di atas sudah cukup konsisten dengan pola `destructive` yang sudah ada.)

`destructive` (merah, SUDAH ADA) dipakai untuk SEMUA aksi hapus — cek dulu titik-titik hapus di seluruh Admin (`*-row-actions.tsx` di `batch/`, `produk/`, `materi/soal/`, `sertifikat/`, `konten/*`, dll — cari lewat grep `AlertDialogAction` atau tombol dengan label "Hapus") dan pastikan semua pakai `variant="destructive"`, ganti yang masih `outline`/`default` untuk aksi hapus.

Tombol edit (label "Edit"/"Ubah", biasanya mengarah ke halaman `[id]/page.tsx` atau membuka dialog edit) ganti jadi `variant="edit"`.

Tombol setujui/approve (contoh konkret: `src/app/admin/(protected)/pendaftaran-batch/pendaftaran-batch-row-actions.tsx`, tombol "Setuju" baris ~57 dan `AlertDialogAction` di baris ~73 — juga cek pola serupa di `admin/upgrade` untuk approve pesanan sertifikat kalau ada) ganti jadi `variant="success"`.

Cek juga tombol "Tolak" di file yang sama — TETAP `variant="outline"` atau ganti ke `destructive` sesuai preferensi konsistensi (tolak = aksi negatif, masuk akal disamakan dengan hapus/merah) — putuskan sendiri yang paling konsisten dan laporkan pilihannya ke Alif.

**Uji:** buka beberapa halaman Admin dengan tombol edit/hapus/setujui (pendaftaran-batch, batch, produk, materi/soal), pastikan warnanya konsisten (biru/merah/hijau) dan tetap jelas terbaca di dark mode (toggle tema, cek kontras teks tidak hilang).

---

## Bagian 3 — Hint heading silabus di form Admin Batch

**Masalah:** halaman publik pelatihan (`pelatihan/[slug]/page.tsx`) sudah memecah silabus jadi akordion otomatis lewat `splitHtmlByHeadings()` berdasarkan heading di rich text — tapi form Admin Batch (`batch-form.tsx`) tidak memberi tahu Admin bahwa menulis heading itu yang menentukan pembagian akordion. Ini BUKAN fitur baru, cukup keterangan di form.

Edit `src/app/admin/(protected)/batch/batch-form.tsx`, field `silabus_id`/`silabus_en` (sekitar baris 483–507). Tambahkan `<FormDescription>` di kedua field:

```tsx
<FormField
  control={control}
  name="silabus_id"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Silabus (Indonesia)</FormLabel>
      <FormControl>
        <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
      </FormControl>
      <FormDescription>
        Gunakan Heading (H2/H3) di editor untuk memisahkan bagian — setiap heading akan
        tampil sebagai satu item akordion terpisah di halaman publik.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

Terapkan pola yang sama untuk `silabus_en`. Cek dulu apakah `FormDescription` sudah diimpor di file ini (kemungkinan besar sudah dipakai field lain).

**Uji:** buka form Edit/Tambah Batch, scroll ke field Silabus, pastikan keterangan baru muncul di bawah kedua editor (ID dan EN), tidak merusak layout form yang sudah ada.

---

## Sebelum melapor selesai

1. `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` bersih.
2. Uji ketiga bagian di viewport 375px (sidebar Admin mobile, tombol aksi di tabel/card mobile, form Batch mobile).
3. Laporkan ke Alif sebagai satu laporan (tiga bagian ini ringan, tidak perlu dipisah per bagian seperti F09.2).
