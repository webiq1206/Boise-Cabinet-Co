"use client";

import { useQuery } from "@tanstack/react-query";
import { isAdmin, isCustomer, isPartner, normalizeRole } from "@/lib/auth/roles";

// Readable companion to the httpOnly session cookie (set in lib/auth.ts). When
// absent, the visitor is anonymous and we skip the /api/auth/user request that
// would otherwise run on every page load behind the global Navigation.
function hasAuthHint(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith("brc_auth="));
}

export interface User {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  company?: string | null;
  role: string;
  profileImageUrl?: string | null;
  agreementAccepted?: boolean | null;
  agreementAcceptedAt?: string | Date | null;
  watchedLeads?: string[] | null;
  declinedLeads?: string[] | null;
  stripeCustomerId?: string | null;
  creditBalance?: string | null;
}

export function useAuth() {
  const { data: user, isLoading, isError, error, refetch } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Not authenticated");
        }
        throw new Error("Failed to fetch user");
      }
      return res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    // Only query when a session hint cookie is present. Anonymous visitors (most
    // marketing traffic) never trigger the request. Authenticated areas (portal,
    // login) can call refetch() after establishing a session.
    enabled: hasAuthHint(),
  });

  const role = normalizeRole(user?.role);

  return {
    user,
    role,
    isLoading,
    isAuthenticated: !!user && !isError,
    isError,
    error,
    refetch,
    isAdmin: isAdmin(user),
    isPartner: isPartner(user) || user?.role === "subcontractor",
    isSubcontractor: isPartner(user) || user?.role === "subcontractor",
    isCustomer: isCustomer(user),
  };
}
