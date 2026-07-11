import { WAVE1_COST_CLUSTERS } from './blogPostsData';
import { ALL_HUB_CLUSTER_POSTS } from './allHubsContent';
import { NEW_CABINET_ARTICLES } from './newCabinetArticles';
import { LEGACY_BLOG_POSTS } from './legacyBlogPosts';
import { PREMIUM_POSTS } from './premiumPosts';

// PREMIUM_POSTS lead so that when a premium rewrite shares a slug with a legacy
// factory post, the richer version is the one `BLOG_POSTS.find(slug)` returns.
// (De-dupe below guarantees a single entry per slug for static generation.)
const RAW_BLOG_POSTS = [
  ...PREMIUM_POSTS,
  ...WAVE1_COST_CLUSTERS,
  ...ALL_HUB_CLUSTER_POSTS,
  ...NEW_CABINET_ARTICLES,
  ...LEGACY_BLOG_POSTS,
];

const seenSlugs = new Set<string>();
export const ALL_BLOG_POSTS = RAW_BLOG_POSTS.filter((post) => {
  if (seenSlugs.has(post.slug)) return false;
  seenSlugs.add(post.slug);
  return true;
});
