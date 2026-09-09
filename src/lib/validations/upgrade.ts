import { z } from 'zod';

export const AlamatPengirimanSchema = z.object({
  nama_penerima: z.string().min(1, { error: 'Nama penerima wajib diisi' }),
  telepon: z.string().min(1, { error: 'Nomor telepon wajib diisi' }),
  alamat_lengkap: z.string().min(1, { error: 'Alamat lengkap wajib diisi' }),
  kota: z.string().min(1, { error: 'Kota wajib diisi' }),
  kode_pos: z.string().min(1, { error: 'Kode pos wajib diisi' }),
});

export const PesananSchema = z
  .object({
    paket: z.enum(['cert_only', 'cert_merch', 'merch_addon']),
    alamat: AlamatPengirimanSchema.optional(),
  })
  .superRefine((val, ctx) => {
    // Pertahanan kedua di atas UI (field alamat disembunyikan) dan constraint DB
    // chk_alamat_merch — supaya pengguna tidak sempat melihat error mentah.
    if (val.paket !== 'cert_only' && !val.alamat) {
      ctx.addIssue({
        code: 'custom',
        path: ['alamat'],
        message: 'Alamat pengiriman wajib diisi untuk paket ini',
      });
    }
  });

export type PesananInput = z.input<typeof PesananSchema>;
export type AlamatPengirimanInput = z.infer<typeof AlamatPengirimanSchema>;
