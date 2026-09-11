import { z } from 'zod';

const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });

export const LampiranFormSchema = z.object({
  judul_id: teksWajib,
  judul_en: teksOpsional,
  deskripsi_id: teksOpsional,
  deskripsi_en: teksOpsional,
  url_file: z.string().min(1, { error: 'Berkas wajib diunggah' }),
});

export type LampiranFormInput = z.input<typeof LampiranFormSchema>;
export type LampiranFormOutput = z.output<typeof LampiranFormSchema>;
