import { Link } from '@/i18n/navigation';
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">Transaksi Saya</h1>
        <p className="mt-1 text-base text-warna-teks-2">
          Status pesanan sertifikat dan merchandise. Setiap pesanan hanya menampilkan status terkini — kirim ulang
          bukti transfer memperbarui baris yang sama, bukan membuat pesanan baru.
        </p>
      </div>

      <div className="rounded-xl border border-warna-latar-2 bg-warna-latar p-5 shadow-float hover:-translate-y-0.5 hover:shadow-float-hover [transition:var(--transition-hover)]">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-bold text-warna-teks">
            {pesananUtama ? LABEL_PAKET[pesananUtama.paket] : 'Sertifikat'}
          </h2>
          {pesananUtama && (
            <p className="text-sm text-warna-teks-2">
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
          />
        </div>
        {pesananUtama && (
          <Link
            href="/dashboard/upgrade"
            className="mt-4 inline-flex h-11 w-fit items-center justify-center rounded-lg border border-warna-utama px-5 text-base font-semibold text-warna-utama"
          >
            Kelola pesanan ini
          </Link>
        )}
      </div>

      {(pesananUtama?.status === 'disetujui' && pesananUtama.paket === 'cert_only') || pesananMerch ? (
        <div className="rounded-xl border border-warna-latar-2 bg-warna-latar p-5 shadow-float hover:-translate-y-0.5 hover:shadow-float-hover [transition:var(--transition-hover)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-bold text-warna-teks">{LABEL_PAKET.merch_addon}</h2>
            {pesananMerch && (
              <p className="text-sm text-warna-teks-2">
                Diajukan {formatTanggal(pesananMerch.created_at)} · Diperbarui {formatTanggal(pesananMerch.updated_at)}
              </p>
            )}
          </div>
          <div className="mt-3">
            <PesananStatusSection
              order={pesananMerch ?? null}
              rekening={rekening}
              paketOptions={['merch_addon']}
              harga={harga}
            />
          </div>
          {pesananMerch && (
            <Link
              href="/dashboard/merchandise"
              className="mt-4 inline-flex h-11 w-fit items-center justify-center rounded-lg border border-warna-utama px-5 text-base font-semibold text-warna-utama"
            >
              Kelola pesanan ini
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
