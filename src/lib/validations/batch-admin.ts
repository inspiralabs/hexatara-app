import { z } from 'zod';

// Tanpa .transform() dengan sengaja — supaya tipe input dan output sama, dan
// useForm<BatchFormInput>() tidak bentrok dengan tipe hasil zodResolver.
// Normalisasi string kosong → null dan angka dilakukan di Server Action, bukan di sini.
const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });
const angkaOpsional = z.union([z.string(), z.number()]).nullable().optional();
const ratingOpsional = angkaOpsional.refine(
  (v) => v == null || v === '' || (Number(v) >= 0 && Number(v) <= 5),
  { error: 'Rating harus antara 0.0 dan 5.0' }
);
const tanggalOpsional = teksOpsional; // disimpan sebagai string yyyy-MM-dd

export const BenefitSchema = z.object({
  teks_id: teksWajib,
  teks_en: teksOpsional,
  ikon: teksOpsional,
});

export const RequirementSchema = z.object({
  teks_id: teksWajib,
  teks_en: teksOpsional,
  ikon: teksOpsional,
});

export const EquipmentSchema = z.object({
  teks_id: teksWajib,
  teks_en: teksOpsional,
});

export const FaqSchema = z.object({
  tanya_id: teksWajib,
  tanya_en: teksOpsional,
  jawab_id: teksWajib,
  jawab_en: teksOpsional,
});

export const GallerySchema = z.object({
  gambar_url: z.string().min(1, { error: 'Gambar wajib diunggah' }),
  caption_id: teksOpsional,
  caption_en: teksOpsional,
});

export const BatchFormSchema = z.object({
  judul_id: teksWajib,
  judul_en: teksOpsional,
  slug: z
    .string()
    .min(1, { error: 'Slug wajib diisi' })
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: 'Slug hanya huruf kecil, angka, dan tanda hubung' }),
  kategori_id: teksOpsional,
  kategori_en: teksOpsional,
  category_id: teksOpsional,
  rating: ratingOpsional,
  lokasi_id: teksOpsional,
  lokasi_en: teksOpsional,
  alamat: teksOpsional,
  harga: angkaOpsional,
  status: z.enum(['upcoming', 'open', 'closed']),
  is_active: z.boolean(),
  hero_gambar_url: teksOpsional,
  deskripsi_id: teksOpsional,
  deskripsi_en: teksOpsional,
  silabus_id: teksOpsional,
  silabus_en: teksOpsional,
  tanggal_mulai: tanggalOpsional,
  tanggal_selesai: tanggalOpsional,
  benefits: z.array(BenefitSchema),
  requirements: z.array(RequirementSchema),
  equipment: z.array(EquipmentSchema),
  faqs: z.array(FaqSchema),
  gallery: z.array(GallerySchema),
});

export type BatchFormInput = z.input<typeof BatchFormSchema>;
export type BatchFormOutput = z.output<typeof BatchFormSchema>;

// Angka/string kosong → null. Dipakai di Server Action sebelum insert/update,
// bukan di skema, supaya tipe form (RHF) dan tipe hasil validasi tetap sama.
export function teks(v: string | null | undefined) {
  return v && v.trim() ? v.trim() : null;
}

export function angka(v: string | number | null | undefined) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
