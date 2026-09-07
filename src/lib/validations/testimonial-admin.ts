import { z } from 'zod';

// Tanpa .transform() dengan sengaja, sama seperti popup-admin.ts — supaya tipe
// form (RHF) dan tipe hasil zodResolver tidak bentrok. Normalisasi string kosong
// → null dilakukan di Server Action lewat teks() dari batch-admin.ts.
const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });
const angkaOpsional = z.union([z.string(), z.number()]).nullable().optional();

export const TestimonialFormSchema = z.object({
  nama: teksWajib,
  peran_id: teksOpsional,
  peran_en: teksOpsional,
  isi_id: teksWajib,
  isi_en: teksOpsional,
  foto_url: teksOpsional,
  urutan: angkaOpsional,
  is_active: z.boolean(),
});

export type TestimonialFormInput = z.input<typeof TestimonialFormSchema>;
