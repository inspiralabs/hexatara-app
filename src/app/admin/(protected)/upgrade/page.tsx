import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AntreanTable, PengirimanTable } from './upgrade-tables';

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
      return { ...order, buktiUrl, nama: namaById.get(order.user_id) ?? '—' };
    })
  );

  const pengirimanDenganNama = (pengiriman ?? []).map((order) => ({
    ...order,
    nama: namaById.get(order.user_id) ?? '—',
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-warna-teks">Antrean Verifikasi Pembayaran</h1>
        <div className="mt-4">
          <AntreanTable antrean={antreanDenganUrl} />
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-warna-teks">Pengiriman Merchandise</h1>
        <div className="mt-4">
          <PengirimanTable pengiriman={pengirimanDenganNama} />
        </div>
      </div>
    </div>
  );
}
