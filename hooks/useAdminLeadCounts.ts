"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface LeadLite {
  id: string;
  status: string;
  projectId?: string | null;
}

/**
 * Shared admin lead counts. Reuses the ["/api/leads"] query key so the result is
 * deduped across the nav, dashboard, and the leads panel (single network call).
 */
export function useAdminLeadCounts() {
  const { isAdmin } = useAuth();

  const { data: leads = [], isLoading } = useQuery<LeadLite[]>({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to load leads");
      return res.json();
    },
    enabled: isAdmin,
    staleTime: 60_000,
  });

  const pendingReview = leads.filter(
    (l) => !l.projectId && l.status !== "accepted" && l.status !== "archived",
  ).length;

  return { pendingReview, total: leads.length, isLoading };
}
