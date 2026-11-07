import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  /** Plain answer paragraph directly under the H1. Not a card. */
  answer?: string;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

/**
 * The page head for catalog, guide and resource pages - sixteen pages share it,
 * so it is the single lever on how those pages open.
 *
 * WAS a 44px h1 over 18px body in a 768px column. NOW the family display scale
 * (up to 92px) with the eyebrow-and-rule and a serif lede, the measure set on
 * the heading itself so it can run wide while the lede stays readable.
 */
export function PageHeader({
  eyebrow,
  title,
  answer,
  description,
  meta,
  align = "center",
  className,
}: PageHeaderProps) {
  const centered = align === "center";

  return (
    <header
      className={cn(
        "interior-page-heading",
        className
      )}
    >
      {eyebrow && <p className="ed-eyebrow">{eyebrow}</p>}
      <h1 className="ed-display ed-statement-display">{title}</h1>
      {answer ? (
        <p className="aeo-answer" data-aeo="answer" data-speakable="summary">{answer}</p>
      ) : null}
      {description && (
        typeof description === "string"
          ? <p className="ed-lede mt-8 max-w-[44ch]">{description}</p>
          : <div className="ed-lede mt-8 max-w-[44ch]">{description}</div>
      )}
      {meta && (
        <div className={cn("ed-small mt-6 flex flex-wrap items-center gap-4", centered && "justify-center")}>
          {meta}
        </div>
      )}
    </header>
  );
}
