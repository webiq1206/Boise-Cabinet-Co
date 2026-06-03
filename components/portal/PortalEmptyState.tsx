import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PortalEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function PortalEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: PortalEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-sm mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">{description}</p>
        {actionLabel && actionHref && (
          <Button variant="brand" asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
