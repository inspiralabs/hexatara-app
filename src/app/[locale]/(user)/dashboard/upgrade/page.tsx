import { Link } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { PesananStatusSection } from '../../pesanan-status-section';

export default async function UpgradePage() {
  const claims = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('free_track_selesai_at')
    .eq('id', claims.sub)
    .single();

  if (!profile?.free_track_selesai_at) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <p className="text-warna-teks-2">
          Selesaikan kuis dan daftar akun dulu untuk mengajukan upgrade sertifikat.
        </p>
        <Link href="/kuis" className="mt-3 inline-block text-sm underline underline-offset-4">
          Mulai Kuis
        </Link>
      </div>
    );
  }

  const { data: order } = await supabase
    .from('certificate_orders')
    .select('id, status, alasan_tolak, status_pengiriman')
    .eq('user_id', claims.sub)
    .in('paket', ['cert_only', 'cert_merch'])
    .maybeSingle();

  const { data: rekeningSetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'rekening')
    .maybeSingle();
  const rekening = rekeningSetting?.value as
    | { bank?: string; nomor?: string; atas_nama?: string }
    | undefined;

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">Upgrade Sertifikat</h1>
      <div className="mt-6">
        <PesananStatusSection
          order={order}
          rekening={rekening}
          paketOptions={['cert_only', 'cert_merch']}
        />
      </div>
    </div>
  );
}
