const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BASE = 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, '_lh-perf-2026-09-21');

const STATIC_PATHS = [
  { id: 'beranda', path: '/id' },
  { id: 'pelatihan', path: '/id/pelatihan' },
  { id: 'katalog', path: '/id/katalog' },
  { id: 'verify', path: '/id/verify' },
  { id: 'faq', path: '/id/faq' },
  { id: 'kuis', path: '/id/kuis' },
  { id: 'tentang-kami', path: '/id/tentang-kami' },
  { id: 'syarat-ketentuan', path: '/id/syarat-ketentuan' },
  { id: 'kebijakan-privasi', path: '/id/kebijakan-privasi' },
  { id: 'ketentuan-layanan', path: '/id/ketentuan-layanan' },
  { id: 'login', path: '/id/login' },
  { id: 'daftar', path: '/id/daftar' },
  { id: 'lupa-sandi', path: '/id/lupa-sandi' },
  { id: 'dashboard', path: '/id/dashboard', note: 'auth-gated' },
  { id: 'materi-1', path: '/id/materi/1', note: 'LMS auth-gated' },
];

async function discoverDetails() {
  const extra = [];
  for (const page of ['/id/pelatihan', '/id/katalog']) {
    const html = await (await fetch(BASE + page)).text();
    const re = page.includes('pelatihan')
      ? /href="(\/id\/pelatihan\/[^"#?]+)"/g
      : /href="(\/id\/katalog\/[^"#?]+)"/g;
    const found = [...html.matchAll(re)].map((m) => m[1]);
    const uniq = [...new Set(found)].filter((h) => !h.endsWith('/pelatihan') && !h.endsWith('/katalog'));
    if (uniq[0]) {
      extra.push({
        id: page.includes('pelatihan') ? 'pelatihan-detail' : 'katalog-detail',
        path: uniq[0],
      });
    }
  }
  return extra;
}

function runLighthouse(url, outJson) {
  return new Promise((resolve, reject) => {
    const args = [
      'lighthouse',
      url,
      '--only-categories=performance',
      '--form-factor=mobile',
      '--screenEmulation.mobile=true',
      '--output=json',
      `--output-path=${outJson}`,
      '--chrome-flags=--headless --no-sandbox --disable-gpu',
      '--quiet',
    ];
    const child = spawn('npx', ['--yes', ...args], {
      cwd: __dirname,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let err = '';
    child.stderr.on('data', (d) => (err += d.toString()));
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`lighthouse exit ${code}: ${err.slice(-500)}`));
    });
  });
}

function summarize(jsonPath, meta) {
  const r = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const audits = r.audits || {};
  const pick = (id) => {
    const a = audits[id];
    if (!a) return null;
    return {
      id,
      title: a.title,
      score: a.score,
      displayValue: a.displayValue || null,
      numericValue: a.numericValue ?? null,
    };
  };
  const opportunities = Object.values(audits)
    .filter((a) => a.details?.type === 'opportunity' && (a.numericValue || 0) > 0)
    .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
    .slice(0, 6)
    .map((a) => ({
      id: a.id,
      title: a.title,
      displayValue: a.displayValue,
      savingsMs: a.numericValue,
      items: (a.details?.items || []).slice(0, 5).map((it) => ({
        url: it.url || it.node?.snippet || null,
        wastedBytes: it.wastedBytes || null,
        totalBytes: it.totalBytes || null,
      })),
    }));

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
    diagnostics: [
      pick('uses-responsive-images'),
      pick('offscreen-images'),
      pick('modern-image-formats'),
      pick('unused-javascript'),
      pick('unused-css-rules'),
      pick('render-blocking-resources'),
      pick('server-response-time'),
      pick('bootup-time'),
      pick('mainthread-work-breakdown'),
      pick('dom-size'),
      pick('redirects'),
    ].filter(Boolean),
    opportunities,
  };
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const details = await discoverDetails();
  const pages = [...STATIC_PATHS, ...details];
  console.log('Pages:', pages.map((p) => p.path).join(', '));

  const results = [];
  for (const page of pages) {
    const url = BASE + page.path;
    const outJson = path.join(OUT_DIR, `${page.id}.json`);
    console.log(`\n=== ${page.id} ${url} ===`);
    try {
      await runLighthouse(url, outJson);
      const summary = summarize(outJson, page);
      results.push(summary);
      console.log('Perf', summary.performance, 'LCP', summary.metrics.LCP?.displayValue, '→', summary.finalUrl);
    } catch (e) {
      console.error('FAIL', page.id, e.message);
      results.push({ id: page.id, path: page.path, error: e.message });
    }
  }

  const summaryPath = path.join(OUT_DIR, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2));
  console.log('\nWrote', summaryPath);
})();
