import { z } from 'zod';

const teksWajib = z.string().min(1, { error: 'Wajib diisi' });
const angkaOpsional = z.union([z.string(), z.number()]).nullable().optional();

export const PracticeLocationFormSchema = z.object({
  nama_kota: teksWajib,
  urutan: angkaOpsional,
  is_active: z.boolean(),
});

export type PracticeLocationFormInput = z.input<typeof PracticeLocationFormSchema>;
