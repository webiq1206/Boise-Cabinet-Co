import { cn } from "@/lib/utils";

export interface HairlineProps {
  className?: string;
  inverse?: boolean;
}

export function Hairline({ className, inverse = false }: HairlineProps) {
  return (
    <div
      role="presentation"
      className={cn(
        "border-t",
        inverse ? "border-inverse-foreground/15" : "border-border/60",
        className
      )}
    />
  );
}
