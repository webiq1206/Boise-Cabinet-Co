import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { DisplayNum } from "./DisplayNum";

/**
 * Aggregate review rating - the highest-signal trust element on a service site.
 * Renders the numeric rating, proportional star fill, review count, and (when a
 * Google Business Profile URL is configured) a source link for verifiability.
 *
 * Data is env-driven via SITE_CONFIG.trust; this component renders NOTHING when
 * no real review data is set, so no ratings are ever fabricated. Set
 * NEXT_PUBLIC_REVIEW_RATING / NEXT_PUBLIC_REVIEW_COUNT (and optionally
 * NEXT_PUBLIC_GBP_URL) to surface it.
 */

interface StarsProps {
  value: number;
  /** Star size in px. */
  size?: number;
  className?: string;
}

/** Five stars with a proportional (fractional) fill for the last partial star. */
function Stars({ value, size = 18, className }: StarsProps) {
  const clamped = Math.max(0, Math.min(5, value));
  return (
    <div className={cn("flex items-center", className)} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, clamped - i));
        return (
          <span
            key={i}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Star
              className="absolute inset-0 text-foreground/25"
              style={{ width: size, height: size }}
              strokeWidth={1.25}
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                className="fill-foreground text-foreground"
                style={{ width: size, height: size }}
                strokeWidth={1.25}
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export interface AggregateRatingProps {
  /** `block` = section anchor (big numeral); `inline` = compact row near a CTA. */
  variant?: "block" | "inline";
  align?: "start" | "center";
  className?: string;
}

export function AggregateRating({
  variant = "block",
  align = "center",
  className,
}: AggregateRatingProps) {
  const { ratingValue, reviewCount, gbpUrl } = SITE_CONFIG.trust;

  // Never fabricate proof: render only when real review data is configured.
  if (!ratingValue || !reviewCount) return null;

  const label = `Rated ${ratingValue} out of 5 from ${reviewCount} homeowner reviews`;
  const reviewsWord = reviewCount === 1 ? "review" : "reviews";

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 text-sm",
          align === "center" ? "justify-center" : "justify-start",
          className,
        )}
        aria-label={label}
      >
        <Stars value={ratingValue} size={16} />
        <span className="text-foreground">
          <span className="tabular-nums">{ratingValue}</span>
          <span className="text-muted-foreground">
            {" "}
            · {reviewCount} {reviewsWord}
          </span>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4",
        align === "center" ? "justify-center" : "justify-start",
        className,
      )}
      aria-label={label}
    >
      <DisplayNum className="text-4xl md:text-5xl leading-none text-foreground">
        {ratingValue}
      </DisplayNum>
      <div className={cn("flex flex-col gap-1.5", align === "center" ? "items-center" : "items-start")}>
        <Stars value={ratingValue} size={18} />
        <p className="text-sm text-muted-foreground">
          Based on {reviewCount} homeowner {reviewsWord}
          {gbpUrl ? (
            <>
              {" · "}
              <a
                href={gbpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-2 hover:underline"
              >
                Read on Google
              </a>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
