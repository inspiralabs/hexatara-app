import { z } from 'zod';

const teksWajib = z.string().min(1, { error: 'Wajib diisi' });
const angkaOpsional = z.union([z.string(), z.number()]).nullable().optional();

export const PartnerFormSchema = z.object({
  nama: teksWajib,
  logo_url: teksWajib,
  urutan: angkaOpsional,
  is_active: z.boolean(),
});

export type PartnerFormInput = z.input<typeof PartnerFormSchema>;
