import assert from "node:assert/strict";
import test from "node:test";
import { countWords } from "../lib/content-utils";
import { BLOG_POSTS } from "../shared/blogContent";
import { getHubBySlug } from "../shared/contentHubs";
import { THIN_POST_META, THIN_POST_WORDS, linksRoomOrService } from "../shared/content/thinPostSupport";

const thin = BLOG_POSTS.filter((post) => countWords(post.content) < THIN_POST_WORDS);

// The blog merge release (2026-11-01, shared/content/blogMerges.ts) 301ed 34
// of the 50 thin posts into stronger pages. The 16 left are the 14 "improve in
// place" posts plus the two Search Console kept (docs/blog-merge-map.md).
test("the thin-post programme still has posts to cover", () => {
  assert.ok(thin.length >= 10, `${thin.length} thin posts`);
});

test("every thin post links its pillar guide and a room or service page in the body", () => {
  const missing: string[] = [];
  for (const post of thin) {
    const pillar = getHubBySlug(post.hubSlug)?.pillarSlug;
    if (pillar && !post.content.includes(`href="/guides/${pillar}"`)) missing.push(`${post.slug}: pillar /guides/${pillar}`);
    if (!linksRoomOrService(post.content)) missing.push(`${post.slug}: no /cabinets/{room} or /services/ link`);
  }
  assert.deepEqual(missing, []);
});

test("thin-post metadata overrides stay in range and never template a city list", () => {
  for (const [slug, meta] of Object.entries(THIN_POST_META)) {
    assert.ok(BLOG_POSTS.some((post) => post.slug === slug), `${slug} is a live post`);
    if (meta.seoTitle) assert.ok(meta.seoTitle.length + " | Boise Cabinet Co".length <= 60, meta.seoTitle);
    if (meta.metaDescription) {
      assert.ok(meta.metaDescription.length >= 120 && meta.metaDescription.length <= 155, meta.metaDescription);
      assert.doesNotMatch(meta.metaDescription, /Serving Boise, Meridian/);
    }
  }
});
