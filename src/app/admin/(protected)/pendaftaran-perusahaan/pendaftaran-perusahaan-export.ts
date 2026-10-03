import { format } from 'date-fns';
import type { PendaftaranPerusahaanRow } from './pendaftaran-perusahaan-table';

const LABEL_STATUS: Record<PendaftaranPerusahaanRow['status'], string> = {
  menunggu_verifikasi: 'Menunggu verifikasi',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
};

export async function eksporPendaftaranPerusahaanXlsx(rows: PendaftaranPerusahaanRow[]) {
  const XLSX = await import('xlsx');
  const sheet = rows.map((r) => ({
    'Nama Perusahaan': r.nama_perusahaan,
    PIC: r.nama_pic,
    'WhatsApp PIC': r.whatsapp_pic,
    'Email PIC': r.email_pic,
    Batch: r.batchJudul,
    'Jumlah Peserta': r.jumlah_peserta,
    Nominal: r.nominal ?? '',
    Status: LABEL_STATUS[r.status],
    Tanggal: r.created_at,
  }));

  const ws = XLSX.utils.json_to_sheet(sheet);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pendaftaran Perusahaan');
  XLSX.writeFile(wb, `pendaftaran-perusahaan-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
