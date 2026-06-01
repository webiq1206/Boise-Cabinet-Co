"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function ComplianceBanner() {
  const { data } = useQuery({
    queryKey: ["/api/compliance"],
    queryFn: async () => {
      const res = await fetch("/api/compliance");
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (!data?.summary || data.summary.status === "compliant") return null;

  const issues: string[] = [];
  if (data.summary.issues?.includes("missing_coi")) issues.push("Certificate of Insurance (COI)");
  if (data.summary.issues?.includes("missing_w9")) issues.push("W-9 form");
  if (data.summary.issues?.includes("coi_expired")) issues.push("expired COI");
  if (data.summary.issues?.includes("coi_expiring_soon")) {
    issues.push(`COI expiring in ${data.summary.daysUntilCoiExpiry} days`);
  }
  if (data.summary.issues?.includes("coi_pending") || data.summary.issues?.includes("w9_pending")) {
    issues.push("documents pending review");
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Compliance action required</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
        <span>
          {issues.length > 0
            ? `Please resolve: ${issues.join(", ")}.`
            : "Please update your compliance documents."}
        </span>
        <Button size="sm" variant="outline" asChild className="shrink-0 w-fit">
          <Link href="/subcontractor/compliance">Update Documents</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
