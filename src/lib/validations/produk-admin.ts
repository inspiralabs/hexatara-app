import { z } from 'zod';

// Tanpa .transform() dengan sengaja — lihat catatan yang sama di batch-admin.ts.
const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });
const angkaOpsional = z.union([z.string(), z.number()]).nullable().optional();
const ratingOpsional = angkaOpsional.refine(
  (v) => v == null || v === '' || (Number(v) >= 0 && Number(v) <= 5),
  { error: 'Rating harus antara 0.0 dan 5.0' }
);

export const ProductImageSchema = z.object({
  url: z.string().min(1, { error: 'Gambar wajib diunggah' }),
});

export const ProductFormSchema = z.object({
  nama_id: teksWajib,
  nama_en: teksOpsional,
  slug: z
    .string()
    .min(1, { error: 'Slug wajib diisi' })
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: 'Slug hanya huruf kecil, angka, dan tanda hubung' }),
  category_id: teksOpsional,
  rating: ratingOpsional,
  harga: angkaOpsional,
  tampilkan_harga: z.boolean(),
  urutan: angkaOpsional,
  is_active: z.boolean(),
  deskripsi_id: teksOpsional,
  deskripsi_en: teksOpsional,
  spesifikasi_id: teksOpsional,
  spesifikasi_en: teksOpsional,
  thumbnail_url: teksOpsional,
  images: z.array(ProductImageSchema),
});

export type ProductFormInput = z.input<typeof ProductFormSchema>;
export type ProductFormOutput = z.output<typeof ProductFormSchema>;
