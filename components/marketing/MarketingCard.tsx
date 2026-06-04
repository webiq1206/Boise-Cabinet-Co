import { cn } from "@/lib/utils";

export interface MarketingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "default" | "lg" | "none";
}

export function MarketingCard({
  className,
  padding = "default",
  children,
  ...props
}: MarketingCardProps) {
  return (
    <div
      className={cn(
        "marketing-card",
        padding === "default" && "p-6 md:p-8",
        padding === "lg" && "p-7 md:p-10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
