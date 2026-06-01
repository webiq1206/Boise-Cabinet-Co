"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LeadMarketplace from "@/components/subcontractor/LeadMarketplace";

export default function SubcontractorLeadsPage() {
  const { isSubcontractor, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isSubcontractor && !isAdmin) {
      router.push("/subcontractor");
    }
  }, [isSubcontractor, isAdmin, isLoading, router]);

  if (isLoading) return null;

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading marketplace...</div>}>
      <LeadMarketplace />
    </Suspense>
  );
}
