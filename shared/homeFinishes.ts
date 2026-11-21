import { FINISHES } from "./catalog/generated/finishes";
import { visualizerFinishes, visualizerStyles, type VisualizerFinish, type VisualizerStyle } from "./doorVisualizer";

/**
 * The finishes the homepage picker shows ("Find your point of view").
 *
 * Server side only: the page resolves these from the catalog and hands the
 * small result to the homepage, so the browser never downloads the finish
 * library. Every entry is a real catalog finish with its real name and sample
 * image; nothing here is described beyond what the catalog holds.
 *
 * The set is meant to show the range honestly: whites first, a neutral, a
 * green and a dark, a white and a dark gloss, and three woodgrains shown as
 * their grain. Guard: tests/home-finishes.test.ts.
 */
export const HOME_FINISH_SLUGS = [
  "matte-snow-white",
  "matte-white",
  "matte-brezee-beige",
  "matte-macaron-green",
  "matte-pearl-black",
  "gloss-white",
  "gloss-anthracite",
  "woodgrain-white-gladstone-oak",
  "woodgrain-natural-bardolino-oak",
  "woodgrain-natural-carini-walnut",
] as const;

export type HomeFinishFamily = "matte" | "gloss" | "woodgrain";

export const HOME_FINISH_FAMILY_LABEL: Readonly<Record<HomeFinishFamily, string>> = {
  matte: "Matte",
  gloss: "Gloss",
  woodgrain: "Woodgrain",
};

export interface HomeFinish {
  slug: string;
  /** The catalog name, as written there. */
  name: string;
  family: HomeFinishFamily;
  familyLabel: string;
  /** How many finishes the catalog holds in this family. */
  familyCount: number;
  /** The catalog sample, 480px square. */
  image: string;
  /** The catalog search opened on this finish. */
  href: string;
  /** The catalog search opened on the whole family. */
  familyHref: string;
}

export function homeFinishHref(name: string, family: HomeFinishFamily): string {
  return `/search?q=${encodeURIComponent(name)}&finish=${family}`;
}

export function homeFinishFamilyHref(family: HomeFinishFamily): string {
  return `/search?finish=${family}`;
}

export function resolveHomeFinishes(): HomeFinish[] {
  const counts = new Map<string, number>();
  for (const finish of FINISHES) counts.set(finish.category, (counts.get(finish.category) ?? 0) + 1);
  return HOME_FINISH_SLUGS.flatMap((slug) => {
    const finish = FINISHES.find((item) => item.slug === slug);
    if (!finish?.imagePath) return [];
    const family = finish.category as HomeFinishFamily;
    return [
      {
        slug,
        name: finish.name,
        family,
        familyLabel: HOME_FINISH_FAMILY_LABEL[family],
        familyCount: counts.get(family) ?? 0,
        image: finish.imagePath,
        href: homeFinishHref(finish.name, family),
        familyHref: homeFinishFamilyHref(family),
      },
    ];
  });
}

/**
 * Everything the homepage picker offers (owner, 21 November 2026: all of the
 * finishes and door styles, as the door visualizer has). Every catalog finish
 * with its catalog name, in its family, with the curated set above first in
 * each family and the rest in catalog order; and every drawn door style.
 * Resolved on the server and handed to the homepage as props.
 */
export function resolveHomePicker(): { finishes: VisualizerFinish[]; styles: VisualizerStyle[] } {
  const all = visualizerFinishes();
  const rank = new Map<string, number>(HOME_FINISH_SLUGS.map((slug, index) => [slug, index]));
  const finishes = all
    .map((finish, index) => ({ finish, index }))
    .sort((a, b) => {
      if (a.finish.family !== b.finish.family) return a.index - b.index;
      const ra = rank.get(a.finish.slug) ?? Number.MAX_SAFE_INTEGER;
      const rb = rank.get(b.finish.slug) ?? Number.MAX_SAFE_INTEGER;
      return ra - rb || a.index - b.index;
    })
    .map(({ finish }) => finish);
  return { finishes, styles: visualizerStyles() };
}
