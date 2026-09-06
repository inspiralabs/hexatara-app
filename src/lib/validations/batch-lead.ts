import { z } from 'zod';

export const BatchLeadFormSchema = z.object({
  nama: z.string().min(1, { error: 'Nama wajib diisi' }),
  whatsapp: z.string().min(8, { error: 'Nomor WhatsApp wajib diisi, minimal 8 digit' }),
  persetujuan: z.boolean().refine((v) => v === true, {
    error: 'Kamu harus menyetujui penyimpanan data',
  }),
});
