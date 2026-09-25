import { PackageIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { SertifikatCard } from './sertifikat-card';
import type { Database } from '@/types/database';

type Jenis = Database['public']['Enums']['jenis_sertifikat'];

const LABEL_JENIS: Record<Jenis, string> = {
  free_track: 'Ready To Fly',
  existing_manual: 'Sertifikat RPC',
  rpc_certified: 'Sertifikat RPC',
};

export default async function SertifikatSayaPage() {
  const claims = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('nama_lengkap, free_track_selesai_at')
    .eq('id', claims.sub)
    .single();

  // Generik by user_id, bukan hardcode jenis — lihat catatan di actions.ts.
  const { data: sertifikat } = await supabase
    .from('certificates')
    .select('id, jenis, nomor_sertifikat, qr_aktif')
    .eq('user_id', claims.sub)
    .order('created_at', { ascending: false });

  const { data: certOnlyDisetujui } = await supabase
    .from('certificate_orders')
    .select('id')
    .eq('user_id', claims.sub)
    .eq('paket', 'cert_only')
    .eq('status', 'disetujui')
    .maybeSingle();

  const { data: pesananMerch } = await supabase
    .from('certificate_orders')
    .select('id, status')
    .eq('user_id', claims.sub)
    .eq('paket', 'merch_addon')
    .maybeSingle();

  const adaFreeTrackAktif = (sertifikat ?? []).some((s) => s.jenis === 'free_track' && s.qr_aktif);
  const tampilkanPreview = profile?.free_track_selesai_at != null && !adaFreeTrackAktif;
  // Fitur BARU (bukan restore) — git: tidak pernah ada kartu merch di /dashboard/sertifikat.
  // Tampil jika cert_only sudah disetujui dan merch_addon belum disetujui.
  const tampilkanAjakanMerch =
    !!certOnlyDisetujui && pesananMerch?.status !== 'disetujui';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">Sertifikat Saya</h1>
        <p className="mt-1 text-base text-warna-teks-2">Klik kartu untuk melihat sertifikatnya langsung.</p>
      </div>

      {!tampilkanPreview && (!sertifikat || sertifikat.length === 0) ? (
        <p className="rounded-xl border border-warna-latar-2 bg-warna-latar-2 p-5 text-sm text-warna-teks-2">
          Belum ada sertifikat. Selesaikan kuis di{' '}
          <Link href="/dashboard/kursus" className="font-medium text-warna-utama underline underline-offset-4">
            Kursus Saya
          </Link>{' '}
          untuk mendapatkan sertifikat pratinjau.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tampilkanPreview && (
            <SertifikatCard status="preview" namaLengkap={profile?.nama_lengkap ?? ''} />
          )}
          {(sertifikat ?? [])
            .filter((s) => s.qr_aktif)
            .map((s) => (
              <SertifikatCard
                key={s.id}
                status="aktif"
                namaLengkap={profile?.nama_lengkap ?? ''}
                certificateId={s.id}
                nomorSertifikat={s.nomor_sertifikat}
                jenisLabel={LABEL_JENIS[s.jenis]}
              />
            ))}
        </div>
      )}

      {tampilkanAjakanMerch && (
        <div className="flex flex-col gap-4 rounded-xl border border-warna-aksen/30 bg-warna-aksen/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-warna-aksen/10 text-warna-aksen">
              <PackageIcon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-base font-semibold text-warna-teks">Tambah merchandise</p>
              <p className="mt-0.5 text-sm text-warna-teks-2">
                Paket Anda saat ini Sertifikat Saja. Anda masih bisa menambah merchandise
                (merch addon) lewat Transaksi Saya.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/merchandise"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
          >
            Lihat opsi merchandise
          </Link>
        </div>
      )}
    </div>
  );
}
