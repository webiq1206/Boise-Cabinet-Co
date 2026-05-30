export const ADAPTIVE_GLASS_ATTR = "data-adaptive-glass";

export type GlassTheme = "onLight" | "onDark";

export interface AdaptiveGlassClasses {
  bar: string;
  text: string;
  textMuted: string;
  divide: string;
}

const themeClasses: Record<GlassTheme, AdaptiveGlassClasses> = {
  onLight: {
    bar: "bg-background/97 backdrop-blur-md border-border",
    text: "text-foreground",
    textMuted: "text-muted-foreground",
    divide: "divide-border",
  },
  onDark: {
    bar: "bg-inverse/85 backdrop-blur-md border-inverse-foreground/15",
    text: "text-inverse-foreground",
    textMuted: "text-inverse-muted/80",
    divide: "divide-inverse-foreground/15",
  },
};

export function getAdaptiveGlassClasses(theme: GlassTheme): AdaptiveGlassClasses {
  return themeClasses[theme];
}

export const ADAPTIVE_GLASS_BAR_BASE =
  "fixed left-0 right-0 transition-colors duration-200 pb-safe border-t";
