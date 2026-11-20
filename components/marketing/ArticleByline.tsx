/**
 * The visible byline on every article and guide (owner answers, 20 November
 * 2026): Nick Perkins, founder of P5 Home Co, linked to his entry on P5's
 * about page. The Article JSON-LD names the same Person (lib/schema.ts).
 */
export const ARTICLE_AUTHOR_HREF = "https://p5homeco.com/about";

export function ArticleByline() {
  return (
    <span data-testid="article-byline">
      {/* A no-break space: the meta row lays its items out with flex, which drops a plain one. */}
      {"By\u00a0"}
      <a href={ARTICLE_AUTHOR_HREF} rel="author" className="underline underline-offset-2">
        Nick Perkins, founder of P5 Home Co
      </a>
    </span>
  );
}
