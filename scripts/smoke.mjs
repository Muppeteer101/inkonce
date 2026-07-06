#!/usr/bin/env node
/**
 * Smoke test: `node scripts/smoke.mjs [origin]` (default http://localhost:3000).
 * Verifies every public surface responds and auth gates hold.
 */
const origin = process.argv[2] ?? 'http://localhost:3000';

const CHECKS = [
  // [path, expected status, substring?]
  ['/', 200, 'Design it right'],
  ['/create', 200, 'studio'],
  ['/pricing', 200, 'Design Pass'],
  ['/faq', 200, null],
  ['/styles', 200, '28'],
  ['/styles/fine-line', 200, 'Fine Line'],
  ['/ideas', 200, null],
  ['/ideas/snake', 200, 'Snake'],
  ['/ideas/snake/blackwork', 200, 'Blackwork'],
  ['/placements', 200, null],
  ['/placements/forearm', 200, 'Forearm'],
  ['/sitemap.xml', 200, 'urlset'],
  ['/robots.txt', 200, 'sitemap'],
  ['/llms.txt', 200, 'InkOnce'],
  ['/openapi.json', 200, 'openapi'],
  ['/api/public/styles', 200, 'fine-line'],
  ['/api/public/ideas', 200, 'snake'],
  ['/api/public/placements', 200, 'forearm'],
  // Auth gates
  ['/api/credits', 401, null],
  ['/api/generate/xyz', 401, null],
  // Webhook secret gate
  ['/api/hf-webhook/test?s=wrong', 401, null, 'POST'],
];

let failed = 0;
for (const [path, want, substr, method = 'GET'] of CHECKS) {
  try {
    const res = await fetch(origin + path, { method, redirect: 'manual' });
    const body = substr ? await res.text() : '';
    const okStatus = res.status === want;
    const okBody = !substr || body.toLowerCase().includes(String(substr).toLowerCase());
    if (okStatus && okBody) {
      console.log(`✓ ${method} ${path} → ${res.status}`);
    } else {
      failed++;
      console.error(`✗ ${method} ${path} → ${res.status} (wanted ${want}${substr ? `, containing "${substr}"` : ''})`);
    }
  } catch (err) {
    failed++;
    console.error(`✗ ${method} ${path} → ${err.message}`);
  }
}

console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll smoke checks passed');
process.exit(failed ? 1 : 0);
