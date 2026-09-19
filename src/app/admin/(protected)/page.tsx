import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { StatCards, type StatCardItem } from './overview/stat-cards';
import { LeadsSummary } from './overview/leads-summary';
import { LeadsTrendChart, type MonthBucket } from './overview/leads-trend-chart';
import { LeadsStatusPie, type PieSlice } from './overview/leads-status-pie';
import { CertificatesBarChart, type CertMonthBucket } from './overview/certificates-bar-chart';
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

function buildEmptyLeadBuckets(months: number): MonthBucket[] {
  const now = new Date();
  const buckets: MonthBucket[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = monthKey(d);
    buckets.push({ key, label: monthLabel(key), pendaftaran: 0, penawaran: 0 });
  }
  return buckets;
}

function buildEmptyCertBuckets(months: number): CertMonthBucket[] {
  const now = new Date();
  const buckets: CertMonthBucket[] = [];
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

const LABEL_STATUS_REG = {
  menunggu_verifikasi: 'Menunggu',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
} as const;

const LABEL_STATUS_QUOTE = {
  baru: 'Baru',
  dihubungi: 'Dihubungi',
  selesai: 'Selesai',
} as const;

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
  const chartSinceDate = startOfMonth(-11).toISOString().slice(0, 10);

  const [
    lead7,
    lead7prev,
    quote7,
    quote7prev,
    pending,
    certBulanIni,
    certBulanLalu,
    batchAktif,
    batchRegChart,
    quoteChart,
    certChart,
    batchRegRecent,
    quoteRecent,
    regMenunggu,
    regDisetujui,
    regDitolak,
    quoteBaru,
    quoteDihubungi,
    quoteSelesai,
  ] = await Promise.all([
    supabase
      .from('batch_registrations')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', tujuhHari),
    supabase
      .from('batch_registrations')
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
    supabase.from('batch_registrations').select('created_at').gte('created_at', chartSince),
    supabase.from('quote_requests').select('created_at').gte('created_at', chartSince),
    supabase.from('certificates').select('tanggal_terbit').gte('tanggal_terbit', chartSinceDate),
    supabase
      .from('batch_registrations')
      .select('id, nama_lengkap, whatsapp, email, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('quote_requests')
      .select('id, nama, whatsapp, email, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('batch_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'menunggu_verifikasi'),
    supabase
      .from('batch_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'disetujui'),
    supabase
      .from('batch_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ditolak'),
    supabase
      .from('quote_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'baru'),
    supabase
      .from('quote_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'dihubungi'),
    supabase
      .from('quote_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'selesai'),
  ]);

  for (const [label, err] of [
    ['lead7', lead7.error],
    ['quote7', quote7.error],
    ['pending', pending.error],
    ['cert', certBulanIni.error],
    ['batch', batchAktif.error],
    ['chart-reg', batchRegChart.error],
    ['chart-quote', quoteChart.error],
    ['chart-cert', certChart.error],
    ['reg-status', regMenunggu.error ?? regDisetujui.error ?? regDitolak.error],
    ['quote-status', quoteBaru.error ?? quoteDihubungi.error ?? quoteSelesai.error],
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

  const regItems = [
    { key: 'menunggu_verifikasi', label: LABEL_STATUS_REG.menunggu_verifikasi, count: regMenunggu.count ?? 0 },
    { key: 'disetujui', label: LABEL_STATUS_REG.disetujui, count: regDisetujui.count ?? 0 },
    { key: 'ditolak', label: LABEL_STATUS_REG.ditolak, count: regDitolak.count ?? 0 },
  ];
  const quoteItems = [
    { key: 'baru', label: LABEL_STATUS_QUOTE.baru, count: quoteBaru.count ?? 0 },
    { key: 'dihubungi', label: LABEL_STATUS_QUOTE.dihubungi, count: quoteDihubungi.count ?? 0 },
    { key: 'selesai', label: LABEL_STATUS_QUOTE.selesai, count: quoteSelesai.count ?? 0 },
  ];
  const pendaftaranTotal = regItems.reduce((s, i) => s + i.count, 0);
  const penawaranTotal = quoteItems.reduce((s, i) => s + i.count, 0);

  const buckets = buildEmptyLeadBuckets(12);
  const indexByKey = new Map(buckets.map((b, i) => [b.key, i]));
  for (const row of batchRegChart.data ?? []) {
    const idx = indexByKey.get(monthKey(new Date(row.created_at)));
    if (idx != null) buckets[idx]!.pendaftaran += 1;
  }
  for (const row of quoteChart.data ?? []) {
    const idx = indexByKey.get(monthKey(new Date(row.created_at)));
    if (idx != null) buckets[idx]!.penawaran += 1;
  }

  const certBuckets = buildEmptyCertBuckets(12);
  const certIndex = new Map(certBuckets.map((b, i) => [b.key, i]));
  for (const row of certChart.data ?? []) {
    if (!row.tanggal_terbit) continue;
    const idx = certIndex.get(monthKey(new Date(row.tanggal_terbit)));
    if (idx != null) certBuckets[idx]!.total += 1;
  }

  // Warna cobalt hex di komponen chart (colorIndex → CHART_COBALT)
  const pieData: PieSlice[] = [
    { key: 'reg-menunggu', name: 'Pendaftaran · Menunggu', value: regItems[0]!.count, colorIndex: 0 },
    { key: 'reg-disetujui', name: 'Pendaftaran · Disetujui', value: regItems[1]!.count, colorIndex: 2 },
    { key: 'reg-ditolak', name: 'Pendaftaran · Ditolak', value: regItems[2]!.count, colorIndex: 4 },
    { key: 'quote-baru', name: 'Penawaran · Baru', value: quoteItems[0]!.count, colorIndex: 1 },
    { key: 'quote-dihubungi', name: 'Penawaran · Dihubungi', value: quoteItems[1]!.count, colorIndex: 3 },
    { key: 'quote-selesai', name: 'Penawaran · Selesai', value: quoteItems[2]!.count, colorIndex: 5 },
  ];

  const recent: RecentLeadRow[] = [
    ...(batchRegRecent.data ?? []).map((r) => ({
      id: `pendaftaran-${r.id}`,
      jenis: 'pendaftaran' as const,
      nama: r.nama_lengkap ?? '—',
      kontak: r.whatsapp || r.email || '',
      statusLabel: LABEL_STATUS_REG[r.status],
      created_at: r.created_at,
    })),
    ...(quoteRecent.data ?? []).map((r) => ({
      id: `penawaran-${r.id}`,
      jenis: 'penawaran' as const,
      nama: r.nama,
      kontak: r.whatsapp || r.email || '',
      statusLabel: LABEL_STATUS_QUOTE[r.status],
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

      <LeadsSummary
        pendaftaran={{ total: pendaftaranTotal, items: regItems }}
        penawaran={{ total: penawaranTotal, items: quoteItems }}
      />

      <LeadsTrendChart data={buckets} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeadsStatusPie data={pieData} />
        <CertificatesBarChart data={certBuckets} />
      </div>

      <RecentLeadsTable rows={recent} />
    </div>
  );
}
