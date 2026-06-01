"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { NotificationsBell } from "@/components/NotificationsBell";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { AdminNav } from "./AdminNav";
import { SubcontractorNav } from "./SubcontractorNav";

interface PortalShellProps {
  variant: "admin" | "subcontractor";
  title?: string;
  children: ReactNode;
  headerActions?: ReactNode;
}

export function PortalShell({
  variant,
  title,
  children,
  headerActions,
}: PortalShellProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 border-r bg-card flex-col shrink-0">
        {variant === "admin" ? <AdminNav /> : <SubcontractorNav />}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="md:hidden font-semibold text-sm">
                BRC
              </Link>
              {title && (
                <h1 className="text-lg font-semibold truncate">{title}</h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              {headerActions}
              <NotificationsBell />
              {variant === "admin" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/subcontractor">Sub Portal</Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <a href="/api/logout" aria-label="Logout">
                  <LogOut className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
