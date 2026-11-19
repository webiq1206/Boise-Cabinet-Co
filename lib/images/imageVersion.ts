import { IMAGE_VERSIONS } from "../../shared/generated/imageVersions";

/**
 * Files under /images and /generated are served with a one-year immutable
 * Cache-Control (next.config.js), keyed by URL. A photograph replaced under
 * the same file name would keep showing the old picture to anyone who has
 * seen it, so a replaced file gets ?v=<hash of its content> and becomes a new
 * URL. Files that were never replaced are left as they are. The list is
 * shared/generated/imageVersions.ts (npm run images:versions).
 *
 * Page code keeps the plain path everywhere (alt text, picture identity,
 * variant lookup, sitemaps, structured data, page URLs). The version is added
 * only where a URL is handed to the browser: the next/image loader
 * (staticVariantLoader.ts), heroImageAttrs() and plain <img> tags.
 */
export function versionedSrc(src: string): string {
  if (!src.startsWith("/") || src.startsWith("//") || src.includes("?")) return src;
  const version = IMAGE_VERSIONS[src];
  return version ? `${src}?v=${version}` : src;
}

/** The same for a srcset: "url 640w, url 1080w". */
export function versionedSrcSet(srcSet: string): string {
  return srcSet
    .split(",")
    .map((part) => {
      const [url, ...rest] = part.trim().split(/\s+/);
      return [versionedSrc(url), ...rest].join(" ");
    })
    .join(", ");
}
