import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface VisualSearchResultProps {
  href: string;
  type: string;
  name: string;
  description: string;
  imagePath?: string;
  className?: string;
  testId?: string;
}

export function VisualSearchResult({
  href,
  type,
  name,
  description,
  imagePath,
  className,
  testId,
}: VisualSearchResultProps) {
  return (
    <Link
      href={href}
      data-testid={testId}
      className={cn(
        "flex gap-3 rounded-lg border p-3 hover:border-primary/50 transition-colors",
        className,
      )}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-muted">
        {imagePath ? (
          <Image
            src={imagePath}
            alt={`${name} thumbnail`}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-xs text-muted-foreground uppercase">{type}</span>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
      </div>
    </Link>
  );
}
