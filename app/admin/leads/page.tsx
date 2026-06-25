"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { AdminPageIntro } from "@/components/admin/AdminPageIntro";
import { CrmDashboard } from "@/components/admin/crm/CrmDashboard";

export default function AdminLeadsPage() {
  return (
    <AdminAuthGate title="Leads">
      <PortalShell variant="admin" title="Leads">
        <div className="space-y-4">
          <AdminPageIntro>
            Capture, track, and reach every homeowner and business lead from one inbox.
          </AdminPageIntro>
          <CrmDashboard />
        </div>
      </PortalShell>
    </AdminAuthGate>
  );
}
