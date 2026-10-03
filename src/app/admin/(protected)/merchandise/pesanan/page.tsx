import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { type PesananMerchandiseRow } from './pesanan-merchandise-table';
import { PesananMerchandiseTabs } from './pesanan-merchandise-tabs';

export default async function AdminMerchandisePesananPage() {
  await requireAdmin();
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();
  const { data: orders, error } = await supabase
    .from('certificate_orders')
    .select('id, user_id, paket, alamat_pengiriman, status_pengiriman, created_at')
    .in('paket', ['cert_merch', 'merch_addon'])
    .eq('status', 'disetujui')
    .order('created_at', { ascending: false });
  if (error) console.error('[admin-merchandise] pesanan:', error);

  const orderIds = (orders ?? []).map((o) => o.id);
  const { data: items } =
    orderIds.length > 0
      ? await supabase.from('certificate_order_items').select('order_id, qty, harga_satuan, product_id').in('order_id', orderIds)
      : { data: [] };
  const productIds = [...new Set((items ?? []).map((i) => i.product_id))];
  const { data: products } =
    productIds.length > 0 ? await supabase.from('products').select('id, nama_id').in('id', productIds) : { data: [] };
  const namaProduk = new Map((products ?? []).map((p) => [p.id, p.nama_id]));

  const { data: antrean } = await supabase
    .from('certificate_orders')
    .select('id, user_id, paket, nominal, bukti_url, alamat_pengiriman')
    .eq('paket', 'merch_addon')
    .eq('status', 'menunggu_verifikasi')
    .order('created_at', { ascending: true });
  const { data: ditolak } = await supabase
    .from('certificate_orders')
    .select('id, user_id, paket, alasan_tolak, created_at, alamat_pengiriman')
    .eq('paket', 'merch_addon')
    .eq('status', 'ditolak')
    .order('created_at', { ascending: false });

  const userIds = [
    ...new Set([...(orders ?? []), ...(antrean ?? []), ...(ditolak ?? [])].map((order) => order.user_id)),
  ];
  const { data: profiles } =
    userIds.length > 0
      ? await supabase.from('profiles').select('id, nama_lengkap').in('id', userIds)
      : { data: [] };
  const namaUser = new Map((profiles ?? []).map((p) => [p.id, p.nama_lengkap]));

  const rows: PesananMerchandiseRow[] = (orders ?? []).map((order) => {
    const daftar = (items ?? []).filter((i) => i.order_id === order.id);
    const alamat = order.alamat_pengiriman as {
      nama_penerima?: string;
      telepon?: string;
      alamat_lengkap?: string;
      kota?: string;
      kode_pos?: string;
    } | null;
    return {
      id: order.id,
      nama: namaUser.get(order.user_id) ?? '—',
      namaPenerima: alamat?.nama_penerima ?? '',
      telepon: alamat?.telepon ?? '',
      items: daftar.map((i) => ({
        nama: namaProduk.get(i.product_id) ?? 'Produk',
        qty: i.qty,
        harga: i.harga_satuan,
      })),
      paket: order.paket,
      produk: daftar.map((i) => `${namaProduk.get(i.product_id) ?? 'Produk'} × ${i.qty}`).join(', ') || '—',
      alamat: `${alamat?.nama_penerima ?? '—'}, ${alamat?.kota ?? '—'}`,
      alamatLengkap: alamat?.alamat_lengkap ?? '',
      kota: alamat?.kota ?? '',
      kodePos: alamat?.kode_pos ?? '',
      status_pengiriman: order.status_pengiriman,
      created_at: order.created_at,
    };
  });

  const antreanSiap = await Promise.all(
    (antrean ?? []).map(async (order) => {
      let buktiUrl: string | null = null;
      if (order.bukti_url) {
        const { data: signed } = await supabaseAdmin.storage.from('payment-proofs').createSignedUrl(order.bukti_url, 300);
        buktiUrl = signed?.signedUrl ?? null;
      }
      return {
        ...order,
        buktiUrl,
        nama: namaUser.get(order.user_id) ?? '—',
        merchandise: '',
      };
    }),
  );
  const ditolakRows = (ditolak ?? []).map((order) => {
    const alamat = order.alamat_pengiriman as { telepon?: string } | null;
    return {
      id: order.id,
      nama: namaUser.get(order.user_id) ?? '—',
      paket: order.paket,
      alasan_tolak: order.alasan_tolak,
      created_at: order.created_at,
      whatsapp: alamat?.telepon ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Pesanan Merchandise</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Merchandise tambahan diverifikasi di sini. Sertifikat tetap di menu Sertifikat.
        </p>
      </div>
      <PesananMerchandiseTabs antrean={antreanSiap} ditolak={ditolakRows} disetujui={rows} />
    </div>
  );
}
