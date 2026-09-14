'use server';

import { revalidatePath } from 'next/cache';
import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PesananSchema } from '@/lib/validations/upgrade';
import { getHargaUpgrade } from '@/lib/site-settings';

function revalidateDashboardPesanan() {
  // Layout locale-aware — revalidate path tanpa locale (Next cocokkan semua).
  revalidatePath('/dashboard/transaksi');
  revalidatePath('/dashboard/upgrade');
  revalidatePath('/dashboard/merchandise');
  revalidatePath('/dashboard');
}

export async function logoutAction() {
  await requireUser();

  const supabase = await createClient();
  await supabase.auth.signOut();
  const locale = await getLocale();
  redirect({ href: '/login', locale });
}

export async function buatPesananAction(input: unknown) {
  const parsed = PesananSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }
  const { paket, alamat } = parsed.data;

  const claims = await requireUser();
  const supabase = await createClient();

  if (paket === 'merch_addon') {
    // F03.10 — hanya untuk cert_only yang SUDAH disetujui (PRD §8.7).
    const { data: certOnlyDisetujui } = await supabase
      .from('certificate_orders')
      .select('id')
      .eq('user_id', claims.sub)
      .eq('paket', 'cert_only')
      .eq('status', 'disetujui')
      .limit(1)
      .maybeSingle();
    if (!certOnlyDisetujui) {
      return { ok: false as const, pesan: 'Paket cert_only kamu belum disetujui Admin.' };
    }
  }

  // Satu pengguna satu pesanan aktif per kelompok paket — kalau sudah ada baris
  // (apa pun statusnya), pesanan baru ditolak di sini. Ditolak (`ditolak`) tidak
  // membuat baris baru — kirim ulang lewat unggahBuktiTransferAction pada baris yang sama.
  const kelompokPaket: (typeof paket)[] =
    paket === 'merch_addon' ? ['merch_addon'] : ['cert_only', 'cert_merch'];
  const { data: orderAda } = await supabase
    .from('certificate_orders')
    .select('id')
    .eq('user_id', claims.sub)
    .in('paket', kelompokPaket)
    .limit(1)
    .maybeSingle();
  if (orderAda) {
    return { ok: false as const, pesan: 'Kamu sudah punya pesanan untuk paket ini.' };
  }

  // Nominal dari site_settings (fallback constants) — tidak pernah dari input klien (PRD §8.7).
  const harga = await getHargaUpgrade();

  const { data: order, error } = await supabase
    .from('certificate_orders')
    .insert({
      user_id: claims.sub,
      paket,
      nominal: harga[paket],
      alamat_pengiriman: alamat ?? null,
    })
    .select('id')
    .single();

  if (error || !order) {
    return { ok: false as const, pesan: 'Gagal membuat pesanan. Coba lagi.' };
  }

  revalidateDashboardPesanan();
  return { ok: true as const, orderId: order.id };
}

export async function unggahBuktiTransferAction(orderId: number, formData: FormData) {
  const claims = await requireUser();
  const supabase = await createClient();

  // RLS certificate_orders hanya mengizinkan SELECT milik sendiri — baris tidak
  // ketemu berarti bukan pesanan pengguna ini atau memang tidak ada.
  const { data: order } = await supabase
    .from('certificate_orders')
    .select('id, status')
    .eq('id', orderId)
    .eq('user_id', claims.sub)
    .maybeSingle();

  if (!order || (order.status !== 'menunggu_bukti' && order.status !== 'ditolak')) {
    return { ok: false as const, pesan: 'Pesanan ini tidak bisa diunggah buktinya saat ini.' };
  }

  const file = formData.get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    return { ok: false as const, pesan: 'Berkas harus berupa gambar.' };
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${orderId}.${ext}`;
  const supabaseAdmin = createAdminClient();

  // Pengguna sengaja TIDAK punya hak UPDATE di certificate_orders (ENGINEERING §3.4) —
  // Server Action ini yang memvalidasi transisi status di atas, admin client cuma
  // menjalankan penulisannya. Bucket privat, path stabil + upsert supaya kirim ulang
  // menimpa berkas lama, bukan menumpuk.
  const { error: uploadError } = await supabaseAdmin.storage
    .from('payment-proofs')
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadError) {
    console.error('[upgrade] gagal unggah bukti transfer:', uploadError);
    return { ok: false as const, pesan: 'Gagal mengunggah bukti. Coba lagi.' };
  }

  const { error: updateError } = await supabaseAdmin
    .from('certificate_orders')
    .update({ bukti_url: path, status: 'menunggu_verifikasi', alasan_tolak: null })
    .eq('id', orderId);
  if (updateError) {
    console.error('[upgrade] gagal update status pesanan:', updateError);
    return { ok: false as const, pesan: 'Gagal menyimpan status pesanan. Coba lagi.' };
  }

  revalidateDashboardPesanan();
  return { ok: true as const };
}
