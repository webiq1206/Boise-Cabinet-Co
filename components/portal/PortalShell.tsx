"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { NotificationsBell } from "@/components/NotificationsBell";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { AdminNav } from "./AdminNav";
import { CustomerNav } from "./CustomerNav";
import { PortalMobileNav } from "./PortalMobileNav";
import { PORTAL_VARIANT_LABEL } from "./portalNavConfig";

interface PortalShellProps {
  variant: "admin" | "customer";
  title?: string;
  breadcrumb?: ReactNode;
  children: ReactNode;
  headerActions?: ReactNode;
}

export function PortalShell({
  variant,
  title,
  breadcrumb,
  children,
  headerActions,
}: PortalShellProps) {
  const portalLabel = PORTAL_VARIANT_LABEL[variant];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 border-r bg-card flex-col shrink-0">
        {variant === "admin" ? <AdminNav /> : <CustomerNav />}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between gap-2 px-4 md:px-6">
            <div className="flex flex-col min-w-0 flex-1 md:flex-none md:max-w-none">
              {breadcrumb ? (
                <div className="hidden md:block">{breadcrumb}</div>
              ) : (
                <span className="md:hidden text-[12px] font-medium uppercase tracking-wider text-muted-foreground truncate">
                  {portalLabel}
                </span>
              )}
              {title ? (
                <h1 className="text-base md:text-lg font-semibold truncate leading-tight">{title}</h1>
              ) : (
                <Link href="/" className="text-base font-semibold truncate md:hidden">
                  Boise Cabinet Co
                </Link>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {headerActions}
              {variant === "admin" && <AdminCommandPalette />}
              <NotificationsBell />
              <Button variant="ghost" size="icon" className="hidden md:inline-flex" asChild>
                <a href="/api/logout" aria-label="Logout">
                  <LogOut className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:pb-6">
          {children}
        </main>
      </div>
      <PortalMobileNav variant={variant} />
    </div>
  );
}
