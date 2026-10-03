import { z } from 'zod';

export const CompanyRegistrationFormSchema = z.object({
  nama_pic: z.string().min(1, { error: 'Nama PIC wajib diisi' }),
  whatsapp_pic: z.string().min(1, { error: 'WhatsApp PIC wajib diisi' }),
  email_pic: z.email({ error: 'Email tidak valid' }),
  nama_perusahaan: z.string().min(1, { error: 'Nama perusahaan/komunitas wajib diisi' }),
  catatan: z.string().optional(),
});

export type CompanyRegistrationFormInput = z.infer<typeof CompanyRegistrationFormSchema>;

export const PesertaExcelSchema = z.object({
  nama: z.string().min(1),
  whatsapp: z.string().min(1),
  email: z.email(),
});

export type PesertaExcel = z.infer<typeof PesertaExcelSchema>;
