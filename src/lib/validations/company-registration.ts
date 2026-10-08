import { z } from 'zod';

/** Minimal peserta kelompok — aturan app, bukan constraint DB (bisa berubah). */
export const MIN_PESERTA_KELOMPOK = 3;

export function pesanMinimalPesertaKelompok(terbaca: number) {
  return (
    `Pendaftaran kelompok minimal ${MIN_PESERTA_KELOMPOK} peserta. Terbaca: ${terbaca} peserta. ` +
    'Untuk 1 sampai 2 orang, gunakan Daftar Individu.'
  );
}

export const CompanyRegistrationFormSchema = z.object({
  nama_pic: z.string().min(1, { error: 'Nama PIC wajib diisi' }),
  whatsapp_pic: z.string().min(1, { error: 'WhatsApp PIC wajib diisi' }),
  email_pic: z.email({ error: 'Email tidak valid' }),
  nama_perusahaan: z.string().min(1, { error: 'Nama kelompok wajib diisi' }),
  catatan: z.string().optional(),
});

export type CompanyRegistrationFormInput = z.infer<typeof CompanyRegistrationFormSchema>;

export const PesertaExcelSchema = z.object({
  nama: z.string().min(1),
  whatsapp: z.string().min(1),
  email: z.email(),
});

export type PesertaExcel = z.infer<typeof PesertaExcelSchema> & {
  practice_location_id: number | null;
  ukuran_baju: string | null;
};
