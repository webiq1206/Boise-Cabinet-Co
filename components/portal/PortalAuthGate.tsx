"use client";

import { type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PortalShell } from "@/components/portal/PortalShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PortalAuthGateProps {
  children: ReactNode;
  /** Required role; defaults to customer */
  role?: "customer" | "admin" | "partner";
  title?: string;
}

export function PortalAuthGate({
  children,
  role = "customer",
  title = "Client Portal",
}: PortalAuthGateProps) {
  const { isLoading, isAuthenticated, isCustomer, isAdmin, isPartner } = useAuth();

  if (isLoading) {
    return (
      <PortalShell variant={role === "admin" ? "admin" : role === "partner" ? "partner" : "customer"} title={title}>
        <div className="max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </PortalShell>
    );
  }

  const allowed =
    role === "customer"
      ? isCustomer
      : role === "admin"
        ? isAdmin
        : isPartner;

  if (!isAuthenticated || !allowed) {
    const returnTo = typeof window !== "undefined" ? window.location.pathname : "/portal";
    const loginHref = `/api/login?returnTo=${encodeURIComponent(returnTo)}`;

    return (
      <PortalShell variant={role === "admin" ? "admin" : role === "partner" ? "partner" : "customer"} title={title}>
        <div className="max-w-md mx-auto pt-8">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-muted-foreground text-sm">
                Sign in to access your {role === "customer" ? "project portal" : "dashboard"}.
              </p>
              <Button variant="brand" asChild className="w-full">
                <a href={loginHref}>Sign in</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PortalShell>
    );
  }

  return <>{children}</>;
}
