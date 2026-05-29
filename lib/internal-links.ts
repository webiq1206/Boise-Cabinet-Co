import manifest from "@/data/internal-links.json";

export interface ManifestLink {
  url: string;
  anchor: string;
  title: string;
  type: string;
  score: number;
}

export function getManifestLinks(path: string): ManifestLink[] {
  const pages = manifest.pages as Record<string, { links?: ManifestLink[] }>;
  return pages[path]?.links ?? [];
}
