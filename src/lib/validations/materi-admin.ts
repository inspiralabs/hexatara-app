import { z } from 'zod';

const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });
const angkaOpsional = z.union([z.string(), z.number()]).nullable().optional();

export const MateriFormSchema = z.object({
  judul_id: teksWajib,
  judul_en: teksOpsional,
  deskripsi_id: teksOpsional,
  deskripsi_en: teksOpsional,
  file_url: z.string().min(1, { error: 'Berkas wajib diunggah' }),
  urutan: angkaOpsional,
  is_active: z.boolean(),
});

export type MateriFormInput = z.input<typeof MateriFormSchema>;
export type MateriFormOutput = z.output<typeof MateriFormSchema>;
