import { z } from 'zod';

export const ProfilSchema = z.object({
  nama_lengkap: z.string().min(1, { error: 'Nama lengkap wajib diisi' }),
  whatsapp: z.string().nullable().optional(),
});

export type ProfilInput = z.infer<typeof ProfilSchema>;
