import { z } from 'zod';

// Tanpa .transform() dengan sengaja, sama seperti batch-admin.ts — supaya tipe
// form (RHF) dan tipe hasil zodResolver tidak bentrok. Normalisasi string kosong
// → null dilakukan di Server Action lewat teks() dari batch-admin.ts.
const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });

export const PopupFormSchema = z.object({
  judul_id: teksWajib,
  judul_en: teksOpsional,
  gambar_mobile_url: teksOpsional,
  gambar_desktop_url: teksOpsional,
  cta_url: teksOpsional,
  tayang_mulai: teksOpsional,
  tayang_selesai: teksOpsional,
  is_active: z.boolean(),
});

export type PopupFormInput = z.input<typeof PopupFormSchema>;
