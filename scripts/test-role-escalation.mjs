/**
 * Uji manual anti self-escalation profiles.role (Opsi A).
 *
 * Prasyarat:
 * 1. Sudah jalankan usulan-sql-profiles-lock-role-opsi-a.sql di SQL Editor.
 * 2. Punya kredensial user BIASA (role=user) — email/password.
 * 3. Env di .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 *    (opsional untuk uji service_role: SUPABASE_SERVICE_ROLE_KEY)
 *
 * Cara jalan (dari root repo hexatara):
 *   node --env-file=.env.local scripts/test-role-escalation.mjs \
 *     --email=USER_BIASA@example.com --password=SANDI
 *
 * Harapan:
 * - Uji A (user JWT update role→admin): GAGAL / error privilege
 * - Uji B (update nama_lengkap saja): BERHASIL
 * - Uji C (service_role update role, jika key ada): BERHASIL lalu rollback ke user
 */

import { createClient } from '@supabase/supabase-js';

function arg(name) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : '';
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = arg('email');
const password = arg('password');

if (!url || !anon) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}
if (!email || !password) {
  console.error('Usage: node --env-file=.env.local scripts/test-role-escalation.mjs --email=... --password=...');
  process.exit(1);
}

const userClient = createClient(url, anon);

console.log('— Login sebagai user biasa…');
const { data: auth, error: loginErr } = await userClient.auth.signInWithPassword({ email, password });
if (loginErr || !auth.user) {
  console.error('Login gagal:', loginErr?.message);
  process.exit(1);
}
const uid = auth.user.id;
console.log('OK uid=', uid);

const { data: before } = await userClient.from('profiles').select('role, nama_lengkap').eq('id', uid).single();
console.log('Profil sebelum:', before);
if (before?.role === 'admin') {
  console.error('Akun ini admin — pakai akun role=user untuk uji A.');
  process.exit(1);
}

// --- Uji A: self-escalate (harus DITOLAK) ---
console.log('\n[A] UPDATE role → admin (harus ditolak)…');
const { error: escErr } = await userClient.from('profiles').update({ role: 'admin' }).eq('id', uid);
if (escErr) {
  console.log('PASS A — ditolak:', escErr.code || '', escErr.message);
} else {
  console.error('FAIL A — update role diterima! Cek trigger.');
  process.exit(1);
}

const { data: afterA } = await userClient.from('profiles').select('role').eq('id', uid).single();
if (afterA?.role !== 'user') {
  console.error('FAIL A — role berubah jadi', afterA?.role);
  process.exit(1);
}
console.log('PASS A — role tetap user');

// --- Uji B: update kolom lain (harus OK) ---
console.log('\n[B] UPDATE nama_lengkap saja (harus OK)…');
const { error: namaErr } = await userClient
  .from('profiles')
  .update({ nama_lengkap: before?.nama_lengkap || 'User Test' })
  .eq('id', uid);
if (namaErr) {
  console.error('FAIL B — update nama ditolak:', namaErr.message);
  process.exit(1);
}
console.log('PASS B — update nama OK');

// --- Uji C: service_role boleh ubah role (opsional) ---
if (service) {
  console.log('\n[C] service_role UPDATE role → admin lalu rollback…');
  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: upErr } = await admin.from('profiles').update({ role: 'admin' }).eq('id', uid);
  if (upErr) {
    console.error('FAIL C — service_role ditolak:', upErr.message);
    process.exit(1);
  }
  const { error: downErr } = await admin.from('profiles').update({ role: 'user' }).eq('id', uid);
  if (downErr) {
    console.error('FAIL C — rollback gagal, role mungkin masih admin:', downErr.message);
    process.exit(1);
  }
  console.log('PASS C — service_role boleh ubah role + rollback OK');
} else {
  console.log('\n[C] SKIP — SUPABASE_SERVICE_ROLE_KEY tidak di-set');
}

console.log('\nSemua uji yang dijalankan lulus.');
await userClient.auth.signOut();
