import { cn } from "@/lib/utils";

type SectionVariant = "canvas" | "surface" | "inverse";

const variantClasses: Record<SectionVariant, string> = {
  canvas: "bg-background text-foreground",
  surface: "bg-card text-card-foreground",
  inverse: "bg-inverse text-inverse-foreground",
};

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: SectionVariant;
  divider?: boolean;
  spacing?: "default" | "sm" | "none";
}

export function Section({
  variant = "canvas",
  divider = false,
  spacing = "default",
  className,
  children,
  ...props
}: SectionProps) {
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
      {children}
    </section>
  );
}
