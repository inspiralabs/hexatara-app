import { z } from 'zod';

// Tanpa .transform() dengan sengaja, sama seperti popup-admin.ts — supaya tipe
// form (RHF) dan tipe hasil zodResolver tidak bentrok. Normalisasi string kosong
// → null dilakukan di Server Action lewat teks() dari batch-admin.ts.
const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });
const angkaOpsional = z.union([z.string(), z.number()]).nullable().optional();

export const HeroSlideFormSchema = z.object({
  judul_id: teksWajib,
  judul_en: teksOpsional,
  subjudul_id: teksOpsional,
  subjudul_en: teksOpsional,
  gambar_url: teksOpsional,
  cta_teks_id: teksOpsional,
  cta_teks_en: teksOpsional,
  cta_url: teksOpsional,
  urutan: angkaOpsional,
  is_active: z.boolean(),
});

export type HeroSlideFormInput = z.input<typeof HeroSlideFormSchema>;
