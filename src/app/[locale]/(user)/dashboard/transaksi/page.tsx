import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { PesananStatusSection } from '../../pesanan-status-section';
import { getHargaUpgrade } from '@/lib/site-settings';
import type { Database } from '@/types/database';

type Paket = Database['public']['Enums']['paket_upgrade'];

const LABEL_PAKET: Record<Paket, string> = {
  cert_only: 'Sertifikat Saja',
  cert_merch: 'Sertifikat + Merchandise',
  merch_addon: 'Tambah Merchandise',
};

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function TransaksiSayaPage() {
  const claims = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('free_track_selesai_at')
    .eq('id', claims.sub)
    .maybeSingle();

  const { data: pesananUtama } = await supabase
    .from('certificate_orders')
    .select('id, paket, status, alasan_tolak, status_pengiriman, created_at, updated_at')
    .eq('user_id', claims.sub)
    .in('paket', ['cert_only', 'cert_merch'])
    .maybeSingle();

  const { data: pesananMerch } = await supabase
    .from('certificate_orders')
    .select('id, paket, status, alasan_tolak, status_pengiriman, created_at, updated_at')
    .eq('user_id', claims.sub)
    .eq('paket', 'merch_addon')
    .maybeSingle();

  const { data: rekeningSetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'rekening')
    .maybeSingle();
  const rekening = rekeningSetting?.value as { bank?: string; nomor?: string; atas_nama?: string } | undefined;

  const harga = await getHargaUpgrade();
  const bisaUpgrade = profile?.free_track_selesai_at != null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Transaksi Saya</h1>
        <p className="mt-1 text-base text-muted-foreground">
          Buat pesanan, unggah bukti transfer, dan pantau status di sini — tanpa pindah halaman.
        </p>
      </div>

      {!bisaUpgrade ? (
        <p className="rounded-xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
          Selesaikan pelatihan gratis dan kuis dulu sebelum mengajukan upgrade sertifikat.
        </p>
      ) : (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {pesananUtama ? LABEL_PAKET[pesananUtama.paket] : 'Upgrade Sertifikat'}
            </h2>
            {pesananUtama && (
              <p className="text-sm text-muted-foreground">
                Diajukan {formatTanggal(pesananUtama.created_at)} · Diperbarui {formatTanggal(pesananUtama.updated_at)}
              </p>
            )}
          </div>
          <div className="mt-3">
            <PesananStatusSection
              order={pesananUtama ?? null}
              rekening={rekening}
              paketOptions={['cert_only', 'cert_merch']}
              harga={harga}
              paket={pesananUtama?.paket}
            />
          </div>
        </div>
      )}

      {bisaUpgrade &&
        ((pesananUtama?.status === 'disetujui' && pesananUtama.paket === 'cert_only') || pesananMerch) && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold text-foreground">{LABEL_PAKET.merch_addon}</h2>
              {pesananMerch && (
                <p className="text-sm text-muted-foreground">
                  Diajukan {formatTanggal(pesananMerch.created_at)} · Diperbarui{' '}
                  {formatTanggal(pesananMerch.updated_at)}
                </p>
              )}
            </div>
            <div className="mt-3">
              <PesananStatusSection
                order={pesananMerch ?? null}
                rekening={rekening}
                paketOptions={['merch_addon']}
                harga={harga}
                paket="merch_addon"
              />
            </div>
          </div>
        )}
    </div>
  );
}
