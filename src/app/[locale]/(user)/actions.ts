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
  redirect({ href: '/', locale });
}

export async function buatPesananAction(input: unknown) {
  const parsed = PesananSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }
  const { paket, alamat, produk } = parsed.data;

  const claims = await requireUser();
  const supabase = await createClient();

  if (paket === 'merch_addon') {
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
    const { data: terakhir } = await supabase
      .from('certificate_orders')
      .select('status')
      .eq('user_id', claims.sub)
      .eq('paket', 'merch_addon')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (terakhir && (terakhir.status === 'menunggu_bukti' || terakhir.status === 'menunggu_verifikasi')) {
      return { ok: false as const, pesan: 'Selesaikan pesanan merchandise yang masih berjalan dulu.' };
    }
  } else {
    const { data: orderAda } = await supabase
      .from('certificate_orders')
      .select('id')
      .eq('user_id', claims.sub)
      .in('paket', ['cert_only', 'cert_merch'])
      .limit(1)
      .maybeSingle();
    if (orderAda) {
      return { ok: false as const, pesan: 'Kamu sudah punya pesanan untuk paket ini.' };
    }
  }

  const harga = await getHargaUpgrade();
  const admin = createAdminClient();
  let nominal = harga.cert_only;
  const barisItem: { product_id: number; qty: number; harga_satuan: number }[] = [];

  if (paket !== 'cert_only') {
    const dipilih = produk ?? [];
    const ids = [...new Set(dipilih.map((p) => p.product_id))];
    const { data: kategori } = await admin
      .from('product_categories')
      .select('id')
      .ilike('nama_id', 'merchandise')
      .limit(1)
      .maybeSingle();
    const { data: rows } = await admin
      .from('products')
      .select('id, harga, is_active, category_id')
      .in('id', ids);
    const byId = new Map((rows ?? []).map((r) => [r.id, r]));
    for (const item of dipilih) {
      const row = byId.get(item.product_id);
      if (
        !row ||
        !row.is_active ||
        row.category_id !== kategori?.id ||
        typeof row.harga !== 'number'
      ) {
        return { ok: false as const, pesan: 'Ada produk merchandise yang tidak lagi tersedia.' };
      }
      barisItem.push({ product_id: row.id, qty: item.qty, harga_satuan: row.harga });
    }
    const totalProduk = barisItem.reduce((sum, item) => sum + item.harga_satuan * item.qty, 0);
    nominal = paket === 'cert_merch' ? harga.cert_only + totalProduk : totalProduk;
  }

  const { data: order, error } = await supabase
    .from('certificate_orders')
    .insert({
      user_id: claims.sub,
      paket,
      nominal,
      alamat_pengiriman: alamat ?? null,
    })
    .select('id')
    .single();

  if (error || !order) {
    return { ok: false as const, pesan: 'Gagal membuat pesanan. Coba lagi.' };
  }

  if (barisItem.length > 0) {
    const { error: itemError } = await admin.from('certificate_order_items').insert(
      barisItem.map((item) => ({ ...item, order_id: order.id })),
    );
    if (itemError) {
      console.error('[upgrade] gagal simpan item merchandise:', itemError);
      await admin.from('certificate_orders').delete().eq('id', order.id);
      return {
        ok: false as const,
        pesan: 'Gagal menyimpan produk pesanan. Jalankan SQL certificate_order_items jika belum.',
      };
    }
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
