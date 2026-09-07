'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  CompanyProfileFormSchema,
  type CompanyProfileFormInput,
} from '@/lib/validations/company-profile-admin';
import { teks } from '@/lib/validations/batch-admin';

// Singleton — selalu baris id=1, sudah di-seed lewat SQL skema. Tidak ada insert/delete.
export async function simpanCompanyProfileAction(input: CompanyProfileFormInput) {
  await requireAdmin();

  const parsed = CompanyProfileFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const p = parsed.data;
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from('company_profile')
    .update({
      judul_id: p.judul_id,
      judul_en: teks(p.judul_en),
      konten_id: p.konten_id,
      konten_en: teks(p.konten_en),
      gambar_url: teks(p.gambar_url),
    })
    .eq('id', 1);

  if (error) {
    console.error('[admin-company-profile] gagal menyimpan:', error);
    return { ok: false as const, pesan: 'Gagal menyimpan company profile. Coba lagi.' };
  }

  return { ok: true as const };
}
