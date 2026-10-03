'use server';

import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';

const StatusSchema = z.enum(['menunggu_verifikasi', 'disetujui', 'ditolak']);

const UpdateSchema = z.object({
  id: z.number().int().positive(),
  status: StatusSchema,
  alasan_tolak: z.string().optional(),
  nominal: z.union([z.number().int().nonnegative(), z.null()]),
  catatan_admin: z.string().optional(),
});

export async function updatePendaftaranPerusahaanAction(input: unknown) {
  await requireAdmin();

  const parsed = UpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data tidak valid. Periksa kembali formnya.' };
  }

  const { id, status, nominal } = parsed.data;
  const alasan = parsed.data.alasan_tolak?.trim() || null;
  const catatanAdmin = parsed.data.catatan_admin?.trim() || null;

  if (status === 'ditolak' && !alasan) {
    return { ok: false as const, pesan: 'Alasan penolakan wajib diisi.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('company_registrations')
    .update({
      status,
      alasan_tolak: status === 'ditolak' ? alasan : null,
      nominal,
      catatan_admin: catatanAdmin,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id')
    .single();

  if (error || !data) {
    console.error('[pendaftaran-perusahaan] gagal update:', error);
    return { ok: false as const, pesan: 'Gagal menyimpan. Coba lagi.' };
  }

  return { ok: true as const };
}
