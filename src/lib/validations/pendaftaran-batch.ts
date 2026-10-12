import { z } from 'zod';
import { IdentitasProfilSchema } from '@/lib/validations/identitas-profil';

const KATEGORI_PESERTA = ['penerbitan_baru', 'perpanjangan_renewal'] as const;
export const UKURAN_BAJU = ['S', 'M', 'L', 'XL', 'XXL'] as const;

/** Form pendaftaran batch (F07.3) — sama untuk login maupun tanpa akun. */
export const PendaftaranBatchSchema = IdentitasProfilSchema.extend({
  nama_lengkap: z.string().min(1, { error: 'Nama lengkap wajib diisi' }),
  email: z.email({ error: 'Email tidak valid' }),
  whatsapp: z.string().min(8, { error: 'Nomor WhatsApp wajib diisi, minimal 8 digit' }),
  kategori_peserta: z
    .enum(KATEGORI_PESERTA, { error: 'Kategori peserta wajib dipilih' })
    .optional(),
  sumber_info: z.string().optional(),
  kode_referral: z.string().optional(),
});

export function resolveKategoriPeserta(butuh: boolean, raw: unknown) {
  if (!butuh) return { ok: true as const, value: null };
  if (raw === 'penerbitan_baru' || raw === 'perpanjangan_renewal') {
    return { ok: true as const, value: raw as (typeof KATEGORI_PESERTA)[number] };
  }
  return { ok: false as const };
}

const LABEL_KATEGORI_PESERTA: Record<KategoriPesertaRpc, string> = {
  penerbitan_baru: 'Penerbitan baru',
  perpanjangan_renewal: 'Perpanjangan / renewal',
};

export function labelKategoriPeserta(nilai: KategoriPesertaRpc | null | undefined) {
  if (nilai == null) return '—';
  return LABEL_KATEGORI_PESERTA[nilai];
}

/** Client: field SiDOPI hanya wajib bila flag aktif (server tetap otoritas). */
export function makePendaftaranBatchFormSchema(opts: {
  butuhLokasi: boolean;
  butuhUkuran: boolean;
  butuhKategori?: boolean;
}) {
  return PendaftaranBatchSchema.extend({
    practice_location_id: z.number().int().positive().optional(),
    ukuran_baju: z.enum(UKURAN_BAJU).optional(),
  }).superRefine((data, ctx) => {
    if (opts.butuhKategori && !data.kategori_peserta) {
      ctx.addIssue({
        code: 'custom',
        path: ['kategori_peserta'],
        message: 'Kategori peserta wajib dipilih.',
      });
    }
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
