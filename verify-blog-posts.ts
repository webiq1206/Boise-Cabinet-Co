import { BLOG_POSTS } from './shared/blogContent';

// The 17 new blog posts (starting from index 23)
const NEW_POST_SLUGS = [
  'complete-guide-patio-installation-treasure-valley-idaho',
  'retaining-wall-installation-design-ideas-cost-guide-idaho',
  'rock-garden-decorative-stone-landscaping-ideas-idaho',
  'smart-irrigation-controllers-save-water-money-idaho',
  'tree-removal-stump-grinding-when-why-idaho',
  'landscape-lighting-design-ideas-outdoor-illumination',
  'sod-installation-vs-overseeding-which-choose',
  'common-lawn-diseases-idaho-prevention-treatment',
  'clay-soil-improvement-treasure-valley-lawns',
  'professional-lawn-edging-bed-definition',
  'mulching-benefits-types-application-maintenance',
  'xeriscaping-idaho-water-wise-landscaping',
  'pet-friendly-lawn-care-safe-products-practices',
  'organic-eco-friendly-lawn-care-treasure-valley',
  'lawn-care-myths-debunked-idaho-experts',
  'complete-lawn-renovation-guide-treasure-valley',
  'professional-christmas-light-installation-permanent-seasonal',
];

function countWords(html: string): number {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, ' ');
  // Remove extra whitespace
  const cleaned = text.replace(/\s+/g, ' ').trim();
  // Count words
  return cleaned.split(' ').filter(word => word.length > 0).length;
}

function countServiceLinks(html: string): number {
  // Count links to /services/
  const matches = html.match(/href="\/services\/[^"]+"/g) || [];
  return matches.length;
}

function checkIdahoContent(html: string): boolean {
  const idahoKeywords = ['Idaho', 'Treasure Valley', 'Boise', 'Kuna', 'Meridian', 'Eagle'];
  return idahoKeywords.some(keyword => html.includes(keyword));
}

console.log('=== BLOG POST SEO VERIFICATION ===\n');
console.log('Target Requirements:');
console.log('- Word Count: 1,500-2,000 words');
console.log('- Service Links: 6-10 links');
console.log('- FAQs: 5-6 questions');
console.log('- Idaho-Specific: Must contain Idaho/Treasure Valley references\n');
console.log('=' .repeat(80) + '\n');

let allPass = true;
const results: any[] = [];

NEW_POST_SLUGS.forEach((slug, index) => {
  const post = BLOG_POSTS.find(p => p.slug === slug);
  
  if (!post) {
    console.log(`❌ ERROR: Post "${slug}" not found!`);
    allPass = false;
    return;
  }

  const wordCount = countWords(post.content);
  const linkCount = countServiceLinks(post.content);
  const faqCount = post.faqs.length;
  const hasIdaho = checkIdahoContent(post.content);

  const wordPass = wordCount >= 1500 && wordCount <= 2000;
  const linkPass = linkCount >= 6 && linkCount <= 10;
  const faqPass = faqCount >= 5 && faqCount <= 6;
  const idahoPass = hasIdaho;

  const passAll = wordPass && linkPass && faqPass && idahoPass;
  if (!passAll) allPass = false;

  const result = {
    number: index + 1,
    slug,
    title: post.title,
    wordCount,
    wordPass,
    linkCount,
    linkPass,
    faqCount,
    faqPass,
    idahoPass,
    passAll
  };

  results.push(result);

  console.log(`Post #${index + 1}: ${post.title}`);
  console.log(`  Slug: ${slug}`);
  console.log(`  Word Count: ${wordCount} ${wordPass ? '✓' : '❌ FAIL'} (target: 1,500-2,000)`);
  console.log(`  Service Links: ${linkCount} ${linkPass ? '✓' : '❌ FAIL'} (target: 6-10)`);
  console.log(`  FAQs: ${faqCount} ${faqPass ? '✓' : '❌ FAIL'} (target: 5-6)`);
  console.log(`  Idaho Content: ${idahoPass ? '✓' : '❌ FAIL'}`);
  console.log(`  Overall: ${passAll ? '✅ PASS' : '❌ FAIL'}\n`);
});

console.log('=' .repeat(80));
console.log('\n=== SUMMARY ===\n');

const passCount = results.filter(r => r.passAll).length;
const failCount = results.length - passCount;

console.log(`Total Posts Verified: ${results.length}`);
console.log(`Passed: ${passCount} ✅`);
console.log(`Failed: ${failCount} ${failCount > 0 ? '❌' : '✅'}`);

if (allPass) {
  console.log('\n🎉 SUCCESS! All 17 new blog posts meet SEO requirements!\n');
} else {
  console.log('\n⚠️  FAILED! Some posts do not meet requirements. See details above.\n');
  
  // Show failed posts
  const failed = results.filter(r => !r.passAll);
  if (failed.length > 0) {
    console.log('Failed Posts:');
    failed.forEach(f => {
      console.log(`  - ${f.slug}`);
      if (!f.wordPass) console.log(`    → Word count: ${f.wordCount} (need 1,500-2,000)`);
      if (!f.linkPass) console.log(`    → Service links: ${f.linkCount} (need 6-10)`);
      if (!f.faqPass) console.log(`    → FAQs: ${f.faqCount} (need 5-6)`);
      if (!f.idahoPass) console.log(`    → Missing Idaho content`);
    });
  }
}

console.log('\n' + '='.repeat(80));

process.exit(allPass ? 0 : 1);
