import Image from "next/image";
import Link from "next/link";
import { getManifestLinks } from "@/lib/internal-links";
import { pageImage } from "./KeepExploring";

interface RelatedPostCardsProps {
  path: string;
  title?: string;
  limit?: number;
}

const KIND_LABEL: Record<string, string> = {
  blog: "Article",
  guide: "Guide",
  room: "Cabinets",
  service: "Cabinets",
  city: "Service area",
  location: "Service area",
};

/** Related pages for articles and guides, each with the photograph of the page it opens. */
export function RelatedPostCards({
  path,
  title = "Related resources",
  limit = 6,
}: RelatedPostCardsProps) {
  const links = getManifestLinks(path).slice(0, limit);
  if (links.length === 0) return null;
  // Three or six cards fill their rows; any other count would leave one alone.
  const shown = links.length >= 6 ? links.slice(0, 6) : links.length >= 3 ? links.slice(0, 3) : links;

  return (
    <div>
      <h2 className="ed-h2-sm ed-statement-wide mb-8">{title}</h2>
      <div className="lx-related">
        {shown.map((link) => {
          const image = pageImage(link.url);
          return (
            <Link key={link.url} href={link.url} className="lx-related-card group" aria-label={link.anchor}>
              {image && (
                <span className="lx-related-photo">
                  <Image src={image.src} alt={image.alt} fill sizes="(max-width: 700px) 112px, 400px" className="object-cover" />
                </span>
              )}
              <span className="lx-related-copy">
                <span className="lx-related-kind">{KIND_LABEL[link.type] ?? "Related"}</span>
                <span className="ed-h4 group-hover:underline group-hover:underline-offset-4">{link.anchor}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
