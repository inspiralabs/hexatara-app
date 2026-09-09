'use server';

import { DaftarSchema } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/server';

export async function daftarAction(input: unknown, kuisSelesai = false) {
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
  // signUp() default @supabase/ssr pakai flow PKCE — link email membawa
  // ?code=, ditempel Supabase ke emailRedirectTo apa adanya. Karena itu
  // emailRedirectTo WAJIB menunjuk ke /auth/confirm (yang menukar code jadi
  // sesi lewat exchangeCodeForSession()), bukan langsung ke halaman tujuan —
  // kalau langsung ke halaman tujuan, code-nya tidak pernah ditukar dan
  // pengguna tidak pernah benar-benar login otomatis.
  const confirmUrl = new URL('/auth/confirm', process.env.NEXT_PUBLIC_SITE_URL);
  confirmUrl.searchParams.set('next', kuisSelesai ? '/dashboard' : '/verifikasi-email');
  const emailRedirectTo = confirmUrl.toString();

  // Sesi lama HARUS dibersihkan sebelum signUp() akun baru — kalau tidak,
  // sesi akun lama tetap valid di cookie (signUp() akun baru tidak pernah
  // membuat sesi baru selama email belum diverifikasi) dan halaman
  // /verifikasi-email salah membacanya sebagai "akun ini sudah terverifikasi",
  // menampilkan data akun yang salah di /dashboard.
  await supabase.auth.signOut();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nama_lengkap,
        consent_at: new Date().toISOString(),
        kuis_selesai: kuisSelesai ? 'true' : undefined,
      },
      emailRedirectTo,
    },
  });

  if (error) {
    // ponytail: log debug sementara untuk lacak bug "Gagal mendaftar" pasca
    // hapus manual user dari Supabase Auth Dashboard — hapus setelah terpecahkan.
    console.error('[daftar] signUp error:', error.code, error.message, error.status, JSON.stringify(error));
    if (error.code === 'user_already_exists') {
      return { ok: false as const, pesan: 'Email ini sudah terdaftar. Coba masuk.' };
    }
    return { ok: false as const, pesan: 'Gagal mendaftar. Coba lagi.' };
  }

  return { ok: true as const };
}
