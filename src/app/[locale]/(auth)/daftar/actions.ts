'use server';

import { DaftarSchema } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { kirimEmailVerifikasi } from '@/lib/email/send';
import type { MateriSessionProgress } from '@/lib/materi/session-progress';
import { setPendingVerifyEmailCookie } from '../verifikasi-email/actions';

export async function daftarAction(
  input: unknown,
  kuisSelesai = false,
  chapterProgress?: MateriSessionProgress
) {
  const parsed = DaftarSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const { nama_lengkap, email, password } = parsed.data;
  const supabase = await createClient();

  // kuisSelesai murni klaim sisi klien (F03.2/PRD §8.5) — dibaca trigger
  // handle_new_user() (docs/sql/13_...) untuk mengisi profiles.free_track_selesai_at
  // tepat saat baris profil dibuat. Tidak diverifikasi server: semua orang
  // dijamin berakhir 100% di kuis, tidak ada yang bisa dicurangi.
  //
  // generateLink(type: 'signup') membuat user + hashed_token TANPA mengirim
  // email. Link → /auth/confirm (OTP); F10.6 confirm mengarah ke
  // /verifikasi-berhasil (tanpa sesi di device pengklik).
  // Sesi lama HARUS dibersihkan sebelum daftar akun baru.
  await supabase.auth.signOut();

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
      redirectTo: new URL('/verifikasi-berhasil', process.env.NEXT_PUBLIC_SITE_URL).toString(),
    },
  });

  if (error) {
    console.error('[daftar] generateLink error:', error.code, error.message, error.status);
    if (
      error.code === 'email_exists' ||
      error.code === 'user_already_exists' ||
      error.message?.toLowerCase().includes('already')
    ) {
      return { ok: false as const, pesan: 'Email ini sudah terdaftar. Coba masuk.' };
    }
    return { ok: false as const, pesan: 'Gagal mendaftar. Coba lagi.' };
  }

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) {
    console.error('[daftar] generateLink tidak mengembalikan hashed_token');
    return { ok: false as const, pesan: 'Gagal mendaftar. Coba lagi.' };
  }

  // ponytail: bangun URL confirm sendiri (bukan action_link) — cocok verifyOtp SSR
  const tautan = new URL('/auth/confirm', process.env.NEXT_PUBLIC_SITE_URL);
  tautan.searchParams.set('token_hash', tokenHash);
  tautan.searchParams.set('type', 'signup');

  const hasilKirim = await kirimEmailVerifikasi(email, {
    nama: nama_lengkap,
    tautan: tautan.toString(),
  });
  if (!hasilKirim.ok) {
    console.error('[daftar] gagal kirim email verifikasi — user sudah dibuat:', email);
  }

  // Cookie httpOnly untuk polling F10.6 — jangan percaya email dari query klien saja.
  await setPendingVerifyEmailCookie(email);

  return { ok: true as const };
}
