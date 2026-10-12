import { z } from 'zod';

const teksWajib = z.string().min(1, { error: 'Wajib diisi' });

export const PracticeLocationFormSchema = z.object({
  nama_kota: teksWajib,
  is_active: z.boolean(),
});

export type PracticeLocationFormInput = z.input<typeof PracticeLocationFormSchema>;
