import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UpgradeRowActions } from './upgrade-row-actions';
import { StatusPengirimanSelect } from './status-pengiriman-select';

const PAKET_LABEL: Record<string, string> = {
  cert_only: 'Sertifikat saja',
  cert_merch: 'Sertifikat + Merchandise',
  merch_addon: 'Tambah Merchandise',
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString('id-ID')}`;
}

function AlamatRingkas({ alamat }: { alamat: unknown }) {
  const a = alamat as { nama_penerima?: string; kota?: string } | null;
  if (!a) return <>—</>;
  return (
    <>
      {a.nama_penerima ?? '—'}, {a.kota ?? '—'}
    </>
  );
}

export default async function AdminUpgradePage() {
  // Layout sudah memanggil requireAdmin(), dipanggil lagi eksplisit di sini
  // sesuai ENGINEERING §4.1 — tidak cukup diandalkan dari layout saja.
  await requireAdmin();

  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const [{ data: antrean, error: errorAntrean }, { data: pengiriman, error: errorPengiriman }] =
    await Promise.all([
      supabase
        .from('certificate_orders')
        .select('id, user_id, paket, nominal, bukti_url, alamat_pengiriman')
        .eq('status', 'menunggu_verifikasi')
        .order('created_at', { ascending: true }),
      supabase
        .from('certificate_orders')
        .select('id, user_id, paket, status_pengiriman, alamat_pengiriman')
        .eq('status', 'disetujui')
        .neq('status_pengiriman', 'tidak_ada')
        .order('updated_at', { ascending: false }),
    ]);

  if (errorAntrean) console.error('[admin-upgrade] gagal memuat antrean:', errorAntrean);
  if (errorPengiriman) console.error('[admin-upgrade] gagal memuat pengiriman:', errorPengiriman);

  // certificate_orders.user_id menunjuk auth.users, bukan profiles — tidak bisa
  // di-embed lewat relasi Supabase, jadi digabung manual di sini.
  const userIds = [...new Set([...(antrean ?? []), ...(pengiriman ?? [])].map((o) => o.user_id))];
  const { data: profiles } =
    userIds.length > 0
      ? await supabase.from('profiles').select('id, nama_lengkap').in('id', userIds)
      : { data: [] };
  const namaById = new Map((profiles ?? []).map((p) => [p.id, p.nama_lengkap]));

  // Bucket payment-proofs privat — bukti transfer cuma boleh dilihat lewat
  // signed URL berumur pendek, tidak pernah lewat URL publik (PRD §8.7).
  const antreanDenganUrl = await Promise.all(
    (antrean ?? []).map(async (order) => {
      let buktiUrl: string | null = null;
      if (order.bukti_url) {
        const { data: signed } = await supabaseAdmin.storage
          .from('payment-proofs')
          .createSignedUrl(order.bukti_url, 300);
        buktiUrl = signed?.signedUrl ?? null;
      }
      return { ...order, buktiUrl };
    })
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-warna-teks">Antrean Verifikasi Pembayaran</h1>
        <div className="mt-4 overflow-x-auto rounded-lg border border-warna-latar-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Bukti</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {antreanDenganUrl.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-warna-teks-2">
                    Tidak ada pesanan menunggu verifikasi.
                  </TableCell>
                </TableRow>
              ) : (
                antreanDenganUrl.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-warna-teks">
                      {namaById.get(order.user_id) ?? '—'}
                    </TableCell>
                    <TableCell>{PAKET_LABEL[order.paket] ?? order.paket}</TableCell>
                    <TableCell>{formatRupiah(order.nominal)}</TableCell>
                    <TableCell>
                      <AlamatRingkas alamat={order.alamat_pengiriman} />
                    </TableCell>
                    <TableCell>
                      {order.buktiUrl ? (
                        <a
                          href={order.buktiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-warna-utama underline underline-offset-4"
                        >
                          Lihat bukti
                        </a>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <UpgradeRowActions orderId={order.id} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-warna-teks">Pengiriman Merchandise</h1>
        <div className="mt-4 overflow-x-auto rounded-lg border border-warna-latar-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Status Pengiriman</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(pengiriman ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-warna-teks-2">
                    Tidak ada merchandise yang perlu dikirim.
                  </TableCell>
                </TableRow>
              ) : (
                (pengiriman ?? []).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-warna-teks">
                      {namaById.get(order.user_id) ?? '—'}
                    </TableCell>
                    <TableCell>{PAKET_LABEL[order.paket] ?? order.paket}</TableCell>
                    <TableCell>
                      <AlamatRingkas alamat={order.alamat_pengiriman} />
                    </TableCell>
                    <TableCell>
                      <StatusPengirimanSelect
                        orderId={order.id}
                        statusSaatIni={order.status_pengiriman}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
