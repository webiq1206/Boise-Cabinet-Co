// Blog Content for Boise Cabinet Co

import { ALL_BLOG_POSTS } from './content/allBlogPosts';
import { applyThinPostSupport } from './content/thinPostSupport';
import { isMergedBlogSlug, resolveMergedPath, withMergedContent } from './content/blogMerges';

export interface BlogPostData {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  hubSlug: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  heroImage?: string;
  thumbnail?: string;
  faqs: Array<{ question: string; answer: string }>;
  relatedLinks?: Array<{ url: string; anchor?: string }>;
  isPillar?: boolean;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  searchIntent?: string;
  featuredSnippetTargets?: string[];
  wordCountTarget?: 'cluster' | 'pillar';
  quickAnswer?: string;
  keyTakeaways?: string[];
}

/** Related links follow merged posts to their destination, never to the page itself. */
function resolveRelatedLinks(
  links: BlogPostData['relatedLinks'],
  selfPath: string,
): BlogPostData['relatedLinks'] {
  if (!links) return links;
  const seen = new Set<string>();
  return links
    .map((link) => ({ ...link, url: resolveMergedPath(link.url) }))
    .filter((link) => link.url !== selfPath && !seen.has(link.url) && seen.add(link.url));
}

/**
 * Posts merged by docs/blog-merge-map.md (shared/content/blogMerges.ts) are
 * left out: they 301 to their destination. Survivors carry any folded section
 * and link to destinations instead of merged URLs.
 */
export const BLOG_POSTS: BlogPostData[] = ALL_BLOG_POSTS.filter((post) => !isMergedBlogSlug(post.slug))
  .map(applyThinPostSupport)
  .map((post) => {
    const selfPath = `/blog/${post.slug}`;
    return {
      ...post,
      content: withMergedContent(post.content, selfPath),
      relatedLinks: resolveRelatedLinks(post.relatedLinks, selfPath),
    };
  });

export function getBlogPostBySlug(slug: string): BlogPostData | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getBlogPostsByHub(hubSlug: string): BlogPostData[] {
  return BLOG_POSTS.filter((p) => p.hubSlug === hubSlug);
}
