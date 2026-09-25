import {
  BadgeCheckIcon,
  CheckCircle2Icon,
  ClockIcon,
  LockIcon,
  PackageIcon,
  UserRoundIcon,
  XCircleIcon,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth/guard';
import { isProfilIdentitasLengkap } from '@/lib/identitas';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

const LABEL_AKSI: Record<string, string> = {
  sertifikat_aktif: 'Sertifikat diaktifkan',
};

type StatusOrder = Database['public']['Enums']['status_order'];
type StatusKirim = Database['public']['Enums']['status_kirim'];

const LABEL_STATUS_ORDER: Record<StatusOrder, string> = {
  menunggu_bukti: 'Menunggu Bukti',
  menunggu_verifikasi: 'Diperiksa Admin',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
};

const LABEL_STATUS_KIRIM: Record<StatusKirim, string> = {
  tidak_ada: 'Tidak Ada',
  belum_diproses: 'Belum Diproses',
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  diterima: 'Diterima',
};

// Kartu angka besar (F03.9, direstyle §12.6) — bukan lagi tabel teks polos,
// sesuai permintaan "angka sebagai hero". Tetap reuse token shadow/transition
// yang sama dengan ContentCard, bukan animasi baru.
function StatTile({
  icon: Icon,
  label,
  value,
  tone,
  href,
}: {
  icon: typeof CheckCircle2Icon;
  label: string;
  value: string;
  tone: 'sukses' | 'aksen' | 'bahaya' | 'netral';
  href: string;
}) {
  const toneClassName = {
    sukses: 'bg-warna-sukses/10 text-warna-sukses',
    aksen: 'bg-warna-aksen/10 text-warna-aksen',
    bahaya: 'bg-warna-bahaya/10 text-warna-bahaya',
    netral: 'bg-warna-latar-2 text-warna-teks-2',
  }[tone];

  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-xl border border-warna-latar-2 bg-warna-latar p-5 shadow-float hover:-translate-y-0.5 hover:shadow-float-hover [transition:var(--transition-hover)]"
    >
      <span className={`inline-flex size-10 items-center justify-center rounded-lg ${toneClassName}`}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-sm text-warna-teks-2">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-warna-teks">{value}</p>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const claims = await requireUser();
  const t = await getTranslations('dashboard');

  const supabase = await createClient();
  const [{ data: profile }, identitasLengkap] = await Promise.all([
    supabase
      .from('profiles')
      .select('nama_lengkap, free_track_selesai_at')
      .eq('id', claims.sub)
      .single(),
    isProfilIdentitasLengkap(claims.sub),
  ]);

  const { data: sertifikatAktif } = await supabase
    .from('certificates')
    .select('nomor_sertifikat')
    .eq('user_id', claims.sub)
    .eq('jenis', 'free_track')
    .eq('qr_aktif', true)
    .maybeSingle();

  const { data: pesananUtama } = await supabase
    .from('certificate_orders')
    .select('status, status_pengiriman')
    .eq('user_id', claims.sub)
    .in('paket', ['cert_only', 'cert_merch'])
    .maybeSingle();

  // Kartu ajakan upgrade: kuis selesai + belum resmi disetujui.
  // menunggu_verifikasi: TIDAK tampil — StatTile "Diperiksa Admin" sudah cukup.
  // belum diajukan / menunggu_bukti / ditolak: tampil (teks disesuaikan).
  const perluAjakanUpgrade =
    !!profile?.free_track_selesai_at &&
    pesananUtama?.status !== 'disetujui' &&
    pesananUtama?.status !== 'menunggu_verifikasi';

  const teksAjakanUpgrade =
    pesananUtama?.status === 'ditolak'
      ? {
          judul: 'Pengajuan upgrade ditolak',
          deskripsi:
            'Sertifikat Anda masih pratinjau (QR blur). Perbaiki dan ajukan ulang di Transaksi Saya supaya mendapat sertifikat resmi yang bisa diverifikasi publik.',
          cta: 'Ajukan ulang di Transaksi',
        }
      : pesananUtama?.status === 'menunggu_bukti'
        ? {
            judul: 'Lanjutkan upgrade sertifikat',
            deskripsi:
              'Pesanan sudah dibuat, tapi bukti transfer belum diunggah. Sertifikat masih pratinjau (QR blur) sampai Admin menyetujui.',
            cta: 'Lanjut di Transaksi',
          }
        : {
            judul: 'Upgrade untuk aktifkan QR',
            deskripsi:
              'Sertifikat Anda masih pratinjau (QR blur). Upgrade supaya mendapat sertifikat resmi yang bisa diverifikasi publik.',
            cta: 'Upgrade di Transaksi',
          };

  const { data: aktivitas } = await supabase
    .from('activity_logs')
    .select('id, aksi, created_at')
    .eq('user_id', claims.sub)
    .order('created_at', { ascending: false })
    .limit(20);

  const statusSertifikat = !profile?.free_track_selesai_at
    ? { label: 'Selesaikan kuis dulu', tone: 'netral' as const, icon: LockIcon }
    : sertifikatAktif
      ? { label: 'Aktif', tone: 'sukses' as const, icon: CheckCircle2Icon }
      : { label: 'Pratinjau', tone: 'aksen' as const, icon: ClockIcon };

  const statusPembayaran = !pesananUtama
    ? { label: 'Belum diajukan', tone: 'netral' as const, icon: ClockIcon }
    : pesananUtama.status === 'ditolak'
      ? { label: LABEL_STATUS_ORDER.ditolak, tone: 'bahaya' as const, icon: XCircleIcon }
      : pesananUtama.status === 'disetujui'
        ? { label: LABEL_STATUS_ORDER.disetujui, tone: 'sukses' as const, icon: CheckCircle2Icon }
        : { label: LABEL_STATUS_ORDER[pesananUtama.status], tone: 'aksen' as const, icon: ClockIcon };

  const statusKirim =
    !pesananUtama || pesananUtama.status_pengiriman === 'tidak_ada'
      ? { label: 'Tidak Ada', tone: 'netral' as const }
      : pesananUtama.status_pengiriman === 'diterima'
        ? { label: LABEL_STATUS_KIRIM.diterima, tone: 'sukses' as const }
        : { label: LABEL_STATUS_KIRIM[pesananUtama.status_pengiriman], tone: 'aksen' as const };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">
          {t('sapaan', { nama: profile?.nama_lengkap ?? '' })}
        </h1>
        <p className="mt-1 text-base text-warna-teks-2">{t('pageTitle')}</p>
      </div>

      {!identitasLengkap && (
        <div className="flex flex-col gap-4 rounded-xl border border-warna-aksen/30 bg-warna-aksen/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-warna-aksen/10 text-warna-aksen">
              <UserRoundIcon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-base font-semibold text-warna-teks">Lengkapi data identitas</p>
              <p className="mt-0.5 text-sm text-warna-teks-2">
                Isi KTP, alamat, dan foto di Profil supaya pendaftaran pelatihan RPC berikutnya bisa
                terisi otomatis. Pendaftaran sekarang tetap bisa dilakukan tanpa ini.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/profil"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
          >
            Lengkapi di Profil
          </Link>
        </div>
      )}

      {perluAjakanUpgrade && (
        <div className="flex flex-col gap-4 rounded-xl border border-warna-aksen/30 bg-warna-aksen/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-warna-aksen/10 text-warna-aksen">
              <BadgeCheckIcon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-base font-semibold text-warna-teks">{teksAjakanUpgrade.judul}</p>
              <p className="mt-0.5 text-sm text-warna-teks-2">{teksAjakanUpgrade.deskripsi}</p>
            </div>
          </div>
          <Link
            href="/dashboard/transaksi"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
          >
            {teksAjakanUpgrade.cta}
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={statusSertifikat.icon}
          label="Sertifikat"
          value={statusSertifikat.label}
          tone={statusSertifikat.tone}
          href="/dashboard/sertifikat"
        />
        <StatTile
          icon={profile?.free_track_selesai_at ? CheckCircle2Icon : LockIcon}
          label={t('readyToFly')}
          value={profile?.free_track_selesai_at ? 'Tercapai' : 'Belum'}
          tone={profile?.free_track_selesai_at ? 'sukses' : 'netral'}
          href="/dashboard/kursus"
        />
        <StatTile
          icon={statusPembayaran.icon}
          label={t('statusPembayaran')}
          value={statusPembayaran.label}
          tone={statusPembayaran.tone}
          href="/dashboard/transaksi"
        />
        <StatTile
          icon={PackageIcon}
          label="Status Pengiriman"
          value={statusKirim.label}
          tone={statusKirim.tone}
          href="/dashboard/transaksi"
        />
      </div>

      <div className="rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
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
