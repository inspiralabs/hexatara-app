const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BASE = process.env.LH_BASE || 'http://localhost:3001';
const OUT_DIR = path.join(__dirname, '_lh-perf-prod-2026-09-21');

const PAGES = [
  { id: 'beranda', path: '/' },
  { id: 'pelatihan', path: '/pelatihan' },
  { id: 'pelatihan-detail', path: '/pelatihan/rpc-juli-2026' },
  { id: 'katalog', path: '/katalog' },
  { id: 'katalog-detail', path: '/katalog/evo-ii-pro-v3' },
  { id: 'verify', path: '/verify' },
  { id: 'faq', path: '/faq' },
  { id: 'kuis', path: '/kuis' },
  { id: 'tentang-kami', path: '/tentang-kami' },
  { id: 'syarat-ketentuan', path: '/syarat-ketentuan' },
  { id: 'kebijakan-privasi', path: '/kebijakan-privasi' },
  { id: 'ketentuan-layanan', path: '/ketentuan-layanan' },
  { id: 'login', path: '/login' },
  { id: 'daftar', path: '/daftar' },
  { id: 'lupa-sandi', path: '/lupa-sandi' },
  { id: 'dashboard', path: '/dashboard', note: 'auth → login' },
  { id: 'materi-1', path: '/materi/1', note: 'LMS' },
];

function runLighthouse(url, outJson) {
  return new Promise((resolve, reject) => {
    const cmd = [
      'npx --yes lighthouse',
      JSON.stringify(url),
      '--only-categories=performance',
      '--form-factor=mobile',
      '--screenEmulation.mobile=true',
      '--output=json',
      `--output-path=${JSON.stringify(outJson)}`,
      '--chrome-flags=--headless --no-sandbox --disable-gpu',
      '--quiet',
    ].join(' ');
    const child = spawn(cmd, {
      cwd: __dirname,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, TMP: OUT_DIR, TEMP: OUT_DIR, TMPDIR: OUT_DIR },
    });
    let err = '';
    child.stderr.on('data', (d) => (err += d.toString()));
    child.on('close', (code) => {
      if (fs.existsSync(outJson) && fs.statSync(outJson).size > 1000) resolve({ code, err });
      else reject(new Error(`exit ${code}: ${err.slice(-600)}`));
    });
  });
}

function summarize(jsonPath, meta) {
  const r = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const a = r.audits || {};
  const pick = (id) =>
    a[id]
      ? {
          id,
          score: a[id].score,
          displayValue: a[id].displayValue || null,
          numericValue: a[id].numericValue ?? null,
        }
      : null;

  const lcpInsight = a['lcp-discovery-insight'];
  const lcpBreakdown = a['lcp-breakdown-insight'];
  const imageDelivery = a['image-delivery-insight'];

  let lcpNode = null;
  const listItems = lcpBreakdown?.details?.items || [];
  for (const it of listItems) {
    if (it.type === 'node') lcpNode = { selector: it.selector, snippet: (it.snippet || '').slice(0, 240) };
  }

  return {
    id: meta.id,
    path: meta.path,
    note: meta.note || null,
    finalUrl: r.finalUrl,
    performance: Math.round((r.categories?.performance?.score || 0) * 100),
    metrics: {
      FCP: pick('first-contentful-paint'),
      LCP: pick('largest-contentful-paint'),
      TBT: pick('total-blocking-time'),
      CLS: pick('cumulative-layout-shift'),
      SI: pick('speed-index'),
      TTI: pick('interactive'),
    },
    lcpNode,
    lcpDiscovery: lcpInsight?.details?.items?.[0]?.items || null,
    imageDelivery: imageDelivery
      ? { score: imageDelivery.score, displayValue: imageDelivery.displayValue }
      : null,
    unusedJs: pick('unused-javascript'),
    ttfb: pick('server-response-time'),
    redirects: pick('redirects'),
    bootup: pick('bootup-time'),
  };
}

(async () => {
  // health check
  try {
    const h = await fetch(BASE + '/');
    console.log('Base', BASE, 'status', h.status);
  } catch (e) {
    console.error('Server not reachable at', BASE, e.message);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const results = [];
  for (const page of PAGES) {
    const url = BASE + page.path;
    const outJson = path.join(OUT_DIR, `${page.id}.json`);
    console.log(`\n=== ${page.id} ${url} ===`);
    try {
      await runLighthouse(url, outJson);
      const s = summarize(outJson, page);
      results.push(s);
      console.log(
        'Perf',
        s.performance,
        'LCP',
        s.metrics.LCP?.displayValue,
        'TTFB',
        s.ttfb?.displayValue,
        'JS',
        s.unusedJs?.displayValue
      );
      if (s.lcpNode) console.log('LCP node', s.lcpNode.selector);
    } catch (e) {
      console.error('FAIL', page.id, e.message);
      results.push({ id: page.id, path: page.path, error: String(e.message) });
    }
  }
  const summaryPath = path.join(OUT_DIR, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({ ranAt: new Date().toISOString(), base: BASE, results }, null, 2));
  console.log('\nWrote', summaryPath);
})();
