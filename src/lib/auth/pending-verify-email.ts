import 'server-only';
import { cookies } from 'next/headers';

const COOKIE_PENDING = 'pending_verify_email';
const MAX_AGE_SEC = 60 * 60 * 24; // 24 jam — selaras jendela polling F10.6

/**
 * HANYA dipanggil dari daftarAction setelah signup sukses.
 * Bukan Server Action — jangan di-export dari file 'use server'
 * (export di sana = endpoint publik → account takeover audit #1).
 */
export async function setPendingVerifyEmailCookie(email: string) {
  const jar = await cookies();
  jar.set(COOKIE_PENDING, email.trim().toLowerCase(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SEC,
  });
}

export async function getPendingVerifyEmail(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_PENDING)?.value?.trim();
  return raw ? raw.toLowerCase() : null;
}

export async function clearPendingVerifyEmailCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_PENDING);
}

/** Konfirmasi terlalu lama → jangan auto magic-link (akun lama / cookie usang). */
export function konfirmasiMasihDalamJendela(emailConfirmedAt: string, maxAgeSec = MAX_AGE_SEC): boolean {
  const confirmedMs = Date.parse(emailConfirmedAt);
  if (Number.isNaN(confirmedMs)) return false;
  return Date.now() - confirmedMs <= maxAgeSec * 1000;
}
