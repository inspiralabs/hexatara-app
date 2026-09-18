# Prompt Cursor — F10.5: Infrastruktur Email Penuh Resend (verifikasi + reset password)

> Sprint 9 / Modul 10 (ADR-023). Tidak butuh SQL. Mengubah alur inti autentikasi — kerjakan hati-hati, uji menyeluruh sebelum lapor selesai. F10.6 (verifikasi lintas-device) BERGANTUNG pada perubahan ini, kerjakan F10.5 dulu sampai tuntas dan teruji sebelum mulai F10.6.

---

## Konteks — SUDAH DITELUSURI

- `src/lib/email/templates.ts` SUDAH punya `templateVerifikasiEmail(params, kontak)` dan `templateResetSandi(params, kontak)` — keduanya pakai `baseLayout()` yang SUDAH branded (header logo Hexatara, footer kontak, warna cobalt mist). **Fungsi-fungsi ini SUDAH ADA dan SUDAH BENAR — jangan ditulis ulang, cukup dipanggil.**
- `src/lib/email/send.ts` SUDAH punya `kirimEmailVerifikasi(to, params)` dan `kirimEmailResetSandi(to, params)` yang memanggil template di atas dan kirim lewat Resend (`src/lib/email/client.ts`, `resend.emails.send(...)`, `RESEND_API_KEY` sudah ada di env). **Fungsi-fungsi ini JUGA SUDAH ADA — masalahnya BUKAN fungsi ini rusak, tapi TIDAK PERNAH DIPANGGIL oleh alur signup/reset password yang sebenarnya.**
- `src/app/[locale]/(auth)/daftar/actions.ts` memanggil `supabase.auth.signUp()` langsung — ini otomatis memicu Supabase mengirim EMAIL BAWAANNYA SENDIRI (polos, dari alamat `noreply@mail.app.supabase.io` untuk beberapa jenis, atau template default Supabase untuk signup), TIDAK PERNAH menyentuh `kirimEmailVerifikasi`.
- `src/app/[locale]/(auth)/lupa-sandi/actions.ts` memanggil `supabase.auth.resetPasswordForEmail()` langsung — sama, otomatis memicu email bawaan Supabase, TIDAK PERNAH menyentuh `kirimEmailResetSandi`.
- `src/lib/supabase/admin.ts` (`createAdminClient()`) SUDAH ADA, `SUPABASE_SERVICE_ROLE_KEY` SUDAH ADA di env — tidak perlu env var baru.

**Solusi:** ganti kedua alur itu memakai `supabaseAdmin.auth.admin.generateLink()` — fungsi ini MEMBUAT link aksi (signup/recovery) TANPA PERNAH mengirim email apa pun secara otomatis, murni mengembalikan data link (`properties.action_link`, `properties.hashed_token`, dll). Setelah itu, APLIKASI yang kirim emailnya sendiri lewat `kirimEmailVerifikasi`/`kirimEmailResetSandi` (Resend).

---

## 1. Alur Daftar (`signUp`) → `generateLink(type: 'signup')`

Edit `src/app/[locale]/(auth)/daftar/actions.ts`. Ganti:

```ts
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { ... }, emailRedirectTo },
});
```

jadi memakai `supabaseAdmin.auth.admin.generateLink()` dengan `type: 'signup'` — ini SEKALIGUS membuat user baru (statusnya `email_confirmed_at: null`, belum terverifikasi) DAN mengembalikan link aksi, tanpa mengirim email:

```ts
import { createAdminClient } from '@/lib/supabase/admin';

// ...di dalam daftarAction, gantikan blok supabase.auth.signUp() yang lama:
const supabaseAdmin = createAdminClient();

const { data: linkData, error } = await supabaseAdmin.auth.admin.generateLink({
  type: 'signup',
  email,
  password,
  options: {
    data: {
      nama_lengkap,
      consent_at: new Date().toISOString(),
      kuis_selesai: kuisSelesai ? 'true' : undefined,
      chapters_selesai:
        chapterProgress && chapterProgress.chapterIds.length > 0
          ? JSON.stringify(chapterProgress.chapterIds)
          : undefined,
    },
    redirectTo: emailRedirectTo,
  },
});

if (error) {
  console.error('[daftar] generateLink error:', error.code, error.message, error.status);
  if (error.code === 'email_exists' || error.message?.includes('already registered')) {
    return { ok: false as const, pesan: 'Email ini sudah terdaftar. Coba masuk.' };
  }
  return { ok: false as const, pesan: 'Gagal mendaftar. Coba lagi.' };
}

// linkData.properties berisi action_link (URL siap pakai, sudah termasuk token+redirectTo)
const tautanVerifikasi = linkData.properties?.action_link;
if (!tautanVerifikasi) {
  console.error('[daftar] generateLink tidak mengembalikan action_link');
  return { ok: false as const, pesan: 'Gagal mendaftar. Coba lagi.' };
}

const hasilKirim = await kirimEmailVerifikasi(email, { nama: nama_lengkap, tautan: tautanVerifikasi });
if (!hasilKirim.ok) {
  console.error('[daftar] gagal kirim email verifikasi:', hasilKirim);
  // Jangan gagalkan pendaftaran kalau email gagal terkirim — user sudah dibuat.
  // Pertimbangkan log ke admin_notify_email atau tampilkan pesan "hubungi admin jika email tidak masuk".
}

return { ok: true as const };
```

**Cek signature `kirimEmailVerifikasi`** di `send.ts` — sesuaikan parameter di atas (`{ nama, tautan }`) persis dengan yang diharapkan fungsi itu, JANGAN menebak, baca dulu definisinya.

**Cek behavior `generateLink` dengan `type: 'signup'` saat email SUDAH TERDAFTAR** — perlu diverifikasi langsung (baca dokumentasi Supabase Admin API atau uji coba) apakah errornya konsisten dengan `error.code === 'email_exists'` seperti di atas, atau kode/pesan lain — sesuaikan pengecekan errornya supaya pesan "Email ini sudah terdaftar" tetap muncul dengan benar (perilaku lama yang harus dipertahankan).

**Penting:** hapus baris `await supabase.auth.signOut()` yang lama KALAU tidak relevan lagi dengan alur baru (baca komentar di sekitarnya dulu — itu ada untuk membersihkan sesi lama sebelum `signUp()` klien; dengan `generateLink()` di server, tidak ada sesi klien yang perlu dibersihkan lewat jalur itu). Verifikasi ulang dengan uji manual apakah race condition sesi lama yang jadi alasan baris itu ditulis masih relevan di alur baru.

## 2. Alur Lupa Sandi (`resetPasswordForEmail`) → `generateLink(type: 'recovery')`

Edit `src/app/[locale]/(auth)/lupa-sandi/actions.ts`. Ganti:

```ts
await supabase.auth.resetPasswordForEmail(parsed.data.email, {
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-sandi`,
});
```

jadi:

```ts
import { createAdminClient } from '@/lib/supabase/admin';
import { kirimEmailResetSandi } from '@/lib/email/send';

// ...
const supabaseAdmin = createAdminClient();

const { data: linkData, error } = await supabaseAdmin.auth.admin.generateLink({
  type: 'recovery',
  email: parsed.data.email,
  options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-sandi` },
});

// PENTING: jangan bedakan respons sukses/gagal ke pengguna (pola lama sengaja begini,
// supaya tidak bisa dipakai menebak email mana yang terdaftar). generateLink() akan
// error kalau email tidak terdaftar — tangkap errornya TANPA mengubah pesan balasan.
if (!error && linkData.properties?.action_link) {
  const hasilKirim = await kirimEmailResetSandi(parsed.data.email, { tautan: linkData.properties.action_link });
  if (!hasilKirim.ok) {
    console.error('[lupa-sandi] gagal kirim email reset:', hasilKirim);
  }
}

return {
  ok: true as const,
  pesan: 'Kalau email itu terdaftar, kami sudah mengirim tautan reset kata sandi.',
};
```

Cek signature `kirimEmailResetSandi` di `send.ts`, sesuaikan parameter `{ tautan }` sama persis.

## 3. Cek `/auth/confirm/route.ts` masih kompatibel

`action_link` yang dikembalikan `generateLink()` sudah berbentuk URL LENGKAP (termasuk `token_hash`/`type`/`redirect_to` sebagai query param, format OTP klasik — BUKAN format PKCE `?code=` seperti `signUp()` client-side yang lama). Baca ulang `src/app/auth/confirm/route.ts`:

```ts
const code = searchParams.get('code');
const token_hash = searchParams.get('token_hash');
const typeParam = searchParams.get('type');
```

Route ini SUDAH menangani DUA jenis link (`code` untuk PKCE, `token_hash`+`type` untuk OTP klasik) — kemungkinan besar TIDAK PERLU diubah karena `generateLink()` menghasilkan format OTP klasik yang sudah didukung cabang `if (token_hash && type)`. **Verifikasi ini dengan uji coba nyata** (generate satu link lewat kode baru, cek query param aktualnya) sebelum menganggap tidak perlu perubahan — kalau ternyata formatnya beda dari dugaan, sesuaikan route ini mengikuti bentuk asli yang dikembalikan `generateLink()`, JANGAN memaksa asumsi.

Untuk `type: 'signup'`, `generateLink()` kemungkinan mengembalikan `type=signup` di query — cek apakah `route.ts` saat ini hanya menerima `type === 'email' || type === 'recovery'` (lihat baris `const type = typeParam === 'email' || typeParam === 'recovery' ? typeParam : null;`) — kalau Supabase mengembalikan `signup` bukan `email` untuk kasus ini, tambahkan `'signup'` ke pengecekan itu supaya tidak jatuh ke cabang gagal.

## 4. Tidak ada perubahan di `templates.ts`/`send.ts`/`client.ts`

File-file ini SUDAH BENAR, jangan disentuh kecuali menemukan bug nyata saat uji coba (misalnya signature parameter yang tidak cocok seperti dicatat di atas).

---

## Sebelum melapor selesai

1. `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` bersih.
2. Uji manual END-TO-END, bukan cuma baca kode: daftar akun baru dengan email asli yang bisa dicek inbox-nya — pastikan email yang masuk BERASAL DARI Resend (bukan `noreply@mail.app.supabase.io`), dan desainnya branded (header logo Hexatara, warna cobalt mist, footer kontak) — BUKAN lagi email polos Supabase.
3. Klik link verifikasi di email itu — pastikan mengarah ke domain yang benar (bukan localhost, asalkan `NEXT_PUBLIC_SITE_URL` sudah diisi benar di environment tempat diuji) dan proses verifikasi berhasil (akun aktif, bisa login).
4. Uji lupa sandi: minta reset password, cek email yang masuk juga branded dan dari Resend, klik link, pastikan bisa ganti password dan login dengan password baru.
5. Uji kasus GAGAL yang harus tetap ditangani dengan benar: daftar dengan email yang SUDAH terdaftar (pesan "Email ini sudah terdaftar" harus tetap muncul), lupa sandi dengan email yang TIDAK terdaftar (pesan generik harus tetap sama, TIDAK boleh bocor info email terdaftar/tidak).
6. Cek `console.error` log tidak ada error tersembunyi yang lolos padahal harusnya gagal (terutama kalau `kirimEmailVerifikasi`/`kirimEmailResetSandi` gagal tapi user sudah terlanjur dibuat — pastikan pesan ke user tetap masuk akal).
7. Diuji di viewport 375px untuk halaman daftar/lupa-sandi (tidak ada perubahan visual signifikan di sini, tapi pastikan tidak ada regresi).
8. Laporkan ke Alif — sertakan screenshot email yang masuk sebagai bukti visual (bagian dari Definisi Selesai §14, "diuji manual oleh Alif" tetap wajib, tapi lampirkan bukti awal ini mempercepat verifikasi).
