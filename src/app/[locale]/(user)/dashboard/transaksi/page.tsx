import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { PesananStatusSection } from '../../pesanan-status-section';
import { getHargaUpgrade } from '@/lib/site-settings';
import { getProdukMerchandiseAktif, itemOrderMerch, pisahOrderMerch } from '@/lib/merchandise';
import { DetailPesananMerch, KartuPesananBerjalan, type KartuMerch } from '../../kartu-pesanan-merch';
import { PesananSelesai } from '../../riwayat-pesanan-merchandise';
import { MerchAddonShell } from '../../merch-addon-shell';
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

  const { data: semuaMerch } = await supabase
    .from('certificate_orders')
    .select('id, paket, status, alasan_tolak, status_pengiriman, alamat_pengiriman, created_at, updated_at')
    .eq('user_id', claims.sub)
    .eq('paket', 'merch_addon')
    .order('created_at', { ascending: false });

  const daftarMerch = semuaMerch ?? [];
  const { utama: pesananMerch, berjalan, selesai } = pisahOrderMerch(daftarMerch);
  const items = await itemOrderMerch(daftarMerch.map((order) => order.id));
  const kartu = (order: (typeof daftarMerch)[number]): KartuMerch => {
    const alamat = order.alamat_pengiriman as { alamat_lengkap?: string; kota?: string; kode_pos?: string } | null;
    return {
      id: order.id,
      tanggal: formatTanggal(order.created_at),
      status: order.status,
      statusPengiriman: order.status_pengiriman,
      alasan: order.alasan_tolak,
      items: items.get(order.id) ?? [],
      alamat: [alamat?.alamat_lengkap, alamat?.kota, alamat?.kode_pos].filter(Boolean).join(', '),
    };
  };

  const { data: rekeningSetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'rekening')
    .maybeSingle();
  const rekening = rekeningSetting?.value as { bank?: string; nomor?: string; atas_nama?: string } | undefined;

  const harga = await getHargaUpgrade();
  const merchandise = await getProdukMerchandiseAktif();
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
              merchandise={merchandise}
            />
          </div>
        </div>
      )}

      {bisaUpgrade &&
        ((pesananUtama?.status === 'disetujui' && pesananUtama.paket === 'cert_only') || pesananMerch) && (
          <MerchAddonShell
            judul={LABEL_PAKET.merch_addon}
            bisaPesanLagi={pesananMerch?.status === 'disetujui'}
            harga={harga}
            merchandise={merchandise}
          >
            <PesananStatusSection
              order={pesananMerch ?? null}
              rekening={rekening}
              paketOptions={['merch_addon']}
              harga={harga}
              paket="merch_addon"
              merchandise={merchandise}
              bolehUlang
            />
            {pesananMerch ? (
              <div className="mt-3 flex justify-end">
                <DetailPesananMerch row={kartu(pesananMerch)} />
              </div>
            ) : null}
            {berjalan.map((order) => (
              <KartuPesananBerjalan key={order.id} row={kartu(order)} />
            ))}
            <PesananSelesai rows={selesai.map(kartu)} />
          </MerchAddonShell>
        )}
    </div>
  );
}
