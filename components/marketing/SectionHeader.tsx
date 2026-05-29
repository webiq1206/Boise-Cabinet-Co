import { cn } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";

export interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  reveal?: boolean;
  inverse?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  reveal = true,
  inverse = false,
}: SectionHeaderProps) {
  const content = (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        align === "center" && eyebrow && "[&_.brc-label]:justify-center",
        className
      )}
    >
      {eyebrow && <div className="brc-label mb-4">{eyebrow}</div>}
      <h2
        className={cn(
          "font-serif font-light tracking-tight text-section-title md:text-section-title-lg mb-4",
          inverse ? "text-inverse-foreground" : "text-foreground"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-sm leading-relaxed",
            inverse ? "text-inverse-muted" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );

  if (reveal) {
    return <Reveal className={cn("mb-14", className?.includes("mb-0") && "mb-0")}>{content}</Reveal>;
  }

  return <div className={cn("mb-14", className?.includes("mb-0") && "mb-0")}>{content}</div>;
}
