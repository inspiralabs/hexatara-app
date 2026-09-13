import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { StatCards, type StatCardItem } from './overview/stat-cards';
import { LeadsTrendChart, type MonthBucket } from './overview/leads-trend-chart';
import { RecentLeadsTable, type RecentLeadRow } from './overview/recent-leads-table';

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function startOfMonth(offset = 0) {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCMonth(d.getUTCMonth() + offset);
  return d;
}

function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split('-');
  const d = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
  return d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit', timeZone: 'UTC' });
}

function buildEmptyBuckets(months: number): MonthBucket[] {
  const now = new Date();
  const buckets: MonthBucket[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = monthKey(d);
    buckets.push({ key, label: monthLabel(key), total: 0 });
  }
  return buckets;
}

function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export default async function AdminHomePage() {
  await requireAdmin();
  const supabase = await createClient();

  const now = new Date();
  const tujuhHari = isoDaysAgo(7);
  const empatBelasHari = isoDaysAgo(14);
  const awalBulanIni = startOfMonth(0).toISOString().slice(0, 10);
  const awalBulanDepan = startOfMonth(1).toISOString().slice(0, 10);
  const awalBulanLalu = startOfMonth(-1).toISOString().slice(0, 10);
  const chartSince = startOfMonth(-11).toISOString();

  const [
    lead7,
    lead7prev,
    quote7,
    quote7prev,
    pending,
    certBulanIni,
    certBulanLalu,
    batchAktif,
    batchLeadsChart,
    quoteChart,
    batchLeadsRecent,
    quoteRecent,
  ] = await Promise.all([
    supabase
      .from('batch_leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', tujuhHari),
    supabase
      .from('batch_leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', empatBelasHari)
      .lt('created_at', tujuhHari),
    supabase
      .from('quote_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', tujuhHari),
    supabase
      .from('quote_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', empatBelasHari)
      .lt('created_at', tujuhHari),
    supabase
      .from('certificate_orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'menunggu_verifikasi'),
    supabase
      .from('certificates')
      .select('id', { count: 'exact', head: true })
      .gte('tanggal_terbit', awalBulanIni)
      .lt('tanggal_terbit', awalBulanDepan),
    supabase
      .from('certificates')
      .select('id', { count: 'exact', head: true })
      .gte('tanggal_terbit', awalBulanLalu)
      .lt('tanggal_terbit', awalBulanIni),
    supabase.from('batches').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('batch_leads').select('created_at').gte('created_at', chartSince),
    supabase.from('quote_requests').select('created_at').gte('created_at', chartSince),
    supabase
      .from('batch_leads')
      .select('id, nama, whatsapp, email, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('quote_requests')
      .select('id, nama, whatsapp, email, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  for (const [label, err] of [
    ['lead7', lead7.error],
    ['quote7', quote7.error],
    ['pending', pending.error],
    ['cert', certBulanIni.error],
    ['batch', batchAktif.error],
    ['chart-batch', batchLeadsChart.error],
    ['chart-quote', quoteChart.error],
  ] as const) {
    if (err) console.error(`[admin-overview] ${label}:`, err);
  }

  const leadBaru = (lead7.count ?? 0) + (quote7.count ?? 0);
  const leadPrev = (lead7prev.count ?? 0) + (quote7prev.count ?? 0);
  const sertifikatBulanIni = certBulanIni.count ?? 0;
  const sertifikatBulanLalu = certBulanLalu.count ?? 0;

  const bulanLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const stats: StatCardItem[] = [
    {
      id: 'leads',
      label: 'Lead baru (7 hari)',
      value: leadBaru,
      caption: 'vs 7 hari sebelumnya',
      icon: 'inbox',
      deltaPct: deltaPct(leadBaru, leadPrev),
    },
    {
      id: 'pending',
      label: 'Menunggu verifikasi',
      value: pending.count ?? 0,
      caption: 'Antrean bukti transfer',
      icon: 'clipboard',
      deltaPct: null,
    },
    {
      id: 'certs',
      label: 'Sertifikat bulan ini',
      value: sertifikatBulanIni,
      caption: bulanLabel,
      icon: 'badge',
      deltaPct: deltaPct(sertifikatBulanIni, sertifikatBulanLalu),
    },
    {
      id: 'batches',
      label: 'Batch aktif',
      value: batchAktif.count ?? 0,
      caption: 'Ditampilkan di publik',
      icon: 'calendar',
      deltaPct: null,
    },
  ];

  const buckets = buildEmptyBuckets(12);
  const indexByKey = new Map(buckets.map((b, i) => [b.key, i]));
  for (const row of [...(batchLeadsChart.data ?? []), ...(quoteChart.data ?? [])]) {
    const key = monthKey(new Date(row.created_at));
    const idx = indexByKey.get(key);
    if (idx != null) buckets[idx]!.total += 1;
  }

  const recent: RecentLeadRow[] = [
    ...(batchLeadsRecent.data ?? []).map((r) => ({
      id: `minat-${r.id}`,
      jenis: 'minat' as const,
      nama: r.nama,
      kontak: r.whatsapp || r.email || '',
      status: r.status,
      created_at: r.created_at,
    })),
    ...(quoteRecent.data ?? []).map((r) => ({
      id: `penawaran-${r.id}`,
      jenis: 'penawaran' as const,
      nama: r.nama,
      kontak: r.whatsapp || r.email || '',
      status: r.status,
      created_at: r.created_at,
    })),
  ]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan aktivitas Hexatara dari data terkini.
        </p>
      </div>

      <StatCards items={stats} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <LeadsTrendChart data={buckets} />
        </div>
        <div className="xl:col-span-2">
          <RecentLeadsTable rows={recent} />
        </div>
      </div>
    </div>
  );
}
