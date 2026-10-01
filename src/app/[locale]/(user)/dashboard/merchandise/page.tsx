import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { PesananStatusSection } from '../../pesanan-status-section';
import { DetailPesananMerch, KartuPesananBerjalan, type KartuMerch } from '../../kartu-pesanan-merch';
import { PesananSelesai } from '../../riwayat-pesanan-merchandise';
import { getHargaUpgrade } from '@/lib/site-settings';
import { getProdukMerchandiseAktif, itemOrderMerch, pisahOrderMerch } from '@/lib/merchandise';

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function MerchandisePage() {
  const claims = await requireUser();
  const supabase = await createClient();

  const { data: certOnlyDisetujui } = await supabase
    .from('certificate_orders')
    .select('id')
    .eq('user_id', claims.sub)
    .eq('paket', 'cert_only')
    .eq('status', 'disetujui')
    .limit(1)
    .maybeSingle();

  if (!certOnlyDisetujui) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">Tambah Merchandise</h1>
        <p className="mt-4 text-warna-teks-2">
          Fitur ini hanya untuk paket Sertifikat Saja yang sudah disetujui Admin.
        </p>
      </div>
    );
  }

  const { data: semuaOrder } = await supabase
    .from('certificate_orders')
    .select('id, status, alasan_tolak, status_pengiriman, alamat_pengiriman, created_at')
    .eq('user_id', claims.sub)
    .eq('paket', 'merch_addon')
    .order('created_at', { ascending: false });

  const semua = semuaOrder ?? [];
  const { utama, berjalan, selesai } = pisahOrderMerch(semua);
  const items = await itemOrderMerch(semua.map((order) => order.id));
  const kartu = (order: (typeof semua)[number]): KartuMerch => {
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
  const rekening = rekeningSetting?.value as
    | { bank?: string; nomor?: string; atas_nama?: string }
    | undefined;

  const harga = await getHargaUpgrade();
  const merchandise = await getProdukMerchandiseAktif();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">Tambah Merchandise</h1>
      <div className="mt-6">
        <PesananStatusSection
          order={utama}
          rekening={rekening}
          paketOptions={['merch_addon']}
          harga={harga}
          paket="merch_addon"
          merchandise={merchandise}
          bolehUlang
        />
        {utama ? (
          <div className="mt-3 flex justify-end">
            <DetailPesananMerch row={kartu(utama)} />
          </div>
        ) : null}
        {berjalan.map((order) => (
          <KartuPesananBerjalan key={order.id} row={kartu(order)} />
        ))}
        <PesananSelesai rows={selesai.map(kartu)} />
      </div>
    </div>
  );
}
