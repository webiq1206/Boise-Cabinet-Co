import { WAVE1_COST_CLUSTERS } from './blogPostsData';
import { ALL_HUB_CLUSTER_POSTS } from './allHubsContent';
import { NEW_CABINET_ARTICLES } from './newCabinetArticles';
import { LEGACY_BLOG_POSTS } from './legacyBlogPosts';

export const ALL_BLOG_POSTS = [
  ...WAVE1_COST_CLUSTERS,
  ...ALL_HUB_CLUSTER_POSTS,
  ...NEW_CABINET_ARTICLES,
  ...LEGACY_BLOG_POSTS,
];
