# Prompt Cursor — F11.3: Redesign halaman Login Admin (tambah logo Hexatara)

> Acuan: `ENGINEERING.md` ADR-024, `PRD.md` §9f (khusus 9f.5), `feature-registry.md` Sprint 10.
> Sprint 10 / Modul 11 (ADR-024). TIDAK bergantung SQL, independen dari F11.1/F11.2, paling sederhana dari 3 kelompok kerja ini.
>
> Governance yang tetap berlaku penuh (CLAUDE.md/PRD.md §13.1): JANGAN membuat komponen logo baru — `BrandLogo` SUDAH ADA (`src/components/brand-logo.tsx`) dan sudah dipakai di sidebar Admin, WAJIB dipakai ulang di sini, bukan duplikat. JANGAN ubah field/validasi/logic form (`admin-login-form.tsx`) — perubahan ini murni visual di sekitar form yang sudah berfungsi.

## 0. Konteks yang WAJIB dipahami dulu sebelum mengubah kode

Baca dulu file-file ini secara utuh:

- `src/app/admin/login/page.tsx` — file utama yang diubah, kartu login saat ini hanya `CardTitle`/`CardDescription` teks tanpa logo.
- `src/components/brand-logo.tsx` — komponen `BrandLogo` yang SUDAH ADA dan HARUS dipakai ulang. Props: `variant` (`"default"` | `"mono"` | `"auto"` — pakai `"auto"` supaya otomatis ganti aset terang/gelap sesuai tema), `size`, `className`, `alt`, `priority`.
- `src/components/shell/admin-shell.tsx` — lihat baris ~387–394 sebagai REFERENSI cara `BrandLogo` sudah dipakai di sidebar Admin (`<BrandLogo variant="auto" size={28} className="size-7 shrink-0" />`), supaya konsisten ukuran/gaya pemakaian.
- `src/app/admin/login/admin-login-form.tsx` — form yang TIDAK diubah, hanya untuk memastikan perubahan layout di `page.tsx` tidak merusak struktur form ini.

---

## Konteks — SUDAH DITELUSURI, jangan diasumsikan ulang

Halaman Login Admin saat ini (`admin/login/page.tsx`):

```tsx
export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4">
      <Card>
        <CardHeader>
          <CardTitle>Login Admin</CardTitle>
          <CardDescription>Khusus staf Hexatara. Bukan untuk pengguna Free Track.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
```

Tidak ada elemen visual brand sama sekali — murni teks. `BrandLogo` sudah terbukti jalan di sidebar Admin dengan `variant="auto"` (otomatis pilih `hexatara-logo-default.png` di light mode, `hexatara-logo-monochrome.png` di dark mode).

---

## Perbaikan

### 1. Tambahkan BrandLogo ke kartu login

Di `admin/login/page.tsx`, tambahkan `<BrandLogo variant="auto" size={...} />` di bagian atas `CardHeader`, sebelum `CardTitle`. Ukuran (`size`) untuk halaman login boleh lebih besar dari sidebar (yang cuma 28px) supaya terasa sebagai fokus utama kartu — pilih ukuran yang seimbang dengan lebar kartu (`max-w-md`), misal sekitar 48–56px, sesuaikan secara visual.

Import yang dibutuhkan: `import { BrandLogo } from '@/components/brand-logo';`

### 2. Susun ulang bagian atas kartu supaya terasa branded

Contoh struktur (sesuaikan class Tailwind dengan style yang sudah konsisten di file lain, jangan asal tempel):

```tsx
<CardHeader className="items-center text-center">
  <BrandLogo variant="auto" size={48} className="mb-2" />
  <CardTitle>Login Admin</CardTitle>
  <CardDescription>Khusus staf Hexatara. Bukan untuk pengguna Free Track.</CardDescription>
</CardHeader>
```

Cek dulu apakah `CardHeader` (dari `@/components/ui/card`) mendukung className langsung untuk alignment seperti ini, atau perlu wrapper `div` terpisah — ikuti pola yang paling konsisten dengan pemakaian `Card`/`CardHeader` di file lain proyek ini (cek 1-2 contoh lain, misal halaman login publik kalau ada, atau kartu Admin lain).

### 3. Jangan ubah apa pun di bawah CardHeader

`CardContent` yang membungkus `<AdminLoginForm />` TIDAK diubah sama sekali — field, validasi, tombol submit, pesan error, semuanya tetap seperti sebelumnya.

---

## Sebelum melapor selesai

1. `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` bersih.
2. Uji manual: buka `/admin/login`, pastikan logo Hexatara tampil di atas judul "Login Admin", proporsional dengan lebar kartu, tidak pecah/blur.
3. Uji dark mode: pastikan logo otomatis berganti jadi versi monokrom yang kontras dengan latar gelap (perilaku `variant="auto"` yang sudah terbukti jalan di sidebar).
4. Uji form tetap berfungsi seperti sebelumnya: login dengan email/password benar berhasil masuk, login dengan kredensial salah menampilkan pesan error yang sama seperti sebelumnya.
5. Diuji di viewport 375px — logo dan judul tidak boleh membuat kartu overflow atau logo jadi terlalu besar dibanding form di bawahnya.
6. Laporkan ke Alif dengan screenshot atau deskripsi hasil di light mode dan dark mode.
7. Sesuai `CLAUDE.md` (Urutan kerja wajib, butir 6): **JANGAN tandai F11.3 DONE di `feature-registry.md` sampai Alif eksplisit mengonfirmasi sudah menguji sendiri di browser.** Begitu dikonfirmasi, update baris F11.3 — status DONE, kolom Berkas diisi file yang benar-benar diubah, kolom Diuji/Bukti diisi ringkasan hasil uji Alif.
