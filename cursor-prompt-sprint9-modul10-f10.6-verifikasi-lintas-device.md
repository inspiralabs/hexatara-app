# Prompt Cursor — F10.6: Verifikasi Email Lintas-Device (ADR-023)

> Acuan: `ENGINEERING.md` ADR-023 (Bagian 10, khusus poin 6 Konteks), `PRD.md` §5.1f dan §9e (khusus 9e.8), `feature-registry.md` Sprint 9.
> Sprint 9 / Modul 10. **PALING KOMPLEKS, BERGANTUNG F10.5.** Jangan mulai bagian ini sebelum F10.5 selesai DAN teruji end-to-end (link email sudah lewat `generateLink()`, bukan lagi `signUp()`/`resetPasswordForEmail()` langsung) — bagian ini mengasumsikan arsitektur baru F10.5 sudah berjalan.
>
> Governance yang tetap berlaku penuh (CLAUDE.md/PRD.md §13.1): JANGAN menambah tabel/kolom baru — status verifikasi cukup dibaca dari `auth.users.email_confirmed_at` (skema bawaan Supabase). JANGAN menambah dependency baru tanpa izin eksplisit (animasi cukup CSS/Tailwind, cek dulu `package.json` sebelum menambah library animasi).

## 0. Konteks yang WAJIB dipahami dulu sebelum mengubah kode

Baca dulu file-file ini secara utuh:

- `src/app/auth/confirm/route.ts` — hasil perubahan F10.5, akan diubah lagi di sini khusus untuk cabang `type === 'signup'`.
- `src/app/[locale]/(auth)/verifikasi-email/page.tsx` dan `verifikasi-poller.tsx` — mekanisme polling lama (`router.refresh()` pasif) yang akan diganti jadi polling aktif ke server action.
- `src/app/[locale]/(auth)/daftar/daftar-form.tsx` dan `daftar/actions.ts` (hasil F10.5) — untuk memastikan email pendaftar bisa diteruskan ke `VerifikasiPoller`.
- `src/lib/supabase/admin.ts` dan `src/lib/supabase/server.ts` — `createAdminClient()`/`createClient()`, dipakai di server action polling baru.
- `src/components/auth/auth-shell.tsx` — komponen shell auth, dipakai untuk halaman `verifikasi-berhasil` baru supaya konsisten visual.

---

## Konteks — masalah nyata dari klien (Abi, disampaikan Alif)

Skenario: user selesai LMS di LAPTOP, klik "Dapatkan Sertifikat" → diarahkan ke form daftar, isi form DI LAPTOP → muncul layar "menunggu verifikasi" DI LAPTOP → user buka inbox emailnya di HP (device lain) → klik link verifikasi DI HP → **masalah:** (a) sebelum F10.5, link itu error localhost; (b) SETELAH link diperbaiki, laptop (device asal, tempat form diisi) TIDAK PERNAH otomatis masuk dashboard — dia masih diam di layar "menunggu verifikasi" selamanya, padahal verifikasi sudah selesai di HP.

**Root cause mekanisme lama, SUDAH DITELUSURI:** `src/app/[locale]/(auth)/verifikasi-email/verifikasi-poller.tsx` memakai `setInterval(() => router.refresh(), 3000)` — `router.refresh()` cuma menghitung ulang Server Component dengan COOKIE TERBARU di browser YANG SAMA. Kalau verifikasi terjadi di device LAIN, cookie sesi baru itu ditulis di device LAIN itu (lewat `/auth/confirm/route.ts` yang memanggil `exchangeCodeForSession()`/`verifyOtp()`, keduanya menulis cookie sesi ke response request SAAT ITU — yaitu request dari device yang klik link, bukan device asal). Device asal (laptop) tidak pernah menerima cookie baru itu — `router.refresh()`-nya percuma, tidak ada yang berubah untuk dibaca ulang.

**Arah yang sudah dikonfirmasi Alif:** device MANAPUN yang klik link verifikasi HANYA menandai status email terverifikasi (tampilkan layar centang besar + animasi, TANPA membuat sesi/login di device itu). Device ASAL (tempat form diisi) yang polling status via SERVER ACTION (bukan `router.refresh()` pasif), dan begitu terverifikasi, device ASAL itu sendiri yang dibuatkan sesi baru dan diarahkan otomatis ke dashboard.

---

## 1. Ubah `/auth/confirm/route.ts` — jangan buat sesi otomatis untuk link verifikasi signup

Baca ulang route ini setelah perubahan F10.5. Untuk `type === 'signup'` (link verifikasi email baru, BUKAN untuk `type === 'recovery'`/reset password yang tetap boleh langsung bikin sesi karena reset password memang selalu dilakukan di device yang sedang dipakai login):

- **JANGAN** panggil `exchangeCodeForSession()`/`verifyOtp()` dengan cara yang otomatis menulis cookie sesi untuk request ini.
- Ganti behaviornya: verifikasi token secara terpisah dengan cara yang HANYA menandai `email_confirmed_at` terisi di `auth.users` TANPA membuat sesi baru untuk request saat ini — opsi paling aman adalah memakai `supabaseAdmin.auth.admin.verifyOtp()` **kalau tersedia**, atau alternatif: panggil `verifyOtp()` dengan client biasa TAPI, karena ini ADALAH cara Supabase menandai email confirmed, cookie session akan tetap tertulis untuk device yang klik link — **redirect setelahnya JANGAN ke `/dashboard`**, melainkan ke halaman verifikasi statis baru (lihat poin 2) yang secara eksplisit TIDAK memakai sesi itu untuk apa pun (halaman itu murni tampilan "berhasil", tidak query data user).
- Riset dulu apakah Supabase Admin API punya cara memverifikasi OTP TANPA membuat sesi client (misalnya lewat REST endpoint admin, atau `admin.updateUserById(userId, { email_confirm: true })` dipanggil setelah admin sendiri yang memvalidasi `token_hash` secara manual) — kalau ada cara yang benar-benar tidak menulis cookie sama sekali, itu LEBIH BERSIH daripada verifyOtp() biasa yang menulis cookie lalu diabaikan. Laporkan pendekatan mana yang akhirnya dipakai dan kenapa ke Alif.
- Redirect akhir untuk `type === 'signup'` menuju halaman BARU, misalnya `/verifikasi-berhasil` (lihat poin 2) — BUKAN lagi `next` param lama yang mengarah ke `/dashboard` atau `/verifikasi-email`.
- `type === 'recovery'` (reset password) TIDAK diubah — device yang klik link reset password memang device yang sedang dipakai user saat itu, sesi normal tetap dibuat, alur `reset-sandi` tidak disentuh bagian ini.

## 2. Halaman baru: `/verifikasi-berhasil` — layar statis, TANPA sesi/dashboard

Buat halaman baru sederhana (Server Component, TIDAK butuh login/sesi apa pun untuk diakses — ini yang dibuka di device MANAPUN setelah klik link):

```
src/app/[locale]/(auth)/verifikasi-berhasil/page.tsx
```

Isinya HANYA: ikon centang besar, pesan "Email berhasil diverifikasi. Kamu bisa menutup halaman ini — perangkat tempat kamu mendaftar akan otomatis masuk ke dashboard." Pakai `AuthShell` yang sudah ada supaya konsisten visual dengan halaman auth lain. TIDAK ada tombol "Ke Dashboard" di sini (sengaja — device ini BUKAN device asal, tidak boleh mengarahkan ke dashboard).

## 3. Server action polling status — dipanggil device ASAL

Buat server action baru, misalnya di `src/app/[locale]/(auth)/verifikasi-email/actions.ts`:

```ts
'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function cekStatusVerifikasiAction(email: string) {
  const supabaseAdmin = createAdminClient();
  // Cari user berdasarkan email lewat admin API (listUsers dengan filter, atau
  // cara lain yang tersedia di versi @supabase/supabase-js yang dipakai proyek ini —
  // cek dulu API yang benar-benar ada sebelum menulis kode final).
  const { data, error } = await supabaseAdmin.auth.admin.listUsers(); // sesuaikan filter email
  const user = data?.users?.find((u) => u.email === email);

  if (!user || !user.email_confirmed_at) {
    return { terverifikasi: false as const };
  }

  // Email sudah terverifikasi — device ASAL (yang memanggil action ini) yang
  // dibuatkan sesi baru DI SINI, lewat generateLink(type: 'magiclink') diikuti
  // verifyOtp() DALAM REQUEST YANG SAMA, supaya cookie sesi tertulis untuk
  // device pemanggil action ini (device asal), BUKAN device yang klik link email.
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (linkError || !linkData.properties?.hashed_token) {
    console.error('[verifikasi] gagal generate magic link untuk auto-login:', linkError);
    return { terverifikasi: true as const, gagalLogin: true as const };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: linkData.properties.hashed_token,
  });

  if (verifyError) {
    console.error('[verifikasi] gagal verifyOtp untuk auto-login:', verifyError);
    return { terverifikasi: true as const, gagalLogin: true as const };
  }

  return { terverifikasi: true as const, gagalLogin: false as const };
}
```

**PENTING — verifikasi dulu API yang benar-benar tersedia:**
- Cek apakah `supabaseAdmin.auth.admin.listUsers()` mendukung filter by email langsung di versi `@supabase/supabase-js` yang dipakai proyek ini (`package.json`), atau perlu cara lain (`getUserById` kalau id sudah diketahui dari konteks lain, atau `listUsers` lalu filter manual di JS seperti draf di atas — cukup untuk skala user proyek ini, tapi kalau ada cara lebih efisien pakai itu).
- Cek apakah `generateLink({ type: 'magiclink' })` benar-benar tidak mengirim email (harus TIDAK — `generateLink` secara umum tidak pernah mengirim email sendiri, hanya `signInWithOtp`/dst yang mengirim) — pastikan lewat baca dokumentasi resmi Supabase, jangan asumsi.
- Pola "panggil `verifyOtp()` di server action supaya cookie tertulis untuk request pemanggil" HARUS diuji nyata — pastikan `createClient()` (`lib/supabase/server.ts`) dipanggil DI DALAM server action ini (bukan di luar/di-cache) supaya context cookie yang benar (milik device asal yang sedang me-request action ini) yang dipakai.

## 4. `VerifikasiPoller` diganti — polling aktif ke server action, bukan `router.refresh()` pasif

Edit `src/app/[locale]/(auth)/verifikasi-email/verifikasi-poller.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { cekStatusVerifikasiAction } from './actions';

export function VerifikasiPoller({ sudahLogin, email }: { sudahLogin: boolean; email: string }) {
  const router = useRouter();
  const [mengecek, setMengecek] = useState(false);

  useEffect(() => {
    if (sudahLogin) {
      router.push('/dashboard');
      return;
    }

    const interval = setInterval(async () => {
      setMengecek(true);
      const hasil = await cekStatusVerifikasiAction(email);
      setMengecek(false);
      if (hasil.terverifikasi && !hasil.gagalLogin) {
        router.push('/dashboard');
      } else if (hasil.terverifikasi && hasil.gagalLogin) {
        // Terverifikasi tapi auto-login gagal — arahkan ke login manual.
        router.push('/login?verified=1');
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sudahLogin, email, router]);

  return null; // atau render indikator kecil kalau mengecek === true, opsional
}
```

`email` perlu diteruskan dari `page.tsx` yang memanggil `VerifikasiPoller` — cek dari mana email pendaftar bisa didapat di halaman ini (kemungkinan dari query param, atau state yang dilewatkan setelah submit form daftar — telusuri alur `daftar-form.tsx` → redirect ke `/verifikasi-email` untuk tahu apa yang tersedia; kalau belum ada, tambahkan `?email=` ke redirect setelah daftar berhasil, atau simpan sementara di sessionStorage saat submit form).

## 5. Animasi di layar menunggu — permintaan tambahan Alif

Alif secara eksplisit minta layar "menunggu verifikasi" (halaman `verifikasi-email/page.tsx`, kondisi belum `sudahLogin`) diberi animasi supaya lebih menarik selagi menunggu, bukan teks statis polos. Tambahkan animasi ringan (contoh: ikon amplop/email dengan animasi pulse/bounce CSS, atau titik-titik loading berjalan di belakang teks "Menunggu verifikasi...") — cek dulu apakah proyek sudah pakai library animasi (Framer Motion?) lewat `package.json`; kalau tidak ada, cukup pakai animasi CSS/Tailwind (`animate-pulse`, `animate-bounce`, atau keyframe custom di `globals.css`) supaya tidak menambah dependency baru untuk hal sekecil ini.

---

## Sebelum melapor selesai

1. `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` bersih.
2. **Uji dengan DUA PERANGKAT FISIK BERBEDA** (bukan dua tab satu browser, bukan mode incognito di browser yang sama — device asal dan device yang klik link HARUS benar-benar beda cookie storage): selesaikan LMS di device A (laptop), daftar akun baru, catat layar "menunggu verifikasi" muncul dengan animasi. Buka email di device B (HP), klik link verifikasi — pastikan device B menampilkan layar "Email berhasil diverifikasi" TANPA masuk dashboard. Kembali ke device A dalam beberapa detik — pastikan device A OTOMATIS pindah ke dashboard TANPA aksi tambahan dari user.
3. Uji juga alur reset password (`type: 'recovery'`) TIDAK terpengaruh perubahan ini — klik link reset masih langsung bisa ganti password di device yang sama, seperti sebelumnya.
4. Uji kegagalan: device A ditutup/refresh sebelum verifikasi selesai — pastikan tidak ada error, cukup layar menunggu yang tetap ada kalau dibuka ulang (asalkan email masih sama).
5. Diuji di viewport 375px untuk kedua halaman (`verifikasi-email`, `verifikasi-berhasil`).
6. Laporkan ke Alif — WAJIB sertakan konfirmasi bahwa uji dilakukan dengan dua perangkat fisik berbeda, bukan simulasi satu browser (Definisi Selesai §14 tidak terpenuhi kalau hanya diuji di satu device).
7. Sesuai `CLAUDE.md` (Urutan kerja wajib, butir 6): **JANGAN tandai F10.6 DONE di `feature-registry.md` sampai Alif eksplisit mengonfirmasi sudah menguji sendiri dengan dua perangkat fisik.** Begitu dikonfirmasi, update baris F10.6 — status DONE, kolom Berkas diisi file yang benar-benar diubah, kolom Diuji/Bukti diisi ringkasan hasil uji dua-device Alif.
