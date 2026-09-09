import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { PesananStatusSection } from '../../pesanan-status-section';

export default async function MerchandisePage() {
  const claims = await requireUser();
  const supabase = await createClient();

  // F03.10 — hanya untuk cert_only yang SUDAH disetujui (PRD §8.7).
  const { data: certOnlyDisetujui } = await supabase
    .from('certificate_orders')
    .select('id')
    .eq('user_id', claims.sub)
    .eq('paket', 'cert_only')
    .eq('status', 'disetujui')
    .maybeSingle();

  if (!certOnlyDisetujui) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">Tambah Merchandise</h1>
        <p className="mt-4 text-warna-teks-2">
          Fitur ini hanya untuk paket Sertifikat Saja yang sudah disetujui Admin.
        </p>
      </div>
    );
  }

  const { data: order } = await supabase
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

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">Tambah Merchandise</h1>
      <div className="mt-6">
        <PesananStatusSection order={order} rekening={rekening} paketOptions={['merch_addon']} />
      </div>
    </div>
  );
}
