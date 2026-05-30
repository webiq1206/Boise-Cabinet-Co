/**
 * Validates blog and guide image registry coverage and quality.
 * Run: npm run verify:images
 */
import fs from 'fs';
import path from 'path';
import { BLOG_POSTS } from '../shared/blogContent';
import { GUIDE_PAGES } from '../shared/guideContent';
import {
  BLOG_IMAGE_REGISTRY,
  HUB_HERO_IMAGES,
} from '../shared/blogImageRegistry';
import { CONTENT_HUBS } from '../shared/contentHubs';

const root = path.join(__dirname, '..');
const errors: string[] = [];
const warnings: string[] = [];

function resolvePublicPath(urlPath: string): string {
  return path.join(root, 'public', urlPath.replace(/^\//, ''));
}

function isLocalPath(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}

function isExternal(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

// Coverage: every blog post and guide slug
for (const post of BLOG_POSTS) {
  if (!BLOG_IMAGE_REGISTRY[post.slug]) {
    errors.push(`Missing registry entry for blog post: ${post.slug}`);
  }
}

for (const guide of GUIDE_PAGES) {
  if (!BLOG_IMAGE_REGISTRY[guide.slug]) {
    errors.push(`Missing registry entry for guide: ${guide.slug}`);
  }
}

// Hub heroes
for (const hub of CONTENT_HUBS) {
  if (!HUB_HERO_IMAGES[hub.hubSlug]) {
    errors.push(`Missing hub hero for: ${hub.hubSlug}`);
  }
}

// Registry quality checks
const heroUsage = new Map<string, string>();

for (const [slug, entry] of Object.entries(BLOG_IMAGE_REGISTRY)) {
  if (entry.alt.length < 20) {
    errors.push(`Alt text too short for ${slug} (${entry.alt.length} chars)`);
  }

  if (isExternal(entry.hero)) {
    errors.push(`External hero URL for ${slug}: ${entry.hero}`);
  }

  if (!isLocalPath(entry.hero)) {
    errors.push(`Invalid hero path for ${slug}: ${entry.hero}`);
  } else {
    const filePath = resolvePublicPath(entry.hero);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing file for ${slug}: ${entry.hero}`);
    }

    const prev = heroUsage.get(entry.hero);
    if (prev) {
      errors.push(`Duplicate hero path: ${entry.hero} used by ${prev} and ${slug}`);
    } else {
      heroUsage.set(entry.hero, slug);
    }
  }

  if (entry.thumbnail) {
    if (isExternal(entry.thumbnail)) {
      errors.push(`External thumbnail URL for ${slug}`);
    } else if (!fs.existsSync(resolvePublicPath(entry.thumbnail))) {
      errors.push(`Missing thumbnail file for ${slug}: ${entry.thumbnail}`);
    }
  }

  // Heuristic relevance: topicTags should relate to hub or slug
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const guide = GUIDE_PAGES.find((g) => g.slug === slug);
  const hubSlug = post?.hubSlug ?? guide?.hubSlug;
  if (hubSlug && entry.topicTags.length > 0) {
    const hubKeyword = hubSlug.replace(/-/g, ' ').split(' ')[0];
    const tagMatch = entry.topicTags.some(
      (t) =>
        hubSlug.includes(t) ||
        t.includes(hubKeyword) ||
        (post?.tags ?? guide?.tags ?? []).some((pt) => pt.includes(t) || t.includes(pt)),
    );
    if (!tagMatch && !entry.topicTags.includes('guide')) {
      warnings.push(`Topic tags may not match hub for ${slug}: [${entry.topicTags.join(', ')}]`);
    }
  }
}

// Hub hero file checks
for (const [hubSlug, hero] of Object.entries(HUB_HERO_IMAGES)) {
  if (isExternal(hero)) {
    errors.push(`External hub hero for ${hubSlug}`);
  } else if (!fs.existsSync(resolvePublicPath(hero))) {
    errors.push(`Missing hub hero file for ${hubSlug}: ${hero}`);
  }
}

console.log(`Blog image registry: ${Object.keys(BLOG_IMAGE_REGISTRY).length} entries`);
console.log(`Blog posts: ${BLOG_POSTS.length}, Guides: ${GUIDE_PAGES.length}`);

if (warnings.length > 0) {
  console.warn(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
}

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s):`);
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  process.exit(1);
}

console.log('\nAll blog image checks passed.');
