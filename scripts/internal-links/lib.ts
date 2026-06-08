import { BLOG_POSTS, type BlogPostData } from "../../shared/blogContent";
import { GUIDE_PAGES } from "../../shared/guideContent";
import { getHubBySlug, getHubPillarSlug, guidePath } from "../../shared/contentHubs";
import { ROOM_CATEGORIES } from "../../shared/catalog/roomCategories";
import { COLLECTIONS } from "../../shared/catalog/collections";

export type PageType = "blog" | "guide" | "catalog";

export interface PageNode {
  id: string;
  type: PageType;
  url: string;
  title: string;
  anchor: string;
  category: string;
  tags: string[];
  hubSlug?: string;
  tokens: Set<string>;
  overrides?: Array<{ url: string; anchor?: string }>;
}

export interface LinkEntry {
  url: string;
  anchor: string;
  title: string;
  type: PageType;
  score: number;
}

export interface Manifest {
  generatedAt: null;
  counts: { blog: number; guide: number; catalog: number };
  pages: Record<string, {
    type: PageType;
    title: string;
    anchor: string;
    url: string;
    links: LinkEntry[];
  }>;
  incoming: Record<string, number>;
  blogByCategory: Record<string, Array<{ slug: string; title: string; publishedAt: string }>>;
}

const STOPWORDS = new Set([
  "a","an","and","are","as","at","be","but","by","for","from","has","have","how",
  "i","if","in","is","it","its","of","on","or","so","that","the","their","then",
  "there","they","this","to","was","were","what","when","where","which","who",
  "why","will","with","you","your","yours","do","does","did","not","no","yes",
  "we","our","us","my","me","mine","over","under","into","out","up","down","more",
  "most","less","least","than","also","just","like","such","very","really","can",
  "could","should","would","may","might","one","two","three","other","others",
  "all","any","some","make","makes","made","get","gets","got","go","goes","going",
  "about","after","before","between","because","being","been","via","near","off",
  "id","idaho","kuna","boise","treasure","valley","ada","county","canyon",
  "page","pages","guide","guides","tips","tip","cabinet","cabinets",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function tokenSet(...parts: string[]): Set<string> {
  const set = new Set<string>();
  for (const p of parts) {
    if (!p) continue;
    for (const t of tokenize(p)) set.add(t);
  }
  return set;
}

const CATALOG_HUB_PAGES: Array<{ url: string; title: string; anchor: string; tags: string[] }> = [
  { url: "/cabinets", title: "Cabinet Catalog", anchor: "Cabinet catalog", tags: ["catalog", "cabinets"] },
  { url: "/collections", title: "Cabinet Collections", anchor: "Collections", tags: ["collections"] },
  { url: "/door-styles", title: "Door Styles", anchor: "Door styles", tags: ["door", "styles"] },
  { url: "/finishes", title: "Finishes", anchor: "Finishes", tags: ["finishes"] },
  { url: "/hardware", title: "Cabinet Hardware", anchor: "Hardware", tags: ["hardware"] },
];

export function buildCanonicalRoutes(): string[] {
  const routes: string[] = [];
  for (const post of BLOG_POSTS) routes.push(`/blog/${post.slug}`);
  for (const guide of GUIDE_PAGES) routes.push(guidePath(guide.slug));
  for (const hub of CATALOG_HUB_PAGES) routes.push(hub.url);
  for (const room of ROOM_CATEGORIES) routes.push(`/cabinets/${room.slug}`);
  for (const col of COLLECTIONS) routes.push(`/collections/${col.slug}`);
  return routes;
}

export function buildPages(): PageNode[] {
  const pages: PageNode[] = [];

  for (const post of BLOG_POSTS) {
    const hub = getHubBySlug(post.hubSlug);
    const pillarSlug = getHubPillarSlug(post.hubSlug);
    const pillarPublished = GUIDE_PAGES.some((g) => g.slug === pillarSlug);
    const pillarOverride =
      pillarSlug && pillarPublished
        ? [{ url: guidePath(pillarSlug), anchor: hub?.title ?? "Guide" }]
        : [];
    const overrides = [...pillarOverride, ...(post.relatedLinks ?? [])];
    pages.push({
      id: `blog:${post.slug}`,
      type: "blog",
      url: `/blog/${post.slug}`,
      title: post.title,
      anchor: post.title,
      category: post.category,
      hubSlug: post.hubSlug,
      tags: post.tags ?? [],
      tokens: tokenSet(
        post.title,
        post.excerpt,
        (post.tags ?? []).join(" "),
        post.category,
        post.hubSlug,
      ),
      overrides,
    });
  }

  for (const guide of GUIDE_PAGES) {
    pages.push({
      id: `guide:${guide.slug}`,
      type: "guide",
      url: guidePath(guide.slug),
      title: guide.title,
      anchor: guide.title,
      category: guide.hubSlug,
      hubSlug: guide.hubSlug,
      tags: guide.tags ?? [],
      tokens: tokenSet(guide.title, guide.excerpt, (guide.tags ?? []).join(" "), guide.hubSlug),
      overrides: guide.relatedLinks ?? [],
    });
  }

  for (const hub of CATALOG_HUB_PAGES) {
    pages.push({
      id: `catalog:${hub.url}`,
      type: "catalog",
      url: hub.url,
      title: hub.title,
      anchor: hub.anchor,
      category: "catalog",
      tags: hub.tags,
      tokens: tokenSet(hub.title, hub.anchor, hub.tags.join(" ")),
      overrides: [],
    });
  }

  for (const room of ROOM_CATEGORIES) {
    pages.push({
      id: `catalog:room:${room.slug}`,
      type: "catalog",
      url: `/cabinets/${room.slug}`,
      title: `${room.name} Cabinets`,
      anchor: `${room.name} cabinets`,
      category: "catalog",
      tags: [room.slug, "room", "cabinets"],
      tokens: tokenSet(room.name, room.description, room.slug),
      overrides: [],
    });
  }

  for (const col of COLLECTIONS) {
    pages.push({
      id: `catalog:collection:${col.slug}`,
      type: "catalog",
      url: `/collections/${col.slug}`,
      title: col.name,
      anchor: col.name,
      category: "catalog",
      tags: [col.slug, "collection"],
      tokens: tokenSet(col.name, col.tagline, col.description, col.slug),
      overrides: [],
    });
  }

  return pages;
}

const SAME_CATEGORY_BONUS = 0.3;
const SAME_HUB_BONUS = 0.35;
const SHARED_TAG_BONUS = 0.1;
const GUIDE_BOOST = 0.12;
const CATALOG_BOOST = 0.1;

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function similarity(from: PageNode, to: PageNode): number {
  if (from.id === to.id) return -1;

  let score = jaccard(from.tokens, to.tokens);

  if (from.category && from.category === to.category) score += SAME_CATEGORY_BONUS;
  if (from.hubSlug && to.hubSlug && from.hubSlug === to.hubSlug) score += SAME_HUB_BONUS;

  const fromTagSet = new Set(from.tags.map((t) => t.toLowerCase()));
  for (const t of to.tags) if (fromTagSet.has(t.toLowerCase())) score += SHARED_TAG_BONUS;

  if (to.type === "guide") score += GUIDE_BOOST;
  if (to.type === "catalog") score += CATALOG_BOOST;

  return score;
}

function targetLimit(from: PageNode): number {
  // Manifest depth (not render depth). More candidates per source spreads
  // incoming links so every page clears the >=5 incoming floor. Display is
  // still capped by renderLimit().
  if (from.type === "blog") return 8;
  if (from.type === "guide") return 10;
  return 8;
}

export function renderLimit(type: PageType): number {
  if (type === "blog") return 3;
  if (type === "guide") return 5;
  return 4;
}

type Quota = Partial<Record<PageType, number>>;

function quotasFor(from: PageNode): Quota {
  switch (from.type) {
    case "blog":
      return { guide: 1, catalog: 2, blog: 2 };
    case "guide":
      return { blog: 3, guide: 1, catalog: 2 };
    case "catalog":
      return { guide: 2, blog: 2, catalog: 2 };
    default:
      return {};
  }
}

function eligible(_from: PageNode, _to: PageNode): boolean {
  return _from.id !== _to.id;
}

export function buildManifest(pages: PageNode[]): Manifest {
  const incoming: Record<string, number> = {};
  for (const p of pages) incoming[p.url] = 0;

  const out: Manifest["pages"] = {};

  const sortedPages = [...pages].sort((a, b) => a.id.localeCompare(b.id));

  const pageById = new Map<string, PageNode>();
  for (const p of pages) pageById.set(p.url, p);

  for (const from of sortedPages) {
    const limit = targetLimit(from);
    const scored: LinkEntry[] = [];
    for (const to of pages) {
      if (!eligible(from, to)) continue;
      const score = similarity(from, to);
      if (score <= 0) continue;
      scored.push({
        url: to.url,
        anchor: to.anchor,
        title: to.title,
        type: to.type,
        score: Math.round(score * 1000) / 1000,
      });
    }
    for (const s of scored) {
      const inc = incoming[s.url] ?? 0;
      s.score = Math.round((s.score - 0.04 * inc) * 1000) / 1000;
    }
    scored.sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));

    const top: LinkEntry[] = [];
    const taken = new Set<string>();

    if (from.overrides && from.overrides.length > 0) {
      for (const ov of from.overrides) {
        if (top.length >= limit) break;
        if (taken.has(ov.url)) continue;
        const target = pageById.get(ov.url);
        if (!target) continue;
        top.push({
          url: target.url,
          anchor: ov.anchor ?? target.anchor,
          title: target.title,
          type: target.type,
          score: 999,
        });
        taken.add(target.url);
      }
    }

    const quotas = quotasFor(from);
    for (const [type, count] of Object.entries(quotas) as [PageType, number][]) {
      let added = 0;
      for (const cand of scored) {
        if (added >= count) break;
        if (taken.has(cand.url)) continue;
        if (cand.type !== type) continue;
        top.push(cand);
        taken.add(cand.url);
        added++;
        if (top.length >= limit) break;
      }
      if (top.length >= limit) break;
    }
    for (const cand of scored) {
      if (top.length >= limit) break;
      if (taken.has(cand.url)) continue;
      top.push(cand);
      taken.add(cand.url);
    }
    top.sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));

    out[from.url] = {
      type: from.type,
      title: from.title,
      anchor: from.anchor,
      url: from.url,
      links: top,
    };

    for (const link of top) incoming[link.url] = (incoming[link.url] ?? 0) + 1;
  }

  // Raise every page to >= minIncomingFloor incoming links. We repeat full
  // sweeps because a single pass can create new violations (a donor's popped
  // link may drop another page below the floor). To avoid churn, we only steal
  // a link from a donor whose weakest link points to an over-supplied target
  // (incoming > floor), so stealing never creates a new violation.
  const minIncomingFloor = 5;
  const MAX_SWEEPS = 25;
  for (let sweep = 0; sweep < MAX_SWEEPS; sweep++) {
    const weak = Object.keys(incoming)
      .filter((u) => (incoming[u] ?? 0) < minIncomingFloor)
      .sort((a, b) => incoming[a] - incoming[b]);
    if (weak.length === 0) break;
    let progressed = false;

    for (const targetUrl of weak) {
      while ((incoming[targetUrl] ?? 0) < minIncomingFloor) {
        const target = pageById.get(targetUrl)!;
        let bestFrom: PageNode | null = null;
        let bestScore = -Infinity;
        for (const from of pages) {
          if (from.url === targetUrl) continue;
          if (!eligible(from, target)) continue;
          const page = out[from.url];
          if (!page) continue;
          if (page.links.some((l) => l.url === targetUrl)) continue;
          if (page.links.length === 0) continue;
          const weakest = page.links[page.links.length - 1];
          if (weakest.score >= 999) continue;
          // Prefer not to steal a link whose removal would create a new
          // violation; with the raised targetLimit there is normally enough
          // slack that donors point at over-supplied targets.
          if ((incoming[weakest.url] ?? 0) <= minIncomingFloor) continue;
          const s = similarity(from, target);
          const margin = s - weakest.score;
          if (margin > bestScore) {
            bestScore = margin;
            bestFrom = from;
          }
        }
        if (!bestFrom) break;
        const page = out[bestFrom.url];
        const removed = page.links.pop()!;
        incoming[removed.url] = Math.max(0, (incoming[removed.url] ?? 0) - 1);
        const insertScore = similarity(bestFrom, target);
        page.links.push({
          url: target.url,
          anchor: target.anchor,
          title: target.title,
          type: target.type,
          score: Math.round(insertScore * 1000) / 1000,
        });
        page.links.sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));
        incoming[targetUrl] = (incoming[targetUrl] ?? 0) + 1;
        progressed = true;
      }
    }

    if (!progressed) break;
  }

  const blogByCategory: Manifest["blogByCategory"] = {};
  for (const post of BLOG_POSTS) {
    const cat = post.hubSlug || post.category;
    if (!blogByCategory[cat]) blogByCategory[cat] = [];
    blogByCategory[cat].push({
      slug: post.slug,
      title: post.title,
      publishedAt: post.publishedAt,
    });
  }
  for (const cat of Object.keys(blogByCategory)) {
    blogByCategory[cat].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
    blogByCategory[cat] = blogByCategory[cat].slice(0, 4);
  }

  const catalogCount =
    CATALOG_HUB_PAGES.length + ROOM_CATEGORIES.length + COLLECTIONS.length;

  return {
    generatedAt: null,
    counts: {
      blog: BLOG_POSTS.length,
      guide: GUIDE_PAGES.length,
      catalog: catalogCount,
    },
    pages: out,
    incoming,
    blogByCategory,
  };
}
