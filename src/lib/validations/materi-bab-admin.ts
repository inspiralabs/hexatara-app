import { z } from 'zod';

const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });

export const BabFormSchema = z.object({
  judul_id: teksWajib,
  judul_en: teksOpsional,
  konten_id: teksWajib,
  konten_en: teksOpsional,
  video_url: teksOpsional,
  gambar_url: teksOpsional,
});

export type BabFormInput = z.input<typeof BabFormSchema>;
export type BabFormOutput = z.output<typeof BabFormSchema>;
