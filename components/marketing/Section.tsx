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

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: SectionVariant;
  divider?: boolean;
  spacing?: "default" | "sm" | "none";
  /**
   * Constrain and centre the section's content. Omit to leave layout entirely
   * to the children, which is the current behaviour for every existing call
   * site - so adding this prop changes nothing until a section opts in.
   */
  width?: SectionWidth;
}

export function Section({
  variant = "canvas",
  divider = false,
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
        variantClasses[variant],
        spacing === "default" && "section-y",
        spacing === "sm" && "section-y-sm",
        divider && "section-divider",
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
