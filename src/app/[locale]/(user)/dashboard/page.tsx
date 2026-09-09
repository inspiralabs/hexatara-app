import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { logoutAction } from '../actions';
import { SertifikatCard } from './sertifikat-card';
import { PesananStatusSection } from '../pesanan-status-section';

const LABEL_AKSI: Record<string, string> = {
  sertifikat_aktif: 'Sertifikat diaktifkan',
};

export default async function DashboardPage() {
  const claims = await requireUser();
  const t = await getTranslations('dashboard');

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('nama_lengkap, free_track_selesai_at')
    .eq('id', claims.sub)
    .single();

  const { data: sertifikatAktif } = await supabase
    .from('certificates')
    .select('nomor_sertifikat')
    .eq('user_id', claims.sub)
    .eq('jenis', 'free_track')
    .eq('qr_aktif', true)
    .maybeSingle();

  const { data: pesananUtama } = await supabase
    .from('certificate_orders')
    .select('id, status, alasan_tolak, status_pengiriman')
    .eq('user_id', claims.sub)
    .in('paket', ['cert_only', 'cert_merch'])
    .maybeSingle();

  const { data: pesananMerch } = await supabase
    .from('certificate_orders')
    .select('id, status, alasan_tolak, status_pengiriman')
    .eq('user_id', claims.sub)
    .eq('paket', 'merch_addon')
    .maybeSingle();

  const { data: rekeningSetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'rekening')
    .maybeSingle();
  const rekening = rekeningSetting?.value as
    | { bank?: string; nomor?: string; atas_nama?: string }
    | undefined;

  const { data: aktivitas } = await supabase
    .from('activity_logs')
    .select('id, aksi, created_at')
    .eq('user_id', claims.sub)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">{t('pageTitle')}</h1>
        <form action={logoutAction}>
          <Button type="submit" variant="outline">
            {t('keluar')}
          </Button>
        </form>
      </div>

      <div className="mt-6">
        {!profile?.free_track_selesai_at ? (
          <div className="rounded-xl border border-warna-latar-2 bg-warna-latar-2 p-5">
            <p className="text-sm text-warna-teks-2">{t('belumSelesaiKuis')}</p>
            <Link
              href="/kuis"
              className="mt-3 inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks"
            >
              {t('mulaiKuis')}
            </Link>
          </div>
        ) : sertifikatAktif ? (
          <SertifikatCard
            status="aktif"
            namaLengkap={profile.nama_lengkap}
            nomorSertifikat={sertifikatAktif.nomor_sertifikat}
          />
        ) : (
          <SertifikatCard status="preview" namaLengkap={profile.nama_lengkap} />
        )}
      </div>

      {profile?.free_track_selesai_at && (
        <div className="mt-6 rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
          <h2 className="text-base font-bold text-warna-teks">{t('statusPembayaran')}</h2>
          <div className="mt-2">
            {pesananUtama ? (
              <PesananStatusSection
                order={pesananUtama}
                rekening={rekening}
                paketOptions={['cert_only', 'cert_merch']}
              />
            ) : (
              <p className="text-sm text-warna-teks-2">
                {t('belumUpgrade')}{' '}
                <Link href="/dashboard/upgrade" className="underline underline-offset-4">
                  {t('upgradeSekarang')}
                </Link>
              </p>
            )}
          </div>

          {pesananMerch && (
            <div className="mt-4 border-t border-warna-latar-2 pt-4">
              <h3 className="text-sm font-semibold text-warna-teks">{t('pesananMerchTambahan')}</h3>
              <div className="mt-2">
                <PesananStatusSection
                  order={pesananMerch}
                  rekening={rekening}
                  paketOptions={['merch_addon']}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
        <h2 className="text-base font-bold text-warna-teks">{t('riwayatAktivitas')}</h2>
        {aktivitas && aktivitas.length > 0 ? (
          <ul className="mt-2 divide-y divide-warna-latar-2">
            {aktivitas.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span className="text-warna-teks">{LABEL_AKSI[log.aksi] ?? log.aksi}</span>
                <span className="shrink-0 text-warna-teks-2">
                  {new Date(log.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-warna-teks-2">{t('belumAdaAktivitas')}</p>
        )}
      </div>
    </div>
  );
}
