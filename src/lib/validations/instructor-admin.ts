import { z } from 'zod';

// Tanpa .transform() dengan sengaja, sama seperti popup-admin.ts — supaya tipe
// form (RHF) dan tipe hasil zodResolver tidak bentrok. Normalisasi string kosong
// → null dilakukan di Server Action lewat teks() dari batch-admin.ts.
const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });

export const InstructorFormSchema = z.object({
  nama: teksWajib,
  jabatan_id: teksOpsional,
  jabatan_en: teksOpsional,
  // Catatan internal (kolom DB tetap bio_id). bio_en tidak di form — jangan dikirim saat update.
  bio_id: teksOpsional,
  foto_url: teksOpsional,
  is_active: z.boolean(),
});

export type InstructorFormInput = z.input<typeof InstructorFormSchema>;
