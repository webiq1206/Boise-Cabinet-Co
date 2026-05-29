import { cn } from "@/lib/utils";

export interface HairlineProps {
  className?: string;
  inverse?: boolean;
  /** Full viewport width vs inset to container grid */
  fullBleed?: boolean;
  /** Generous vertical air around the rule */
  spaced?: boolean;
}

export function Hairline({
  className,
  inverse = false,
  fullBleed = false,
  spaced = true,
}: HairlineProps) {
  return (
    <div
      role="presentation"
      className={cn(
        "border-t",
        inverse ? "border-inverse-foreground/15" : "border-border/60",
        fullBleed ? "w-full" : "w-full max-w-none",
        spaced && "my-10 md:my-14",
        className
      )}
    />
  );
}
