import type { Database } from '@/types/database';

export type PesertaPendaftaranRow = {
  id: number;
  nama_lengkap: string | null;
  email: string | null;
  whatsapp: string | null;
  nomor_ktp: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  alamat_lengkap: string | null;
  kategori_peserta: Database['public']['Enums']['kategori_peserta_rpc'];
  sumber_info: string | null;
  kode_referral: string | null;
  user_id: string | null;
  verified_at: string | null;
  batchJudul: string;
  fotoKtpUrl: string | null;
  pasFotoUrl: string | null;
};
