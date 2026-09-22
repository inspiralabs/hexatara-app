const fs = require('fs');
(async () => {
  for (const page of ['/pelatihan', '/katalog']) {
    const html = await (await fetch('http://localhost:3000' + page)).text();
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    const hits = [...new Set(hrefs)].filter(
      (h) => h.includes(page + '/') || (page === '/pelatihan' && h.includes('/batch/'))
    );
    console.log(page, hits.slice(0, 10));
  }
  // What is materi/1?
  const r = await fetch('http://localhost:3000/materi/1', { redirect: 'manual' });
  console.log('materi/1', r.status, r.headers.get('location'));
})();
