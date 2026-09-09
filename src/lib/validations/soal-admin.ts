import { z } from 'zod';

const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });
const angkaOpsional = z.union([z.string(), z.number()]).nullable().optional();

export const OpsiSoalSchema = z.object({
  label_id: teksWajib,
  label_en: teksOpsional,
  penjelasan_id: teksOpsional,
  penjelasan_en: teksOpsional,
});

// jawaban_benar memilih SATU dari empat opsi tetap — bentuk yang sama dengan
// kolom Excel di import.ts. Karena radio group cuma bisa punya satu nilai
// terpilih, "dua jawaban benar" mustahil secara struktur di form ini.
export const SoalFormSchema = z.object({
  pertanyaan_id: teksWajib,
  pertanyaan_en: teksOpsional,
  urutan: angkaOpsional,
  is_active: z.boolean(),
  jawaban_benar: z.enum(['a', 'b', 'c', 'd']),
  opsi_a: OpsiSoalSchema,
  opsi_b: OpsiSoalSchema,
  opsi_c: OpsiSoalSchema,
  opsi_d: OpsiSoalSchema,
});

export type SoalFormInput = z.input<typeof SoalFormSchema>;
export type SoalFormOutput = z.output<typeof SoalFormSchema>;
