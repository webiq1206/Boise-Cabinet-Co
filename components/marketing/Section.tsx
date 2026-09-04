import { cn } from "@/lib/utils";

type SectionVariant = "canvas" | "surface" | "greige" | "inverse" | "tint";

const variantClasses: Record<SectionVariant, string> = {
  canvas: "bg-background text-foreground",
  surface: "bg-card text-card-foreground",
  greige: "bg-surface-greige text-foreground",
  inverse: "bg-inverse text-inverse-foreground",
  tint: "bg-tint-warm text-foreground",
};

/**
 * The three sanctioned content widths.
 *
 * Section containers were previously set with a raw max-w-* literal at each
 * call site, which produced six competing content widths across 99 usages and
 * four different left edges on a single desktop page. These names exist so a
 * width is chosen by intent rather than by picking a number, and so narrowing
 * the set later is one edit here instead of 99 edits across the codebase.
 *
 * The values deliberately match the three most-used existing widths, so
 * adopting a name is a pure rename with no visual change.
 */
const widthClasses = {
  /** ~65 character measure. Prose, section intros, anything read as text. */
  prose: "max-w-2xl",
  /** Standard content width. Grids, cards, most section bodies. */
  content: "max-w-5xl",
  /** Widest. Galleries and full-width grids. */
  wide: "max-w-6xl",
  /** Opt out - the section manages its own layout. */
  none: "",
} as const;

export type SectionWidth = keyof typeof widthClasses;

/**
 * The P5 family surfaces (app/family.css).
 *
 * The site shipped as a uniformly dark page, so every band sat at the same
 * value and a long page had no rhythm - nothing told a scrolling reader that a
 * new idea had started. `surface` gives a section its ground from the family
 * layer, which derives all of these from tokens this site already defines, so
 * alternating light and dark costs no new brand colour.
 *
 * `variant` is left in place and unchanged so pages not yet adopted keep
 * rendering exactly as they do; pass `surface` instead to join the rhythm.
 */
type SectionSurface = "dark" | "deep" | "bone" | "muted" | "gradient";

const surfaceClasses: Record<SectionSurface, string> = {
  dark: "ed-on-dark",
  deep: "ed-on-deep",
  bone: "ed-on-bone",
  muted: "ed-on-muted",
  gradient: "ed-on-gradient",
};

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: SectionVariant;
  /** Family ground. Takes precedence over `variant` when supplied. */
  surface?: SectionSurface;
  /** Hairline above the section, for separating two bands of the same value. */
  edge?: boolean;
  divider?: boolean;
  spacing?: "default" | "sm" | "none" | "lg" | "xl";
  /**
   * Constrain and centre the section's content. Omit to leave layout entirely
   * to the children, which is the current behaviour for every existing call
   * site - so adding this prop changes nothing until a section opts in.
   */
  width?: SectionWidth;
}

export function Section({
  variant = "canvas",
  surface,
  divider = false,
  edge = false,
  spacing = "default",
  width,
  className,
  children,
  ...props
}: SectionProps) {
  const constrained = width && width !== "none";
  return (
    <section
      className={cn(
        surface ? surfaceClasses[surface] : variantClasses[variant],
        spacing === "default" && "section-y",
        spacing === "sm" && "section-y-sm",
        spacing === "lg" && "ed-section",
        spacing === "xl" && "ed-section-lg",
        divider && "section-divider",
        edge && "ed-edge-top",
        className
      )}
      {...props}
    >
      {constrained ? (
        <div className={cn(widthClasses[width], "mx-auto")}>{children}</div>
      ) : (
        children
      )}
    </section>
  );
}
