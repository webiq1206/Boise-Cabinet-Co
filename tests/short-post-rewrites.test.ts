/**
 * SEO audit CAB-T1 / CAB-S3 (20 November 2026): the sixteen short posts carry
 * answer-first ledes, phrase H1s and their own questions, never the cluster
 * factory's templates. See shared/content/shortPostRewrites.ts.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { BLOG_POSTS } from "../shared/blogContent.ts";
import { SHORT_POST_REWRITES, isGeneratedQuestion } from "../shared/content/shortPostRewrites.ts";
import { KEPT_BY_SEARCH_DATA } from "../shared/content/blogMerges.ts";

const TEMPLATE_TEXT = [
  /^Expert .+ advice for Idaho homeowners\.$/,
  / considerations for Idaho homeowners\.$/,
  /: practical Idaho advice for coordinated cabinetry\.$/,
  /^Planning .+ with local design and installation\.$/,
  /^Local custom vanity guidance for /,
  /: educate yourself before signing a cabinet contract in Idaho\.$/,
];

test("all sixteen short posts are rewritten and still published", () => {
  assert.equal(Object.keys(SHORT_POST_REWRITES).length, 16);
  for (const slug of Object.keys(SHORT_POST_REWRITES)) {
    assert.ok(BLOG_POSTS.some((post) => post.slug === slug), slug);
  }
});

test("no template lede, quick answer or question survives on a short post", () => {
  for (const slug of Object.keys(SHORT_POST_REWRITES)) {
    const post = BLOG_POSTS.find((entry) => entry.slug === slug)!;
    for (const text of [post.excerpt, post.quickAnswer ?? ""]) {
      for (const pattern of TEMPLATE_TEXT) assert.doesNotMatch(text, pattern, `${slug}: ${text}`);
      assert.notEqual(text.trim(), post.title, slug);
    }
    for (const faq of post.faqs) assert.equal(isGeneratedQuestion(faq.question), false, `${slug}: ${faq.question}`);
    assert.ok(post.faqs.length >= 6 && post.faqs.length <= 12, `${slug}: ${post.faqs.length} FAQs`);
    assert.doesNotMatch(post.title, /(?<!\bin) Boise$/, `${slug}: H1 is a keyword fragment`);
    for (const text of [post.title, post.excerpt, post.quickAnswer ?? "", ...post.faqs.map((f) => f.question + f.answer)]) {
      assert.equal(text.includes("—"), false, slug);
    }
  }
});

test("posts the repo's Search Console notes protect keep their title tags", () => {
  assert.equal(BLOG_POSTS.find((p) => p.slug === "bathroom-vanity-layout-guide")!.seoTitle, "Bathroom vanity layout guide | Boise Cabinet Co");
  assert.equal(BLOG_POSTS.find((p) => p.slug === "cabinet-consultation-process")!.seoTitle, "Cabinet consultation process | Boise Cabinet Co");
  for (const slug of Object.keys(KEPT_BY_SEARCH_DATA)) assert.equal(SHORT_POST_REWRITES[slug].title, undefined, slug);
});
