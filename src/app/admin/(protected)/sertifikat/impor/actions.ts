'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseSpreadsheet, validateRow } from '@/lib/certificate/import';

export type BarisGagal = { baris: number; alasan: string };

export async function imporSertifikatAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get('berkas');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, pesan: 'Pilih berkas CSV atau Excel terlebih dahulu.' };
  }

  const parsed = await parseSpreadsheet(file);
  if (!parsed.ok) {
    return { ok: false as const, pesan: parsed.pesan };
  }

  const supabaseAdmin = createAdminClient();
  let berhasil = 0;
  const gagal: BarisGagal[] = [];

  // Satu insert per baris, SENGAJA tanpa transaksi tunggal — satu baris rusak
  // tidak boleh menggagalkan baris lain (ENGINEERING §5.5). Duplikat nomor
  // (baik di dalam berkas maupun yang sudah ada di DB) tertangkap lewat
  // constraint unique nomor_sertifikat saat insert, bukan query cek terpisah.
  for (const { baris, sel } of parsed.rows) {
    const hasil = validateRow(sel);
    if (!hasil.ok) {
      gagal.push({ baris, alasan: hasil.alasan });
      continue;
    }

    const { error } = await supabaseAdmin.from('certificates').insert({ ...hasil.data, qr_aktif: true });
    if (error) {
      const duplikat = error.code === '23505';
      if (!duplikat) console.error('[admin-sertifikat-impor] gagal simpan baris:', baris, error);
      gagal.push({ baris, alasan: duplikat ? 'nomor sertifikat sudah ada' : 'gagal menyimpan baris ini' });
      continue;
    }
    berhasil++;
  }

  return { ok: true as const, berhasil, gagal };
}
