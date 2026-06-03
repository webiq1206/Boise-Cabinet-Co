"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PortalShell } from "@/components/portal/PortalShell";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminAuthGate({
  children,
  title = "Admin",
}: {
  children: ReactNode;
  title?: string;
}) {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push("/admin");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return (
      <PortalShell variant="admin" title={title}>
        <div className="space-y-4 max-w-5xl">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </PortalShell>
    );
  }

  if (!isAdmin) {
    return (
      <PortalShell variant="admin" title={title}>
        <p className="text-sm text-muted-foreground">Redirecting to sign in…</p>
      </PortalShell>
    );
  }

  return <>{children}</>;
}
