/**
 * Case studies, derived from projects that carry a `scenario` narrative in the
 * compiled project source of truth. Authoring happens in `data/projects.json`;
 * this file only reshapes the compiled data for the case-studies section.
 */
import { PROJECTS } from "./generated/projects.generated";
import type { ProjectKind } from "./projects/types";

export interface CaseStudy {
  slug: string;
  title: string;
  area: string;
  /** Humanized service label for display. */
  service: string;
  kind: ProjectKind;
  scope: string;
  challenge: string;
  approach: string;
  outcome: string;
  details: Array<{ label: string; value: string }>;
  imageUrl: string;
  imageAlt: string;
  links: Array<{ label: string; href: string }>;
}

function humanizeService(slug: string): string {
  const s = slug.replace(/-/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const CASE_STUDIES: CaseStudy[] = PROJECTS.filter((p) => p.scenario).map((p) => ({
  slug: p.slug,
  title: p.title,
  area: p.area,
  service: humanizeService(p.serviceType),
  kind: p.kind,
  scope: p.scenario!.scope,
  challenge: p.scenario!.challenge,
  approach: p.scenario!.approach,
  outcome: p.scenario!.outcome,
  details: p.scenario!.details,
  imageUrl: p.hero.src,
  imageAlt: p.hero.alt,
  links: p.scenario!.links,
}));
