import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SertifikatRowActions } from './sertifikat-row-actions';

const JENIS_LABEL: Record<string, string> = {
  free_track: 'Free Track',
  existing_manual: 'Existing Manual',
  rpc_certified: 'RPC Certified',
};

const formatTanggalId = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
function formatTanggal(tanggal: string | null) {
  return tanggal ? formatTanggalId.format(new Date(tanggal)) : '—';
}

export default async function AdminSertifikatPage() {
  // Layout sudah memanggil requireAdmin(), tapi Server Component ini dipanggil
  // lagi secara eksplisit sesuai ENGINEERING §4.1 — bukan cuma diandalkan dari layout.
  await requireAdmin();

  const supabase = await createClient();

  // Dua query paralel: certificates untuk data penuh (id, qr_aktif — tidak ada di
  // view publik), certificates_public untuk kolom status yang SUDAH dihitung DB
  // lewat status_sertifikat() — supaya tidak menghitung ulang di TypeScript
  // (ENGINEERING §3.6, dua sumber kebenaran). Digabung lewat nomor_sertifikat (unik).
  const [{ data: sertifikat, error }, { data: statusRows }] = await Promise.all([
    supabase
      .from('certificates')
      .select('id, nomor_sertifikat, jenis, nama_lengkap, tanggal_terbit, tanggal_kedaluwarsa, qr_aktif')
      .order('created_at', { ascending: false }),
    supabase.from('certificates_public').select('nomor_sertifikat, status'),
  ]);

  if (error) console.error('[admin-sertifikat] gagal memuat daftar:', error);

  const statusByNomor = new Map((statusRows ?? []).map((s) => [s.nomor_sertifikat, s.status]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-warna-teks">Sertifikat</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/sertifikat/impor"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-warna-utama px-5 text-base font-semibold text-warna-utama"
          >
            Impor Massal
          </Link>
          <Link
            href="/admin/sertifikat/baru"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
          >
            Tambah Sertifikat
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-warna-latar-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Terbit</TableHead>
              <TableHead>Kedaluwarsa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>QR Aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!sertifikat || sertifikat.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-warna-teks-2">
                  Belum ada sertifikat.
                </TableCell>
              </TableRow>
            ) : (
              sertifikat.map((s) => {
                const status = statusByNomor.get(s.nomor_sertifikat);
                const invalid = status === 'invalid';
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-warna-teks">{s.nomor_sertifikat}</TableCell>
                    <TableCell>{JENIS_LABEL[s.jenis] ?? s.jenis}</TableCell>
                    <TableCell>{s.nama_lengkap}</TableCell>
                    <TableCell>{formatTanggal(s.tanggal_terbit)}</TableCell>
                    <TableCell>
                      {s.tanggal_kedaluwarsa === null ? 'Tanpa masa berlaku' : formatTanggal(s.tanggal_kedaluwarsa)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          invalid ? 'bg-warna-bahaya/10 text-warna-bahaya' : 'bg-warna-sukses/10 text-warna-sukses'
                        }`}
                      >
                        {invalid ? 'Invalid' : 'Berlaku'}
                      </span>
                    </TableCell>
                    <TableCell>{s.qr_aktif ? 'Ya' : 'Tidak'}</TableCell>
                    <TableCell className="text-right">
                      <SertifikatRowActions id={s.id} nomor={s.nomor_sertifikat} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
