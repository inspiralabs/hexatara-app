import { z } from 'zod';

// Tanpa .transform() dengan sengaja, sama seperti popup-admin.ts — supaya tipe
// form (RHF) dan tipe hasil zodResolver tidak bentrok. Normalisasi string kosong
// → null dilakukan di Server Action lewat teks() dari batch-admin.ts.
const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });
const angkaOpsional = z.union([z.string(), z.number()]).nullable().optional();

export const InstructorFormSchema = z.object({
  nama: teksWajib,
  jabatan_id: teksOpsional,
  jabatan_en: teksOpsional,
  bio_id: teksOpsional,
  bio_en: teksOpsional,
  foto_url: teksOpsional,
  urutan: angkaOpsional,
  is_active: z.boolean(),
});

export type InstructorFormInput = z.input<typeof InstructorFormSchema>;
