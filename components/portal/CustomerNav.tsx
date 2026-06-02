"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { Home, FolderKanban, FileText, MessageSquare, User } from "lucide-react";

import { PLACEHOLDER_PROJECT_ID } from "@/shared/portalPlaceholder";

const navItems = [
  { href: "/portal", label: "Home", icon: Home, exact: true },
  {
    href: `/portal/projects/${PLACEHOLDER_PROJECT_ID}`,
    label: "My Project",
    icon: FolderKanban,
  },
  {
    href: `/portal/projects/${PLACEHOLDER_PROJECT_ID}/documents`,
    label: "Documents",
    icon: FileText,
  },
  {
    href: `/portal/projects/${PLACEHOLDER_PROJECT_ID}/messages`,
    label: "Messages",
    icon: MessageSquare,
  },
  { href: "/portal/account", label: "Account", icon: User },
];

export function CustomerNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2 px-2 py-3 mb-2">
        <FolderKanban className="h-6 w-6 text-primary" />
        <div className="min-w-0">
          <span className="font-semibold text-sm block truncate">{SITE_CONFIG.name}</span>
          <span className="text-xs text-muted-foreground">Client Portal</span>
        </div>
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
