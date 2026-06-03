"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { PortalShell } from "@/components/portal/PortalShell";
import LeadMarketplace from "@/components/subcontractor/LeadMarketplace";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubcontractorLeadsPage() {
  const { isSubcontractor, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isSubcontractor && !isAdmin) {
      router.push("/subcontractor");
    }
  }, [isSubcontractor, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <PortalShell variant="subcontractor" title="Lead Marketplace">
        <Skeleton className="h-48 w-full" />
      </PortalShell>
    );
  }

  return (
    <PortalShell variant="subcontractor" title="Lead Marketplace">
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <LeadMarketplace embedded />
      </Suspense>
    </PortalShell>
  );
}
