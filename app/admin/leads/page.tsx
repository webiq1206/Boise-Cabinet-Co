"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import AdminLeadsPanel from "@/components/admin/AdminLeadsPanel";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";

export default function AdminLeadsPage() {
  return (
    <AdminAuthGate title="Lead Marketplace">
      <PortalShell variant="admin" title="Lead Marketplace">
        <AdminLeadsPanel embedded />
      </PortalShell>
    </AdminAuthGate>
  );
}
