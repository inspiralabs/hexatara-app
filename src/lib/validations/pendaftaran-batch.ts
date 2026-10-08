import { z } from 'zod';
import { IdentitasProfilSchema } from '@/lib/validations/identitas-profil';

const KATEGORI_PESERTA = ['penerbitan_baru', 'perpanjangan_renewal'] as const;
export const UKURAN_BAJU = ['S', 'M', 'L', 'XL', 'XXL'] as const;

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

/** Client: field SiDOPI hanya wajib bila flag aktif (server tetap otoritas). */
export function makePendaftaranBatchFormSchema(opts: {
  butuhLokasi: boolean;
  butuhUkuran: boolean;
}) {
  return PendaftaranBatchSchema.extend({
    practice_location_id: z.number().int().positive().optional(),
    ukuran_baju: z.enum(UKURAN_BAJU).optional(),
  }).superRefine((data, ctx) => {
    if (opts.butuhLokasi && data.practice_location_id == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['practice_location_id'],
        message: 'Lokasi praktek wajib dipilih',
      });
    }
    if (opts.butuhUkuran && data.ukuran_baju == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['ukuran_baju'],
        message: 'Ukuran baju wajib dipilih',
      });
    }
  });
}

export type PendaftaranBatchInput = z.infer<typeof PendaftaranBatchSchema>;
export type PendaftaranBatchFormInput = z.infer<ReturnType<typeof makePendaftaranBatchFormSchema>>;
export type KategoriPesertaRpc = (typeof KATEGORI_PESERTA)[number];
export type UkuranBaju = (typeof UKURAN_BAJU)[number];
