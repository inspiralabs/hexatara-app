import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { StatusPengirimanSelect } from '../../upgrade/status-pengiriman-select';

export default async function AdminMerchandisePesananPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from('certificate_orders')
    .select('id, user_id, paket, alamat_pengiriman, status_pengiriman')
    .in('paket', ['cert_merch', 'merch_addon'])
    .eq('status', 'disetujui')
    .order('updated_at', { ascending: false });
  if (error) console.error('[admin-merchandise] pesanan:', error);

  const orderIds = (orders ?? []).map((o) => o.id);
  const { data: items } =
    orderIds.length > 0
      ? await supabase
          .from('certificate_order_items')
          .select('order_id, qty, product_id')
          .in('order_id', orderIds)
      : { data: [] };
  const productIds = [...new Set((items ?? []).map((i) => i.product_id))];
  const { data: products } =
    productIds.length > 0
      ? await supabase.from('products').select('id, nama_id').in('id', productIds)
      : { data: [] };
  const namaProduk = new Map((products ?? []).map((p) => [p.id, p.nama_id]));
  const userIds = [...new Set((orders ?? []).map((o) => o.user_id))];
  const { data: profiles } =
    userIds.length > 0
      ? await supabase.from('profiles').select('id, nama_lengkap').in('id', userIds)
      : { data: [] };
  const namaUser = new Map((profiles ?? []).map((p) => [p.id, p.nama_lengkap]));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Pesanan Merchandise</h1>
      <p className="text-sm text-muted-foreground">
        Order yang sudah disetujui. Verifikasi pembayaran tetap di menu Sertifikat → Upgrade.
      </p>
      {(orders ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada pesanan merchandise yang disetujui.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {(orders ?? []).map((order) => {
            const daftar = (items ?? []).filter((i) => i.order_id === order.id);
            const alamat = order.alamat_pengiriman as { nama_penerima?: string; alamat_lengkap?: string; kota?: string } | null;
            return (
              <li key={order.id} className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">{namaUser.get(order.user_id) ?? '—'}</p>
                <ul className="mt-2 text-sm text-muted-foreground">
                  {daftar.map((item) => (
                    <li key={`${order.id}-${item.product_id}`}>
                      {namaProduk.get(item.product_id) ?? 'Produk'} × {item.qty}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-muted-foreground">
                  {alamat?.nama_penerima ?? '—'}, {alamat?.alamat_lengkap ?? '—'}, {alamat?.kota ?? '—'}
                </p>
                <div className="mt-3">
                  <StatusPengirimanSelect orderId={order.id} statusSaatIni={order.status_pengiriman} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
