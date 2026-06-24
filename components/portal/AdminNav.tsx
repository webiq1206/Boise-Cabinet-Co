"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  ShoppingBag,
  Shield,
  Send,
} from "lucide-react";

const primaryNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: ShoppingBag },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/outreach", label: "Outreach", icon: Send },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2 px-2 py-3 mb-2">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-semibold text-sm">Admin Portal</span>
      </div>

      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">
        Operations
      </p>
      {primaryNav.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
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
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
