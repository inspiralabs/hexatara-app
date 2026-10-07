import { z } from 'zod';

// Dipakai kedua domain (product_categories, batch_categories) — bentuknya sama persis.
const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });

// is_active TIDAK ada di sini dengan sengaja — dikendalikan lewat Switch inline
// di tabel (KategoriManager), bukan lewat dialog form ini. Insert baru mengandalkan
// default kolom (is_active default true, SQL 15/ADR-012).
export const KategoriFormSchema = z.object({
  nama_id: teksWajib,
  nama_en: teksOpsional,
});

/** Batch saja — flag program (SiDOPI dkk), bukan product_categories. */
export const BatchKategoriFormSchema = KategoriFormSchema.extend({
  butuh_lokasi_praktek: z.boolean(),
  butuh_ukuran_baju: z.boolean(),
});

export type KategoriFormInput = z.input<typeof KategoriFormSchema>;
export type KategoriFormOutput = z.output<typeof KategoriFormSchema>;
export type BatchKategoriFormInput = z.input<typeof BatchKategoriFormSchema>;
