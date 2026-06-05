import { IMAGE_VARIANTS } from "@/shared/generated/imageVariants";

interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Custom next/image loader. Serves pre-generated static WebP variants (see
 * scripts/images/build-image-variants.mjs) directly, bypassing the runtime
 * image optimizer so cold autoscale instances never re-encode. Any image
 * without a generated variant falls back to its original static file unchanged.
 */
export default function staticVariantLoader({ src, width }: LoaderArgs): string {
  // Remote URLs and data URIs are returned untouched.
  if (!src.startsWith("/")) return src;

  const widths = IMAGE_VARIANTS[src];
  if (!widths || widths.length === 0) return src;

  // Smallest variant at or above the requested width; otherwise the original
  // (covers requests larger than the biggest variant, e.g. hi-DPI / heroes).
  const pick = widths.find((w) => w >= width);
  if (!pick) return src;

  const dot = src.lastIndexOf(".");
  if (dot === -1) return src;
  return `${src.slice(0, dot)}-${pick}.webp`;
}
