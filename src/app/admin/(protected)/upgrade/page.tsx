import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AntreanTable, SertifikatDitolakTable } from './upgrade-tables';

export default async function AdminUpgradePage() {
  // Layout sudah memanggil requireAdmin(), dipanggil lagi eksplisit di sini
  // sesuai ENGINEERING §4.1 — tidak cukup diandalkan dari layout saja.
  await requireAdmin();

  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const [{ data: antrean, error: errorAntrean }, { data: ditolak, error: errorDitolak }] = await Promise.all([
    supabase
      .from('certificate_orders')
      .select('id, user_id, paket, nominal, bukti_url, alamat_pengiriman')
      .eq('status', 'menunggu_verifikasi')
      .order('created_at', { ascending: true }),
    supabase
      .from('certificate_orders')
      .select('id, user_id, paket, alasan_tolak, created_at')
      .eq('status', 'ditolak')
      .order('created_at', { ascending: false }),
  ]);

  if (errorAntrean) console.error('[admin-upgrade] gagal memuat antrean:', errorAntrean);
  if (errorDitolak) console.error('[admin-upgrade] gagal memuat ditolak:', errorDitolak);

  const userIds = [...new Set([...(antrean ?? []), ...(ditolak ?? [])].map((o) => o.user_id))];
  const { data: profiles } =
    userIds.length > 0
      ? await supabase.from('profiles').select('id, nama_lengkap, whatsapp').in('id', userIds)
      : { data: [] };
  const namaById = new Map((profiles ?? []).map((p) => [p.id, p.nama_lengkap]));
  const waById = new Map((profiles ?? []).map((p) => [p.id, p.whatsapp]));

  // Bucket payment-proofs privat — bukti transfer cuma boleh dilihat lewat
  // signed URL berumur pendek, tidak pernah lewat URL publik (PRD §8.7).
  const antreanIds = (antrean ?? []).map((o) => o.id);
  const { data: itemMerch } =
    antreanIds.length > 0
      ? await supabase.from('certificate_order_items').select('order_id, qty, product_id').in('order_id', antreanIds)
      : { data: [] as { order_id: number; qty: number; product_id: number }[] };
  const produkIds = [...new Set((itemMerch ?? []).map((i) => i.product_id))];
  const { data: produkNama } =
    produkIds.length > 0
      ? await supabase.from('products').select('id, nama_id').in('id', produkIds)
      : { data: [] as { id: number; nama_id: string }[] };
  const namaProduk = new Map((produkNama ?? []).map((p) => [p.id, p.nama_id]));
  const ringkasByOrder = new Map<number, string>();
  for (const item of itemMerch ?? []) {
    const prev = ringkasByOrder.get(item.order_id);
    const baris = `${namaProduk.get(item.product_id) ?? 'Produk'} × ${item.qty}`;
    ringkasByOrder.set(item.order_id, prev ? `${prev}, ${baris}` : baris);
  }

  const antreanDenganUrl = await Promise.all(
    (antrean ?? []).map(async (order) => {
      let buktiUrl: string | null = null;
      if (order.bukti_url) {
        const { data: signed } = await supabaseAdmin.storage
          .from('payment-proofs')
          .createSignedUrl(order.bukti_url, 300);
        buktiUrl = signed?.signedUrl ?? null;
      }
      return {
        ...order,
        buktiUrl,
        nama: namaById.get(order.user_id) ?? '—',
        merchandise: ringkasByOrder.get(order.id) ?? '',
      };
    })
  );

  const ditolakRows = (ditolak ?? []).map((order) => ({
    ...order,
    nama: namaById.get(order.user_id) ?? '—',
    whatsapp: waById.get(order.user_id) ?? null,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">Antrean Verifikasi Pembayaran</h1>
        <div className="mt-4">
          <AntreanTable antrean={antreanDenganUrl} />
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-foreground">Sertifikat Ditolak</h1>
        <div className="mt-4">
          <SertifikatDitolakTable rows={ditolakRows} />
        </div>
      </div>
    </div>
  );
}
