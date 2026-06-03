"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Palette,
  FileText,
  MessageSquare,
  CreditCard,
} from "lucide-react";

const hubLinks = [
  { slug: "", label: "Overview", shortLabel: "Overview", icon: LayoutDashboard },
  { slug: "design", label: "Design", shortLabel: "Design", icon: Palette },
  { slug: "documents", label: "Documents", shortLabel: "Docs", icon: FileText },
  { slug: "messages", label: "Messages", shortLabel: "Chat", icon: MessageSquare },
  { slug: "payments", label: "Payments", shortLabel: "Pay", icon: CreditCard },
];

export function ProjectSubNav() {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id as string;
  const basePath = `/portal/projects/${projectId}`;

  return (
    <nav
      className="sticky top-14 z-30 -mx-4 px-4 py-2 mb-4 bg-background/95 backdrop-blur border-b md:static md:mx-0 md:px-1 md:py-0 md:mb-0 md:bg-transparent md:border-0 md:backdrop-blur-none"
      aria-label="Project sections"
    >
      <div className="flex gap-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-0.5">
        {hubLinks.map((link) => {
          const href = link.slug ? `${basePath}/${link.slug}` : basePath;
          const active = link.slug
            ? pathname.startsWith(`${basePath}/${link.slug}`)
            : pathname === basePath;
          const Icon = link.icon;

          return (
            <Link
              key={link.slug || "overview"}
              href={href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm whitespace-nowrap transition-colors shrink-0 snap-start min-h-[44px] touch-manipulation",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="sm:hidden">{link.shortLabel}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
