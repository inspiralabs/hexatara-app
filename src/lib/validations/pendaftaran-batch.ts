import { z } from 'zod';
import { IdentitasProfilSchema } from '@/lib/validations/identitas-profil';

const KATEGORI_PESERTA = ['penerbitan_baru', 'perpanjangan_renewal'] as const;

/** Form pendaftaran batch (F07.3) — sama untuk login maupun tanpa akun. */
export const PendaftaranBatchSchema = IdentitasProfilSchema.extend({
  nama_lengkap: z.string().min(1, { error: 'Nama lengkap wajib diisi' }),
  email: z.email({ error: 'Email tidak valid' }),
  whatsapp: z.string().min(8, { error: 'Nomor WhatsApp wajib diisi, minimal 8 digit' }),
  kategori_peserta: z.enum(KATEGORI_PESERTA, {
    error: 'Kategori peserta wajib dipilih',
  }),
  sumber_info: z.string().optional(),
  kode_referral: z.string().optional(),
});

export type PendaftaranBatchInput = z.infer<typeof PendaftaranBatchSchema>;
export type KategoriPesertaRpc = (typeof KATEGORI_PESERTA)[number];
