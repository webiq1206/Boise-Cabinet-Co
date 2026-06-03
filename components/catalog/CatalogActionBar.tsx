"use client";

import Link from "next/link";
import { ArrowRight, GitCompare, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CatalogActionBarProps {
  designStudioHref?: string;
  compareHref?: string;
  productsHref?: string;
  className?: string;
}

export function CatalogActionBar({
  designStudioHref = "/design-studio",
  compareHref,
  productsHref,
  className,
}: CatalogActionBarProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      <Button variant="brand" size="sm" asChild>
        <Link href={designStudioHref}>
          Add to design <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
      {productsHref && (
        <Button variant="outline" size="sm" asChild>
          <Link href={productsHref}>View products</Link>
        </Button>
      )}
      {compareHref && (
        <Button variant="outline" size="sm" asChild>
          <Link href={compareHref}>
            <GitCompare className="h-4 w-4 mr-1" />
            Compare
          </Link>
        </Button>
      )}
      <Button variant="ghost" size="sm" type="button" disabled title="Save to project (sign in)">
        <BookmarkPlus className="h-4 w-4 mr-1" />
        Save to project
      </Button>
    </div>
  );
}
