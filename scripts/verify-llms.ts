/**
 * Guards /llms.txt (shared/llmsTxt.ts), which is generated from the content
 * layer at build. Fails when:
 * - a markdown link points anywhere but a public sitemap URL (or llms-full.txt),
 *   which is how /testimonials, a route that does not exist, stayed linked;
 * - a dollar figure appears (costs live in the cost guide, not a second copy);
 * - an unsupported superlative or a missing required section slips in.
 *
 * Run: npm run verify:llms (in prebuild).
 */
import { LLMS_TXT } from '../shared/llmsTxt';
import { getAllSiteUrls } from '../lib/siteUrls';
import { SITE_CONFIG } from '../shared/siteConfig';

const base = SITE_CONFIG.siteUrl.replace(/\/$/, '');
const allowed = new Set([...getAllSiteUrls().map((entry) => entry.path), '/llms-full.txt']);
const failures: string[] = [];

const links = [...LLMS_TXT.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => ({ label: m[1], href: m[2] }));
if (links.length < 30) failures.push(`expected at least 30 links, found ${links.length}`);
for (const { label, href } of links) {
  if (!href.startsWith(base)) {
    failures.push(`external or malformed link: [${label}](${href})`);
    continue;
  }
  const path = href.slice(base.length) || '/';
  if (!allowed.has(path)) failures.push(`not a public sitemap URL: [${label}](${href})`);
}

const bareMoney = LLMS_TXT.match(/\$\s?\d[\d,]*/g);
if (bareMoney) failures.push(`dollar figures belong in the cost guide, found: ${bareMoney.join(', ')}`);
if (/premier|best in|#1\b/i.test(LLMS_TXT)) failures.push('unsupported superlative');
if (/\/testimonials\b/.test(LLMS_TXT)) failures.push('links /testimonials, which has no route');
for (const heading of ['# ', '> ', '## Business facts', '## Cabinets by room', '## Cabinets by city', '## Catalog', '## Contact']) {
  if (!LLMS_TXT.includes(heading)) failures.push(`missing section: ${heading.trim()}`);
}
if (!/Last updated: \d{4}-\d{2}-\d{2}/.test(LLMS_TXT)) failures.push('missing "Last updated" build date');

if (failures.length) {
  console.error('verify:llms FAILED');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`verify:llms OK (${links.length} links, all public sitemap URLs; no dollar figures)`);
