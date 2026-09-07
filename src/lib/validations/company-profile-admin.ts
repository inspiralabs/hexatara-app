import { z } from 'zod';

// Tanpa .transform() dengan sengaja, sama seperti popup-admin.ts — supaya tipe
// form (RHF) dan tipe hasil zodResolver tidak bentrok. Normalisasi string kosong
// → null dilakukan di Server Action lewat teks() dari batch-admin.ts.
const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });

export const CompanyProfileFormSchema = z.object({
  judul_id: teksWajib,
  judul_en: teksOpsional,
  konten_id: teksWajib,
  konten_en: teksOpsional,
  gambar_url: teksOpsional,
});

export type CompanyProfileFormInput = z.input<typeof CompanyProfileFormSchema>;
