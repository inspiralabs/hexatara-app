import { z } from 'zod';

/** Field identitas RPC di `profiles` (F07.1/F07.2). Path foto divalidasi di upload, bukan di sini. */
export const IdentitasProfilSchema = z.object({
  nomor_ktp: z
    .string()
    .regex(/^\d{16}$/, { error: 'Nomor KTP wajib 16 digit angka' }),
  tempat_lahir: z.string().min(1, { error: 'Tempat lahir wajib diisi' }),
  tanggal_lahir: z
    .string()
    .min(1, { error: 'Tanggal lahir wajib diisi' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Format tanggal: YYYY-MM-DD' })
    .refine((v) => {
      const d = new Date(`${v}T00:00:00`);
      if (Number.isNaN(d.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d <= today;
    }, { error: 'Tanggal lahir tidak boleh di masa depan' }),
  alamat_lengkap: z
    .string()
    .min(10, { error: 'Alamat lengkap wajib diisi, minimal 10 karakter' }),
});

export type IdentitasProfilInput = z.infer<typeof IdentitasProfilSchema>;
