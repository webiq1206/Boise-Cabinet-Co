import { cn } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";

export interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  reveal?: boolean;
  /**
   * Kept for callers. Colour now comes from the band's ground (the family
   * surfaces re-point the semantic tokens), so this no longer changes anything.
   */
  inverse?: boolean;
  size?: "default" | "display";
  as?: "h1" | "h2" | "h3";
}

/**
 * The family section head: eyebrow, heading, one paragraph.
 *
 * This component assigns purpose-specific family roles: `display` uses the
 * editorial section display and `default` uses the compact feature-title role.
 * The site-owned presentation layer maps those roles to the approved shared
 * responsive tokens. Body copy and eyebrows retain their own text roles.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  reveal = true,
  size = "default",
  as: Heading = "h2",
}: SectionHeaderProps) {
  const content = (
    <div
      className={cn(
        align === "center" && "mx-auto text-center [&_.ed-eyebrow]:justify-center [&_.ed-statement-wide]:mx-auto [&_.ed-body]:mx-auto",
        className
      )}
    >
      {eyebrow && <p className="ed-eyebrow">{eyebrow}</p>}
      <Heading className={cn(size === "display" ? "ed-h2" : "ed-h2-sm", "ed-statement-wide")}>
        {title}
      </Heading>
      {description && (
        typeof description === "string"
          ? <p className="ed-body mt-6">{description}</p>
          : <div className="ed-body mt-6">{description}</div>
      )}
    </div>
  );

  const gap = className?.includes("mb-0") ? "mb-0" : "mb-[clamp(40px,5vw,72px)]";
  return reveal ? <Reveal className={gap}>{content}</Reveal> : <div className={gap}>{content}</div>;
}
