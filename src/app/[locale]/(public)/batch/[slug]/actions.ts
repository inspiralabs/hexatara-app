'use server';

import { z } from 'zod';
import { BatchLeadFormSchema } from '@/lib/validations/batch-lead';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { kirimEmailLeadBaru } from '@/lib/email/send';
import { formatTanggalBatch } from '@/lib/batch';

const BatchIdSchema = z.number().int().positive();

export async function daftarMinatAction(batchId: unknown, input: unknown) {
  const parsedInput = BatchLeadFormSchema.safeParse(input);
  const parsedBatchId = BatchIdSchema.safeParse(batchId);

  if (!parsedInput.success || !parsedBatchId.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const { nama, whatsapp } = parsedInput.data;
  const supabase = await createClient();

  const { data: batch } = await supabase
    .from('batches')
    .select('judul_id, tanggal_mulai, tanggal_selesai')
    .eq('id', parsedBatchId.data)
    .eq('is_active', true)
    .maybeSingle();

  if (!batch) {
    return { ok: false as const, pesan: 'Batch tidak ditemukan. Muat ulang halaman dan coba lagi.' };
  }

  const supabaseAdmin = createAdminClient();
  const { error: insertError } = await supabaseAdmin.from('batch_leads').insert({
    batch_id: parsedBatchId.data,
    nama,
    whatsapp,
    consent_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error('[daftar-minat] gagal simpan lead:', insertError);
    return { ok: false as const, pesan: 'Gagal menyimpan pendaftaran. Coba lagi.' };
  }

  const tanggal = formatTanggalBatch(batch.tanggal_mulai, batch.tanggal_selesai);

  await kirimEmailLeadBaru({
    jenis: 'minat_batch',
    nama,
    kontak: whatsapp,
    detail: tanggal ? `${batch.judul_id} (${tanggal})` : batch.judul_id,
  });

  const nomorAdmin = process.env.NEXT_PUBLIC_WA_ADMIN;
  const pesan = `Halo Admin Hexatara, saya ${nama} ingin mendaftar batch "${batch.judul_id}"${tanggal ? ` (${tanggal})` : ''}.\nKontak saya: ${whatsapp}`;
  const waLink = nomorAdmin ? `https://wa.me/${nomorAdmin}?text=${encodeURIComponent(pesan)}` : null;

  return { ok: true as const, waLink };
}
