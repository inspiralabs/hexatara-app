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

export type KategoriFormInput = z.input<typeof KategoriFormSchema>;
export type KategoriFormOutput = z.output<typeof KategoriFormSchema>;
