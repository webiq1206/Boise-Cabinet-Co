import Link from "next/link";
import { getManifestLinks } from "@/lib/internal-links";

interface ManifestRelatedLinksProps {
  path: string;
  title?: string;
  limit?: number;
}

export function ManifestRelatedLinks({
  path,
  title = "Related resources",
  limit = 6,
}: ManifestRelatedLinksProps) {
  const links = getManifestLinks(path).slice(0, limit);
  if (links.length === 0) return null;

  return (
    <div>
      <h2 className="font-sans font-light text-section-title mb-6 text-foreground">
        {title}
      </h2>
      <ul className="grid sm:grid-cols-2 gap-3">
        {links.map((link) => (
          <li key={link.url}>
            <Link
              href={link.url}
              className="block text-sm text-muted-foreground hover:text-accent transition-colors py-1"
            >
              {link.anchor}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
