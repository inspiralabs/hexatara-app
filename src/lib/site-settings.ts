import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  HARGA_CERT_ONLY,
  HARGA_CERT_MERCH,
  HARGA_MERCH_ADDON,
} from '@/lib/constants';

export type RekeningSettings = {
  bank?: string;
  nomor?: string;
  atas_nama?: string;
};

export type KontakSettings = {
  wa?: string;
  email?: string;
  instagram?: string;
};

export type HargaUpgrade = {
  cert_only: number;
  cert_merch: number;
  merch_addon: number;
};

const DEFAULT_HARGA: HargaUpgrade = {
  cert_only: HARGA_CERT_ONLY,
  cert_merch: HARGA_CERT_MERCH,
  merch_addon: HARGA_MERCH_ADDON,
};

async function bacaSetting(key: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('value').eq('key', key).maybeSingle();
  return data?.value ?? null;
}

export async function getRekening(): Promise<RekeningSettings> {
  const value = await bacaSetting('rekening');
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as RekeningSettings;
}

export async function getKontak(): Promise<KontakSettings> {
  const value = await bacaSetting('kontak');
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as KontakSettings;
}

export async function getAdminNotifyEmail(): Promise<string | null> {
  const value = await bacaSetting('admin_notify_email');
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const email = (value as { email?: unknown }).email;
    if (typeof email === 'string' && email.trim()) return email.trim();
  }
  const env = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  return env || null;
}

export async function getHargaUpgrade(): Promise<HargaUpgrade> {
  const value = await bacaSetting('harga_upgrade');
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...DEFAULT_HARGA };
  const raw = value as Record<string, unknown>;
  const angka = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : fallback;
  return {
    cert_only: angka(raw.cert_only, DEFAULT_HARGA.cert_only),
    cert_merch: angka(raw.cert_merch, DEFAULT_HARGA.cert_merch),
    merch_addon: angka(raw.merch_addon, DEFAULT_HARGA.merch_addon),
  };
}

/** Baca WA publik: site_settings.kontak.wa → NEXT_PUBLIC_WA_ADMIN */
export async function getWhatsappAdmin(): Promise<string | null> {
  const kontak = await getKontak();
  if (kontak.wa?.trim()) return kontak.wa.trim();
  return process.env.NEXT_PUBLIC_WA_ADMIN?.trim() || null;
}

/** Upsert lewat service role — Admin UI saja. */
export async function upsertSiteSetting(key: string, value: unknown) {
  const admin = createAdminClient();
  const { error } = await admin.from('site_settings').upsert({
    key,
    value: value as never,
    updated_at: new Date().toISOString(),
  });
  return error;
}
