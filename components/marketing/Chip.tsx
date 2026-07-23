import { cn } from "@/lib/utils";

export interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Chip({ children, active, className, onClick }: ChipProps) {
  const Comp = onClick ? "button" : "span";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-sm px-3 py-1 text-xs font-medium tracking-wide transition-colors duration-200 ease-out",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-[hsl(var(--surface-muted))] text-foreground",
        // Only the interactive form is a touch target; a static chip is a label.
        onClick &&
          "tap-target cursor-pointer hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </Comp>
  );
}
