import { getLocale, getTranslations } from 'next-intl/server';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { pick } from '@/lib/i18n/pick';
import { getMateriHeroHref } from '@/lib/materi';
import { getFreemiumLmsAccess } from '@/lib/site-settings';
import { slugify } from '@/lib/slugify';
import { PelatihanCard } from '@/app/[locale]/(public)/pelatihan/pelatihan-card';
import { FilterBar } from '@/app/[locale]/(public)/pelatihan/filter-bar';
import { SORT_VALUES, type PelatihanSort } from '@/app/[locale]/(public)/pelatihan/sort-options';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STATUS_VALUES = ['upcoming', 'open', 'closed'] as const;
type StatusFilter = (typeof STATUS_VALUES)[number];

function isStatusFilter(value: string | undefined): value is StatusFilter {
  return STATUS_VALUES.includes(value as StatusFilter);
}

function isSort(value: string | undefined): value is PelatihanSort {
  return SORT_VALUES.includes(value as PelatihanSort);
}

function modeBanner(opts: {
  adaMateri: boolean;
  lulus: boolean;
  pesananUtama: { paket: string; status: string } | null;
  adaMerchDisetujui: boolean;
}) {
  if (!opts.adaMateri) return null;
  if (!opts.lulus) return 'lms' as const;
  const disetujui = opts.pesananUtama?.status === 'disetujui';
  const sertifikatAktif = disetujui && (opts.pesananUtama?.paket === 'cert_only' || opts.pesananUtama?.paket === 'cert_merch');
  if (!sertifikatAktif) return 'upgrade' as const;
  if (opts.pesananUtama?.paket === 'cert_merch' || opts.adaMerchDisetujui) return null;
  return 'merchandise' as const;
}

// Sama seperti (public)/pelatihan/page.tsx — sengaja diduplikasi query-nya,
// bukan diekstrak ke lib bersama. Banner freemium: Mulai LMS / Upgrade / sembunyi
// kalau sudah paket tertinggi.
export default async function DashboardPelatihanPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; status?: string; sort?: string }>;
}) {
  const claims = await requireUser();
  const { kategori, status, sort } = await searchParams;
  const statusFilter = isStatusFilter(status) ? status : undefined;
  const sortValue = isSort(sort) ? sort : 'tanggalTerdekat';

  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations('pelatihan');
  const tDash = await getTranslations('dashboard');
  const tBatch = await getTranslations('batch');

  const [{ data: kategoriList }, { data: profile }, { data: pesananUtama }, { data: pesananMerch }] =
    await Promise.all([
      supabase
        .from('batch_categories')
        .select('id, nama_id, nama_en')
        .eq('is_active', true)
        .order('urutan', { ascending: true }),
      supabase.from('profiles').select('free_track_selesai_at').eq('id', claims.sub).maybeSingle(),
      supabase
        .from('certificate_orders')
        .select('paket, status')
        .eq('user_id', claims.sub)
        .in('paket', ['cert_only', 'cert_merch'])
        .maybeSingle(),
      supabase
        .from('certificate_orders')
        .select('status')
        .eq('user_id', claims.sub)
        .eq('paket', 'merch_addon')
        .eq('status', 'disetujui')
        .limit(1)
        .maybeSingle(),
    ]);

  const kategoriSlug = kategori ? slugify(kategori) : '';
  const kategoriMatch = (kategoriList ?? []).find((k) => slugify(k.nama_id) === kategoriSlug);
  const kategoriId = kategoriMatch?.id;
  const kategoriValue = kategoriMatch ? slugify(kategoriMatch.nama_id) : undefined;

  let query = supabase
    .from('batches')
    .select(
      'id, slug, judul_id, judul_en, lokasi_id, lokasi_en, deskripsi_id, deskripsi_en, harga, status, rating, hero_gambar_url, tanggal_mulai, tanggal_selesai, created_at, batch_categories(nama_id, nama_en)'
    )
    .eq('is_active', true);

  if (kategoriId) query = query.eq('category_id', kategoriId);
  if (statusFilter) query = query.eq('status', statusFilter);

  if (sortValue === 'terbaru') {
    query = query.order('created_at', { ascending: false });
  } else if (sortValue === 'hargaAsc') {
    query = query.order('harga', { ascending: true, nullsFirst: false });
  } else if (sortValue === 'hargaDesc') {
    query = query.order('harga', { ascending: false, nullsFirst: false });
  } else {
    query = query.order('tanggal_mulai', { ascending: true, nullsFirst: false });
  }

  const { data } = await query;

  const materiHref = await getMateriHeroHref();
  const { open: lmsOpen } = await getFreemiumLmsAccess();
  const tClosed = await getTranslations('lmsClosed');
  const kategoriOptions = (kategoriList ?? []).map((k) => ({
    value: slugify(k.nama_id),
    label: pick(k.nama_id, k.nama_en, locale) ?? k.nama_id,
  }));

  const lulusGratis = profile?.free_track_selesai_at != null;
  const banner = modeBanner({
    adaMateri: materiHref != null,
    lulus: lulusGratis,
    pesananUtama: pesananUtama ?? null,
    adaMerchDisetujui: pesananMerch != null,
  });
  // Saat LMS tertutup: jangan tampilkan CTA LMS; teks pelan jika itu satu-satunya banner.
  const bannerTampil = banner === 'lms' && !lmsOpen ? null : banner;
  const tampilkanTeksLmsTutup = banner === 'lms' && !lmsOpen;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Pelatihan</h1>
        <p className="mt-1 text-base text-muted-foreground">Semua pelatihan Hexatara, termasuk yang gratis.</p>
      </div>

      {tampilkanTeksLmsTutup && (
        <p className="rounded-xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
          {tClosed('softClosed')}
        </p>
      )}

      {bannerTampil && (
        <div className="rounded-xl border border-border bg-muted/40 p-5">
          <p className="font-semibold text-foreground">
            {bannerTampil === 'lms'
              ? t('freemiumHeroTitle')
              : bannerTampil === 'merchandise'
                ? tDash('dapatkanMerchandise')
                : tDash('upgradeSekarang')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {bannerTampil === 'lms'
              ? t('freemiumHeroDesc')
              : bannerTampil === 'merchandise'
                ? tDash('dapatkanMerchandiseDesc')
                : 'Kamu sudah menyelesaikan pelatihan gratis. Ajukan upgrade untuk mengaktifkan QR sertifikat resmi.'}
          </p>
          <Link
            href={
              bannerTampil === 'lms'
                ? materiHref!
                : bannerTampil === 'merchandise'
                  ? '/dashboard/merchandise'
                  : '/dashboard/transaksi'
            }
            className={cn(buttonVariants(), 'mt-3 h-11 px-6')}
          >
            {bannerTampil === 'lms'
              ? t('freemiumHeroCta')
              : bannerTampil === 'merchandise'
                ? tDash('dapatkanMerchandiseCta')
                : tDash('upgradeSekarang')}
          </Link>
        </div>
      )}

      <FilterBar kategoriOptions={kategoriOptions} kategoriValue={kategoriValue} statusValue={statusFilter} sortValue={sortValue} />

      {!data || data.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">{t('kosong')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((batch) => (
            <PelatihanCard
              key={batch.id}
              batch={batch}
              locale={locale}
              statusLabel={tBatch(`status.${batch.status}`)}
              detailLabel={t('lihatDetail')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
