'use server';

import { z } from 'zod';
import { QuoteRequestFormSchema } from '@/lib/validations/quote-request';
import { teks } from '@/lib/validations/batch-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { kirimEmailLeadBaru } from '@/lib/email/send';
import { MerchandisePublikSchema } from '@/lib/validations/merchandise-publik';
import { getWhatsappAdmin } from '@/lib/site-settings';

const ProductIdSchema = z.number().int().positive();

export async function kirimPenawaranAction(productId: unknown, input: unknown) {
  const parsedInput = QuoteRequestFormSchema.safeParse(input);
  const parsedProductId = ProductIdSchema.safeParse(productId);

  if (!parsedInput.success || !parsedProductId.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const { nama, perusahaan, email, whatsapp, kebutuhan } = parsedInput.data;

  // Tabel ini nol akses anon (sama seperti batch_leads) — service role wajib,
  // bukan dari browser. Lihat PANDUAN.md §3.3.5.
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('quote_requests').insert({
    product_id: parsedProductId.data,
    nama,
    perusahaan: teks(perusahaan),
    email,
    whatsapp: teks(whatsapp),
    kebutuhan: teks(kebutuhan),
    consent_at: new Date().toISOString(),
  });

  if (error) {
    // 23503 = FK produk tidak valid — kasus langka (produk dihapus antara
    // halaman dimuat dan form dikirim). Jangan biarkan error Postgres mentah.
    const produkTidakValid = error.code === '23503';
    console.error('[katalog-penawaran] gagal simpan lead:', error);
    return {
      ok: false as const,
      pesan: produkTidakValid ? 'Produk ini sudah tidak tersedia. Muat ulang halaman dan coba lagi.' : 'Gagal menyimpan permintaan. Coba lagi.',
    };
  }

  await kirimEmailLeadBaru({
    jenis: 'penawaran',
    nama,
    kontak: email,
    detail: kebutuhan?.trim() ? kebutuhan : '(tidak ada catatan kebutuhan)',
  });

  return { ok: true as const };
}

export async function kirimPesananMerchandisePublikAction(productId: unknown, input: unknown) {
  const parsedId = ProductIdSchema.safeParse(productId);
  const parsed = MerchandisePublikSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const supabaseAdmin = createAdminClient();
  const { data: produk } = await supabaseAdmin
    .from('products_public')
    .select('id, nama_id, harga, category_nama_id')
    .eq('id', parsedId.data)
    .maybeSingle();

  if (!produk?.id || !produk.nama_id || produk.category_nama_id?.toLowerCase() !== 'merchandise') {
    return { ok: false as const, pesan: 'Produk merchandise ini tidak tersedia.' };
  }

  const hargaSatuan = typeof produk.harga === 'number' ? produk.harga : 0;
  const { nama_lengkap, whatsapp, qty, alamat, catatan } = parsed.data;
  const { error } = await supabaseAdmin.from('merchandise_public_orders').insert({
    nama_lengkap,
    whatsapp,
    alamat_pengiriman: alamat,
    catatan: catatan?.trim() || null,
    items: [{ product_id: produk.id, nama_produk: produk.nama_id, qty, harga_satuan: hargaSatuan }],
  });
  if (error) {
    console.error('[katalog-merchandise] gagal simpan:', error);
    return { ok: false as const, pesan: 'Gagal menyimpan pesanan. Coba lagi.' };
  }

  const nomor = await getWhatsappAdmin();
  const pesan = `Halo Admin Hexatara, saya ${nama_lengkap} ingin beli ${produk.nama_id} (${qty} pcs). Kota: ${alamat.kota}. WA: ${whatsapp}`;
  const waLink = nomor ? `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}` : null;
  return { ok: true as const, waLink };
}
