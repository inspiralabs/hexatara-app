import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { PesananPublikStatusSelect } from './status-select';

type Item = { nama_produk?: string; qty?: number };

export default async function PesananPublikPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('merchandise_public_orders')
    .select('id, nama_lengkap, whatsapp, alamat_pengiriman, items, status, created_at')
    .order('created_at', { ascending: false });
  if (error) console.error('[merchandise-publik] daftar:', error);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Pesanan Publik</h1>
      {(data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada pesanan publik.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {(data ?? []).map((row) => {
            const items = (Array.isArray(row.items) ? row.items : []) as Item[];
            const alamat = row.alamat_pengiriman as { alamat_lengkap?: string; kota?: string } | null;
            const wa = row.whatsapp.replace(/\D/g, '');
            return (
              <li key={row.id} className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">{row.nama_lengkap}</p>
                <p className="text-sm text-muted-foreground">
                  {items.map((item) => `${item.nama_produk ?? 'Produk'} × ${item.qty ?? 0}`).join(', ') || '—'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {alamat?.alamat_lengkap ?? '—'}, {alamat?.kota ?? '—'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <PesananPublikStatusSelect id={row.id} statusSaatIni={row.status} />
                  {wa && (
                    <a
                      href={`https://wa.me/${wa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline underline-offset-4"
                    >
                      WhatsApp {row.whatsapp}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
