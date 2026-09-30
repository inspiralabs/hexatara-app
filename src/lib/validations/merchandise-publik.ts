import { z } from 'zod';
import { AlamatPengirimanSchema } from '@/lib/validations/upgrade';

export const MerchandisePublikSchema = z.object({
  nama_lengkap: z.string().min(1, { error: 'Nama lengkap wajib diisi' }),
  whatsapp: z.string().min(1, { error: 'Nomor WhatsApp wajib diisi' }),
  qty: z.number().int().positive({ error: 'Jumlah minimal 1' }),
  alamat: AlamatPengirimanSchema,
  catatan: z.string().optional(),
});

export type MerchandisePublikInput = z.infer<typeof MerchandisePublikSchema>;
