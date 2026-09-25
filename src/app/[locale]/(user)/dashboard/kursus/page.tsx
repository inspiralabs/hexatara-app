import { CheckCircle2Icon, CircleIcon, LockIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ContentCard } from '@/components/content-card';
import { StatusBadge } from '@/components/status-badge';
import { formatTanggalBatch } from '@/lib/batch';

const LABEL_STATUS_BATCH: Record<'upcoming' | 'open' | 'closed', string> = {
  upcoming: 'Segera',
  open: 'Dibuka',
  closed: 'Ditutup',
};

const LABEL_STATUS_REG = {
  menunggu_verifikasi: 'Menunggu',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
} as const;

export default async function KursusPage() {
  const claims = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('free_track_selesai_at')
    .eq('id', claims.sub)
    .single();

  const { data: material } = await supabase
    .from('materials')
    .select('id, judul_id, material_chapters!inner(id)')
    .eq('is_active', true)
    .order('urutan')
    .limit(1)
    .maybeSingle();

  let totalBab = 0;
  let babSelesai = 0;
  if (material) {
    const { data: chapters } = await supabase
      .from('material_chapters')
      .select('id')
      .eq('material_id', material.id);
    totalBab = chapters?.length ?? 0;

    if (totalBab > 0) {
      const { data: progress } = await supabase
        .from('material_progress')
        .select('chapter_id')
        .eq('user_id', claims.sub)
        .eq('is_selesai', true)
        .in('chapter_id', chapters!.map((c) => c.id));
      babSelesai = progress?.length ?? 0;
    }
  }

  // Pendaftaran resmi (ADR-020r). Admin client: RLS user terbatas; filter dari sesi server.
  const email = (await supabase.auth.getUser()).data.user?.email;
  const admin = createAdminClient();
  const selectReg =
    'id, created_at, status, batches(slug, judul_id, judul_en, status, tanggal_mulai, tanggal_selesai)';
  const [{ data: byUser }, { data: byEmail }] = await Promise.all([
    admin.from('batch_registrations').select(selectReg).eq('user_id', claims.sub).order('created_at', { ascending: false }),
    email
      ? admin.from('batch_registrations').select(selectReg).eq('email', email).order('created_at', { ascending: false })
      : Promise.resolve({ data: null }),
  ]);
  const pendaftaranById = new Map<number, NonNullable<typeof byUser>[number]>();
  for (const row of [...(byUser ?? []), ...(byEmail ?? [])]) {
    pendaftaranById.set(row.id, row);
  }
  const pendaftaranBatch = [...pendaftaranById.values()].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );

  const kuisSelesai = profile?.free_track_selesai_at != null;
  // kuisSelesai true berarti user sudah pegang sertifikat Ready to Fly, baik lewat
  // alur lama (sebelum LMS berbab, ADR-013) maupun alur baru — jangan tampilkan
  // "Belum Mulai" untuk user yang sudah selesai, walau progress bab barunya 0.
  const kursusSelesai = kuisSelesai || (totalBab > 0 && babSelesai >= totalBab);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">Kursus Saya</h1>
        <p className="mt-1 text-base text-warna-teks-2">
          Progres pelatihan gratis dan pendaftaran pelatihan berbayar yang pernah kamu ajukan.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-warna-teks">Pelatihan Gratis</h2>
        {!material ? (
          <p className="rounded-xl border border-warna-latar-2 bg-warna-latar-2 p-5 text-sm text-warna-teks-2">
            Belum ada materi gratis yang aktif.
          </p>
        ) : (
          <div className="rounded-xl border border-warna-latar-2 bg-warna-latar p-5 shadow-float hover:-translate-y-0.5 hover:shadow-float-hover [transition:var(--transition-hover)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-warna-teks">{material.judul_id}</h3>
                <p className="mt-1 text-sm text-warna-teks-2">
                  {babSelesai} dari {totalBab} bab selesai
                </p>
              </div>
              <StatusBadge
                status={kursusSelesai ? 'done' : totalBab > 0 && babSelesai > 0 ? 'wip' : 'todo'}
                label={kursusSelesai ? 'Selesai' : babSelesai > 0 ? 'Berjalan' : 'Belum Mulai'}
              />
            </div>

            {totalBab > 0 && (
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-warna-latar-2">
                <div
                  className="h-full rounded-full bg-warna-sukses [transition:var(--transition-hover)]"
                  style={{ width: `${Math.round((babSelesai / totalBab) * 100)}%` }}
                />
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 text-sm text-warna-teks-2">
              {kuisSelesai ? (
                <CheckCircle2Icon className="size-4 text-warna-sukses" />
              ) : (
                <CircleIcon className="size-4" />
              )}
              Kuis {kuisSelesai ? 'sudah selesai' : 'belum dikerjakan'}
            </div>

            {!kuisSelesai && (
              <Link
                href="/materi/get-free-certificate-rpc"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks"
              >
                {babSelesai === 0 ? 'Mulai Belajar' : 'Lanjutkan Belajar'}
              </Link>
            )}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-warna-teks">Pendaftaran Pelatihan</h2>
        <p className="text-sm text-warna-teks-2">
          Status mengikuti verifikasi Admin — menunggu, disetujui, atau ditolak.
        </p>
        {pendaftaranBatch.length === 0 ? (
          <div className="rounded-xl border border-warna-latar-2 bg-warna-latar-2 p-5 text-sm text-warna-teks-2">
            Belum ada pendaftaran pelatihan yang tercatat dari akun ini.
            <Link href="/pelatihan" className="ml-1 font-medium text-warna-utama underline underline-offset-4">
              Lihat pelatihan tersedia
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendaftaranBatch.map((row) => {
              const batch = row.batches;
              return (
                <ContentCard
                  key={row.id}
                  title={batch?.judul_id ?? 'Batch tidak ditemukan'}
                  badges={
                    <>
                      {batch && <StatusBadge status={batch.status} label={LABEL_STATUS_BATCH[batch.status]} />}
                      <StatusBadge
                        status={
                          row.status === 'disetujui' ? 'done' : row.status === 'ditolak' ? 'todo' : 'wip'
                        }
                        label={LABEL_STATUS_REG[row.status]}
                      />
                    </>
                  }
                  meta={[
                    batch ? formatTanggalBatch(batch.tanggal_mulai, batch.tanggal_selesai) : null,
                    `Diajukan ${new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`,
                  ].filter((line): line is string => Boolean(line))}
                  cta={
                    batch?.slug ? (
                      <Link
                        href={`/pelatihan/${batch.slug}`}
                        className="inline-flex h-11 w-fit items-center justify-center rounded-lg border border-warna-utama px-5 text-base font-semibold text-warna-utama"
                      >
                        Lihat Detail
                      </Link>
                    ) : (
                      <LockIcon className="size-4 text-warna-teks-2" />
                    )
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
