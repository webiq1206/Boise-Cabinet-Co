/**
 * Content QA for guides and blog posts (topical authority standards).
 * Run: npx tsx scripts/verify-content.ts
 */
import { BLOG_POSTS } from '../shared/blogContent';
import { GUIDE_PAGES } from '../shared/guideContent';
import {
  countWords,
  countInternalLinks,
  countCitiesMentioned,
} from '../lib/content-utils';
import { TREASURE_VALLEY_CITIES } from '../shared/contentHubs';

const CITIES = [...TREASURE_VALLEY_CITIES];

type Tier = 'pillar' | 'cluster';

interface CheckResult {
  slug: string;
  route: string;
  tier: Tier;
  wordCount: number;
  wordPass: boolean;
  linkCount: number;
  linkPass: boolean;
  faqCount: number;
  faqPass: boolean;
  cityCount: number;
  cityPass: boolean;
  hubPass: boolean;
  passAll: boolean;
}

function checks(tier: Tier, wordCount: number, links: number, faqs: number, cities: number) {
  const wordMin = tier === 'pillar' ? 4000 : 2500;
  const wordMax = tier === 'pillar' ? 12000 : 10000;
  const linkMin = tier === 'pillar' ? 12 : 8;
  const faqMin = tier === 'pillar' ? 15 : 8;
  const faqMax = tier === 'pillar' ? 25 : 15;
  const cityMin = tier === 'pillar' ? 8 : 4;

  return {
    wordPass: wordCount >= wordMin && wordCount <= wordMax,
    linkPass: links >= linkMin,
    faqPass: faqs >= faqMin && faqs <= faqMax,
    cityPass: cities >= cityMin,
  };
}

const results: CheckResult[] = [];

for (const guide of GUIDE_PAGES) {
  const tier: Tier =
    guide.guideType === 'location' || guide.guideType === 'neighborhood'
      ? 'cluster'
      : 'pillar';
  const wordCount = countWords(guide.content);
  const linkCount = countInternalLinks(guide.content);
  const faqCount = guide.faqs.length;
  const cityCount = countCitiesMentioned(guide.content, CITIES);
  const c = checks(tier, wordCount, linkCount, faqCount, cityCount);

  results.push({
    slug: guide.slug,
    route: `/guides/${guide.slug}`,
    tier,
    wordCount,
    linkCount,
    faqCount,
    cityCount,
    hubPass: !!guide.hubSlug,
    passAll: c.wordPass && c.linkPass && c.faqPass && c.cityPass && !!guide.hubSlug,
    ...c,
  });
}

for (const post of BLOG_POSTS) {
  const tier: Tier = 'cluster';
  const wordCount = countWords(post.content);
  const linkCount = countInternalLinks(post.content);
  const faqCount = post.faqs.length;
  const cityCount = countCitiesMentioned(post.content, CITIES);
  const c = checks(tier, wordCount, linkCount, faqCount, cityCount);

  results.push({
    slug: post.slug,
    route: `/blog/${post.slug}`,
    tier,
    wordCount,
    linkCount,
    faqCount,
    cityCount,
    hubPass: !!post.hubSlug,
    passAll:
      c.wordPass && c.linkPass && c.faqPass && c.cityPass && !!post.hubSlug,
    ...c,
  });
}

console.log('=== CONTENT VERIFICATION ===\n');
let allPass = true;
for (const r of results) {
  if (!r.passAll) allPass = false;
  console.log(`${r.passAll ? '✅' : '❌'} ${r.route} (${r.tier})`);
  console.log(
    `   words: ${r.wordCount} ${r.wordPass ? '✓' : '✗'} | links: ${r.linkCount} ${r.linkPass ? '✓' : '✗'} | faqs: ${r.faqCount} ${r.faqPass ? '✓' : '✗'} | cities: ${r.cityCount} ${r.cityPass ? '✓' : '✗'}`,
  );
}
console.log(`\n${results.filter((r) => r.passAll).length}/${results.length} passed`);
process.exit(allPass ? 0 : 1);
