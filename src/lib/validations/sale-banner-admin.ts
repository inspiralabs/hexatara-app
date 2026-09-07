import { z } from 'zod';

// Tanpa .transform() dengan sengaja, sama seperti popup-admin.ts — supaya tipe
// form (RHF) dan tipe hasil zodResolver tidak bentrok. Normalisasi string kosong
// → null dilakukan di Server Action lewat teks() dari batch-admin.ts.
const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });

export const SaleBannerFormSchema = z.object({
  judul_id: teksWajib,
  judul_en: teksOpsional,
  teks_id: teksOpsional,
  teks_en: teksOpsional,
  urgensi_id: teksOpsional,
  urgensi_en: teksOpsional,
  tombol_teks_id: teksOpsional,
  tombol_teks_en: teksOpsional,
  tombol_url: teksOpsional,
  tayang_mulai: teksOpsional,
  tayang_selesai: teksOpsional,
  is_active: z.boolean(),
});

export type SaleBannerFormInput = z.input<typeof SaleBannerFormSchema>;
