"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import AdminLeadsPanel from "@/components/admin/AdminLeadsPanel";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLeadsPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push("/admin");
  }, [isAdmin, isLoading, router]);

  if (isLoading || !isAdmin) return null;

  return (
    <PortalShell variant="admin" title="Lead Marketplace">
      <AdminLeadsPanel embedded />
    </PortalShell>
  );
}
