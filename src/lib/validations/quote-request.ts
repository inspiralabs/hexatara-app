import { z } from 'zod';

// Validasi email HANYA format standar (PRD §9.5, larangan #20). Tanpa domain
// check, MX lookup, atau daftar hitam — itu scope Fase 2, sudah dianggarkan
// terpisah. Jangan tambahkan di sini walau terasa seperti "praktik baik".
export const QuoteRequestFormSchema = z.object({
  nama: z.string().min(1, { error: 'Nama wajib diisi' }),
  perusahaan: z.string().optional(),
  email: z.email({ error: 'Format email tidak valid' }),
  whatsapp: z.string().optional(),
  kebutuhan: z.string().optional(),
  persetujuan: z.boolean().refine((v) => v === true, {
    error: 'Kamu harus menyetujui penyimpanan data',
  }),
});
