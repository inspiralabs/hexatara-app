'use server';

import { z } from 'zod';
import { QuoteRequestFormSchema } from '@/lib/validations/quote-request';
import { teks } from '@/lib/validations/batch-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { kirimEmailLeadBaru } from '@/lib/email/send';

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
