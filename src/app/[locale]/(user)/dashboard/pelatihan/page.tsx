import { getLocale, getTranslations } from 'next-intl/server';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { pick } from '@/lib/i18n/pick';
import { getMateriHeroHref } from '@/lib/materi';
import { PelatihanCard } from '@/app/[locale]/(public)/pelatihan/pelatihan-card';
import { FilterBar } from '@/app/[locale]/(public)/pelatihan/filter-bar';
import { SORT_VALUES, type PelatihanSort } from '@/app/[locale]/(public)/pelatihan/sort-options';
import { Link } from '@/i18n/navigation';

const STATUS_VALUES = ['upcoming', 'open', 'closed'] as const;
type StatusFilter = (typeof STATUS_VALUES)[number];

function isStatusFilter(value: string | undefined): value is StatusFilter {
  return STATUS_VALUES.includes(value as StatusFilter);
}

function isSort(value: string | undefined): value is PelatihanSort {
  return SORT_VALUES.includes(value as PelatihanSort);
}

// Sama seperti (public)/pelatihan/page.tsx — sengaja diduplikasi query-nya,
// bukan diekstrak ke lib bersama, konsisten dengan pola inline-fetch-per-halaman
// proyek ini (lihat komentar di (kelas)/materi/[id]/page.tsx). Bedanya cuma
// dibungkus shell dashboard dan link "Mulai Sekarang" tetap ke /materi/{id}
// yang otomatis mengenali sesi login (tanpa alur anonim, sudah berlaku sejak F06.3).
export default async function DashboardPelatihanPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; status?: string; sort?: string }>;
}) {
  await requireUser();
  const { kategori, status, sort } = await searchParams;
  const kategoriId = kategori;
  const statusFilter = isStatusFilter(status) ? status : undefined;
  const sortValue = isSort(sort) ? sort : 'tanggalTerdekat';

  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations('pelatihan');
  const tBatch = await getTranslations('batch');

  const { data: kategoriList } = await supabase
    .from('batch_categories')
    .select('id, nama_id, nama_en')
    .eq('is_active', true)
    .order('urutan', { ascending: true });

  let query = supabase
    .from('batches')
    .select(
      'id, slug, judul_id, judul_en, kategori_id, kategori_en, lokasi_id, lokasi_en, deskripsi_id, deskripsi_en, harga, status, rating, hero_gambar_url, tanggal_mulai, tanggal_selesai, created_at'
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
  const kategoriOptions = (kategoriList ?? []).map((k) => ({
    value: k.id,
    label: pick(k.nama_id, k.nama_en, locale) ?? k.nama_id,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">Pelatihan</h1>
        <p className="mt-1 text-base text-warna-teks-2">Semua pelatihan Hexatara, termasuk yang gratis.</p>
      </div>

      {materiHref && (
        <div className="rounded-xl border border-warna-latar-2 bg-warna-latar-2 p-5">
          <p className="font-semibold text-warna-teks">{t('freemiumHeroTitle')}</p>
          <p className="mt-1 text-sm text-warna-teks-2">{t('freemiumHeroDesc')}</p>
          <Link
            href={materiHref}
            className="mt-3 inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks"
          >
            {t('freemiumHeroCta')}
          </Link>
        </div>
      )}

      <FilterBar kategoriOptions={kategoriOptions} kategoriValue={kategoriId} statusValue={statusFilter} sortValue={sortValue} />

      {!data || data.length === 0 ? (
        <p className="rounded-xl border border-warna-latar-2 bg-warna-latar-2 p-5 text-sm text-warna-teks-2">
          {t('kosong')}
        </p>
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
