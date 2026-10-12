import { format } from 'date-fns';
import { labelKategoriPeserta } from '@/lib/validations/pendaftaran-batch';
import type { PendaftaranBatchRow } from './pendaftaran-batch-table';

/** Export antrean menunggu — kolom detail penuh, tanpa foto. */
export async function eksporPendaftaranBatchXlsx(rows: PendaftaranBatchRow[]) {
  const XLSX = await import('xlsx');
  const data = rows.map((row) => ({
    Nama: row.nama_lengkap ?? '',
    Email: row.email ?? '',
    WhatsApp: row.whatsapp ?? '',
    Batch: row.batchJudul,
    'Kategori Peserta': labelKategoriPeserta(row.kategori_peserta),
    'Lokasi Praktek': row.lokasiPraktek ?? '',
    'Ukuran Baju': row.ukuranBaju ?? '',
    Akun: row.user_id ? 'Login' : 'Tanpa akun',
    'Nomor KTP': row.nomor_ktp ?? '',
    'Tempat Lahir': row.tempat_lahir ?? '',
    'Tanggal Lahir': row.tanggal_lahir ?? '',
    Alamat: row.alamat_lengkap ?? '',
    'Sumber Info': row.sumber_info ?? '',
    'Kode Referral': row.kode_referral ?? '',
    Diajukan: format(new Date(row.created_at), 'yyyy-MM-dd HH:mm'),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pendaftaran');
  XLSX.writeFile(wb, `pendaftaran-batch-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
