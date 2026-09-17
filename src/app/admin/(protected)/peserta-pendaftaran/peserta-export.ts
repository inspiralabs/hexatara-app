import { format } from 'date-fns';
import type { PesertaPendaftaranRow } from './peserta-types';

const LABEL_KATEGORI: Record<PesertaPendaftaranRow['kategori_peserta'], string> = {
  penerbitan_baru: 'Penerbitan baru',
  perpanjangan_renewal: 'Perpanjangan / renewal',
};

/** Export mengikuti baris terfilter server — kolom detail penuh, tanpa foto. */
export async function eksporPesertaPendaftaranXlsx(rows: PesertaPendaftaranRow[]) {
  const XLSX = await import('xlsx');
  const data = rows.map((row) => ({
    Nama: row.nama_lengkap ?? '',
    Email: row.email ?? '',
    WhatsApp: row.whatsapp ?? '',
    Batch: row.batchJudul,
    'Kategori Peserta': LABEL_KATEGORI[row.kategori_peserta],
    Akun: row.user_id ? 'Login' : 'Tanpa akun',
    'Nomor KTP': row.nomor_ktp ?? '',
    'Tempat Lahir': row.tempat_lahir ?? '',
    'Tanggal Lahir': row.tanggal_lahir ?? '',
    Alamat: row.alamat_lengkap ?? '',
    'Sumber Info': row.sumber_info ?? '',
    'Kode Referral': row.kode_referral ?? '',
    'Tanggal Disetujui': row.verified_at
      ? format(new Date(row.verified_at), 'yyyy-MM-dd HH:mm')
      : '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Peserta');
  XLSX.writeFile(wb, `peserta-pendaftaran-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
