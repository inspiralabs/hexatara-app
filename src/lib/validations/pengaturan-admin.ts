import { z } from 'zod';

export const RekeningSchema = z.object({
  bank: z.string().min(1, { error: 'Nama bank wajib diisi' }),
  nomor: z.string().min(1, { error: 'Nomor rekening wajib diisi' }),
  atas_nama: z.string().min(1, { error: 'Atas nama wajib diisi' }),
});

export const KontakPublikSchema = z.object({
  wa: z
    .string()
    .min(1, { error: 'Nomor WhatsApp wajib diisi' })
    .regex(/^62\d{8,13}$/, { error: 'Format WA: 62… tanpa + atau spasi (contoh 62812…)' }),
  email: z.email({ error: 'Email kontak tidak valid' }).or(z.literal('')),
  instagram: z.string().optional().default(''),
  jam_operasional: z.string().optional().default(''),
  jam_operasional_en: z.string().optional().default(''),
});

const waOpsional = z
  .string()
  .regex(/^62\d{8,13}$/, { error: 'Format WA: 62… tanpa + atau spasi (contoh 62812…)' })
  .or(z.literal(''));

export const KontakPelatihanSchema = z.object({
  wa_reguler: waOpsional,
  wa_private: waOpsional,
});

export const AdminNotifyEmailSchema = z.object({
  email: z.email({ error: 'Email notifikasi Admin tidak valid' }),
});

export const HargaUpgradeSchema = z.object({
  cert_only: z.coerce.number().int().positive({ error: 'Harga harus bilangan bulat positif' }),
  cert_merch: z.coerce.number().int().positive({ error: 'Harga harus bilangan bulat positif' }),
  merch_addon: z.coerce.number().int().positive({ error: 'Harga harus bilangan bulat positif' }),
});

export const AdminProfilSchema = z.object({
  nama_lengkap: z.string().min(1, { error: 'Nama lengkap wajib diisi' }),
});
