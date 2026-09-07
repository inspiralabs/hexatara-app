import { z } from 'zod';

// Tanpa .transform() dengan sengaja — lihat catatan yang sama di batch-admin.ts.
const teksOpsional = z.string().nullable().optional();
const teksWajib = z.string().min(1, { error: 'Wajib diisi' });

export const SertifikatFormSchema = z
  .object({
    nomor_sertifikat: teksOpsional, // kosong = otomatis lewat next_certificate_number() di Server Action
    jenis: z.enum(['free_track', 'existing_manual', 'rpc_certified']),
    nama_lengkap: teksWajib,
    tanggal_terbit: teksWajib, // yyyy-MM-dd
    tanggal_kedaluwarsa: teksOpsional, // yyyy-MM-dd, WAJIB null untuk free_track
    qr_aktif: z.boolean(),
    catatan: teksOpsional,
  })
  .superRefine((val, ctx) => {
    // Pertahanan kedua di atas UI (field dinonaktifkan) dan constraint DB
    // chk_free_track_tanpa_expiry — supaya Admin tidak sempat melihat error mentah.
    if (val.jenis === 'free_track') {
      if (val.tanggal_kedaluwarsa) {
        ctx.addIssue({
          code: 'custom',
          path: ['tanggal_kedaluwarsa'],
          message: 'Sertifikat free track tidak boleh punya tanggal kedaluwarsa',
        });
      }
    } else if (!val.tanggal_kedaluwarsa) {
      ctx.addIssue({
        code: 'custom',
        path: ['tanggal_kedaluwarsa'],
        message: 'Wajib diisi untuk jenis ini',
      });
    }
  });

export type SertifikatFormInput = z.input<typeof SertifikatFormSchema>;
export type SertifikatFormOutput = z.output<typeof SertifikatFormSchema>;
