import { z } from 'zod';

const teksWajib = z.string().min(1, { error: 'Wajib diisi' });

export const PartnerFormSchema = z.object({
  nama: teksWajib,
  logo_url: teksWajib,
  is_active: z.boolean(),
});

export type PartnerFormInput = z.input<typeof PartnerFormSchema>;
