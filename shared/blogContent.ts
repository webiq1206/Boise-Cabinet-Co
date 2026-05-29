// Blog Content for Boise Remodeling Co
// Posts will be added here as they are written

export interface BlogPostData {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
  faqs: Array<{ question: string; answer: string }>;
}

export const BLOG_POSTS: BlogPostData[] = [
  // No posts yet — check back soon
];
