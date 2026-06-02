"use client";

import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AttentionItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  href: string;
  actionLabel?: string;
}

interface AttentionQueueProps {
  items: AttentionItem[];
  className?: string;
}

const priorityVariant = {
  high: "destructive" as const,
  medium: "secondary" as const,
  low: "outline" as const,
};

export function AttentionQueue({ items, className }: AttentionQueueProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <Alert className="border-accent/30 bg-accent/5">
        <AlertTriangle className="h-4 w-4 text-accent" />
        <AlertTitle>
          {items.length} item{items.length !== 1 ? "s" : ""} need your attention
        </AlertTitle>
        <AlertDescription>
          Complete these steps to keep your project moving forward.
        </AlertDescription>
      </Alert>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="group flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{item.title}</p>
                  <Badge variant={priorityVariant[item.priority]} className="text-[10px]">
                    {item.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 gap-1 text-muted-foreground group-hover:text-foreground"
                asChild
              >
                <span>
                  {item.actionLabel ?? "View"}
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
