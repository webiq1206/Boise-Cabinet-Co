"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import AdminLeadsPanel from "@/components/admin/AdminLeadsPanel";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { AdminPageIntro } from "@/components/admin/AdminPageIntro";

export default function AdminLeadsPage() {
  return (
    <AdminAuthGate title="Leads">
      <PortalShell variant="admin" title="Leads">
        <div className="space-y-4">
          <AdminPageIntro>
            Review incoming customer leads, track quotes, and convert them into projects.
          </AdminPageIntro>
          <AdminLeadsPanel embedded />
        </div>
      </PortalShell>
    </AdminAuthGate>
  );
}
