import { z } from 'zod';

export const DaftarSchema = z
  .object({
    nama_lengkap: z.string().min(1, { error: 'Nama lengkap wajib diisi' }),
    email: z.email({ error: 'Email tidak valid' }),
    password: z.string().min(8, { error: 'Kata sandi minimal 8 karakter' }),
    konfirmasiPassword: z.string().min(1, { error: 'Konfirmasi kata sandi wajib diisi' }),
    persetujuan: z.boolean().refine((v) => v === true, {
      error: 'Kamu harus menyetujui penyimpanan data',
    }),
  })
  .refine((data) => data.password === data.konfirmasiPassword, {
    error: 'Konfirmasi kata sandi tidak sama',
    path: ['konfirmasiPassword'],
  });

export const LoginSchema = z.object({
  email: z.email({ error: 'Email tidak valid' }),
  password: z.string().min(1, { error: 'Kata sandi wajib diisi' }),
});

export const LupaSandiSchema = z.object({
  email: z.email({ error: 'Email tidak valid' }),
});

export const ResetSandiSchema = z
  .object({
    password: z.string().min(8, { error: 'Kata sandi minimal 8 karakter' }),
    konfirmasiPassword: z.string(),
  })
  .refine((data) => data.password === data.konfirmasiPassword, {
    error: 'Konfirmasi kata sandi tidak cocok',
    path: ['konfirmasiPassword'],
  });
